import { ThemeMode } from '@/store/slices/settingsSlice';
import { AppNavigationProp } from '../../navigation/types';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ThemeScreenProps {
  navigation: AppNavigationProp;
}

export interface ThemeOption {
  code: ThemeMode;
  label: string;
  description: string;
  icon: string;
}
