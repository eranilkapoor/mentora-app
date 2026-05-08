import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants';
import { FeatureKey } from 'src/common/enums';

@Schema({ collection: COLLECTIONS.FEATURE, timestamps: true })
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
    enum: ['boolean', 'limit', 'quota', 'tier', 'duration'],
    default: 'boolean',
  })
  type!: 'boolean' | 'limit' | 'quota' | 'tier' | 'duration';

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
