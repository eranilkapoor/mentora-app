import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants/collections';

@Schema({ collection: COLLECTIONS.USER_REPORT, timestamps: true })
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
