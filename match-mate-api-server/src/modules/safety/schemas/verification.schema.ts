import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';
import {
  VerificationProvider,
  VerificationStatus,
} from '../enums/verification.enums';

@Schema({ collection: COLLECTION_NAMES.VERIFICATION, timestamps: true })
export class Verification {
  @Prop({ type: Types.ObjectId, required: true, unique: true })
  userId!: Types.ObjectId;

  @Prop()
  idProofUrl?: string;

  @Prop()
  selfieUrl?: string;

  @Prop({ enum: VerificationStatus, default: VerificationStatus.NOT_STARTED })
  status!: VerificationStatus;

  @Prop({ enum: VerificationProvider, default: VerificationProvider.MANUAL })
  provider!: VerificationProvider;

  @Prop()
  documentType?: string;

  @Prop()
  rejectionReason?: string;

  @Prop({ type: Types.ObjectId })
  reviewedBy?: Types.ObjectId;

  @Prop()
  reviewedAt?: Date;

  @Prop()
  submittedAt?: Date;

  @Prop({ default: false })
  livenessPassed?: boolean;

  @Prop({ type: Object })
  providerPayload?: Record<string, unknown>;

  @Prop({ default: false })
  isVerified!: boolean;

  @Prop({ default: false })
  isPhoneVerified?: boolean;

  @Prop({ default: false })
  isEmailVerified?: boolean;

  @Prop({ default: false })
  isProfileVerified?: boolean;

  @Prop()
  verifiedAt?: Date;
}

export type VerificationDocument = Verification & Document;
export const VerificationSchema = SchemaFactory.createForClass(Verification);
