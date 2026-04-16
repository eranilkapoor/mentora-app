import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants/collections';

@Schema({ collection: COLLECTIONS.NOTIFICATION_TEMPLATE, timestamps: true })
export class NotificationTemplates {
  @Prop({ required: true, unique: true })
  key!: string; // e.g. INTEREST_RECEIVED

  @Prop({ required: true })
  title!: string; // "New Interest 💌"

  @Prop({ required: true })
  message!: string; 
  // "{{name}} sent you an interest"

  @Prop({ default: true })
  isPushEnabled!: boolean;

  @Prop({ default: false })
  isEmailEnabled!: boolean;

  @Prop({ default: false })
  isSmsEnabled!: boolean;
}

export type NotificationTemplatesDocument = NotificationTemplates & Document;
export const NotificationTemplatesSchema = SchemaFactory.createForClass(NotificationTemplates);
