import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { COLLECTIONS } from 'src/common/constants';
import { FeatureKey } from 'src/common/enums';

@Schema({ collection: COLLECTIONS.FEATURE, timestamps: true })
export class Feature {
  @Prop({ enum: FeatureKey, unique: true })
  key!: FeatureKey;

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const FeatureSchema = SchemaFactory.createForClass(Feature);
