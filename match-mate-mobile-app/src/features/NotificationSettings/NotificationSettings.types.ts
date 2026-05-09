import { SettingsNavigationProp } from '../../navigation/types';

// ─── Types ────────────────────────────────────────────────────────────────────
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

export interface ToggleRowProps {
  icon: string;
  label: string;
  description: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
}
