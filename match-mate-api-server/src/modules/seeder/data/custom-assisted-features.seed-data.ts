import { FeatureKey } from '@/common/enums';

export const CUSTOM_ASSISTED_FEATURE_VALUE = 'custom' as const;

export const CUSTOM_ASSISTED_FEATURE_MAPPINGS = Object.freeze(
  Object.values(FeatureKey).map((featureKey) => ({
    featureKey,
    value: CUSTOM_ASSISTED_FEATURE_VALUE,
  })),
);
