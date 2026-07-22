import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';

//
// TYPES
//

export type ChannelPreferenceType = {
  inApp: boolean;
  push: boolean;
  email: boolean;
  sms: boolean;
};

export type NotificationPreferencesType = {
  interestReceived: ChannelPreferenceType;
  interestAccepted: ChannelPreferenceType;
  profileView: ChannelPreferenceType;
  matchFound: ChannelPreferenceType;
  messageReceived: ChannelPreferenceType;
  subscription: ChannelPreferenceType;
  system: ChannelPreferenceType;
  marketing: ChannelPreferenceType;
};

export type QuietHoursType = {
  enabled: boolean;
  start: string;
  end: string;
  timezone: string;
};

//
// SCHEMAS
//

@Schema({ _id: false })
class ChannelPreference {
  @Prop({ default: true }) inApp!: boolean;
  @Prop({ default: true }) push!: boolean;
  @Prop({ default: false }) email!: boolean;
  @Prop({ default: false }) sms!: boolean;
}

const engagementPreferenceDefault = () => ({
  inApp: true,
  push: true,
  email: false,
  sms: false,
});

const profileViewPreferenceDefault = () => ({
  inApp: true,
  push: true,
  email: false,
  sms: false,
});

const transactionalPreferenceDefault = () => ({
  inApp: true,
  push: true,
  email: true,
  sms: false,
});

const marketingPreferenceDefault = () => ({
  inApp: false,
  push: false,
  email: true,
  sms: false,
});

@Schema({ _id: false })
class QuietHours {
  @Prop({ default: false }) enabled!: boolean;

  @Prop({ default: '22:00' })
  start!: string;

  @Prop({ default: '08:00' })
  end!: string;

  @Prop({ default: 'UTC' })
  timezone!: string;
}

@Schema({ _id: false })
class NotificationPreferences {
  @Prop({ type: ChannelPreference, default: engagementPreferenceDefault })
  interestReceived!: ChannelPreference;

  @Prop({ type: ChannelPreference, default: engagementPreferenceDefault })
  interestAccepted!: ChannelPreference;

  @Prop({ type: ChannelPreference, default: profileViewPreferenceDefault })
  profileView!: ChannelPreference;

  @Prop({ type: ChannelPreference, default: engagementPreferenceDefault })
  matchFound!: ChannelPreference;

  @Prop({ type: ChannelPreference, default: engagementPreferenceDefault })
  messageReceived!: ChannelPreference;

  @Prop({ type: ChannelPreference, default: transactionalPreferenceDefault })
  subscription!: ChannelPreference;

  @Prop({ type: ChannelPreference, default: transactionalPreferenceDefault })
  system!: ChannelPreference;

  @Prop({ type: ChannelPreference, default: marketingPreferenceDefault })
  marketing!: ChannelPreference;
}

@Schema({
  collection: COLLECTION_NAMES.NOTIFICATION_SETTING,
  timestamps: true,
})
export class NotificationSetting {
  @Prop({
    type: Types.ObjectId,
    required: true,
    unique: true,
    index: true,
  })
  userId!: Types.ObjectId;

  // Global

  @Prop({ default: true })
  inAppEnabled!: boolean;

  @Prop({ default: true })
  pushEnabled!: boolean;

  @Prop({ default: true })
  emailEnabled!: boolean;

  @Prop({ default: false })
  smsEnabled!: boolean;

  @Prop({ default: false })
  marketingEnabled!: boolean;

  @Prop({ default: false })
  doNotDisturb!: boolean;

  // Preferences

  @Prop({
    type: NotificationPreferences,
    default: () => ({}),
  })
  preferences!: NotificationPreferences;

  // Quiet Hours

  @Prop({
    type: QuietHours,
    default: () => ({}),
  })
  quietHours!: QuietHours;

  // Device

  @Prop({ default: true })
  soundEnabled!: boolean;

  @Prop({ default: true })
  vibrationEnabled!: boolean;
}

export type NotificationSettingDocument = NotificationSetting & Document;

export const NotificationSettingSchema =
  SchemaFactory.createForClass(NotificationSetting);
