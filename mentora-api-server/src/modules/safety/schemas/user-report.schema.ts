import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';

@Schema({ collection: COLLECTION_NAMES.USER_REPORT, timestamps: true })
export class UserReport {
  @Prop({ type: Types.ObjectId, required: true })
  reportedBy!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  reportedUserId!: Types.ObjectId;

  @Prop()
  reason?: string;

  @Prop({ trim: true, index: true })
  source?: string;

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

  @Prop({ index: true })
  anonymizedAt?: Date;

  @Prop({ trim: true, maxlength: 250 })
  retentionReason?: string;

  @Prop()
  legalHoldUntil?: Date;
}

export type UserReportDocument = UserReport & Document;
export const UserReportSchema = SchemaFactory.createForClass(UserReport);

UserReportSchema.index({ reportedBy: 1, reportedUserId: 1 }, { unique: true });
UserReportSchema.index({ reportedUserId: 1, createdAt: -1 });
UserReportSchema.index({ anonymizedAt: 1, retentionReason: 1 });
UserReportSchema.index({ legalHoldUntil: 1 });
