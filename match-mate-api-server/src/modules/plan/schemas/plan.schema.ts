import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { COLLECTIONS } from 'src/common/constants';
import { PlanTier } from 'src/common/enums';

@Schema({ collection: COLLECTIONS.PLAN, timestamps: true })
export class Plan {
  @Prop({ required: true, unique: true })
  name!: string; // GOLD_MONTHLY

  @Prop({ enum: PlanTier, required: true })
  tier!: PlanTier;

  @Prop({ required: true })
  price!: number;

  @Prop({ required: true })
  durationDays!: number;

  @Prop({ default: true })
  isActive!: boolean;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
