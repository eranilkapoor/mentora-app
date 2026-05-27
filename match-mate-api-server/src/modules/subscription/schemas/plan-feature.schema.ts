import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';

@Schema({ collection: COLLECTION_NAMES.PLAN_FEATURE, timestamps: true })
export class PlanFeature {
  @Prop({ type: Types.ObjectId, ref: 'Plan', required: true })
  planId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Feature', required: true })
  featureId!: Types.ObjectId;

  @Prop({
    type: SchemaTypes.Mixed,
    default: true,
  })
  value?: string | number | boolean;

  @Prop({
    default: 1,
  })
  version!: number;
}

export type PlanFeatureDocument = PlanFeature & HydratedDocument<PlanFeature>;
export const PlanFeatureSchema = SchemaFactory.createForClass(PlanFeature);

PlanFeatureSchema.index({ planId: 1, featureId: 1 }, { unique: true });
