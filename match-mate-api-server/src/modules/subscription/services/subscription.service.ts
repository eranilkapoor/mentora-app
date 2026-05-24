import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Subscription,
  SubscriptionDocument,
} from '../schemas/subscription.schema';
import { Plan, PlanDocument } from '../schemas/plan.schema';
import { UserRepository } from '../../auth/repositories/user.repository';
import { PlanTier } from 'src/common/enums';
import { SubscriptionStatus } from 'src/common/enums/subscription-status.enum';

@Injectable()
export class SubscriptionService {
  constructor(
    // Fixed: use Subscription.name instead of string literal
    @InjectModel(Subscription.name)
    private readonly subModel: Model<SubscriptionDocument>,

    @InjectModel(Plan.name)
    private readonly planModel: Model<PlanDocument>,

    private readonly userRepo: UserRepository,
  ) {}

  async purchasePlan(userId: string, planId: string) {
    const plan = await this.planModel.findById(planId).lean().exec();

    if (!plan || !plan.isActive) {
      throw new NotFoundException('Plan not found or inactive');
    }

    // Expire any existing active subscription for this user
    await this.subModel.updateMany(
      {
        userId: new Types.ObjectId(userId),
        status: SubscriptionStatus.ACTIVE,
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

  async getActiveSubscription(userId: string) {
    return this.subModel
      .findOne({
        userId: new Types.ObjectId(userId),
        status: SubscriptionStatus.ACTIVE,
        endDate: { $gt: new Date() },
      })
      .populate('planId')
      .lean()
      .exec();
  }

  async cancelSubscription(userId: string, reason?: string) {
    const sub = await this.subModel.findOne({
      userId: new Types.ObjectId(userId),
      status: SubscriptionStatus.ACTIVE,
    });

    if (!sub) throw new NotFoundException('No active subscription found');

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
        status: SubscriptionStatus.ACTIVE,
        endDate: { $lt: new Date() },
      },
      { $set: { status: SubscriptionStatus.EXPIRED } },
    );
    return { expiredCount: result.modifiedCount };
  }
}
