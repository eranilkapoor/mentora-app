import { FeatureKey } from '@/common/enums';

export const ENTERPRISE_FEATURE_VALUE = 'custom' as const;

export const ENTERPRISE_FEATURE_MAPPINGS = Object.freeze(
  Object.values(FeatureKey).map((featureKey) => ({
    featureKey,
    value: ENTERPRISE_FEATURE_VALUE,
  })),
);
