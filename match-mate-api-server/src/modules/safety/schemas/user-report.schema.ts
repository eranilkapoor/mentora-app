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
}

export type UserReportDocument = UserReport & Document;
export const UserReportSchema = SchemaFactory.createForClass(UserReport);

UserReportSchema.index({ reportedBy: 1, reportedUserId: 1 }, { unique: true });
