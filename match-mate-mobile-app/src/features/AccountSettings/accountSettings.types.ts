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
  isPrimary?: boolean;
  isVerified?: boolean;
  canDisconnect?: boolean;
  disconnectReason?: string;
}

export interface AccountSettings {
  emailVerified: boolean;
  phoneVerified: boolean;
  profileVerification: {
    status: 'not_started' | 'pending' | 'approved' | 'rejected';
    provider?: 'manual' | 'aadhaar' | 'digilocker' | 'liveness';
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
