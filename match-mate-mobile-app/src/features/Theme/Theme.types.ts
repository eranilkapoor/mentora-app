import { ThemeMode } from '@/store/slices/settings.slice';
import { SettingsNavigationProp } from '../../navigation/types';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ThemeScreenProps {
  navigation: SettingsNavigationProp;
}

export interface ThemeOption {
  code: ThemeMode;
  label: string;
  description: string;
  icon: string;
}
