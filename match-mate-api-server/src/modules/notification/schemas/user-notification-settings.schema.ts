import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants/collections';

@Schema({ collection: COLLECTIONS.USER_NOTIFICATION_SETTING, timestamps: true })
export class UserNotificationSettings {
  @Prop({ type: Types.ObjectId, required: true, unique: true })
  userId!: Types.ObjectId;

  @Prop({
    type: {
      interestReceived: { push: Boolean, email: Boolean },
      interestAccepted: { push: Boolean, email: Boolean },
      profileViewed: { push: Boolean, email: Boolean },
      matchFound: { push: Boolean, email: Boolean },
      messageReceived: { push: Boolean, email: Boolean },
    },
    default: {},
  })
  preferences!: Record<string, { push: boolean; email: boolean }>;

  @Prop({ default: true })
  pushEnabled!: boolean;

  @Prop({ default: true })
  emailEnabled!: boolean;

  @Prop({ default: false })
  smsEnabled!: boolean;

  @Prop({ default: false })
  doNotDisturb!: boolean;

  @Prop()
  dndStart?: string; // "22:00"

  @Prop()
  dndEnd?: string; // "07:00"
}

export type UserNotificationSettingsDocument = UserNotificationSettings &
  Document;
export const UserNotificationSettingsSchema = SchemaFactory.createForClass(
  UserNotificationSettings,
);
