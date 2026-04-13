import { AppNavigationProp } from '../../navigation/types';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface SettingsScreenProps {
  navigation: AppNavigationProp;
}

export interface SettingRowProps {
  icon: string;
  label: string;
  subLabel?: string;
  badge?: string;
  onPress: () => void;
  isLast?: boolean;
}

export interface SettingToggleProps {
  icon: string;
  label: string;
  subLabel?: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  isLast?: boolean;
}

export interface SectionProps {
  icon: string;
  title: string;
  children: React.ReactNode;
}
