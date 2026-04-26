import { User } from './user.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string; // Optional: only for mobile
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken?: string; // Optional: only for mobile
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
  accessToken: string;
  password: string;
}

export interface SocialLoginRequest {
  provider: string;
  provider_id: string;
  accessToken: string;
}

export interface SocialLoginResponse {
  accessToken: string;
  refreshToken?: string; // Optional: only for mobile
  user: User;
}

export interface OnbardingResponse {
  userId: string;
  isOnboardingCompleted: boolean;
}
