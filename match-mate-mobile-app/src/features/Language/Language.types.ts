import { Language } from '../../store/slices/settings.slice';
import { SettingsNavigationProp } from '../../navigation/types';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface LanguageScreenProps {
  navigation: SettingsNavigationProp;
}

export interface LanguageOption {
  code: Language;
  label: string;
  nativeName: string;
  icon: string;
}
