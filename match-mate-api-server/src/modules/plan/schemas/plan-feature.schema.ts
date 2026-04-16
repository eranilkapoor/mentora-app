import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class PlanFeature {
  @Prop({ type: Types.ObjectId, ref: 'Plan', required: true })
  planId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Feature', required: true })
  featureId!: Types.ObjectId;

  @Prop()
  value?: number; // e.g. 10 likes, 100 likes, unlimited
}

export const PlanFeatureSchema = SchemaFactory.createForClass(PlanFeature);