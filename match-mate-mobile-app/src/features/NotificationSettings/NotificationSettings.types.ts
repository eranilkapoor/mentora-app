import { SettingsNavigationProp } from '../../navigation/types';

export interface NotificationSettingsScreenProps {
  navigation: SettingsNavigationProp;
}

export interface NotificationSetting {
  key: string;
  label: string;
  description: string;
  icon: string;
}

export interface NotificationGroup {
  title: string;
  subtitle: string;
  settings: NotificationSetting[];
}

export type NotificationState = Record<string, boolean>;


export interface ChannelPreference {
  inApp: boolean;
  push: boolean;
  email: boolean;
  sms: boolean;
}

export interface NotificationPreferences {
  interestReceived: ChannelPreference;
  interestAccepted: ChannelPreference;
  profileView: ChannelPreference;
  matchFound: ChannelPreference;
  messageReceived: ChannelPreference;
  subscription: ChannelPreference;
  system: ChannelPreference;
  marketing: ChannelPreference;
}

export interface QuietHours {
  enabled: boolean;
  start?: string;   // 'HH:mm'
  end?: string;     // 'HH:mm'
  timezone?: string;
}

export interface NotificationSettings {
  inAppEnabled: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  marketingEnabled: boolean;
  doNotDisturb: boolean;
  preferences: NotificationPreferences;
  quietHours: QuietHours;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface NotificationSettingsResponse {
  notification: NotificationSettings;
}

export interface UpdateNotificationSettingsPayload extends Partial<NotificationSettings> {}
