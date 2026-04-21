import { Injectable, ForbiddenException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PlanService } from './plan.service';
import type { ICacheService } from 'src/modules/cache/interfaces/cache.interface';
import { CACHE_SERVICE } from 'src/modules/cache/interfaces/cache.interface';
import { PlanFeature } from '../schemas/plan-feature.schema';
import { Subscription } from '../../subscription/schemas/subscription.schema';
import { FeatureKey } from 'src/common/enums';
import { FeatureContext } from '../interfaces/feature-context.interface';

type PopulatedFeature = {
  key: FeatureKey;
};

type PlanFeatureWithPopulatedFeature = {
  featureId: PopulatedFeature;
  value?: number;
};

@Injectable()
export class FeatureService {
  constructor(
    @InjectModel(PlanFeature.name)
    private pfModel: Model<PlanFeature>,

    @InjectModel(Subscription.name)
    private subModel: Model<Subscription>,

    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,

    private readonly planService: PlanService,
  ) {}

  async checkAccess(featureKey: FeatureKey, context: FeatureContext) {
    const { userId } = context;

    const subscription = await this.subModel.findOne({
      userId,
      status: 'active',
    });

    if (!subscription) {
      throw new ForbiddenException('No active subscription');
    }

    const planFeatures = await this.pfModel
      .find({ planId: subscription.planId })
      .populate('featureId')
      .lean<PlanFeatureWithPopulatedFeature[]>();

    const feature = planFeatures.find((pf) => pf.featureId.key === featureKey);

    if (!feature) {
      throw new ForbiddenException('Upgrade your plan');
    }

    // Handle limits for finite feature values.
    if (typeof feature.value === 'number' && feature.value !== -1) {
      await this.checkUsageLimit(userId, featureKey, feature.value);
    }

    return { allowed: true };
  }

  async checkUsageLimit(userId: string, featureKey: FeatureKey, limit: number) {
    const key = `usage:${userId}:${featureKey}:${this.getTodayKey()}`;

    const current = await this.cache.get<number>(key);

    if (current && current >= limit) {
      throw new ForbiddenException('Limit exceeded');
    }

    await this.cache.incr(key);

    // expire in 24h
    await this.cache.expire(key, 86400);

    return current;
  }

  private getTodayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  async getFeaturesForUser(user: unknown): Promise<Record<string, unknown>> {
    const planId = this.getPlanIdFromUser(user);
    const features = await this.planService.getPlanFeatures(planId);

    const map: Record<string, unknown> = {};

    for (const feature of features as unknown[]) {
      if (this.isPlanFeatureWithPopulatedFeature(feature)) {
        map[feature.featureId.key] = feature.value ?? true;
      }
    }

    return map;
  }

  hasFeature(features: Record<string, unknown>, key: string) {
    return Boolean(features[key]);
  }

  private getPlanIdFromUser(user: unknown): string {
    if (typeof user !== 'object' || user === null || !('membership' in user)) {
      throw new ForbiddenException('No active subscription');
    }

    const membership = (user as { membership: unknown }).membership;
    if (
      typeof membership !== 'object' ||
      membership === null ||
      !('planId' in membership)
    ) {
      throw new ForbiddenException('No active subscription');
    }

    const planId = (membership as { planId: unknown }).planId;
    if (planId === undefined || planId === null) {
      throw new ForbiddenException('No active subscription');
    }

    if (typeof planId === 'string') {
      return planId;
    }

    if (planId instanceof Types.ObjectId) {
      return planId.toHexString();
    }

    throw new ForbiddenException('No active subscription');
  }

  private isPlanFeatureWithPopulatedFeature(
    feature: unknown,
  ): feature is PlanFeatureWithPopulatedFeature {
    if (
      typeof feature !== 'object' ||
      feature === null ||
      !('featureId' in feature)
    ) {
      return false;
    }

    const featureId = (feature as { featureId: unknown }).featureId;
    if (
      typeof featureId !== 'object' ||
      featureId === null ||
      !('key' in featureId)
    ) {
      return false;
    }

    return typeof (featureId as { key: unknown }).key === 'string';
  }
}
