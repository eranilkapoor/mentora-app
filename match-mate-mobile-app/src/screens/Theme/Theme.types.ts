import { ThemeMode } from '@/store/slices/themeSlice';

export interface ThemeOption {
  code: ThemeMode;
  label: string;
  description: string;
  icon: string;
}
