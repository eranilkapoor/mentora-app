import { SettingsNavigationProp } from '@/navigation/types';

export interface AiSettingsScreenProps {
  navigation: SettingsNavigationProp;
}

export interface AiSettings {
  aiRecommendationsEnabled: boolean;
  smartMatchRanking: boolean;
  horoscopeSuggestions: boolean;
  compatibilityScoring: boolean;
  allowAiBioGeneration: boolean;
  useProfileDataForRanking: boolean;
}

export interface AiSettingsResponse {
  ai: AiSettings;
}

export interface UpdateAiSettingsPayload extends Partial<AiSettings> {}
