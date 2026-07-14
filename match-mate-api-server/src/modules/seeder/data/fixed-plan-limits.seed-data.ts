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
  [FeatureKey.UPLOAD_PHOTOS]: 3,
  [FeatureKey.MULTIPLE_PROFILE_PHOTOS]: 3,
  [FeatureKey.SEND_INTEREST]: 10,
  [FeatureKey.SEND_INTEREST_MONTHLY_LIMIT]: 25,
  [FeatureKey.SHORTLIST_PROFILES]: 20,
  [FeatureKey.PROFILE_VIEWS]: 25,
  [FeatureKey.DAILY_PROFILE_VIEWS]: 25,
  [FeatureKey.MATCH_LIMIT]: 20,
};

const SILVER_LIMITS: NumericFeaturePolicy = {
  [FeatureKey.UPLOAD_PHOTOS]: 5,
  [FeatureKey.MULTIPLE_PROFILE_PHOTOS]: 5,
  [FeatureKey.UPLOAD_VIDEOS]: 1,
  [FeatureKey.SEND_INTEREST]: -1,
  [FeatureKey.SHORTLIST_PROFILES]: 50,
  [FeatureKey.MESSAGE_LIMIT]: 100,
  [FeatureKey.VIEW_CONTACT]: 10,
  [FeatureKey.CONTACT_VIEW_LIMIT]: 10,
  [FeatureKey.DAILY_PROFILE_VIEWS]: -1,
  [FeatureKey.UNLIMITED_PROFILE_VIEWS]: -1,
  [FeatureKey.PROFILE_VIEWS]: -1,
  [FeatureKey.SAVED_SEARCHES]: 10,
  [FeatureKey.PROFILE_BOOST]: 0,
  [FeatureKey.GRACE_PERIOD]: 3,
};

const GOLD_LIMITS: NumericFeaturePolicy = {
  [FeatureKey.UPLOAD_PHOTOS]: 10,
  [FeatureKey.MULTIPLE_PROFILE_PHOTOS]: 10,
  [FeatureKey.UPLOAD_VIDEOS]: 1,
  [FeatureKey.SEND_INTEREST]: -1,
  [FeatureKey.UNLIMITED_CHAT]: -1,
  [FeatureKey.UNLIMITED_SEARCH]: -1,
  [FeatureKey.UNLIMITED_PROFILE_VIEWS]: -1,
  [FeatureKey.PROFILE_VIEWS]: -1,
  [FeatureKey.VIEW_CONTACT]: 50,
  [FeatureKey.CONTACT_VIEW_LIMIT]: 50,
  [FeatureKey.SAVED_SEARCHES]: 10,
  [FeatureKey.PROFILE_BOOST]: 5,
  [FeatureKey.DAILY_BOOSTS]: 5,
  [FeatureKey.GRACE_PERIOD]: 3,
};

const PLATINUM_LIMITS: NumericFeaturePolicy = {
  ...GOLD_LIMITS,
  [FeatureKey.UPLOAD_PHOTOS]: 20,
  [FeatureKey.MULTIPLE_PROFILE_PHOTOS]: 20,
  [FeatureKey.VIEW_CONTACT]: -1,
  [FeatureKey.SHORTLIST_PROFILES]: -1,
  [FeatureKey.FAVORITE_PROFILES]: -1,
  [FeatureKey.SAVED_SEARCHES]: -1,
  [FeatureKey.WEEKLY_BOOSTS]: 7,
  [FeatureKey.MONTHLY_BOOSTS]: 30,
  [FeatureKey.UNLIMITED_BOOSTS]: -1,
  [FeatureKey.SHORTLIST_LIMIT]: -1,
  [FeatureKey.CONTACT_VIEW_LIMIT]: -1,
  [FeatureKey.MESSAGE_LIMIT]: -1,
  [FeatureKey.MATCH_LIMIT]: -1,
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
