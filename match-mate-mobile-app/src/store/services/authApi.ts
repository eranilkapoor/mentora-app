import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../index';
import {
  LoginRequest,
  RegisterRequest,
  SendOtpRequest,
  VerifyOtpRequest,
  ForgotPasswordRequest,
  ChangePasswordRequest,
  SocialLoginRequest,
  OnboardingProfileRequest,
  ApiResponse,
  LoginResponse,
  RegisterResponse,
  SendOtpResponse,
  VerifyOtpResponse,
  SocialLoginResponse,
  OnbardingResponse,
  User,
} from '../../core/types';
import { Platform } from 'react-native';
import { getDeviceId } from '../../core/utils/device';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL as string,
    prepareHeaders: async (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }

      const deviceId = await getDeviceId();

      headers.set('X-Device-Id', deviceId);
      headers.set('X-Platform', Platform.OS);
      headers.set('X-Client-Version', '1.0');

      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<LoginResponse>, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),
    register: builder.mutation<ApiResponse<RegisterResponse>, RegisterRequest>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),
    sendOtp: builder.mutation<ApiResponse<SendOtpResponse>, SendOtpRequest>({
      query: (body) => ({
        url: '/auth/send-otp',
        method: 'POST',
        body,
      }),
    }),

    verifyOtp: builder.mutation<
      ApiResponse<VerifyOtpResponse>,
      VerifyOtpRequest
    >({
      query: (body) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body,
      }),
    }),

    socialLogin: builder.mutation<
      ApiResponse<SocialLoginResponse>,
      SocialLoginRequest
    >({
      query: (body) => ({
        url: '/auth/social-login',
        method: 'POST',
        body,
      }),
    }),

    forgotPassword: builder.mutation<ApiResponse<User>, ForgotPasswordRequest>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),

    changePassword: builder.mutation<ApiResponse<User>, ChangePasswordRequest>({
      query: (body) => ({
        url: '/auth/change-password',
        method: 'POST',
        body,
      }),
    }),

    onboardingProfile: builder.mutation<
      ApiResponse<OnbardingResponse>,
      OnboardingProfileRequest
    >({
      query: (body) => ({
        url: '/auth/onboarding-profile',
        method: 'POST',
        body,
      }),
    }),

    verifyUser: builder.query<ApiResponse<User>, void>({
      query: () => '/auth/verify-user',
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useSocialLoginMutation,
  useForgotPasswordMutation,
  useChangePasswordMutation,
  useOnboardingProfileMutation,
  useVerifyUserQuery,
} = authApi;
