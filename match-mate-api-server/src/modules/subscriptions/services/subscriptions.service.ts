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
import { PlanTier, PlanType, SubscriptionStatus } from '@/common/enums';
import { PaymentGateway } from '@/modules/payments/enums/payment-gateway.enum';
import { PaymentStatus } from '@/modules/payments/enums/payment-status.enum';
import { ErrorCode } from '@/common/constants';
import { throwNotFound } from '@/common/exceptions/throw-app-exception';
import type { GooglePlaySubscriptionLifecycle } from '@/modules/payments/services/store-receipt-verifier.service';

@Injectable()
export class SubscriptionsService {
  constructor(
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
        status: {
          $in: [
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.TRIAL,
            SubscriptionStatus.GRACE_PERIOD,
          ],
        },
      },
      {
        $set: {
          status: SubscriptionStatus.EXPIRED,
          cancelledAt: new Date(),
        },
      },
    );

    const startDate = new Date();
    const endDate =
      options?.storeExpiresAt ??
      new Date(startDate.getTime() + plan.durationDays * 86_400_000);

    const subscription = await this.subModel.create({
      userId: new Types.ObjectId(userId),
      planId: new Types.ObjectId(planId),
      startDate,
      endDate,
      status: options?.status ?? SubscriptionStatus.ACTIVE,
      paymentId: options?.paymentId,
      paymentProvider: options?.paymentProvider,
      autoRenew: options?.autoRenew ?? Boolean(plan.autoRenewDefault),
      trialEndsAt: options?.trialEndsAt,
      storeProductId: options?.storeProductId,
      storeBasePlanId: options?.storeBasePlanId,
      storeOfferId: options?.storeOfferId,
      storePurchaseToken: options?.storePurchaseToken,
      storeTransactionId: options?.storeTransactionId,
      storeOriginalTransactionId: options?.storeOriginalTransactionId,
      storeEnvironment: options?.storeEnvironment,
      storeLastVerifiedAt: options?.storeLastVerifiedAt,
    });

    // Sync user membership tier for fast reads
    await this.userRepo.updateMembership(userId, {
      tier: plan.tier ?? PlanTier.FREE,
      status: options?.status ?? SubscriptionStatus.ACTIVE,
      startDate,
      expiresAt: endDate,
      autoRenew: options?.autoRenew ?? Boolean(plan.autoRenewDefault),
      planId: planId,
    });

    return { success: true, subscription };
  }

  async reconcileStoreSubscription(
    userId: string,
    options: {
      planId: string;
      paymentId?: string;
      paymentProvider: PaymentGateway;
      storeProductId: string;
      storeBasePlanId?: string;
      storeOfferId?: string;
      storePurchaseToken?: string;
      storeTransactionId: string;
      storeOriginalTransactionId?: string;
      storeEnvironment?: string;
      storeLastVerifiedAt?: Date;
      storeExpiresAt?: Date;
      autoRenew?: boolean;
      status?: SubscriptionStatus.ACTIVE | SubscriptionStatus.GRACE_PERIOD;
    },
  ) {
    const existing = await this.subModel
      .findOne({
        userId: new Types.ObjectId(userId),
        storeTransactionId: options.storeTransactionId,
      })
      .exec();

    if (existing) {
      existing.autoRenew = options.autoRenew ?? existing.autoRenew;
      existing.status = options.status ?? SubscriptionStatus.ACTIVE;
      existing.endDate = options.storeExpiresAt ?? existing.endDate;
      existing.storeLastVerifiedAt = options.storeLastVerifiedAt ?? new Date();
      await existing.save();

      const plan = await this.planModel.findById(options.planId).lean().exec();
      await this.userRepo.updateMembership(userId, {
        tier: plan?.tier ?? PlanTier.FREE,
        status: existing.status,
        startDate: existing.startDate,
        expiresAt: existing.endDate,
        autoRenew: existing.autoRenew,
        planId: options.planId,
      });

      return { success: true, subscription: existing, reconciled: true };
    }

    return this.purchasePlan(userId, options.planId, {
      paymentId: options.paymentId,
      paymentProvider: options.paymentProvider,
      autoRenew: options.autoRenew ?? true,
      storeProductId: options.storeProductId,
      storeBasePlanId: options.storeBasePlanId,
      storeOfferId: options.storeOfferId,
      storePurchaseToken: options.storePurchaseToken,
      storeTransactionId: options.storeTransactionId,
      storeOriginalTransactionId: options.storeOriginalTransactionId,
      storeEnvironment: options.storeEnvironment,
      storeLastVerifiedAt: options.storeLastVerifiedAt,
      storeExpiresAt: options.storeExpiresAt,
      status: options.status,
    });
  }

  async reconcileGooglePlayLifecycle(
    purchaseToken: string,
    lifecycle: GooglePlaySubscriptionLifecycle,
  ) {
    const subscription = await this.subModel
      .findOne({
        paymentProvider: PaymentGateway.GOOGLE_PLAY,
        storePurchaseToken: purchaseToken,
      })
      .exec();

    if (!subscription) return null;

    subscription.status = lifecycle.status;
    subscription.endDate = lifecycle.expiresAt;
    subscription.autoRenew = lifecycle.autoRenew;
    subscription.storeProductId = lifecycle.productId;
    subscription.storeBasePlanId = lifecycle.basePlanId;
    subscription.storeOfferId = lifecycle.offerId;
    subscription.storeLastVerifiedAt = new Date();
    if (lifecycle.transactionId) {
      subscription.storeTransactionId = lifecycle.transactionId;
    }
    if (
      lifecycle.status === SubscriptionStatus.EXPIRED ||
      lifecycle.status === SubscriptionStatus.CANCELLED
    ) {
      subscription.cancelledAt ??= new Date();
      subscription.cancelledReason = lifecycle.subscriptionState;
    }
    await subscription.save();

    const storeProductQuery: Record<string, unknown> = {
      isActive: true,
      'storeProducts.android.productId': lifecycle.productId,
    };
    if (lifecycle.basePlanId) {
      storeProductQuery['storeProducts.android.basePlanId'] =
        lifecycle.basePlanId;
    }
    const mappedPlan = await this.planModel
      .findOne(storeProductQuery)
      .lean()
      .exec();
    const plan =
      mappedPlan ??
      (await this.planModel.findById(subscription.planId).lean().exec());
    if (mappedPlan?._id) {
      subscription.planId = mappedPlan._id;
    }
    const entitled = [
      SubscriptionStatus.ACTIVE,
      SubscriptionStatus.GRACE_PERIOD,
    ].includes(lifecycle.status);
    await this.userRepo.updateMembership(subscription.userId.toString(), {
      tier: entitled ? (plan?.tier ?? PlanTier.FREE) : PlanTier.FREE,
      status: lifecycle.status,
      startDate: subscription.startDate,
      expiresAt: lifecycle.expiresAt,
      autoRenew: lifecycle.autoRenew,
      planId: (mappedPlan?._id ?? subscription.planId).toString(),
    });

    return subscription;
  }

  async revokeGooglePlayEntitlement(purchaseToken: string, reason: string) {
    const subscription = await this.subModel
      .findOne({
        paymentProvider: PaymentGateway.GOOGLE_PLAY,
        storePurchaseToken: purchaseToken,
      })
      .exec();
    if (!subscription) return null;

    const revokedAt = new Date();
    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.endDate = revokedAt;
    subscription.autoRenew = false;
    subscription.cancelledAt = revokedAt;
    subscription.cancelledReason = reason;
    subscription.storeLastVerifiedAt = revokedAt;
    await subscription.save();
    await this.userRepo.updateMembership(subscription.userId.toString(), {
      tier: PlanTier.FREE,
      status: SubscriptionStatus.CANCELLED,
      startDate: subscription.startDate,
      expiresAt: revokedAt,
      autoRenew: false,
      planId: subscription.planId.toString(),
    });
    return subscription;
  }

  async startFreeTrial(userId: string, planId: string, trialDays?: number) {
    const requestedPlan = await this.planModel.findById(planId).lean().exec();

    if (
      !requestedPlan ||
      !requestedPlan.isActive ||
      requestedPlan.price <= 0 ||
      requestedPlan.planType === PlanType.PROFILE_BOOST ||
      requestedPlan.isCustom
    ) {
      return throwNotFound(ErrorCode.SUBSCRIPTION_NOT_FOUND, {
        reason: 'trial_plan_not_available',
      });
    }

    const paidPlanIds = await this.planModel
      .find({
        price: { $gt: 0 },
        planType: { $ne: PlanType.PROFILE_BOOST },
      })
      .select('_id')
      .lean()
      .exec();

    const previousSubscription = await this.subModel
      .exists({
        userId: new Types.ObjectId(userId),
        planId: { $in: paidPlanIds.map((plan) => plan._id) },
      })
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

    const effectiveTrialDays = trialDays ?? requestedPlan.trialDays ?? 7;
    const trialEndsAt = new Date(Date.now() + effectiveTrialDays * 86_400_000);
    const result = await this.purchasePlan(userId, planId, {
      trialEndsAt,
      autoRenew: false,
    });

    const trialSubscription = await this.subModel.findByIdAndUpdate(
      result.subscription._id,
      {
        $set: { status: SubscriptionStatus.TRIAL, endDate: trialEndsAt },
      },
      { new: true },
    );

    await this.userRepo.updateMembership(userId, {
      tier: requestedPlan.tier ?? PlanTier.FREE,
      status: SubscriptionStatus.TRIAL,
      startDate: result.subscription.startDate,
      expiresAt: trialEndsAt,
      autoRenew: false,
      planId,
    });

    return { success: true, subscription: trialSubscription };
  }

  async getActiveSubscription(userId: string) {
    const now = new Date();
    const userObjectId = new Types.ObjectId(userId);
    const overdueFilter = {
      userId: userObjectId,
      status: {
        $in: [
          SubscriptionStatus.ACTIVE,
          SubscriptionStatus.TRIAL,
          SubscriptionStatus.GRACE_PERIOD,
        ],
      },
      endDate: { $lte: now },
    };

    const overdueUserIds = await this.subModel
      .distinct('userId', overdueFilter)
      .exec();
    if (overdueUserIds.length > 0) {
      await this.subModel.updateMany(overdueFilter, {
        $set: { status: SubscriptionStatus.EXPIRED },
      });
      await this.userRepo.expireMemberships(
        overdueUserIds.map((id) => id.toString()),
        now,
      );
    }

    const activeSubscription = await this.subModel
      .findOne({
        userId: userObjectId,
        status: {
          $in: [
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.TRIAL,
            SubscriptionStatus.GRACE_PERIOD,
          ],
        },
        endDate: { $gt: now },
      })
      .populate('planId')
      .lean()
      .exec();

    if (activeSubscription) return activeSubscription;

    const freePlan = await this.planModel
      .findOne({
        tier: PlanTier.FREE,
        isActive: true,
        planType: { $ne: PlanType.PROFILE_BOOST },
      })
      .lean()
      .exec();

    if (!freePlan) return null;

    return {
      _id: null,
      userId: userObjectId,
      planId: freePlan,
      startDate: null,
      endDate: null,
      status: SubscriptionStatus.ACTIVE,
      autoRenew: false,
      isFallback: true,
    };
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
      status: {
        $in: [
          SubscriptionStatus.ACTIVE,
          SubscriptionStatus.TRIAL,
          SubscriptionStatus.GRACE_PERIOD,
        ],
      },
    });

    if (!sub) return throwNotFound(ErrorCode.SUBSCRIPTION_NOT_FOUND);

    sub.autoRenew = false;
    sub.cancelledAt = new Date();
    sub.cancelledReason = reason;

    if (sub.status === SubscriptionStatus.TRIAL) {
      sub.status = SubscriptionStatus.CANCELLED;
      sub.endDate = new Date();
    }

    await sub.save();

    const plan = await this.planModel.findById(sub.planId).lean().exec();

    await this.userRepo.updateMembership(userId, {
      tier:
        sub.status === SubscriptionStatus.CANCELLED
          ? PlanTier.FREE
          : (plan?.tier ?? PlanTier.FREE),
      status: sub.status,
      startDate: sub.startDate,
      expiresAt: sub.endDate,
      autoRenew: false,
      planId: sub.planId.toString(),
    });

    return { success: true, subscription: sub };
  }

  // Called by cron to expire subscriptions past their endDate
  async expireOverdueSubscriptions() {
    const expiredAt = new Date();
    const filter = {
      status: {
        $in: [
          SubscriptionStatus.ACTIVE,
          SubscriptionStatus.TRIAL,
          SubscriptionStatus.GRACE_PERIOD,
        ],
      },
      endDate: { $lt: expiredAt },
    };
    const userIds = await this.subModel.distinct('userId', filter).exec();
    const result = await this.subModel.updateMany(filter, {
      $set: { status: SubscriptionStatus.EXPIRED },
    });
    await this.userRepo.expireMemberships(
      userIds.map((id) => id.toString()),
      expiredAt,
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
