import { ApiResponse } from '@/core/types';
import { baseApi } from './baseApi.service';

export interface WalletTransaction {
  _id: string;
  type: 'credit' | 'debit' | 'adjustment' | 'expire';
  source: string;
  points: number;
  balanceAfter: number;
  referenceId?: string;
  metadata?: Record<string, unknown>;
  expiresAt?: string;
  status: string;
  createdAt?: string;
}

export interface WalletSummary {
  balance: number;
  redeemablePoints: number;
  pendingPoints: number;
  redemptionThreshold: number;
  transactions: WalletTransaction[];
  transactionsMeta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const walletApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWalletSummary: builder.query<ApiResponse<WalletSummary>, void>({
      query: () => ({
        url: '/wallet',
        method: 'GET',
      }),
      providesTags: ['Referral', 'Payment'],
    }),

    spendWalletCoins: builder.mutation<
      ApiResponse<WalletSummary>,
      {
        coins: number;
        referenceId?: string;
        reason?: string;
        metadata?: Record<string, unknown>;
      }
    >({
      query: (body) => ({
        url: '/wallet/spend',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Referral', 'Payment'],
    }),
  }),

  overrideExisting: false,
});

export const { useGetWalletSummaryQuery, useSpendWalletCoinsMutation } =
  walletApi;
