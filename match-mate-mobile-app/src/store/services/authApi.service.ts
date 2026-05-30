import {
  LoginRequest,
  RegisterRequest,
  SendOtpRequest,
  VerifyOtpRequest,
  ForgotPasswordRequest,
  ChangePasswordRequest,
  SocialLoginRequest,
  ApiResponse,
  LoginResponse,
  RegisterResponse,
  SendOtpResponse,
  VerifyOtpResponse,
  SocialLoginResponse,
  User,
  ResetPasswordRequest,
  AuthSessionsResponse,
} from '../../core/types';
import { logout as logoutAction } from '../slices/auth.slice';
import { baseApi, clearRefreshToken, getRefreshToken } from './baseApi.service';

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

    resetPassword: builder.mutation<ApiResponse<User>, ResetPasswordRequest>({
      query: (body) => ({
        url: '/auth/reset-password',
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
    logout: builder.mutation<{ success: boolean }, void>({
      async queryFn(_arg, _api, _extraOptions, baseQuery) {
        try {
          const refreshToken = await getRefreshToken();

          const result = await baseQuery({
            url: '/auth/logout',
            method: 'POST',
            credentials: 'include',
            headers: refreshToken
              ? {
                  'X-Refresh-Token': refreshToken,
                }
              : undefined,
            body: refreshToken ? { refreshToken } : undefined,
          });

          // API Error
          if (result.error) {
            return {
              error: result.error,
            };
          }

          await clearRefreshToken();
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
              error: error instanceof Error ? error.message : 'Logout failed',
            },
          };
        }
      },
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
  useResetPasswordMutation,
  useChangePasswordMutation,
  useVerifyUserQuery,
  useLogoutMutation,
  useLogoutAllMutation,
  useGetSessionsQuery,
  useLogoutSessionMutation,
} = authApi;
