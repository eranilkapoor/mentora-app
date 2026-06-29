import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';
import { BillingCycle, PlanTier, PlanType } from '@/common/enums';

@Schema({ collection: COLLECTION_NAMES.PLAN, timestamps: true })
export class Plan {
  @Prop({ required: true, unique: true })
  name!: string; // GOLD_MONTHLY

  @Prop({ required: true, unique: true })
  slug!: string; // gold_monthly

  @Prop({ enum: PlanTier, required: true })
  tier!: PlanTier;

  @Prop({ type: String, enum: PlanType, default: PlanType.SELF_SERVICE })
  planType!: PlanType;

  @Prop({ type: String, enum: BillingCycle, required: true })
  billingCycle!: BillingCycle;

  @Prop({ required: true })
  price!: number;

  @Prop({ required: true })
  durationDays!: number;

  @Prop({ default: 0, min: 0 })
  trialDays!: number;

  @Prop({ default: false })
  autoRenewDefault!: boolean;

  @Prop({ default: false })
  isCustom!: boolean;

  @Prop({ default: 'INR' })
  currency!: string;

  @Prop({ default: false })
  isPopular!: boolean;

  @Prop({ default: 0 })
  sortOrder!: number;

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: 1 })
  version!: number;
}

export type PlanDocument = Plan & Document;
export const PlanSchema = SchemaFactory.createForClass(Plan);

PlanSchema.index({ tier: 1 });
PlanSchema.index({ planType: 1, sortOrder: 1 });
PlanSchema.index({ price: 1 });
PlanSchema.index({ isActive: 1 });
PlanSchema.index({ sortOrder: 1 });
