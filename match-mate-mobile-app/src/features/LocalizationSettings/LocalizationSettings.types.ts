import { SettingsNavigationProp } from '@/navigation/types';

export interface LocalizationSettingsScreenProps {
  navigation: SettingsNavigationProp;
}

export interface LocalizationSettings {
  appLanguage: string;
  preferredLanguages: string[];
  region: string;
  timezone: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  currency: string;
}

export interface LocalizationSettingsResponse {
  localization: LocalizationSettings;
}

export interface UpdateLocalizationSettingsPayload extends Partial<LocalizationSettings> {}
