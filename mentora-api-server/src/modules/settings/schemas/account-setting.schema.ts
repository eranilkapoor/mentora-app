import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';

@Schema({ collection: COLLECTION_NAMES.ACCOUNT_SETTING, timestamps: true })
export class AccountSetting {
  @Prop({ type: Types.ObjectId, required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ default: false }) isDeactivated!: boolean;
  @Prop() deactivatedAt?: Date;
  @Prop() deactivationReason?: string;
  @Prop() deletionScheduledAt?: Date;
  @Prop() deletionCompletedAt?: Date;
  @Prop() deletionReason?: string;
  @Prop({ default: false }) exportRequested!: boolean;
  @Prop() exportRequestedAt?: Date;
  @Prop() exportCompletedAt?: Date;
  @Prop({ trim: true }) defaultLandingPage?: string;
  @Prop({ type: Object, default: {} }) defaultContext!: Record<string, unknown>;
  @Prop({ index: true }) anonymizedAt?: Date;
  @Prop() retentionReason?: string;
  @Prop() legalHoldUntil?: Date;
}

export type AccountSettingDocument = AccountSetting & Document;
export const AccountSettingSchema =
  SchemaFactory.createForClass(AccountSetting);

AccountSettingSchema.index({ anonymizedAt: 1, retentionReason: 1 });
AccountSettingSchema.index({ legalHoldUntil: 1 });
