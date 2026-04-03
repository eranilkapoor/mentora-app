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
import { baseApi } from './baseApi';

export const authApi = baseApi.injectEndpoints({
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
