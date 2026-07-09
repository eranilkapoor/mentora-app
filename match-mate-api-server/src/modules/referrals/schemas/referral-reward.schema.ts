import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';
import { ReferralRewardStatus } from '../enums/referral-reward-status.enum';

@Schema({
  collection: COLLECTION_NAMES.REFERRAL_REWARD,
  timestamps: true,
  versionKey: false,
})
export class ReferralReward {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  referrerId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  referredUserId!: Types.ObjectId;

  @Prop({ required: true, uppercase: true, trim: true, index: true })
  referralCode!: string;

  @Prop({ trim: true, index: true })
  source?: string;

  @Prop({ trim: true })
  medium?: string;

  @Prop({ trim: true, index: true })
  campaign?: string;

  @Prop({ type: Object })
  attribution?: Record<string, unknown>;

  @Prop({
    enum: ReferralRewardStatus,
    default: ReferralRewardStatus.REGISTERED,
  })
  status!: ReferralRewardStatus;

  @Prop({ default: 100, min: 0 })
  registrationPoints!: number;

  @Prop({ default: 0, min: 0 })
  subscriptionPoints!: number;

  @Prop({ default: 0, min: 0 })
  subscriptionAmount!: number;

  @Prop({ default: 0.05, min: 0 })
  subscriptionRewardRate!: number;

  @Prop({ default: 100, min: 0 })
  totalPoints!: number;

  @Prop()
  joinedAt?: Date;

  @Prop()
  subscribedAt?: Date;

  @Prop()
  subscriptionPaymentId?: string;
}

export type ReferralRewardDocument = HydratedDocument<ReferralReward>;

export const ReferralRewardSchema =
  SchemaFactory.createForClass(ReferralReward);

ReferralRewardSchema.index({ referrerId: 1, createdAt: -1 });
ReferralRewardSchema.index({ referredUserId: 1 }, { unique: true });
ReferralRewardSchema.index({ campaign: 1, createdAt: -1 });
