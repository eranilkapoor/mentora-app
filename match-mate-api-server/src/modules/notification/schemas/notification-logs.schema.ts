import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants';
import {
  DELIVERY_LOG_CHANNELS,
  DELIVERY_LOG_STATUSES,
} from '../notification.constants';

@Schema({ collection: COLLECTIONS.NOTIFICATION_LOG, timestamps: true })
export class NotificationLog {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  notificationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: DELIVERY_LOG_CHANNELS,
    required: true,
    index: true,
  })
  channel!: (typeof DELIVERY_LOG_CHANNELS)[number];

  @Prop({
    type: String,
    enum: DELIVERY_LOG_STATUSES,
    required: true,
    index: true,
  })
  status!: (typeof DELIVERY_LOG_STATUSES)[number];

  @Prop({ index: true })
  templateKey?: string;

  @Prop()
  provider?: string;

  @Prop()
  attemptedAt?: Date;

  @Prop()
  deliveredAt?: Date;

  @Prop({ default: 0 })
  retryCount!: number;

  @Prop()
  error?: string;

  @Prop()
  providerResponse?: string;

  @Prop({ type: Object })
  requestPayload?: Record<string, unknown>;

  @Prop({ type: Object })
  responsePayload?: Record<string, unknown>;
}

export type NotificationLogDocument = NotificationLog & Document;
export const NotificationLogSchema =
  SchemaFactory.createForClass(NotificationLog);

NotificationLogSchema.index({ notificationId: 1, channel: 1, createdAt: -1 });
