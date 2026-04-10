import { Language } from '../../store/slices/settingsSlice';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeName: string;
  icon: string;
}