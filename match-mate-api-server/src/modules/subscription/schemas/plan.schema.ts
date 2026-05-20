import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants';
import { BillingCycle, PlanTier } from 'src/common/enums';

@Schema({ collection: COLLECTIONS.PLAN, timestamps: true })
export class Plan {
  @Prop({ required: true, unique: true })
  name!: string; // GOLD_MONTHLY

  @Prop({ required: true, unique: true })
  slug!: string; // gold_monthly

  @Prop({ enum: PlanTier, required: true })
  tier!: PlanTier;

  @Prop({ type: String, enum: BillingCycle, required: true })
  billingCycle!: BillingCycle;

  @Prop({ required: true })
  price!: number;

  @Prop({ required: true })
  durationDays!: number;

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
PlanSchema.index({ price: 1 });
PlanSchema.index({ isActive: 1 });
PlanSchema.index({ sortOrder: 1 });
