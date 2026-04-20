import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants/collections';

@Schema({ collection: COLLECTIONS.USER_NOTIFICATION_SETTING, timestamps: true })
export class UserNotificationSettings {
  @Prop({ type: Types.ObjectId, required: true, unique: true })
  userId!: Types.ObjectId;

  @Prop({
    type: {
      interestReceived: {
        inApp: Boolean,
        push: Boolean,
        email: Boolean,
        sms: Boolean,
      },
      interestAccepted: {
        inApp: Boolean,
        push: Boolean,
        email: Boolean,
        sms: Boolean,
      },
      profileView: {
        inApp: Boolean,
        push: Boolean,
        email: Boolean,
        sms: Boolean,
      },
      matchFound: {
        inApp: Boolean,
        push: Boolean,
        email: Boolean,
        sms: Boolean,
      },
      messageReceived: {
        inApp: Boolean,
        push: Boolean,
        email: Boolean,
        sms: Boolean,
      },
      subscription: {
        inApp: Boolean,
        push: Boolean,
        email: Boolean,
        sms: Boolean,
      },
      system: {
        inApp: Boolean,
        push: Boolean,
        email: Boolean,
        sms: Boolean,
      },
    },
    default: {},
    _id: false,
  })
  preferences!: Record<
    string,
    { inApp?: boolean; push?: boolean; email?: boolean; sms?: boolean }
  >;

  @Prop({ default: true })
  inAppEnabled!: boolean;

  @Prop({ default: true })
  pushEnabled!: boolean;

  @Prop({ default: true })
  emailEnabled!: boolean;

  @Prop({ default: false })
  smsEnabled!: boolean;

  @Prop({ default: false })
  doNotDisturb!: boolean;

  @Prop({
    type: {
      enabled: { type: Boolean, default: false },
      start: { type: String },
      end: { type: String },
      timezone: { type: String, default: 'UTC' },
    },
    default: {},
    _id: false,
  })
  quietHours?: {
    enabled: boolean;
    start?: string;
    end?: string;
    timezone?: string;
  };

  @Prop()
  dndStart?: string; // backward compatibility

  @Prop()
  dndEnd?: string; // backward compatibility
}

export type UserNotificationSettingsDocument = UserNotificationSettings &
  Document;
export const UserNotificationSettingsSchema = SchemaFactory.createForClass(
  UserNotificationSettings,
);
