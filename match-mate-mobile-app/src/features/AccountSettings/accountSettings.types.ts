import { SettingsStackParamList } from '@/navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export interface AccountSettingsScreenProps {
  navigation: NativeStackNavigationProp<
    SettingsStackParamList,
    'AccountSettings'
  >;
}
export interface LinkedAccount {
  provider: string;
  providerId?: string;
  connected: boolean;
  connectedAt?: string;
}

export interface AccountSettings {
  emailVerified: boolean;
  phoneVerified: boolean;
  profileVerified?: boolean;
  verification?: {
    isVerified?: boolean;
    isProfileVerified?: boolean;
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
    verifiedAt?: string;
  };
  isDeactivated: boolean;
  deactivatedAt?: string;
  deactivationReason?: string;
  deletionScheduledAt?: string;
  linkedAccounts: LinkedAccount[];
}

export interface AccountSettingsResponse {
  account: AccountSettings;
}

/**
 * Deactivate Account
 */
export interface DeactivateAccountPayload {
  reason?: string;
}

/**
 * Connect / Disconnect Provider
 */
export interface ConnectProviderPayload {
  provider: string;
}

/**
 * Update Account Settings
 */
export interface UpdateAccountSettingsPayload extends Partial<AccountSettings> {}

export interface RequestEmailChangePayload {
  email: string;
}

export interface RequestPhoneChangePayload {
  countryCode: string;
  phone: string;
}

export type ConsentType =
  | 'privacy_policy'
  | 'terms'
  | 'community_guidelines'
  | 'data_processing'
  | 'marketing';

export interface UserConsent {
  _id?: string;
  userId?: string;
  type: ConsentType;
  version: string;
  accepted: boolean;
  acceptedAt?: string;
  revokedAt?: string;
  source?: string;
}

export interface RecordConsentPayload {
  type: ConsentType;
  version: string;
  accepted?: boolean;
  source?: string;
}

export type DataExportResponse = Record<string, unknown>;
