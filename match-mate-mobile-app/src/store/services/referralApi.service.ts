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
  }),
});

export const { useGetReferralSummaryQuery } = referralApi;
