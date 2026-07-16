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

  @Prop({ trim: true, index: true })
  source?: string;

  @Prop()
  reason?: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

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

  @Prop()
  verifiedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  @Prop({ default: 1, min: 1 })
  version!: number;

  @Prop({ index: true })
  deletedAt?: Date;

  @Prop({ index: true })
  anonymizedAt?: Date;

  @Prop({ trim: true, maxlength: 250 })
  retentionReason?: string;

  @Prop()
  legalHoldUntil?: Date;
}

export type VerificationDocument = Verification & Document;
export const VerificationSchema = SchemaFactory.createForClass(Verification);
VerificationSchema.index({ status: 1, submittedAt: 1 });
VerificationSchema.index({ anonymizedAt: 1, retentionReason: 1 });
VerificationSchema.index({ legalHoldUntil: 1 });
