import { User } from './user.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  sessionId?: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
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
}

export interface SocialLoginResponse {
  accessToken: string;
  refreshToken?: string;
  sessionId?: string;
  user: User;
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
