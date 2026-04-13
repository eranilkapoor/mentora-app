import { User } from './user.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
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
  token: string;
  user: User;
}

export interface OnbardingResponse {
  userId: string;
  isProfileCompleted: boolean;
}