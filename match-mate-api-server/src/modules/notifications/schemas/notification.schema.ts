import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_TYPES,
} from '../notification.constants';

@Schema({ collection: COLLECTION_NAMES.NOTIFICATION, timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 120 })
  title!: string;

  @Prop({ required: true, trim: true, maxlength: 2000 })
  message!: string;

  @Prop({
    type: String,
    enum: NOTIFICATION_TYPES,
    default: 'info',
  })
  type!: (typeof NOTIFICATION_TYPES)[number];

  @Prop({ default: false })
  isRead!: boolean;

  @Prop()
  readAt?: Date;

  @Prop({
    type: String,
    enum: NOTIFICATION_CATEGORIES,
    required: true,
  })
  category!: (typeof NOTIFICATION_CATEGORIES)[number];

  @Prop({
    type: String,
    enum: NOTIFICATION_PRIORITIES,
    default: 'normal',
    index: true,
  })
  priority!: (typeof NOTIFICATION_PRIORITIES)[number];

  @Prop({ index: true })
  templateKey?: string;

  @Prop({ type: Types.ObjectId })
  actorId?: Types.ObjectId; // who triggered it

  @Prop()
  actorName?: string;

  @Prop()
  actorImage?: string;

  @Prop()
  referenceId?: string; // matchId / interactionId

  @Prop({ index: true })
  dedupeKey?: string;

  @Prop({
    type: {
      screen: String,
      params: Object,
    },
  })
  action?: {
    screen: string;
    params?: Record<string, any>;
  };

  @Prop({ default: false })
  isDeleted!: boolean;

  @Prop({ default: false })
  isSentPush!: boolean;

  @Prop({ default: false })
  isSentEmail!: boolean;

  @Prop({ default: false })
  isSentSms!: boolean;

  @Prop({ default: false })
  hasDeliveryFailure!: boolean;

  @Prop({
    type: {
      push: {
        status: String,
        attemptedAt: Date,
        deliveredAt: Date,
        error: String,
      },
      email: {
        status: String,
        attemptedAt: Date,
        deliveredAt: Date,
        error: String,
      },
      sms: {
        status: String,
        attemptedAt: Date,
        deliveredAt: Date,
        error: String,
      },
    },
    default: {},
    _id: false,
  })
  delivery?: Record<string, unknown>;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;
}

export type NotificationDocument = Notification & Document;

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, category: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, dedupeKey: 1, createdAt: -1 });
