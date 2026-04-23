import { User } from './user.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  accessToken: string;
  user: User;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface SocialLoginRequest {
  provider: string;
  provider_id: string;
  access_token: string;
}

export interface SocialLoginResponse {
  accessToken: string;
  user: User;
}

export interface OnbardingResponse {
  userId: string;
  isOnboardingCompleted: boolean;
}
