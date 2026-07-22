import { FEATURE_SEEDS } from './features.seed-data';

export const CUSTOM_ASSISTED_FEATURE_VALUE = 'custom' as const;

export const CUSTOM_ASSISTED_FEATURE_MAPPINGS = Object.freeze(
  FEATURE_SEEDS.map((feature) => ({
    featureKey: feature.key,
    value: CUSTOM_ASSISTED_FEATURE_VALUE,
  })),
);
