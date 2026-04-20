import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants/collections';
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PRIORITIES,
} from '../notification.constants';

@Schema({ collection: COLLECTIONS.NOTIFICATION_TEMPLATE, timestamps: true })
export class NotificationTemplates {
  @Prop({ required: true, unique: true })
  key!: string; // e.g. INTEREST_RECEIVED

  @Prop({ required: true })
  name!: string;

  @Prop({
    type: String,
    enum: NOTIFICATION_CATEGORIES,
    required: true,
    index: true,
  })
  category!: (typeof NOTIFICATION_CATEGORIES)[number];

  @Prop({ type: String, enum: NOTIFICATION_PRIORITIES, default: 'normal' })
  priority!: (typeof NOTIFICATION_PRIORITIES)[number];

  @Prop({ required: true })
  title!: string; // "New Interest 💌"

  @Prop({ required: true })
  message!: string;
  // "{{name}} sent you an interest"

  @Prop()
  pushTitle?: string;

  @Prop()
  pushBody?: string;

  @Prop()
  emailSubject?: string;

  @Prop()
  emailBody?: string;

  @Prop()
  smsBody?: string;

  @Prop({ type: [String], default: [] })
  variables!: string[];

  @Prop({
    type: {
      inApp: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
    },
    default: {},
    _id: false,
  })
  channels!: {
    inApp: boolean;
    push: boolean;
    email: boolean;
    sms: boolean;
  };

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: 1 })
  version!: number;
}

export type NotificationTemplatesDocument = NotificationTemplates & Document;
export const NotificationTemplatesSchema = SchemaFactory.createForClass(
  NotificationTemplates,
);

NotificationTemplatesSchema.index({ key: 1, isActive: 1 });
