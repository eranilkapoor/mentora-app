import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants';

@Schema({ collection: COLLECTIONS.PLAN_FEATURE, timestamps: true })
export class PlanFeature {
  @Prop({ type: Types.ObjectId, ref: 'Plan', required: true })
  planId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Feature', required: true })
  featureId!: Types.ObjectId;

  @Prop({ default: 0 })
  value!: number; // e.g. 10 likes, 100 likes, Infinity
}

export const PlanFeatureSchema = SchemaFactory.createForClass(PlanFeature);

PlanFeatureSchema.index({ planId: 1, featureId: 1 }, { unique: true });
