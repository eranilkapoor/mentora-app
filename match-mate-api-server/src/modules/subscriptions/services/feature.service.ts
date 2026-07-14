import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FlattenMaps, Model, Types } from 'mongoose';
import type { ICacheService } from '@/common/cache/interfaces/cache.interface';
import { CACHE_SERVICE } from '@/common/cache/cache.constants';
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
import { Plan, PlanDocument } from '../schemas/plan.schema';
import { SubscriptionStatus, PlanTier } from '@/common/enums';

//  Types

type LeanPlanFeature = FlattenMaps<PlanFeature> & {
  _id: Types.ObjectId;
  featureId: {
    key: FeatureKey;
    type?: 'boolean' | 'limit' | 'quota' | 'tier' | 'duration';
    isActive?: boolean;
  };
};

const PLAN_FEATURES_CACHE_TTL = 300; // 5 minutes  plan features rarely change
const USAGE_CACHE_TTL = 86_400; // 24 hours  daily limit window
const MONTHLY_USAGE_CACHE_TTL = 32 * 86_400;

type UsageWindow = 'day' | 'month';

@Injectable()
export class FeatureService {
  constructor(
    @InjectModel(PlanFeature.name)
    private readonly pfModel: Model<PlanFeatureDocument>,

    @InjectModel(Subscription.name)
    private readonly subModel: Model<SubscriptionDocument>,

    @InjectModel(Plan.name)
    private readonly planModel: Model<PlanDocument>,

    @Inject(CACHE_SERVICE)
    private readonly cache: ICacheService,

    private readonly planService: PlanService,
  ) {}

  //  Feature gate

  async checkAccess(featureKey: FeatureKey, context: FeatureContext) {
    const { userId } = context;

    const planId = await this.resolvePlanIdForUser(userId);

    if (!planId) {
      return throwForbidden(ErrorCode.SUBSCRIPTION_REQUIRED);
    }

    const planFeatures = await this.getCachedPlanFeatures(planId);

    const feature = planFeatures.find((pf) => pf.featureId.key === featureKey);

    if (!feature) {
      return throwForbidden(ErrorCode.SUBSCRIPTION_FEATURE_NOT_AVAILABLE, {
        reason: 'feature_not_available_on_current_plan',
      });
    }

    const autoTrackedUsageFeatures = new Set<FeatureKey>([
      FeatureKey.SEND_INTEREST,
      FeatureKey.MESSAGE_LIMIT,
      FeatureKey.DAILY_PROFILE_VIEWS,
      FeatureKey.PROFILE_BOOST,
    ]);

    // Only action-style limits consume usage here; capacity limits are enforced
    // by their owning services.
    if (
      autoTrackedUsageFeatures.has(featureKey) &&
      typeof feature.value === 'number' &&
      feature.value !== -1
    ) {
      await this.checkUsageLimit(
        userId,
        featureKey,
        feature.value,
        featureKey === FeatureKey.MESSAGE_LIMIT ? 'month' : 'day',
      );
    }

    return { allowed: true };
  }

  //  Usage tracking (Redis)

  async checkUsageLimit(
    userId: string,
    featureKey: FeatureKey,
    limit: number,
    window: UsageWindow = 'day',
  ): Promise<void> {
    if (!Number.isFinite(limit) || limit <= 0) {
      return throwForbidden(ErrorCode.SUBSCRIPTION_FEATURE_NOT_AVAILABLE, {
        reason: 'feature_limit_reached',
        limit,
      });
    }

    const key = `usage:${userId}:${featureKey}:${this.getWindowKey(window)}`;
    const counter = await this.cache.incrementWithExpiry(
      key,
      this.getUsageTtl(window),
    );

    if (counter.value > limit) {
      return throwForbidden(ErrorCode.SUBSCRIPTION_FEATURE_NOT_AVAILABLE, {
        reason: 'daily_feature_limit_reached',
        limit,
      });
    }
  }

  async checkUniqueUsageLimit(
    userId: string,
    featureKey: FeatureKey,
    limit: number,
    uniqueId: string,
    window: UsageWindow = 'month',
  ): Promise<void> {
    const windowKey = this.getWindowKey(window);
    const markerKey = `usage:${userId}:${featureKey}:${windowKey}:item:${uniqueId}`;

    if (await this.cache.has(markerKey)) return;

    await this.checkUsageLimit(userId, featureKey, limit, window);
    await this.cache.set(markerKey, true, this.getUsageTtl(window));
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
    const planId = await this.resolvePlanIdForUser(userId);

    if (!planId) {
      return {}; // Free tier  no features
    }

    const features = await this.getCachedPlanFeatures(planId);

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
      .populate<{
        featureId: {
          key: FeatureKey;
          type?: 'boolean' | 'limit' | 'quota' | 'tier' | 'duration';
          isActive?: boolean;
        };
      }>('featureId', 'key type isActive')
      .lean<LeanPlanFeature[]>()
      .exec();

    const activeFeatures = features.filter(
      (feature) =>
        Boolean(feature.featureId) && feature.featureId.isActive !== false,
    );

    await this.cache.set(cacheKey, activeFeatures, PLAN_FEATURES_CACHE_TTL);
    return activeFeatures;
  }

  // Invalidate cache when plan features change (call from PlanService)
  async invalidatePlanFeaturesCache(planId: string): Promise<void> {
    await this.cache.del(`plan_features:${planId}`);
  }

  private getTodayKey(): string {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  }

  private getMonthKey(): string {
    return new Date().toISOString().slice(0, 7); // YYYY-MM
  }

  private getWindowKey(window: UsageWindow): string {
    return window === 'month' ? this.getMonthKey() : this.getTodayKey();
  }

  private getUsageTtl(window: UsageWindow): number {
    return window === 'month' ? MONTHLY_USAGE_CACHE_TTL : USAGE_CACHE_TTL;
  }

  private async resolvePlanIdForUser(userId: string): Promise<string | null> {
    const now = new Date();
    const subscription = await this.subModel
      .findOne({
        userId: new Types.ObjectId(userId),
        status: {
          $in: [
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.TRIAL,
            SubscriptionStatus.GRACE_PERIOD,
          ],
        },
        endDate: { $gt: now },
      })
      .sort({ endDate: -1 })
      .lean()
      .exec();

    if (subscription?.planId) {
      return subscription.planId.toString();
    }

    const freePlan = await this.planModel
      .findOne({ tier: PlanTier.FREE, isActive: true })
      .select('_id')
      .lean()
      .exec();

    return freePlan?._id.toString() ?? null;
  }
}
