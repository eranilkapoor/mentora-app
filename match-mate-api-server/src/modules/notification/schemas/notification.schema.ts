import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants';

@Schema({ collection: COLLECTIONS.NOTIFICATION, timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  message!: string;

  @Prop({
    enum: [
      'info',
      'success',
      'warning',
      'error',
      'match',
      'chat',
      'system',
      'payment',
    ],
    default: 'info',
  })
  type!:
    | 'info'
    | 'success'
    | 'warning'
    | 'error'
    | 'match'
    | 'chat'
    | 'system'
    | 'payment';

  @Prop({ default: false })
  isRead!: boolean;

  @Prop({
    enum: [
      'interest_received',
      'interest_accepted',
      'profile_view',
      'match_found',
      'message_received',
      'subscription',
      'system',
    ],
    required: true,
  })
  category!: string;

  @Prop({ type: Types.ObjectId })
  actorId?: Types.ObjectId; // who triggered it

  @Prop()
  actorName?: string;

  @Prop()
  actorImage?: string;

  @Prop()
  referenceId?: string; // matchId / interactionId

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

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export type NotificationDocument = Notification & Document;

export const NotificationSchema = SchemaFactory.createForClass(Notification);
