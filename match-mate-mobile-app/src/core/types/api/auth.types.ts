import { User } from './user.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken?: string;
  refreshToken?: string;
  sessionId?: string;
  user?: User;
  requiresTwoFactor?: boolean;
  challengeId?: string;
  method?: 'sms' | 'email' | 'authenticator';
  expiresInSeconds?: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  referralCode?: string;
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken?: string;
  sessionId?: string;
  user: User;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface MagicLinkRequest {
  email: string;
}

export interface MagicLinkVerifyRequest {
  token: string;
}

export interface MagicLinkResponse {
  sent: boolean;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SocialLoginRequest {
  provider: string;
  provider_id: string;
  accessToken: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  profile_photo?: string;
  referralCode?: string;
}

export interface SocialLoginResponse {
  accessToken?: string;
  refreshToken?: string;
  sessionId?: string;
  user?: User;
  requiresTwoFactor?: boolean;
  challengeId?: string;
  method?: 'sms' | 'email' | 'authenticator';
  expiresInSeconds?: number;
}

export interface MagicLinkVerifyResponse {
  accessToken?: string;
  refreshToken?: string;
  sessionId?: string;
  user?: User;
  requiresTwoFactor?: boolean;
  challengeId?: string;
  method?: 'sms' | 'email' | 'authenticator';
  expiresInSeconds?: number;
}

export interface TwoFactorVerifyRequest {
  challengeId: string;
  code?: string;
  recoveryCode?: string;
}

export interface AuthSession {
  sessionId: string;
  deviceId: string;
  deviceName?: string;
  platform?: string;
  ipAddress?: string;
  lastActive?: string;
  expiresAt?: string;
}

export interface AuthSessionsResponse {
  sessions: AuthSession[];
}

export interface OnbardingResponse {
  userId: string;
  isOnboardingCompleted: boolean;
}
