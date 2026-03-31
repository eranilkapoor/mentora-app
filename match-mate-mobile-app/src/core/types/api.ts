import {
  EducationData,
  FamilyData,
  PersonalData,
  PhysicalData,
  PreferencesData,
} from './profile.types';

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  message: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

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

export interface User {
  userId: string;
  firstName?: string;
  email?: string;
  lastName?: string;
  phone?: {
    countryCode: string;
    phone: string;
  };
  isEmailVerified?: boolean;
  isProfileCompleted: boolean;
  membership?: {
    tier: 'free' | 'premium';
  };
}

export interface OnbardingResponse {
  userId: string;
  isProfileCompleted: boolean;
}

export interface SendOtpRequest {
  country_code: string;
  phone: string;
}

export interface SendOtpResponse {
  phone: string;
  otp: string;
}

export interface VerifyOtpRequest {
  country_code: string;
  phone: string;
  otp: string;
}

export interface VerifyOtpResponse {
  user: {
    userId: string;
    firstName?: string;
    email?: string;
    phone: {
      countryCode: string;
      phone: string;
    };
    isPhoneVerified: boolean;
    isProfileCompleted: boolean;
  };
  token: string;
}

export interface OnboardingProfileRequest {
  personal: PersonalData;
  physical: PhysicalData;
  education: EducationData;
  family: FamilyData;
  preferences: PreferencesData;
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

export interface ProfileData {
  personal: PersonalData;
  physical: PhysicalData;
  education: EducationData;
  family: FamilyData;
  preferences: PreferencesData;
}
