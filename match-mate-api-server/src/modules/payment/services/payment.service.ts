import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomUUID } from 'crypto';
import { Model, Types } from 'mongoose';
import { PaymentRepository } from '../repositories/payment.repository';
import { AdminListPaymentsDto } from '../dto/admin-list-payments.dto';
import { AdminRefundPaymentDto } from '../dto/admin-refund-payment.dto';
import { CreateOrderDto } from '../dto/create-order.dto';
import { VerifyPaymentDto } from '../dto/verify-payment.dto';
import { PaymentStatus } from '../enums/payment-status.enum';
import { FailPaymentDto } from '../dto/fail-payment.dto';
import { ListPaymentsDto } from '../dto/list-payments.dto';
import { PaymentWebhookDto } from '../dto/payment-webhook.dto';
import { PaymentReconciliationDto } from '../dto/payment-reconciliation.dto';
import { PaymentSettlementReportDto } from '../dto/payment-settlement-report.dto';
import { PaymentGateway } from '../enums/payment-gateway.enum';
import { PaymentPurpose } from '../enums/payment-purpose.enum';
import { Plan } from '../../plan/schemas/plan.schema';
import { SubscriptionService } from '../../subscription/services/subscription.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly configService: ConfigService,
    private readonly subscriptionService: SubscriptionService,
    @InjectModel(Plan.name)
    private readonly planModel: Model<Plan>,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    this.ensureUserId(userId);

    const plan = await this.planModel.findById(dto.planId).lean().exec();

    if (!plan || !plan.isActive) {
      throw new BadRequestException('Invalid or inactive plan');
    }

    if (dto.idempotencyKey) {
      const existing = await this.paymentRepo.findByIdempotencyKey(
        userId,
        dto.idempotencyKey,
      );

      if (existing) {
        return {
          isIdempotentReplay: true,
          payment: existing,
        };
      }
    }

    const taxPercentage = Number(
      this.configService.get<string>('payments.gstPercentage') ?? '0',
    );

    const amount = Number(plan.price);
    const taxAmount = Number(((amount * taxPercentage) / 100).toFixed(2));
    const discountAmount = 0;
    const netAmount = Number((amount + taxAmount - discountAmount).toFixed(2));

    const orderId = this.generateOrderId();
    const gatewayOrderId = this.generateGatewayOrderId();

    const payment = await this.paymentRepo.create({
      userId: new Types.ObjectId(userId),
      planId: new Types.ObjectId(dto.planId),
      orderId,
      gatewayOrderId,
      amount,
      taxAmount,
      discountAmount,
      netAmount,
      currency: (dto.currency ?? 'INR').toUpperCase(),
      status: PaymentStatus.PENDING,
      gateway: dto.gateway ?? PaymentGateway.RAZORPAY,
      purpose: dto.purpose ?? PaymentPurpose.SUBSCRIPTION,
      idempotencyKey: dto.idempotencyKey,
      initiatedAt: new Date(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      metadata: {
        ...(dto.metadata ?? {}),
        description: dto.description,
      },
    });

    return {
      orderId: payment.orderId,
      gatewayOrderId: payment.gatewayOrderId,
      amount: payment.amount,
      taxAmount: payment.taxAmount,
      netAmount: payment.netAmount,
      currency: payment.currency,
      status: payment.status,
      gateway: payment.gateway,
      expiresAt: payment.expiresAt,
    };
  }

  async verifyPayment(userId: string, dto: VerifyPaymentDto) {
    this.ensureUserId(userId);

    const payment = await this.paymentRepo.findByOrderIdAndUser(
      dto.orderId,
      userId,
    );

    if (!payment) {
      throw new BadRequestException('Invalid order');
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return payment;
    }

    if (
      payment.status === PaymentStatus.REFUNDED ||
      payment.status === PaymentStatus.CANCELLED
    ) {
      throw new ConflictException('Payment is not verifiable in current state');
    }

    const signatureVerified = this.verifySignature({
      orderId: dto.gatewayOrderId ?? payment.gatewayOrderId ?? dto.orderId,
      paymentId: dto.gatewayPaymentId,
      signature: dto.signature,
    });

    if (!signatureVerified) {
      throw new UnauthorizedException('Invalid payment signature');
    }

    const updated = await this.paymentRepo.markSuccess({
      orderId: dto.orderId,
      gatewayPaymentId: dto.gatewayPaymentId,
      gatewayOrderId: dto.gatewayOrderId,
      method: dto.method,
      signatureVerified,
      gatewayPayload: dto.gatewayPayload,
    });

    if (!updated) {
      throw new BadRequestException('Unable to update payment status');
    }

    await this.activateSubscriptionIfRequired(
      updated.userId.toString(),
      updated,
    );

    return updated;
  }

  async markPaymentFailed(userId: string, dto: FailPaymentDto) {
    this.ensureUserId(userId);

    const payment = await this.paymentRepo.findByOrderIdAndUser(
      dto.orderId,
      userId,
    );

    if (!payment) {
      throw new BadRequestException('Invalid order');
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      throw new ConflictException('Successful payment cannot be marked failed');
    }

    const updated = await this.paymentRepo.markFailed({
      orderId: dto.orderId,
      failureCode: dto.failureCode,
      failureReason: dto.failureReason,
      gatewayPayload: dto.gatewayPayload,
    });

    if (!updated) {
      throw new BadRequestException('Unable to update payment status');
    }

    return updated;
  }

  async processWebhook(dto: PaymentWebhookDto, signature?: string) {
    const payment = await this.paymentRepo.findByOrderId(dto.orderId);

    if (!payment) {
      throw new BadRequestException('Order not found');
    }

    if (!this.verifyWebhookSignature(dto, signature)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    if (dto.status === PaymentStatus.SUCCESS) {
      const updated = await this.paymentRepo.markSuccess({
        orderId: dto.orderId,
        gatewayPaymentId:
          dto.gatewayPaymentId ?? payment.gatewayPaymentId ?? '',
        method: dto.method,
        signatureVerified: true,
        gatewayPayload: dto.payload,
      });

      if (!updated) {
        throw new BadRequestException('Unable to process success webhook');
      }

      await this.activateSubscriptionIfRequired(
        updated.userId.toString(),
        updated,
      );

      return { processed: true, status: updated.status };
    }

    if (dto.status === PaymentStatus.REFUNDED) {
      const updated = await this.paymentRepo.markRefunded(
        dto.orderId,
        dto.payload,
      );

      if (!updated) {
        throw new BadRequestException('Unable to process refund webhook');
      }

      return { processed: true, status: updated.status };
    }

    const updated = await this.paymentRepo.markFailed({
      orderId: dto.orderId,
      failureCode: dto.failureCode,
      failureReason: dto.failureReason,
      gatewayPayload: dto.payload,
    });

    if (!updated) {
      throw new BadRequestException('Unable to process failure webhook');
    }

    return { processed: true, status: updated.status };
  }

  getUserPayments(userId: string, query: ListPaymentsDto) {
    this.ensureUserId(userId);

    return this.paymentRepo.findUserPayments({
      userId,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      status: query.status,
      purpose: query.purpose,
      currency: query.currency?.toUpperCase(),
    });
  }

  async getUserPaymentDetail(userId: string, orderId: string) {
    this.ensureUserId(userId);

    const payment = await this.paymentRepo.findByOrderIdAndUser(
      orderId,
      userId,
    );

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    return payment;
  }

  adminListPayments(query: AdminListPaymentsDto) {
    return this.paymentRepo.findAdminPayments({
      orderId: query.orderId,
      userId: query.userId,
      status: query.status,
      gateway: query.gateway,
      method: query.method,
      purpose: query.purpose,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }

  async adminGetPaymentDetail(orderId: string) {
    const payment = await this.paymentRepo.findPaymentByOrderId(orderId);

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    return payment;
  }

  async adminInitiateRefund(orderId: string, dto: AdminRefundPaymentDto) {
    const payment = await this.paymentRepo.findByOrderId(orderId);

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new ConflictException('Only successful payments can be refunded');
    }

    const refundAmount = dto.amount ?? payment.netAmount;

    if (refundAmount <= 0 || refundAmount > payment.netAmount) {
      throw new BadRequestException('Invalid refund amount');
    }

    const refundPayload = {
      provider: payment.gateway,
      mode: payment.gateway === PaymentGateway.RAZORPAY ? 'razorpay' : 'manual',
      refundId: `RFND_${Date.now()}_${randomUUID().slice(0, 8).toUpperCase()}`,
      reason: dto.reason ?? 'Admin initiated refund',
      amount: refundAmount,
      initiatedAt: new Date().toISOString(),
    };

    const updated = await this.paymentRepo.markRefunded(orderId, refundPayload);

    if (!updated) {
      throw new BadRequestException('Unable to initiate refund');
    }

    return {
      orderId: updated.orderId,
      status: updated.status,
      refund: refundPayload,
    };
  }

  async adminReconcilePayments(query: PaymentReconciliationDto) {
    const fromDate = query.fromDate
      ? new Date(query.fromDate)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const toDate = query.toDate ? new Date(query.toDate) : new Date();
    const staleMinutes = query.stalePendingMinutes ?? 30;
    const staleBefore = new Date(Date.now() - staleMinutes * 60 * 1000);

    const [summary, stalePendingCount] = await Promise.all([
      this.paymentRepo.getStatusSummary({ fromDate, toDate }),
      this.paymentRepo.countStalePending(staleBefore, fromDate, toDate),
    ]);

    const totals = summary.reduce(
      (acc, item) => {
        acc.totalTransactions += item.count;
        acc.totalNetAmount += item.netAmount;

        if (item._id === PaymentStatus.SUCCESS) {
          acc.successfulTransactions = item.count;
        }

        if (item._id === PaymentStatus.FAILED) {
          acc.failedTransactions = item.count;
        }

        return acc;
      },
      {
        totalTransactions: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        totalNetAmount: 0,
      },
    );

    return {
      range: { fromDate, toDate },
      stalePendingMinutes: staleMinutes,
      stalePendingCount,
      successRate:
        totals.totalTransactions > 0
          ? Number(
              (
                (totals.successfulTransactions / totals.totalTransactions) *
                100
              ).toFixed(2),
            )
          : 0,
      totals,
      byStatus: summary,
    };
  }

  async adminSettlementReport(query: PaymentSettlementReportDto) {
    const fromDate = query.fromDate
      ? new Date(query.fromDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = query.toDate ? new Date(query.toDate) : new Date();

    const breakdown = await this.paymentRepo.getSettlementBreakdown({
      fromDate,
      toDate,
      gateway: query.gateway,
      currency: query.currency,
    });

    const totals = breakdown.reduce(
      (acc, item) => {
        acc.count += item.count;

        if (item._id.status === PaymentStatus.SUCCESS) {
          acc.grossSettled += item.amount;
        }

        if (item._id.status === PaymentStatus.REFUNDED) {
          acc.refunded += item.amount;
        }

        return acc;
      },
      { count: 0, grossSettled: 0, refunded: 0 },
    );

    return {
      provider: query.gateway ?? 'ALL',
      currency: query.currency ?? 'ALL',
      range: { fromDate, toDate },
      totals: {
        transactionCount: totals.count,
        grossSettled: totals.grossSettled,
        refunded: totals.refunded,
        netSettled: Number((totals.grossSettled - totals.refunded).toFixed(2)),
      },
      breakdown,
    };
  }

  private ensureUserId(userId: string) {
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }
  }

  private generateOrderId() {
    return `ORD_${Date.now()}_${randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase()}`;
  }

  private generateGatewayOrderId() {
    return `GORD_${Date.now()}_${randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
  }

  private verifySignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }) {
    const secret = this.configService.get<string>('payments.signatureSecret');

    if (!secret) {
      // In local/non-integrated environments, skip strict HMAC verification.
      return true;
    }

    const payload = `${params.orderId}|${params.paymentId}`;
    const digest = createHmac('sha256', secret).update(payload).digest('hex');
    return digest === params.signature;
  }

  private verifyWebhookSignature(dto: PaymentWebhookDto, signature?: string) {
    const secret = this.configService.get<string>('payments.webhookSecret');

    if (!secret) {
      return true;
    }

    if (!signature) {
      return false;
    }

    const payload = `${dto.eventId}|${dto.orderId}|${dto.status}`;
    const digest = createHmac('sha256', secret).update(payload).digest('hex');

    return digest === signature;
  }

  private async activateSubscriptionIfRequired(
    userId: string,
    payment: {
      purpose?: PaymentPurpose;
      planId?: { toString(): string };
    },
  ) {
    if (payment.purpose !== PaymentPurpose.SUBSCRIPTION || !payment.planId) {
      return;
    }

    await this.subscriptionService.purchasePlan(
      userId,
      payment.planId.toString(),
    );
  }
}
