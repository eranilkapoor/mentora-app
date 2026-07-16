import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';
import { CouponDiscountType, CouponStatus } from '../enums/coupon.enum';
import { PlanTier, PlanType } from '@/common/enums';

@Schema({ collection: COLLECTION_NAMES.PROMOTION_COUPON, timestamps: true })
export class PromotionCoupon {
  @Prop({ required: true, uppercase: true, trim: true, unique: true })
  code!: string;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ type: String, enum: CouponDiscountType, required: true })
  discountType!: CouponDiscountType;

  @Prop({ required: true, min: 0 })
  discountValue!: number;

  @Prop({ default: 0, min: 0 })
  maxDiscountAmount!: number;

  @Prop({ type: [String], enum: PlanTier, default: [] })
  eligibleTiers!: PlanTier[];

  @Prop({ type: [String], enum: PlanType, default: [] })
  eligiblePlanTypes!: PlanType[];

  @Prop({ type: [Types.ObjectId], ref: 'Plan', default: [] })
  eligiblePlanIds!: Types.ObjectId[];

  @Prop()
  validFrom?: Date;

  @Prop()
  validTill?: Date;

  @Prop({ default: 0, min: 0 })
  maxRedemptions!: number;

  @Prop({ default: 0, min: 0 })
  maxRedemptionsPerUser!: number;

  @Prop({ default: 0, min: 0 })
  redeemedCount!: number;

  @Prop({ trim: true, index: true })
  source?: string;

  @Prop()
  reason?: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  @Prop({ default: 1, min: 1 })
  version!: number;

  @Prop({ index: true })
  deletedAt?: Date;

  @Prop({ trim: true, maxlength: 250 })
  retentionReason?: string;

  @Prop()
  legalHoldUntil?: Date;

  @Prop({ type: String, enum: CouponStatus, default: CouponStatus.ACTIVE })
  status!: CouponStatus;
}

export type PromotionCouponDocument = PromotionCoupon & Document;
export const PromotionCouponSchema =
  SchemaFactory.createForClass(PromotionCoupon);

PromotionCouponSchema.index({ code: 1, status: 1 });
PromotionCouponSchema.index({ validTill: 1 });
PromotionCouponSchema.index({ deletedAt: 1, status: 1 });
PromotionCouponSchema.index({ legalHoldUntil: 1 });
