import { FeatureKey } from '@/common/enums';

export type FixedPlanSlug =
  | 'FREE'
  | 'SILVER_MONTHLY'
  | 'SILVER_QUARTERLY'
  | 'SILVER_YEARLY'
  | 'GOLD_MONTHLY'
  | 'GOLD_QUARTERLY'
  | 'GOLD_YEARLY'
  | 'PLATINUM_MONTHLY'
  | 'PLATINUM_QUARTERLY'
  | 'PLATINUM_YEARLY'
  | 'ASSISTED_HALF_YEARLY'
  | 'ASSISTED_YEARLY';

type NumericFeaturePolicy = Readonly<Partial<Record<FeatureKey, number>>>;

const FREE_LIMITS: NumericFeaturePolicy = {
  [FeatureKey.CHILD_PROFILE_LIMIT]: 1,
  [FeatureKey.AI_TUTOR_MONTHLY_MINUTES]: 120,
  [FeatureKey.AI_TUTOR_DAILY_MINUTES]: 30,
  [FeatureKey.AI_TUTOR_SESSION_LIMIT]: 8,
  [FeatureKey.AI_PRACTICE_QUESTIONS]: 50,
};

const SILVER_LIMITS: NumericFeaturePolicy = {
  [FeatureKey.CHILD_PROFILE_LIMIT]: 1,
  [FeatureKey.AI_TUTOR_MONTHLY_MINUTES]: 600,
  [FeatureKey.AI_TUTOR_DAILY_MINUTES]: 60,
  [FeatureKey.AI_TUTOR_SESSION_LIMIT]: 24,
  [FeatureKey.AI_PRACTICE_QUESTIONS]: 250,
  [FeatureKey.GRACE_PERIOD]: 3,
};

const GOLD_LIMITS: NumericFeaturePolicy = {
  [FeatureKey.CHILD_PROFILE_LIMIT]: 3,
  [FeatureKey.AI_TUTOR_MONTHLY_MINUTES]: 1800,
  [FeatureKey.AI_TUTOR_DAILY_MINUTES]: 120,
  [FeatureKey.AI_TUTOR_SESSION_LIMIT]: 80,
  [FeatureKey.AI_PRACTICE_QUESTIONS]: 1000,
  [FeatureKey.GRACE_PERIOD]: 3,
};

const PLATINUM_LIMITS: NumericFeaturePolicy = {
  [FeatureKey.CHILD_PROFILE_LIMIT]: 5,
  [FeatureKey.AI_TUTOR_MONTHLY_MINUTES]: -1,
  [FeatureKey.AI_TUTOR_DAILY_MINUTES]: 240,
  [FeatureKey.AI_TUTOR_SESSION_LIMIT]: -1,
  [FeatureKey.AI_PRACTICE_QUESTIONS]: -1,
  [FeatureKey.GRACE_PERIOD]: 7,
};

const assignPolicy = (
  slugs: readonly FixedPlanSlug[],
  policy: NumericFeaturePolicy,
): Partial<Record<FixedPlanSlug, NumericFeaturePolicy>> =>
  Object.fromEntries(slugs.map((slug) => [slug, policy]));

export const FIXED_PLAN_LIMITS: Readonly<
  Record<FixedPlanSlug, NumericFeaturePolicy>
> = {
  ...assignPolicy(['FREE'], FREE_LIMITS),
  ...assignPolicy(
    ['SILVER_MONTHLY', 'SILVER_QUARTERLY', 'SILVER_YEARLY'],
    SILVER_LIMITS,
  ),
  ...assignPolicy(
    ['GOLD_MONTHLY', 'GOLD_QUARTERLY', 'GOLD_YEARLY'],
    GOLD_LIMITS,
  ),
  ...assignPolicy(
    [
      'PLATINUM_MONTHLY',
      'PLATINUM_QUARTERLY',
      'PLATINUM_YEARLY',
      'ASSISTED_HALF_YEARLY',
      'ASSISTED_YEARLY',
    ],
    PLATINUM_LIMITS,
  ),
} as Record<FixedPlanSlug, NumericFeaturePolicy>;
