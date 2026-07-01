import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
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
import { ValidateCouponDto } from '../dto/validate-coupon.dto';
import { VerifyStoreSubscriptionDto } from '../dto/verify-store-subscription.dto';
import { PaymentGateway } from '../enums/payment-gateway.enum';
import { PaymentPurpose } from '../enums/payment-purpose.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { CouponDiscountType, CouponStatus } from '../enums/coupon.enum';
import {
  PromotionCoupon,
  PromotionCouponDocument,
} from '../schemas/promotion-coupon.schema';
import {
  PaymentInvoice,
  PaymentInvoiceDocument,
} from '../schemas/payment-invoice.schema';
import { Plan } from '@/modules/subscriptions/schemas/plan.schema';
import { SubscriptionsService } from '@/modules/subscriptions/services/subscriptions.service';
import { ReferralsService } from '@/modules/referrals/services/referrals.service';
import { WalletService } from '@/modules/referrals/services/wallet.service';
import { ProfileBoostService } from '@/modules/subscriptions/services/profile-boost.service';
import { SubscriptionStatus } from '@/common/enums';
import { ErrorCode } from '@/common/constants';
import {
  throwBadRequest,
  throwConflict,
  throwNotFound,
  throwUnauthorized,
} from '@/common/exceptions/throw-app-exception';
import { verifyPaymentSignature } from '../utils/payment-signature.util';
import {
  StoreReceiptVerifierService,
  VerifiedStoreSubscription,
} from './store-receipt-verifier.service';
import { StoreProductType } from '@/modules/subscriptions/enums/store-product-type.enum';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly configService: ConfigService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly referralsService: ReferralsService,
    private readonly walletService: WalletService,
    private readonly profileBoostService: ProfileBoostService,
    @InjectModel(Plan.name)
    private readonly planModel: Model<Plan>,
    @InjectModel(PromotionCoupon.name)
    private readonly couponModel: Model<PromotionCouponDocument>,
    @InjectModel(PaymentInvoice.name)
    private readonly invoiceModel: Model<PaymentInvoiceDocument>,
    private readonly storeReceiptVerifier: StoreReceiptVerifierService,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    this.ensureUserId(userId);

    const purpose = dto.purpose ?? PaymentPurpose.SUBSCRIPTION;
    const isCoinPack = purpose === PaymentPurpose.COIN_PACK;
    const plan = dto.planId
      ? await this.planModel.findById(dto.planId).lean().exec()
      : null;

    if (!isCoinPack && (!plan || !plan.isActive)) {
      return throwBadRequest(ErrorCode.PAYMENT_FAILED, {
        reason: 'invalid_or_inactive_plan',
      });
    }

    if (!isCoinPack && plan?.isCustom) {
      return throwBadRequest(ErrorCode.PAYMENT_FAILED, {
        reason: 'custom_plan_requires_sales_contract',
      });
    }

    if (isCoinPack && (!dto.amount || !dto.coinAmount)) {
      return throwBadRequest(ErrorCode.PAYMENT_FAILED, {
        reason: 'coin_pack_amount_and_coins_required',
      });
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

    const amount = Number(isCoinPack ? dto.amount : plan?.price);
    const discount = isCoinPack
      ? { discountAmount: 0, couponCode: undefined, couponSummary: undefined }
      : await this.calculateCouponDiscount({
          userId,
          plan: plan!,
          couponCode: dto.couponCode,
          amount,
        });
    const taxAmount = Number(((amount * taxPercentage) / 100).toFixed(2));
    const discountAmount = discount.discountAmount;
    const netAmount = Number((amount + taxAmount - discountAmount).toFixed(2));

    const orderId = this.generateOrderId();
    const gatewayOrderId = this.generateGatewayOrderId();

    const payment = await this.paymentRepo.create({
      userId: new Types.ObjectId(userId),
      planId: dto.planId ? new Types.ObjectId(dto.planId) : undefined,
      orderId,
      gatewayOrderId,
      amount,
      taxAmount,
      discountAmount,
      couponCode: discount.couponCode,
      netAmount,
      currency: (dto.currency ?? 'INR').toUpperCase(),
      status: PaymentStatus.PENDING,
      gateway: dto.gateway ?? PaymentGateway.RAZORPAY,
      purpose,
      idempotencyKey: dto.idempotencyKey,
      initiatedAt: new Date(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      metadata: {
        ...(dto.metadata ?? {}),
        description: dto.description,
        ...(isCoinPack
          ? {
              coinAmount: Math.round(Number(dto.coinAmount)),
              walletProduct: 'coin_pack',
            }
          : {}),
        coupon: discount.couponSummary,
      },
      customer: dto.customerGstin ? { gstin: dto.customerGstin } : undefined,
    });

    return {
      orderId: payment.orderId,
      gatewayOrderId: payment.gatewayOrderId,
      amount: payment.amount,
      taxAmount: payment.taxAmount,
      discountAmount: payment.discountAmount,
      netAmount: payment.netAmount,
      couponCode: payment.couponCode,
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
      return throwNotFound(ErrorCode.PAYMENT_NOT_FOUND, {
        reason: 'invalid_order',
      });
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return payment;
    }

    if (
      payment.status === PaymentStatus.REFUNDED ||
      payment.status === PaymentStatus.CANCELLED
    ) {
      return throwConflict(ErrorCode.PAYMENT_VERIFICATION_FAILED, {
        reason: 'payment_not_verifiable_in_current_state',
      });
    }

    const signatureVerified = this.verifySignature({
      orderId: dto.gatewayOrderId ?? payment.gatewayOrderId ?? dto.orderId,
      paymentId: dto.gatewayPaymentId,
      signature: dto.signature,
    });

    if (!signatureVerified) {
      return throwUnauthorized(ErrorCode.PAYMENT_VERIFICATION_FAILED, {
        reason: 'invalid_payment_signature',
      });
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
      return throwBadRequest(ErrorCode.PAYMENT_FAILED, {
        reason: 'unable_to_update_payment_status',
      });
    }

    await this.activateSubscriptionIfRequired(
      updated.userId.toString(),
      updated,
    );
    await this.activateProfileBoostIfRequired(
      updated.userId.toString(),
      updated,
    );
    await this.creditCoinPackIfRequired(updated.userId.toString(), updated);
    await this.createInvoiceIfRequired(updated);

    return updated;
  }

  async markPaymentFailed(userId: string, dto: FailPaymentDto) {
    this.ensureUserId(userId);

    const payment = await this.paymentRepo.findByOrderIdAndUser(
      dto.orderId,
      userId,
    );

    if (!payment) {
      return throwNotFound(ErrorCode.PAYMENT_NOT_FOUND, {
        reason: 'invalid_order',
      });
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return throwConflict(ErrorCode.PAYMENT_ALREADY_VERIFIED, {
        reason: 'successful_payment_cannot_be_marked_failed',
      });
    }

    const updated = await this.paymentRepo.markFailed({
      orderId: dto.orderId,
      failureCode: dto.failureCode,
      failureReason: dto.failureReason,
      gatewayPayload: dto.gatewayPayload,
    });

    if (!updated) {
      return throwBadRequest(ErrorCode.PAYMENT_FAILED, {
        reason: 'unable_to_update_payment_status',
      });
    }

    return updated;
  }

  async processWebhook(dto: PaymentWebhookDto, signature?: string) {
    const payment = await this.paymentRepo.findByOrderId(dto.orderId);

    if (!payment) {
      return throwNotFound(ErrorCode.PAYMENT_NOT_FOUND, {
        reason: 'order_not_found',
      });
    }

    if (!this.verifyWebhookSignature(dto, signature)) {
      return throwUnauthorized(ErrorCode.PAYMENT_VERIFICATION_FAILED, {
        reason: 'invalid_webhook_signature',
      });
    }

    if (payment.status === dto.status) {
      return { processed: false, duplicate: true, status: payment.status };
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
        return throwBadRequest(ErrorCode.PAYMENT_FAILED, {
          reason: 'unable_to_process_success_webhook',
        });
      }

      await this.activateSubscriptionIfRequired(
        updated.userId.toString(),
        updated,
      );
      await this.activateProfileBoostIfRequired(
        updated.userId.toString(),
        updated,
      );
      await this.creditCoinPackIfRequired(updated.userId.toString(), updated);
      await this.createInvoiceIfRequired(updated);

      return { processed: true, status: updated.status };
    }

    if (dto.status === PaymentStatus.REFUNDED) {
      const updated = await this.paymentRepo.markRefunded(
        dto.orderId,
        dto.payload,
      );

      if (!updated) {
        return throwBadRequest(ErrorCode.PAYMENT_REFUND_FAILED, {
          reason: 'unable_to_process_refund_webhook',
        });
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
      return throwBadRequest(ErrorCode.PAYMENT_FAILED, {
        reason: 'unable_to_process_failure_webhook',
      });
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
      return throwNotFound(ErrorCode.PAYMENT_NOT_FOUND);
    }

    return payment;
  }

  async validateCoupon(userId: string, dto: ValidateCouponDto) {
    const plan = await this.planModel.findById(dto.planId).lean().exec();

    if (!plan || !plan.isActive) {
      return throwBadRequest(ErrorCode.PAYMENT_FAILED, {
        reason: 'invalid_or_inactive_plan',
      });
    }

    if (plan.isCustom) {
      return throwBadRequest(ErrorCode.PAYMENT_FAILED, {
        reason: 'custom_plan_does_not_accept_coupons',
      });
    }

    const amount = Number(plan.price);
    return this.calculateCouponDiscount({
      userId,
      plan,
      couponCode: dto.code,
      amount,
    });
  }

  async verifyStoreSubscription(
    userId: string,
    dto: VerifyStoreSubscriptionDto,
  ) {
    this.ensureUserId(userId);
    this.ensureMobileStoreReceiptAllowed(dto);

    const plan = await this.planModel.findById(dto.planId).lean().exec();

    if (!plan || !plan.isActive) {
      return throwBadRequest(ErrorCode.PAYMENT_FAILED, {
        reason: 'invalid_or_inactive_plan',
      });
    }

    if (plan.isCustom) {
      return throwBadRequest(ErrorCode.PAYMENT_FAILED, {
        reason: 'custom_plan_requires_sales_contract',
      });
    }

    this.ensureStoreProductMatchesPlan(plan, dto);
    const verifiedStoreSubscription =
      await this.verifyStoreReceiptWhenRequired(dto);
    const transactionId =
      verifiedStoreSubscription?.transactionId ?? dto.transactionId;

    const existingPayment =
      await this.paymentRepo.findSuccessfulStoreTransaction({
        gateway: dto.gateway,
        transactionId,
      });

    if (existingPayment) {
      if (existingPayment.userId.toString() !== userId) {
        return throwConflict(ErrorCode.PAYMENT_VERIFICATION_FAILED, {
          reason: 'store_transaction_already_claimed',
        });
      }

      await this.subscriptionsService.reconcileStoreSubscription(userId, {
        planId: existingPayment.planId?.toString() ?? dto.planId,
        paymentId: existingPayment._id?.toString(),
        paymentProvider: dto.gateway,
        storeProductId: dto.productId,
        storeBasePlanId:
          verifiedStoreSubscription?.basePlanId ?? dto.basePlanId,
        storeOfferId: verifiedStoreSubscription?.offerId ?? dto.offerId,
        storePurchaseToken: dto.purchaseToken ?? dto.receiptData,
        storeTransactionId: transactionId,
        storeOriginalTransactionId:
          verifiedStoreSubscription?.originalTransactionId ??
          dto.originalTransactionId,
        storeEnvironment: verifiedStoreSubscription?.environment,
        storeLastVerifiedAt: new Date(),
        storeExpiresAt: verifiedStoreSubscription?.expiresAt,
        autoRenew: verifiedStoreSubscription?.autoRenew,
        status: verifiedStoreSubscription?.status,
      });

      return existingPayment;
    }

    // Store prices, tax, and offers are provider-owned. This is the catalog
    // reference amount until settlement reconciliation records provider totals.
    const amount = Number(plan.price);
    const taxAmount = 0;
    const netAmount = amount;
    const orderId = this.generateOrderId();

    const payment = await this.paymentRepo.create({
      userId: new Types.ObjectId(userId),
      planId: new Types.ObjectId(dto.planId),
      orderId,
      gatewayOrderId: transactionId,
      gatewayPaymentId: transactionId,
      amount,
      taxAmount,
      discountAmount: 0,
      netAmount,
      currency: plan.currency ?? 'INR',
      gateway: dto.gateway,
      method:
        dto.gateway === PaymentGateway.APPLE_IAP
          ? PaymentMethod.APPLE_PAY
          : PaymentMethod.GOOGLE_PAY,
      purpose: PaymentPurpose.SUBSCRIPTION,
      status: PaymentStatus.SUCCESS,
      signatureVerified: true,
      initiatedAt: new Date(),
      paidAt: new Date(),
      storeProductId: dto.productId,
      storeBasePlanId: verifiedStoreSubscription?.basePlanId ?? dto.basePlanId,
      storeOfferId: verifiedStoreSubscription?.offerId ?? dto.offerId,
      storeTransactionId: transactionId,
      storeOriginalTransactionId:
        verifiedStoreSubscription?.originalTransactionId ??
        dto.originalTransactionId,
      gatewayPayload: {
        provider: dto.gateway,
        productId: dto.productId,
        basePlanId: dto.basePlanId,
        offerId: dto.offerId,
        transactionId,
        originalTransactionId: dto.originalTransactionId,
        verification: verifiedStoreSubscription?.providerPayload,
        payload: dto.payload,
      },
      metadata: {
        pricingSource: 'internal_catalog_reference',
      },
    });

    await this.activateSubscriptionIfRequired(userId, payment, {
      paymentProvider: dto.gateway,
      autoRenew: verifiedStoreSubscription?.autoRenew ?? true,
      storeProductId: dto.productId,
      storeBasePlanId: verifiedStoreSubscription?.basePlanId ?? dto.basePlanId,
      storeOfferId: verifiedStoreSubscription?.offerId ?? dto.offerId,
      storePurchaseToken: dto.purchaseToken ?? dto.receiptData,
      storeTransactionId: transactionId,
      storeOriginalTransactionId:
        verifiedStoreSubscription?.originalTransactionId ??
        dto.originalTransactionId,
      storeEnvironment: verifiedStoreSubscription?.environment,
      storeLastVerifiedAt: new Date(),
      storeExpiresAt: verifiedStoreSubscription?.expiresAt,
      status: verifiedStoreSubscription?.status,
    });
    await this.createInvoiceIfRequired(payment);

    return payment;
  }

  async getInvoice(userId: string, orderId: string) {
    const payment = await this.paymentRepo.findByOrderIdAndUser(
      orderId,
      userId,
    );

    if (!payment) {
      return throwNotFound(ErrorCode.PAYMENT_NOT_FOUND);
    }

    const invoice = await this.invoiceModel
      .findOne({ paymentId: payment._id })
      .lean()
      .exec();

    if (!invoice) {
      return throwNotFound(ErrorCode.PAYMENT_NOT_FOUND, {
        reason: 'invoice_not_generated',
      });
    }

    return invoice;
  }

  async adminGstReport(query: { fromDate?: string; toDate?: string }) {
    const fromDate = query.fromDate
      ? new Date(query.fromDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = query.toDate ? new Date(query.toDate) : new Date();

    const invoices = await this.invoiceModel
      .find({ issuedAt: { $gte: fromDate, $lte: toDate } })
      .sort({ issuedAt: -1 })
      .lean()
      .exec();

    const totals = invoices.reduce(
      (acc, invoice) => {
        acc.taxableAmount += Number(invoice.taxableAmount ?? 0);
        acc.discountAmount += Number(invoice.discountAmount ?? 0);
        acc.gstAmount += Number(invoice.gstAmount ?? 0);
        acc.totalAmount += Number(invoice.totalAmount ?? 0);
        return acc;
      },
      {
        taxableAmount: 0,
        discountAmount: 0,
        gstAmount: 0,
        totalAmount: 0,
      },
    );

    return {
      range: { fromDate, toDate },
      invoiceCount: invoices.length,
      totals,
      invoices,
    };
  }

  async expireStalePendingPayments() {
    const result = await this.paymentRepo.expireStalePending(new Date());
    return { expiredCount: result.modifiedCount };
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
      return throwNotFound(ErrorCode.PAYMENT_NOT_FOUND);
    }

    return payment;
  }

  async adminInitiateRefund(orderId: string, dto: AdminRefundPaymentDto) {
    const payment = await this.paymentRepo.findByOrderId(orderId);

    if (!payment) {
      return throwNotFound(ErrorCode.PAYMENT_NOT_FOUND);
    }

    if (payment.status !== PaymentStatus.SUCCESS) {
      return throwConflict(ErrorCode.PAYMENT_REFUND_FAILED, {
        reason: 'only_successful_payments_can_be_refunded',
      });
    }

    const refundAmount = dto.amount ?? payment.netAmount;

    if (refundAmount <= 0 || refundAmount > payment.netAmount) {
      return throwBadRequest(ErrorCode.PAYMENT_REFUND_FAILED, {
        reason: 'invalid_refund_amount',
      });
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
      return throwBadRequest(ErrorCode.PAYMENT_REFUND_FAILED, {
        reason: 'unable_to_initiate_refund',
      });
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

    const [summary, stalePendingCount, storeRenewalCount] = await Promise.all([
      this.paymentRepo.getStatusSummary({ fromDate, toDate }),
      this.paymentRepo.countStalePending(staleBefore, fromDate, toDate),
      this.paymentRepo.countStoreRenewals({ fromDate, toDate }),
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
      storeRenewalCount,
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

  private async calculateCouponDiscount(params: {
    userId: string;
    plan: Plan & { _id: Types.ObjectId };
    couponCode?: string;
    amount: number;
  }) {
    const normalizedCode = params.couponCode?.trim().toUpperCase();

    if (!normalizedCode) {
      return {
        couponCode: undefined,
        discountAmount: 0,
        couponSummary: undefined,
      };
    }

    const now = new Date();
    const coupon = await this.couponModel
      .findOne({
        code: normalizedCode,
        status: CouponStatus.ACTIVE,
        validFrom: { $lte: now },
        validTill: { $gte: now },
      })
      .lean()
      .exec();

    if (!coupon) {
      return throwBadRequest(ErrorCode.PAYMENT_FAILED, {
        reason: 'coupon_invalid_or_expired',
      });
    }

    if (
      coupon.eligibleTiers?.length &&
      !coupon.eligibleTiers.includes(params.plan.tier)
    ) {
      return throwBadRequest(ErrorCode.PAYMENT_FAILED, {
        reason: 'coupon_not_valid_for_plan_tier',
      });
    }

    if (
      coupon.eligiblePlanTypes?.length &&
      !coupon.eligiblePlanTypes.includes(params.plan.planType)
    ) {
      return throwBadRequest(ErrorCode.PAYMENT_FAILED, {
        reason: 'coupon_not_valid_for_plan_type',
      });
    }

    if (
      coupon.eligiblePlanIds?.length &&
      !coupon.eligiblePlanIds.some(
        (planId) => String(planId) === String(params.plan._id),
      )
    ) {
      return throwBadRequest(ErrorCode.PAYMENT_FAILED, {
        reason: 'coupon_not_valid_for_plan',
      });
    }

    const [totalUses, userUses] = await Promise.all([
      this.paymentRepo.countSuccessfulCouponUsage({
        couponCode: normalizedCode,
      }),
      this.paymentRepo.countSuccessfulCouponUsage({
        couponCode: normalizedCode,
        userId: params.userId,
      }),
    ]);

    if (coupon.maxRedemptions && totalUses >= coupon.maxRedemptions) {
      return throwBadRequest(ErrorCode.PAYMENT_FAILED, {
        reason: 'coupon_redemption_limit_reached',
      });
    }

    if (
      coupon.maxRedemptionsPerUser &&
      userUses >= coupon.maxRedemptionsPerUser
    ) {
      return throwBadRequest(ErrorCode.PAYMENT_FAILED, {
        reason: 'coupon_user_limit_reached',
      });
    }

    const rawDiscount =
      coupon.discountType === CouponDiscountType.PERCENT
        ? (params.amount * Number(coupon.discountValue)) / 100
        : Number(coupon.discountValue);
    const cappedDiscount = coupon.maxDiscountAmount
      ? Math.min(rawDiscount, Number(coupon.maxDiscountAmount))
      : rawDiscount;
    const discountAmount = Number(
      Math.min(params.amount, Math.max(0, cappedDiscount)).toFixed(2),
    );

    return {
      couponCode: normalizedCode,
      discountAmount,
      couponSummary: {
        code: normalizedCode,
        title: coupon.title,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
      },
    };
  }

  private ensureMobileStoreReceiptAllowed(dto: VerifyStoreSubscriptionDto) {
    const mode =
      this.configService.get<string>('payments.mobileStoreVerificationMode') ??
      'sandbox';

    if (mode === 'disabled') {
      return throwBadRequest(ErrorCode.PAYMENT_FAILED, {
        reason: 'mobile_store_billing_disabled',
      });
    }

    if (dto.gateway === PaymentGateway.APPLE_IAP && !dto.receiptData) {
      return throwBadRequest(ErrorCode.PAYMENT_VERIFICATION_FAILED, {
        reason: 'apple_receipt_required',
      });
    }

    if (dto.gateway === PaymentGateway.GOOGLE_PLAY && !dto.purchaseToken) {
      return throwBadRequest(ErrorCode.PAYMENT_VERIFICATION_FAILED, {
        reason: 'google_purchase_token_required',
      });
    }

    if (mode === 'strict') {
      const strictEnabled = this.configService.get<boolean>(
        'payments.mobileStoreStrictVerificationEnabled',
      );

      if (!strictEnabled) {
        return throwBadRequest(ErrorCode.PAYMENT_VERIFICATION_FAILED, {
          reason: 'strict_store_verification_not_configured',
        });
      }
    }
  }

  private ensureStoreProductMatchesPlan(
    plan: Plan,
    dto: VerifyStoreSubscriptionDto,
  ) {
    const mapping =
      dto.gateway === PaymentGateway.GOOGLE_PLAY
        ? plan.storeProducts?.android
        : plan.storeProducts?.ios;

    if (!mapping || mapping.productType !== StoreProductType.SUBSCRIPTION) {
      return throwBadRequest(ErrorCode.PAYMENT_VERIFICATION_FAILED, {
        reason: 'plan_not_available_on_store',
      });
    }

    if (mapping.productId !== dto.productId) {
      return throwBadRequest(ErrorCode.PAYMENT_VERIFICATION_FAILED, {
        reason: 'store_product_plan_mismatch',
      });
    }

    if (
      dto.gateway === PaymentGateway.GOOGLE_PLAY &&
      plan.storeProducts?.android?.basePlanId !== dto.basePlanId
    ) {
      return throwBadRequest(ErrorCode.PAYMENT_VERIFICATION_FAILED, {
        reason: 'store_base_plan_mismatch',
      });
    }

    if (dto.offerId && mapping.offerId !== dto.offerId) {
      return throwBadRequest(ErrorCode.PAYMENT_VERIFICATION_FAILED, {
        reason: 'store_offer_mismatch',
      });
    }
  }

  private async verifyStoreReceiptWhenRequired(
    dto: VerifyStoreSubscriptionDto,
  ): Promise<VerifiedStoreSubscription | undefined> {
    const mode =
      this.configService.get<string>('payments.mobileStoreVerificationMode') ??
      'sandbox';
    if (mode !== 'strict') return undefined;

    try {
      return await this.storeReceiptVerifier.verify(dto);
    } catch {
      return throwBadRequest(ErrorCode.PAYMENT_VERIFICATION_FAILED, {
        reason: 'store_receipt_verification_failed',
      });
    }
  }

  private async createInvoiceIfRequired(payment: {
    _id?: { toString(): string };
    orderId: string;
    userId: { toString(): string };
    planId?: { toString(): string };
    amount?: number;
    discountAmount?: number;
    taxAmount?: number;
    netAmount?: number;
    currency?: string;
    customer?: { gstin?: string };
  }) {
    if (!payment._id || !payment.orderId) {
      return;
    }

    const existing = await this.invoiceModel
      .findOne({ paymentId: new Types.ObjectId(payment._id.toString()) })
      .lean()
      .exec();

    if (existing) {
      return existing;
    }

    const issuedAt = new Date();
    const invoice = await this.invoiceModel.create({
      invoiceNumber: `INV-${issuedAt.getFullYear()}-${payment.orderId.replace(/^ORD_/, '')}`,
      paymentId: new Types.ObjectId(payment._id.toString()),
      userId: new Types.ObjectId(payment.userId.toString()),
      orderId: payment.orderId,
      planId: payment.planId
        ? new Types.ObjectId(payment.planId.toString())
        : undefined,
      currency: payment.currency ?? 'INR',
      taxableAmount: Number(payment.amount ?? 0),
      discountAmount: Number(payment.discountAmount ?? 0),
      gstPercentage: Number(
        this.configService.get<string>('payments.gstPercentage') ?? '0',
      ),
      gstAmount: Number(payment.taxAmount ?? 0),
      totalAmount: Number(payment.netAmount ?? 0),
      customerGstin: payment.customer?.gstin,
      issuedAt,
    });

    await this.paymentRepo.attachInvoice(
      payment.orderId,
      new Types.ObjectId(invoice._id.toString()),
    );

    return invoice;
  }

  private ensureUserId(userId: string) {
    if (!userId) {
      return throwUnauthorized(ErrorCode.AUTH_UNAUTHORIZED);
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
      return this.canAllowUnsignedPaymentVerification();
    }

    const payload = `${params.orderId}|${params.paymentId}`;
    return verifyPaymentSignature(payload, params.signature, secret);
  }

  private verifyWebhookSignature(dto: PaymentWebhookDto, signature?: string) {
    const secret = this.configService.get<string>('payments.webhookSecret');

    if (!secret) {
      return this.canAllowUnsignedPaymentVerification();
    }

    if (!signature) {
      return false;
    }

    const payload = `${dto.eventId}|${dto.orderId}|${dto.status}`;
    return verifyPaymentSignature(payload, signature, secret);
  }

  private canAllowUnsignedPaymentVerification() {
    const env = this.configService.get<string>('env', 'development');
    const allowUnsigned = this.configService.get<boolean>(
      'payments.allowUnsignedVerification',
      false,
    );
    return env !== 'production' && allowUnsigned;
  }

  private async activateSubscriptionIfRequired(
    userId: string,
    payment: {
      _id?: { toString(): string };
      purpose?: PaymentPurpose;
      planId?: { toString(): string };
      netAmount?: number;
      gateway?: PaymentGateway;
      storeProductId?: string;
      storeBasePlanId?: string;
      storeOfferId?: string;
      storePurchaseToken?: string;
      storeTransactionId?: string;
      storeOriginalTransactionId?: string;
      storeEnvironment?: string;
      storeLastVerifiedAt?: Date;
      storeExpiresAt?: Date;
    },
    options?: {
      paymentProvider?: PaymentGateway;
      autoRenew?: boolean;
      storeProductId?: string;
      storeBasePlanId?: string;
      storeOfferId?: string;
      storePurchaseToken?: string;
      storeTransactionId?: string;
      storeOriginalTransactionId?: string;
      storeEnvironment?: string;
      storeLastVerifiedAt?: Date;
      storeExpiresAt?: Date;
      status?: SubscriptionStatus.ACTIVE | SubscriptionStatus.GRACE_PERIOD;
    },
  ) {
    if (payment.purpose !== PaymentPurpose.SUBSCRIPTION || !payment.planId) {
      return;
    }

    await this.subscriptionsService.purchasePlan(
      userId,
      payment.planId.toString(),
      {
        paymentId: payment._id?.toString(),
        paymentProvider: options?.paymentProvider ?? payment.gateway,
        autoRenew: options?.autoRenew,
        storeProductId: options?.storeProductId ?? payment.storeProductId,
        storeBasePlanId: options?.storeBasePlanId,
        storeOfferId: options?.storeOfferId,
        storePurchaseToken: options?.storePurchaseToken,
        storeTransactionId:
          options?.storeTransactionId ?? payment.storeTransactionId,
        storeOriginalTransactionId:
          options?.storeOriginalTransactionId ??
          payment.storeOriginalTransactionId,
        storeEnvironment: options?.storeEnvironment,
        storeLastVerifiedAt: options?.storeLastVerifiedAt,
        storeExpiresAt: options?.storeExpiresAt,
        status: options?.status,
      },
    );
    await this.referralsService.awardSubscriptionReward(userId, {
      paymentId: payment._id?.toString(),
      netAmount: payment.netAmount,
    });
  }

  private async activateProfileBoostIfRequired(
    userId: string,
    payment: {
      _id?: { toString(): string };
      purpose?: PaymentPurpose;
      planId?: { toString(): string };
      metadata?: Record<string, unknown>;
    },
  ) {
    if (payment.purpose !== PaymentPurpose.PROFILE_BOOST) {
      return;
    }

    const durationHours = Number(payment.metadata?.durationHours ?? 24);
    const multiplier = Number(payment.metadata?.multiplier ?? 1.25);

    await this.profileBoostService.activateBoost({
      userId,
      paymentId: payment._id?.toString(),
      planId: payment.planId?.toString(),
      durationHours: Number.isFinite(durationHours) ? durationHours : 24,
      multiplier: Number.isFinite(multiplier) ? multiplier : 1.25,
      source: 'payment',
    });
  }

  private async creditCoinPackIfRequired(
    userId: string,
    payment: {
      _id?: { toString(): string };
      purpose?: PaymentPurpose;
      metadata?: Record<string, unknown>;
      orderId?: string;
      netAmount?: number;
      currency?: string;
    },
  ) {
    if (payment.purpose !== PaymentPurpose.COIN_PACK) {
      return;
    }

    const coins = Math.round(Number(payment.metadata?.coinAmount ?? 0));
    if (!Number.isFinite(coins) || coins <= 0) {
      return throwBadRequest(ErrorCode.PAYMENT_FAILED, {
        reason: 'coin_pack_missing_coin_amount',
      });
    }

    await this.walletService.creditCoinPurchase({
      userId,
      coins,
      paymentId: payment._id?.toString() ?? payment.orderId ?? randomUUID(),
      metadata: {
        orderId: payment.orderId,
        netAmount: payment.netAmount,
        currency: payment.currency,
      },
    });
  }
}
