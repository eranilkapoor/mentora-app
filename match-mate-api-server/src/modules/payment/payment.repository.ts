import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { PaymentStatus } from './enums/payment-status.enum';
import { PaymentGateway } from './enums/payment-gateway.enum';
import { PaymentMethod } from './enums/payment-method.enum';
import { PaymentPurpose } from './enums/payment-purpose.enum';

@Injectable()
export class PaymentRepository {
  constructor(
    @InjectModel(Payment.name)
    private readonly model: Model<PaymentDocument>,
  ) {}

  create(data: Partial<Payment>) {
    return this.model.create(data);
  }

  findByOrderId(orderId: string) {
    return this.model.findOne({ orderId }).exec();
  }

  findByOrderIdAndUser(orderId: string, userId: string) {
    return this.model
      .findOne({ orderId, userId: new Types.ObjectId(userId) })
      .exec();
  }

  findByIdempotencyKey(userId: string, idempotencyKey: string) {
    return this.model
      .findOne({ userId: new Types.ObjectId(userId), idempotencyKey })
      .exec();
  }

  markSuccess(params: {
    orderId: string;
    gatewayPaymentId: string;
    gatewayOrderId?: string;
    method?: PaymentMethod;
    signatureVerified: boolean;
    gatewayPayload?: Record<string, unknown>;
  }) {
    return this.model
      .findOneAndUpdate(
        { orderId: params.orderId },
        {
          $set: {
            status: PaymentStatus.SUCCESS,
            gatewayPaymentId: params.gatewayPaymentId,
            gatewayOrderId: params.gatewayOrderId,
            method: params.method,
            signatureVerified: params.signatureVerified,
            paidAt: new Date(),
            gatewayPayload: params.gatewayPayload,
          },
          $inc: {
            attemptCount: 1,
          },
        },
        { new: true },
      )
      .exec();
  }

  markFailed(params: {
    orderId: string;
    failureCode?: string;
    failureReason?: string;
    gatewayPayload?: Record<string, unknown>;
  }) {
    return this.model
      .findOneAndUpdate(
        { orderId: params.orderId },
        {
          $set: {
            status: PaymentStatus.FAILED,
            failedAt: new Date(),
            failureCode: params.failureCode,
            failureReason: params.failureReason,
            gatewayPayload: params.gatewayPayload,
          },
          $inc: {
            attemptCount: 1,
          },
        },
        { new: true },
      )
      .exec();
  }

  markRefunded(orderId: string, gatewayPayload?: Record<string, unknown>) {
    return this.model
      .findOneAndUpdate(
        { orderId },
        {
          $set: {
            status: PaymentStatus.REFUNDED,
            refundedAt: new Date(),
            gatewayPayload,
          },
        },
        { new: true },
      )
      .exec();
  }

  async findUserPayments(params: {
    userId: string;
    page: number;
    limit: number;
    status?: PaymentStatus;
    purpose?: string;
    currency?: string;
  }) {
    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(params.userId),
    };

    if (params.status) {
      filter.status = params.status;
    }

    if (params.purpose) {
      filter.purpose = params.purpose;
    }

    if (params.currency) {
      filter.currency = params.currency;
    }

    const skip = (params.page - 1) * params.limit;

    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(params.limit)
        .lean()
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return {
      items,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async findAdminPayments(params: {
    orderId?: string;
    userId?: string;
    status?: PaymentStatus;
    gateway?: PaymentGateway;
    method?: PaymentMethod;
    purpose?: PaymentPurpose;
    fromDate?: Date;
    toDate?: Date;
    page: number;
    limit: number;
  }) {
    const filter: Record<string, unknown> = {};

    if (params.orderId) {
      filter.orderId = params.orderId;
    }

    if (params.userId) {
      filter.userId = new Types.ObjectId(params.userId);
    }

    if (params.status) {
      filter.status = params.status;
    }

    if (params.gateway) {
      filter.gateway = params.gateway;
    }

    if (params.method) {
      filter.method = params.method;
    }

    if (params.purpose) {
      filter.purpose = params.purpose;
    }

    if (params.fromDate || params.toDate) {
      filter.createdAt = {};

      if (params.fromDate) {
        (filter.createdAt as Record<string, unknown>).$gte = params.fromDate;
      }

      if (params.toDate) {
        (filter.createdAt as Record<string, unknown>).$lte = params.toDate;
      }
    }

    const skip = (params.page - 1) * params.limit;

    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(params.limit)
        .lean()
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return {
      items,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  findPaymentByOrderId(orderId: string) {
    return this.model.findOne({ orderId }).lean().exec();
  }

  async getStatusSummary(params: { fromDate: Date; toDate: Date }) {
    return this.model
      .aggregate<{ _id: PaymentStatus; count: number; netAmount: number }>([
        {
          $match: {
            createdAt: {
              $gte: params.fromDate,
              $lte: params.toDate,
            },
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            netAmount: { $sum: '$netAmount' },
          },
        },
      ])
      .exec();
  }

  countStalePending(beforeDate: Date, fromDate?: Date, toDate?: Date) {
    const filter: Record<string, unknown> = {
      status: PaymentStatus.PENDING,
      createdAt: {
        $lt: beforeDate,
      },
    };

    if (fromDate || toDate) {
      const createdAt = filter.createdAt as Record<string, unknown>;

      if (fromDate) {
        createdAt.$gte = fromDate;
      }

      if (toDate) {
        createdAt.$lte = toDate;
      }
    }

    return this.model.countDocuments(filter).exec();
  }

  async getSettlementBreakdown(params: {
    fromDate: Date;
    toDate: Date;
    gateway?: PaymentGateway;
    currency?: string;
  }) {
    const matchStage: Record<string, unknown> = {
      createdAt: {
        $gte: params.fromDate,
        $lte: params.toDate,
      },
      status: {
        $in: [PaymentStatus.SUCCESS, PaymentStatus.REFUNDED],
      },
    };

    if (params.gateway) {
      matchStage.gateway = params.gateway;
    }

    if (params.currency) {
      matchStage.currency = params.currency;
    }

    return this.model
      .aggregate<{
        _id: { day: string; gateway: PaymentGateway; status: PaymentStatus };
        count: number;
        amount: number;
      }>([
        {
          $match: matchStage,
        },
        {
          $group: {
            _id: {
              day: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$createdAt',
                },
              },
              gateway: '$gateway',
              status: '$status',
            },
            count: { $sum: 1 },
            amount: { $sum: '$netAmount' },
          },
        },
        {
          $sort: {
            '_id.day': 1,
          },
        },
      ])
      .exec();
  }
}
