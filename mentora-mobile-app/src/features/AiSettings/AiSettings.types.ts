import { SettingsNavigationProp } from '@/navigation/types';

export interface AiSettingsScreenProps {
  navigation: SettingsNavigationProp;
}

export interface AiSettings {
  aiRecommendationsEnabled: boolean;
  adaptiveTutorRanking: boolean;
  studyPlanSuggestions: boolean;
  progressScoring: boolean;
  allowAiProfileSummary: boolean;
  useProfileDataForPersonalization: boolean;
}

export interface AiSettingsResponse {
  ai: AiSettings;
}

export interface UpdateAiSettingsPayload extends Partial<AiSettings> {}
