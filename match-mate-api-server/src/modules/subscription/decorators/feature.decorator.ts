import { SetMetadata } from '@nestjs/common';
import { FeatureKey } from 'src/common/enums';

export const FEATURE_KEY = 'feature_key';

export const FeatureRequired = (feature: FeatureKey) =>
  SetMetadata(FEATURE_KEY, feature);
