import { SettingsNavigationProp } from '../../navigation/types';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface PrivacyPolicyScreenProps {
  navigation: SettingsNavigationProp;
}

export interface SectionItem {
  heading: string;
  subSections?: { title: string; bullets: string[] }[];
  bullets?: string[];
  paragraph?: string;
}
