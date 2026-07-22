import { SettingsNavigationProp } from '@/navigation/types';

export interface SecuritySettingsScreenProps {
  navigation: SettingsNavigationProp;
}

export interface LoginDevice {
  deviceId: string;
  deviceName?: string;
  platform?: string;
  ipAddress?: string;
  lastActive?: string;
  isCurrent?: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod: 'none' | 'sms' | 'email' | 'authenticator';
  biometricEnabled: boolean;
  appPinEnabled: boolean;
  suspiciousLoginAlerts: boolean;
  loginNotifications: boolean;
  loginDevices: LoginDevice[];
  lastPasswordChangedAt?: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
}

export interface SecuritySettingsResponse {
  security: SecuritySettings;
}

export interface UpdateSecuritySettingsPayload extends Partial<SecuritySettings> {}

export interface LoginHistoryItem {
  sessionId: string;
  device?: string;
  ip?: string;
  userAgent?: string;
  isActive: boolean;
  status: 'active' | 'inactive' | 'expired' | 'signed_out';
  signedInAt?: string;
  lastActiveAt?: string;
  expiresAt?: string;
  loggedOutAt?: string;
}

export interface LoginActivityItem {
  id: string;
  category?: string;
  action?: string;
  ip?: string;
  device?: string;
  userAgent?: string;
  platform?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

export interface LoginHistoryResponse {
  sessions: LoginHistoryItem[];
  timeline: LoginActivityItem[];
}

export interface TwoFactorStatus {
  enabled: boolean;
  method: 'none' | 'sms' | 'email' | 'authenticator';
  authenticatorConfigured: boolean;
  recoveryCodesRemaining: number;
  recoveryCodesGeneratedAt?: string;
}

export interface TotpSetupResponse {
  secret: string;
  otpauthUrl: string;
}

export interface EnableTwoFactorResponse {
  enabled: boolean;
  method: 'sms' | 'authenticator' | 'none';
  recoveryCodes?: string[];
}
