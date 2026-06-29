import { SettingsNavigationProp } from '@/navigation/types';

export interface PrivacySettingsScreenProps {
  navigation: SettingsNavigationProp;
}

export type VisibilityLevel =
  | 'everyone'
  | 'accepted_matches'
  | 'contacts_only'
  | 'no_one';

export type ProfileVisibility =
  | 'public'
  | 'private'
  | 'contacts_only'
  | 'premium_only';

export type MessagePermission =
  | 'all'
  | 'matches_only'
  | 'contacts_only'
  | 'no_one';

export interface PrivacySettings {
  profileVisibility: ProfileVisibility;

  incognitoMode: boolean;
  showOnlyToPremium: boolean;

  showPhone: boolean;
  showEmail: boolean;
  showIncome: boolean;
  showExactAge: boolean;

  showPhotosTo: VisibilityLevel;
  blurPhotosForUnmatched: boolean;
  allowScreenshots: boolean;

  showOnlineStatus: boolean;
  showLastSeen: VisibilityLevel;

  allowMessagesFrom: MessagePermission;
}

export interface PrivacySettingsResponse {
  privacy: PrivacySettings;
}

export interface UpdatePrivacySettingsPayload extends Partial<PrivacySettings> {}

export interface BlockedUsersResponse {
  blockedUsers: BlockedUserSummary[];
}

export interface HiddenProfilesResponse {
  hiddenProfiles: HiddenProfileSummary[];
}

export interface BlockedUserSummary {
  userId: string;
  name: string;
  age?: number;
  location?: string;
  avatarUrl?: string;
  verificationStatus?: 'not_started' | 'pending' | 'approved' | 'rejected';
  blockedAt?: string;
}

export interface HiddenProfileSummary extends Omit<
  BlockedUserSummary,
  'blockedAt'
> {
  reason?: string;
  hiddenAt?: string;
}
