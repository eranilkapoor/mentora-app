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
