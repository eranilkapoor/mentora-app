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

export interface LoginHistoryResponse {
  sessions: LoginHistoryItem[];
}
