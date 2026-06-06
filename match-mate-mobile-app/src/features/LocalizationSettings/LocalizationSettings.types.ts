import { SettingsNavigationProp } from '@/navigation/types';

export interface LocalizationSettingsScreenProps {
  navigation: SettingsNavigationProp;
}

export type SelectKey = 'region' | 'timezone' | 'dateFormat' | 'currency';

export interface LocalizationSettings {
  appLanguage: string;
  preferredLanguages: string[];
  region: string;
  timezone: string;
  shareLocation: boolean;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  currency: string;
}

export interface LocalizationSettingsResponse {
  localization: LocalizationSettings;
}

export interface UpdateLocalizationSettingsPayload extends Partial<LocalizationSettings> {}
