import { SettingsNavigationProp } from '../../navigation/types';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface HelpSupportScreenProps {
  navigation: SettingsNavigationProp;
}

export interface FaqItem {
  question: string;
  answer: string;
  icon: string;
}

export interface ContactItem {
  icon: string;
  label: string;
  value: string;
  action: () => void;
  iconColor?: string;
  isLast?: boolean;
}
