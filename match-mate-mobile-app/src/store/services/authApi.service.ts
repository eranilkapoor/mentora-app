import {
  LoginRequest,
  RegisterRequest,
  SendOtpRequest,
  VerifyOtpRequest,
  ForgotPasswordRequest,
  ChangePasswordRequest,
  SocialLoginRequest,
  MagicLinkRequest,
  MagicLinkResponse,
  MagicLinkVerifyRequest,
  MagicLinkVerifyResponse,
  ApiResponse,
  LoginResponse,
  RegisterResponse,
  SendOtpResponse,
  VerifyOtpResponse,
  SocialLoginResponse,
  User,
  ResetPasswordRequest,
  ResetPasswordCodeExchangeRequest,
  ResetPasswordCodeExchangeResponse,
  AuthSessionsResponse,
  TwoFactorVerifyRequest,
  AnalyticsEventType,
  AnalyticsPlatform,
} from '../../core/types';
import { Platform } from 'react-native';
import { logout as logoutAction } from '../slices/auth.slice';
import {
  baseApi,
  clearRefreshToken,
  getRefreshToken,
  setRefreshToken,
} from './baseApi.service';
import { getDeviceId } from '@/core/utils/device';
import { Storage } from '@/core/utils/storage';
import { RootState } from '../index';

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

    requestMagicLink: builder.mutation<
      ApiResponse<MagicLinkResponse>,
      MagicLinkRequest
    >({
      query: (body) => ({
        url: '/auth/magic-link/request',
        method: 'POST',
        body,
      }),
    }),

    verifyMagicLink: builder.mutation<
      ApiResponse<MagicLinkVerifyResponse>,
      MagicLinkVerifyRequest
    >({
      query: (body) => ({
        url: '/auth/magic-link/verify',
        method: 'POST',
        body,
      }),
    }),

    resetPassword: builder.mutation<ApiResponse<User>, ResetPasswordRequest>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),

    exchangeResetPasswordCode: builder.mutation<
      ApiResponse<ResetPasswordCodeExchangeResponse>,
      ResetPasswordCodeExchangeRequest
    >({
      query: (body) => ({
        url: '/auth/reset-password/exchange-code',
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

    verifyUser: builder.query<ApiResponse<User>, void>({
      query: () => '/auth/verify-user',
      providesTags: ['Auth'],
    }),
    refresh: builder.mutation<
      ApiResponse<{ accessToken: string; refreshToken?: string }>,
      void
    >({
      async queryFn(_arg, _api, _extraOptions, baseQuery) {
        try {
          const refreshToken = await getRefreshToken();

          if (!refreshToken) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: 'AUTH.REFRESH_TOKEN_MISSING',
              },
            };
          }

          const result = await baseQuery({
            url: '/auth/refresh',
            method: 'POST',
            credentials: 'include',
            headers: {
              'X-Refresh-Token': refreshToken,
            },
          });

          if (result.error) {
            return { error: result.error };
          }

          const response = result.data as ApiResponse<{
            accessToken: string;
            refreshToken?: string;
          }>;

          if (response?.data?.refreshToken) {
            await setRefreshToken(response.data.refreshToken);
          }

          return {
            data: response,
          };
        } catch (error) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error:
                error instanceof Error ? error.message : 'AUTH.REFRESH_FAILED',
            },
          };
        }
      },
    }),
    logout: builder.mutation<{ success: boolean }, void>({
      async queryFn(_arg, _api, _extraOptions, baseQuery) {
        try {
          const refreshToken = await getRefreshToken();
          const state = _api.getState() as RootState;
          const userId = state.auth.user?.userId;
          const deviceId = await getDeviceId();

          await baseQuery({
            url: '/notifications/device-tokens/revoke',
            method: 'POST',
            body: { deviceId },
          });

          const result = await baseQuery({
            url: '/auth/logout',
            method: 'POST',
            credentials: 'include',
            headers: refreshToken
              ? {
                  'X-Refresh-Token': refreshToken,
                }
              : undefined,
          });

          // API Error
          if (result.error) {
            return {
              error: result.error,
            };
          }

          await baseQuery({
            url: '/analytics/track',
            method: 'POST',
            body: {
              eventType: AnalyticsEventType.USER_LOGGED_OUT,
              platform:
                Platform.OS === 'android'
                  ? AnalyticsPlatform.ANDROID
                  : Platform.OS === 'ios'
                    ? AnalyticsPlatform.IOS
                    : AnalyticsPlatform.WEB,
              funnelStage: 'RETENTION',
            },
          });

          await clearRefreshToken();
          if (userId) {
            await Storage.removeItem(`notification-push-token:${userId}`);
          }
          _api.dispatch(logoutAction());

          // Success
          return {
            data: {
              success: true,
            },
          };
        } catch (error) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error:
                error instanceof Error ? error.message : 'AUTH.LOGOUT_FAILED',
            },
          };
        }
      },
    }),

    verifyTwoFactor: builder.mutation<
      ApiResponse<LoginResponse>,
      TwoFactorVerifyRequest
    >({
      query: (body) => ({
        url: '/auth/2fa/verify',
        method: 'POST',
        body,
      }),
    }),
    logoutAll: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/auth/logout-all',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
    getSessions: builder.query<ApiResponse<AuthSessionsResponse>, void>({
      query: () => ({
        url: '/auth/sessions',
        method: 'GET',
      }),
      providesTags: ['Auth'],
    }),
    logoutSession: builder.mutation<ApiResponse<null>, { sessionId: string }>({
      query: ({ sessionId }) => ({
        url: `/auth/sessions/${sessionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Auth'],
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
  useRequestMagicLinkMutation,
  useVerifyMagicLinkMutation,
  useVerifyTwoFactorMutation,
  useExchangeResetPasswordCodeMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useVerifyUserQuery,
  useRefreshMutation,
  useLogoutMutation,
  useLogoutAllMutation,
  useGetSessionsQuery,
  useLogoutSessionMutation,
} = authApi;
