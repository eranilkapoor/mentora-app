import { ApiResponse } from '@/core/types';
import { ReferralSummary } from '@/features/ReferRewards/ReferRewards.types';
import { baseApi } from './baseApi.service';

export const referralApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReferralSummary: builder.query<ApiResponse<ReferralSummary>, void>({
      query: () => ({
        url: '/referrals/me',
        method: 'GET',
      }),
      providesTags: ['Referral'],
    }),

    getReferralWallet: builder.query<ApiResponse<unknown>, void>({
      query: () => ({
        url: '/referrals/wallet',
        method: 'GET',
      }),
      providesTags: ['Referral'],
    }),

    redeemReferralWallet: builder.mutation<
      ApiResponse<unknown>,
      { points: number }
    >({
      query: (body) => ({
        url: '/referrals/wallet/redeem',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Referral'],
    }),

    getReferralLeaderboard: builder.query<
      ApiResponse<unknown[]>,
      number | void
    >({
      query: (limit = 25) => ({
        url: `/referrals/leaderboard?limit=${limit}`,
        method: 'GET',
      }),
      providesTags: ['Referral'],
    }),
  }),
});

export const {
  useGetReferralSummaryQuery,
  useGetReferralWalletQuery,
  useRedeemReferralWalletMutation,
  useGetReferralLeaderboardQuery,
} = referralApi;
