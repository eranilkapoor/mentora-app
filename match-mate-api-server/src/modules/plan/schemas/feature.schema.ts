import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { FeatureKey } from 'src/common/enums/feature-key.enum';

@Schema({ timestamps: true })
export class Feature {
  @Prop({ enum: FeatureKey, unique: true })
  key!: FeatureKey;

  @Prop()
  description?: string;
}

export const FeatureSchema = SchemaFactory.createForClass(Feature);