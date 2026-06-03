import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Subscription,
  SubscriptionDocument,
} from '../schemas/subscription.schema';
import { Plan, PlanDocument } from '../schemas/plan.schema';
import {
  Payment,
  PaymentDocument,
} from '@/modules/payments/schemas/payment.schema';
import { UserRepository } from '@/modules/auth/repositories/user.repository';
import { PlanTier, SubscriptionStatus } from '@/common/enums';
import { PaymentGateway } from '@/modules/payments/enums/payment-gateway.enum';
import { PaymentStatus } from '@/modules/payments/enums/payment-status.enum';
import { ErrorCode } from '@/common/constants';
import { throwNotFound } from '@/common/exceptions/throw-app-exception';

@Injectable()
export class SubscriptionsService {
  constructor(
    // Fixed: use Subscription.name instead of string literal
    @InjectModel(Subscription.name)
    private readonly subModel: Model<SubscriptionDocument>,

    @InjectModel(Plan.name)
    private readonly planModel: Model<PlanDocument>,

    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,

    private readonly userRepo: UserRepository,
  ) {}

  async purchasePlan(
    userId: string,
    planId: string,
    options?: {
      paymentId?: string;
      paymentProvider?: PaymentGateway;
      autoRenew?: boolean;
      trialEndsAt?: Date;
      storeProductId?: string;
      storeTransactionId?: string;
      storeOriginalTransactionId?: string;
    },
  ) {
    const plan = await this.planModel.findById(planId).lean().exec();

    if (!plan || !plan.isActive) {
      return throwNotFound(ErrorCode.SUBSCRIPTION_NOT_FOUND, {
        reason: 'plan_not_found_or_inactive',
      });
    }

    // Expire any existing active subscription for this user
    await this.subModel.updateMany(
      {
        userId: new Types.ObjectId(userId),
        status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL] },
      },
      {
        $set: {
          status: SubscriptionStatus.EXPIRED,
          cancelledAt: new Date(),
        },
      },
    );

    const startDate = new Date();
    const endDate = new Date(
      startDate.getTime() + plan.durationDays * 86_400_000,
    );

    const subscription = await this.subModel.create({
      userId: new Types.ObjectId(userId),
      planId: new Types.ObjectId(planId),
      startDate,
      endDate,
      status: SubscriptionStatus.ACTIVE,
      paymentId: options?.paymentId,
      paymentProvider: options?.paymentProvider,
      autoRenew: options?.autoRenew ?? false,
      trialEndsAt: options?.trialEndsAt,
      storeProductId: options?.storeProductId,
      storeTransactionId: options?.storeTransactionId,
      storeOriginalTransactionId: options?.storeOriginalTransactionId,
    });

    // Sync user membership tier for fast reads
    await this.userRepo.updateMembership(userId, {
      tier: plan.tier ?? PlanTier.FREE,
      status: SubscriptionStatus.ACTIVE,
      startDate,
      expiresAt: endDate,
      planId: planId,
    });

    return { success: true, subscription };
  }

  async startFreeTrial(userId: string, planId: string, trialDays = 7) {
    const previousSubscription = await this.subModel
      .exists({ userId: new Types.ObjectId(userId) })
      .exec();
    const previousSuccessfulPayment = await this.paymentModel
      .exists({
        userId: new Types.ObjectId(userId),
        status: PaymentStatus.SUCCESS,
      })
      .exec();

    if (previousSubscription || previousSuccessfulPayment) {
      return throwNotFound(ErrorCode.SUBSCRIPTION_NOT_FOUND, {
        reason: 'free_trial_not_available',
      });
    }

    const trialEndsAt = new Date(Date.now() + trialDays * 86_400_000);
    const result = await this.purchasePlan(userId, planId, {
      trialEndsAt,
      autoRenew: false,
    });

    await this.subModel.findByIdAndUpdate(result.subscription._id, {
      $set: { status: SubscriptionStatus.TRIAL, endDate: trialEndsAt },
    });

    const plan = await this.planModel.findById(planId).lean().exec();
    await this.userRepo.updateMembership(userId, {
      tier: plan?.tier ?? PlanTier.FREE,
      status: SubscriptionStatus.TRIAL,
      startDate: result.subscription.startDate,
      expiresAt: trialEndsAt,
      planId,
    });

    return result;
  }

  async getActiveSubscription(userId: string) {
    return this.subModel
      .findOne({
        userId: new Types.ObjectId(userId),
        status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL] },
        endDate: { $gt: new Date() },
      })
      .populate('planId')
      .lean()
      .exec();
  }

  async getBillingSummary(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const now = new Date();

    const [currentPlan, subscriptions, payments, totals] = await Promise.all([
      this.getActiveSubscription(userId),
      this.subModel
        .find({ userId: userObjectId })
        .populate('planId')
        .sort({ startDate: -1, createdAt: -1 })
        .limit(25)
        .lean()
        .exec(),
      this.paymentModel
        .find({ userId: userObjectId })
        .populate('planId')
        .sort({ createdAt: -1, initiatedAt: -1 })
        .limit(25)
        .select('-gatewayPayload')
        .lean()
        .exec(),
      this.paymentModel
        .aggregate<{
          _id: string;
          totalPaid: number;
          paymentCount: number;
          lastPaymentAt?: Date;
        }>([
          {
            $match: {
              userId: userObjectId,
              status: PaymentStatus.SUCCESS,
            },
          },
          {
            $group: {
              _id: '$currency',
              totalPaid: { $sum: '$netAmount' },
              paymentCount: { $sum: 1 },
              lastPaymentAt: { $max: '$paidAt' },
            },
          },
          { $sort: { totalPaid: -1 } },
        ])
        .exec(),
    ]);

    const primaryTotal = totals[0];
    const currentSubscription = currentPlan as
      | (Record<string, unknown> & {
          endDate?: Date | string;
          autoRenew?: boolean;
        })
      | null;

    return {
      currentPlan,
      subscriptions,
      payments,
      billing: {
        currency: primaryTotal?._id ?? payments[0]?.currency ?? 'INR',
        totalPaid: primaryTotal?.totalPaid ?? 0,
        successfulPayments: primaryTotal?.paymentCount ?? 0,
        lastPaymentAt: primaryTotal?.lastPaymentAt,
        nextRenewalAt:
          currentSubscription?.autoRenew &&
          currentSubscription?.endDate &&
          new Date(currentSubscription.endDate) > now
            ? currentSubscription.endDate
            : null,
        autoRenew: Boolean(currentSubscription?.autoRenew),
      },
    };
  }

  async cancelSubscription(userId: string, reason?: string) {
    const sub = await this.subModel.findOne({
      userId: new Types.ObjectId(userId),
      status: SubscriptionStatus.ACTIVE,
    });

    if (!sub) return throwNotFound(ErrorCode.SUBSCRIPTION_NOT_FOUND);

    sub.status = SubscriptionStatus.CANCELLED;
    sub.cancelledAt = new Date();
    sub.cancelledReason = reason;
    await sub.save();

    await this.userRepo.updateMembership(userId, {
      tier: PlanTier.FREE,
      status: SubscriptionStatus.CANCELLED,
      startDate: sub.startDate,
      expiresAt: sub.endDate,
      planId: sub.planId.toString(),
    });

    return { success: true };
  }

  // Called by cron to expire subscriptions past their endDate
  async expireOverdueSubscriptions() {
    const result = await this.subModel.updateMany(
      {
        status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL] },
        endDate: { $lt: new Date() },
      },
      { $set: { status: SubscriptionStatus.EXPIRED } },
    );
    return { expiredCount: result.modifiedCount };
  }

  async markExpiryRemindersDue(offsetDays: number[]) {
    const now = new Date();
    const results = [];

    for (const offset of offsetDays) {
      const start = new Date(now.getTime() + offset * 86_400_000);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);

      const result = await this.subModel.updateMany(
        {
          status: {
            $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL],
          },
          endDate: { $gte: start, $lte: end },
          reminderOffsetsSent: { $ne: offset },
        },
        {
          $addToSet: { reminderOffsetsSent: offset },
        },
      );

      results.push({ offsetDays: offset, markedCount: result.modifiedCount });
    }

    return { reminders: results };
  }
}
