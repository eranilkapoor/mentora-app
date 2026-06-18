import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';
import { ConsentType } from '../enums/user-consent.enum';

@Schema({
  collection: COLLECTION_NAMES.USER_CONSENT,
  timestamps: true,
  versionKey: false,
})
export class UserConsent {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, enum: ConsentType, required: true, index: true })
  type!: ConsentType;

  @Prop({ required: true, trim: true, maxlength: 40 })
  version!: string;

  @Prop({ default: true })
  accepted!: boolean;

  @Prop({ required: true })
  acceptedAt!: Date;

  @Prop()
  revokedAt?: Date;

  @Prop({ trim: true, maxlength: 64 })
  ip?: string;

  @Prop({ trim: true, maxlength: 500 })
  userAgent?: string;

  @Prop({ trim: true, maxlength: 80 })
  source?: string;
}

export type UserConsentDocument = HydratedDocument<UserConsent>;
export const UserConsentSchema = SchemaFactory.createForClass(UserConsent);

UserConsentSchema.index({ userId: 1, type: 1, version: 1 }, { unique: true });
UserConsentSchema.index({ userId: 1, acceptedAt: -1 });
