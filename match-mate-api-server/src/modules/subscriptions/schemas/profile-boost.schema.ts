import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';

export enum ProfileBoostStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Schema({ collection: COLLECTION_NAMES.PROFILE_BOOST, timestamps: true })
export class ProfileBoost {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  paymentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  planId?: Types.ObjectId;

  @Prop({ default: 'purchase' })
  source!: string;

  @Prop({ required: true })
  startsAt!: Date;

  @Prop({ required: true, index: true })
  endsAt!: Date;

  @Prop({ default: 1.25, min: 1 })
  multiplier!: number;

  @Prop({
    type: String,
    enum: ProfileBoostStatus,
    default: ProfileBoostStatus.ACTIVE,
    index: true,
  })
  status!: ProfileBoostStatus;
}

export type ProfileBoostDocument = ProfileBoost & Document;
export const ProfileBoostSchema = SchemaFactory.createForClass(ProfileBoost);

ProfileBoostSchema.index({ userId: 1, status: 1, endsAt: -1 });
