import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription } from './schemas/subscription.schema';
import { UserRepository } from '../auth/repositories/user.repository';
import { Plan } from '../plan/schemas/plan.schema';
import { PlanTier } from 'src/common/enums';
import { SubscriptionStatus } from 'src/common/enums/subscription-status.enum';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel('Subscription')
    private subModel: Model<Subscription>,

    @InjectModel('Plan')
    private planModel: Model<Plan>,

    private userRepo: UserRepository,
  ) {}

  async purchasePlan(userId: string, planId: string) {
    const plan = await this.planModel.findById(planId);

    if (!plan) throw new Error('Plan not found');

    const startDate = new Date();
    const endDate = new Date(
      startDate.getTime() + plan.durationDays * 86400000,
    );

    await this.subModel.create({
      userId,
      planId,
      startDate,
      endDate,
    });

    // 🔥 UPDATE USER MEMBERSHIP
    await this.userRepo.updateMembership(userId, {
      tier: PlanTier.FREE,
      status: SubscriptionStatus.ACTIVE,
      startDate: startDate,
      expiresAt: endDate,
    });

    return { success: true };
  }
}
