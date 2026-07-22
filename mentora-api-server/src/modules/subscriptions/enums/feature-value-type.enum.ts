export const FEATURE_VALUE_TYPES = [
  'boolean',
  'limit',
  'quota',
  'tier',
  'duration',
] as const;

export type FeatureValueType = (typeof FEATURE_VALUE_TYPES)[number];
