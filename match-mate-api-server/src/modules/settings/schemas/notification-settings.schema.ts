import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants';

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
  @Prop({ type: ChannelPreference, default: () => ({}) })
  interestReceived!: ChannelPreference;

  @Prop({ type: ChannelPreference, default: () => ({}) })
  interestAccepted!: ChannelPreference;

  @Prop({ type: ChannelPreference, default: () => ({}) })
  profileView!: ChannelPreference;

  @Prop({ type: ChannelPreference, default: () => ({}) })
  matchFound!: ChannelPreference;

  @Prop({ type: ChannelPreference, default: () => ({}) })
  messageReceived!: ChannelPreference;

  @Prop({ type: ChannelPreference, default: () => ({}) })
  subscription!: ChannelPreference;

  @Prop({ type: ChannelPreference, default: () => ({}) })
  system!: ChannelPreference;

  @Prop({ type: ChannelPreference, default: () => ({}) })
  marketing!: ChannelPreference;
}

@Schema({
  collection: COLLECTIONS.NOTIFICATION_SETTING,
  timestamps: true,
})
export class NotificationSettings {
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

export type NotificationSettingsDocument = NotificationSettings & Document;

export const NotificationSettingsSchema =
  SchemaFactory.createForClass(NotificationSettings);
