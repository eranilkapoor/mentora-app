import httpClient from '../api/httpClient';
import {
  EducationData,
  FamilyData,
  PersonalData,
  PhysicalData,
  PreferencesData,
} from '../types/onboarding.types';

export const AuthService = {
  login: (data: { email: string; password: string }) =>
    httpClient.post('/auth/login', data),
  register: (data: { email: string; password: string }) =>
    httpClient.post('/auth/register', data),
  sendOtp: (data: { country_code: string; phone: string }) =>
    httpClient.post('/auth/send-otp', data),
  verifyOtp: (data: { country_code: string; phone: string; otp: string }) =>
    httpClient.post('/auth/verify-otp', data),
  socialLogin: (data: {
    provider: string;
    provider_id: string;
    access_token: string;
  }) => httpClient.post('/auth/social-login', data),
  forgotPassword: (data: { email: string }) =>
    httpClient.post('/auth/forgot-password', data),
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    httpClient.post('/auth/change-password', data),
  onboardingProfile: (data: {
    personal: PersonalData;
    education: EducationData;
    physical: PhysicalData;
    family: FamilyData;
    preferences: PreferencesData;
  }) => httpClient.post('/auth/onboarding-profile', data),
};
