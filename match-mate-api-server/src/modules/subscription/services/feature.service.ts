import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FlattenMaps, Model, Types } from 'mongoose';
import type { ICacheService } from '@/modules/cache/interfaces/cache.interface';
import { CACHE_SERVICE } from '@/modules/cache/interfaces/cache.interface';
import {
  PlanFeature,
  PlanFeatureDocument,
} from '../schemas/plan-feature.schema';
import {
  Subscription,
  SubscriptionDocument,
} from '../schemas/subscription.schema';
import { FeatureKey } from '@/common/enums';
import { FeatureContext } from '../interfaces/feature-context.interface';
import { PlanService } from './plan.service';
import { ErrorCode } from '@/common/constants';
import { throwForbidden } from '@/common/exceptions/throw-app-exception';

//  Types

type LeanPlanFeature = FlattenMaps<PlanFeature> & {
  _id: Types.ObjectId;
  featureId: { key: FeatureKey };
};

const PLAN_FEATURES_CACHE_TTL = 300; // 5 minutes  plan features rarely change
const USAGE_CACHE_TTL = 86_400; // 24 hours  daily limit window

@Injectable()
export class FeatureService {
  constructor(
    @InjectModel(PlanFeature.name)
    private readonly pfModel: Model<PlanFeatureDocument>,

    @InjectModel(Subscription.name)
    private readonly subModel: Model<SubscriptionDocument>,

    @Inject(CACHE_SERVICE)
    private readonly cache: ICacheService,

    private readonly planService: PlanService,
  ) {}

  //  Feature gate

  async checkAccess(featureKey: FeatureKey, context: FeatureContext) {
    const { userId } = context;

    const subscription = await this.subModel
      .findOne({ userId, status: 'active', endDate: { $gt: new Date() } })
      .lean()
      .exec();

    if (!subscription) {
      return throwForbidden(ErrorCode.SUBSCRIPTION_REQUIRED);
    }

    const planFeatures = await this.getCachedPlanFeatures(
      subscription.planId.toString(),
    );

    const feature = planFeatures.find((pf) => pf.featureId.key === featureKey);

    if (!feature) {
      return throwForbidden(ErrorCode.SUBSCRIPTION_FEATURE_NOT_AVAILABLE, {
        reason: 'feature_not_available_on_current_plan',
      });
    }

    // -1 means unlimited
    if (typeof feature.value === 'number' && feature.value !== -1) {
      await this.checkUsageLimit(userId, featureKey, feature.value);
    }

    return { allowed: true };
  }

  //  Usage tracking (Redis)

  async checkUsageLimit(
    userId: string,
    featureKey: FeatureKey,
    limit: number,
  ): Promise<void> {
    const key = `usage:${userId}:${featureKey}:${this.getTodayKey()}`;
    const current = await this.cache.get<number>(key);

    if (current !== null && current !== undefined && current >= limit) {
      return throwForbidden(ErrorCode.SUBSCRIPTION_FEATURE_NOT_AVAILABLE, {
        reason: 'daily_feature_limit_reached',
        limit,
      });
    }

    await this.cache.incr(key);
    await this.cache.expire(key, USAGE_CACHE_TTL);
  }

  async getRemainingUsage(
    userId: string,
    featureKey: FeatureKey,
    limit: number,
  ): Promise<number> {
    const key = `usage:${userId}:${featureKey}:${this.getTodayKey()}`;
    const current = await this.cache.get<number>(key);
    return Math.max(0, limit - (current ?? 0));
  }

  //  Feature map for a user

  async getFeaturesForUser(userId: string): Promise<Record<string, unknown>> {
    const subscription = await this.subModel
      .findOne({ userId, status: 'active', endDate: { $gt: new Date() } })
      .lean()
      .exec();

    if (!subscription) {
      return {}; // Free tier  no features
    }

    const features = await this.getCachedPlanFeatures(
      subscription.planId.toString(),
    );

    const map: Record<string, unknown> = {};
    for (const feature of features) {
      map[feature.featureId.key] = feature.value ?? true;
    }
    return map;
  }

  hasFeature(features: Record<string, unknown>, key: FeatureKey): boolean {
    return Boolean(features[key]);
  }

  //  Cached plan features

  private async getCachedPlanFeatures(
    planId: string,
  ): Promise<LeanPlanFeature[]> {
    const cacheKey = `plan_features:${planId}`;
    const cached = await this.cache.get<LeanPlanFeature[]>(cacheKey);
    if (cached) return cached;

    const features = await this.pfModel
      .find({ planId: new Types.ObjectId(planId) })
      .populate<{ featureId: { key: FeatureKey } }>('featureId')
      .lean<LeanPlanFeature[]>()
      .exec();

    await this.cache.set(cacheKey, features, PLAN_FEATURES_CACHE_TTL);
    return features;
  }

  // Invalidate cache when plan features change (call from PlanService)
  async invalidatePlanFeaturesCache(planId: string): Promise<void> {
    await this.cache.del(`plan_features:${planId}`);
  }

  private getTodayKey(): string {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  }
}
