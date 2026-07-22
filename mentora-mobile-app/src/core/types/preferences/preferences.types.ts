export type LearningPace = 'guided' | 'balanced' | 'accelerated';
export type TutorModePreference = 'ai' | 'human' | 'hybrid';
export type DeliveryModePreference = 'chat' | 'audio' | 'video' | 'offline';
export type ParentDigestFrequency =
  'after_each_session' | 'daily' | 'weekly' | 'monthly';

export interface PreferencesData {
  dailySessionMinutes?: {
    min: number;
    max: number;
  };
  gradeRange?: {
    min: number;
    max: number;
  };
  subjects?: string[];
  learningGoals?: string[];
  preferredTutorMode?: TutorModePreference;
  preferredDeliveryModes?: DeliveryModePreference[];
  learningPace?: LearningPace;
  weeklyStudyMinutes?: number;
  parentDigestFrequency?: ParentDigestFrequency;
  parentalApprovalRequired?: boolean;
}
