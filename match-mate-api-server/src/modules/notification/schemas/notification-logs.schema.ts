import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants/collections';

@Schema({ collection: COLLECTIONS.NOTIFICATION_LOG, timestamps: true })
export class NotificationLogs {
  @Prop({ type: Types.ObjectId })
  notificationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  userId!: Types.ObjectId;

  @Prop({ enum: ['push', 'email', 'sms'] })
  channel!: 'push' | 'email' | 'sms';

  @Prop({ enum: ['pending', 'sent', 'failed'] })
  status!: 'pending' | 'sent' | 'failed';

  @Prop()
  error?: string;

  @Prop()
  providerResponse?: string;
}

export type NotificationLogsDocument = NotificationLogs & Document;
export const NotificationLogsSchema =
  SchemaFactory.createForClass(NotificationLogs);
