import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';
import { FeatureKey } from '@/common/enums';
import {
  FEATURE_VALUE_TYPES,
  FeatureValueType,
} from '../enums/feature-value-type.enum';

@Schema({ collection: COLLECTION_NAMES.FEATURE, timestamps: true })
export class Feature {
  @Prop({ enum: FeatureKey, required: true, unique: true, trim: true })
  key!: FeatureKey;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop()
  category?: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({
    enum: FEATURE_VALUE_TYPES,
    default: 'boolean',
  })
  type!: FeatureValueType;

  @Prop({ type: SchemaTypes.Mixed, default: null })
  defaultValue?: string | boolean | number | null;

  @Prop({ type: Object, default: {} })
  metadata?: {
    limit: number;
  };

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: 1 })
  version!: number;
}

export type FeatureDocument = Feature & HydratedDocument<Feature>;
export const FeatureSchema = SchemaFactory.createForClass(Feature);
