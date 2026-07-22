import { SettingsNavigationProp } from '../../navigation/types';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface HelpSupportScreenProps {
  navigation: SettingsNavigationProp;
}

export interface ContactItem {
  icon: string;
  label: string;
  value: string;
  action: () => void;
  iconColor?: string;
  isLast?: boolean;
}
