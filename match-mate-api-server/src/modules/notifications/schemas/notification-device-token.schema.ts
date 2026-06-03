import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';

@Schema({
  collection: COLLECTION_NAMES.NOTIFICATION_DEVICE_TOKEN,
  timestamps: true,
})
export class NotificationDeviceToken {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true, index: true })
  deviceId!: string;

  @Prop({ required: true, trim: true })
  token!: string;

  @Prop({
    required: true,
    trim: true,
    enum: ['ios', 'android', 'web', 'unknown'],
  })
  platform!: 'ios' | 'android' | 'web' | 'unknown';

  @Prop({ default: true, index: true })
  isActive!: boolean;

  @Prop()
  lastUsedAt?: Date;

  @Prop()
  revokedAt?: Date;
}

export type NotificationDeviceTokenDocument = NotificationDeviceToken &
  Document;
export const NotificationDeviceTokenSchema = SchemaFactory.createForClass(
  NotificationDeviceToken,
);

NotificationDeviceTokenSchema.index(
  { userId: 1, deviceId: 1 },
  { unique: true },
);
NotificationDeviceTokenSchema.index({ token: 1 });
