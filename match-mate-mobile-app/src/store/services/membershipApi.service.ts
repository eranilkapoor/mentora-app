import { baseApi } from './baseApi';
import { ApiResponse } from '@/core/types';

export interface MembershipPlanFeature {
  value?: string | number | boolean;
  featureId?: {
    key?: string;
    name?: string;
    description?: string;
  };
}

export interface MembershipPlan {
  _id: string;
  name: string;
  slug: string;
  tier: string;
  billingCycle: string;
  price: number;
  durationDays: number;
  currency: string;
  isPopular?: boolean;
  description?: string;
  features?: MembershipPlanFeature[];
}

export interface ActiveSubscription {
  _id: string;
  planId: MembershipPlan | string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface CreatePaymentOrderRequest {
  planId: string;
  currency?: string;
  idempotencyKey?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentOrder {
  orderId: string;
  gatewayOrderId?: string;
  amount: number;
  taxAmount: number;
  netAmount: number;
  currency: string;
  status: string;
  gateway: string;
  expiresAt: string;
}

const unwrapApiResponse = <T>(response: ApiResponse<T>, fallback: T): T => {
  if (response.success) return response.data;

  return fallback;
};

export const membershipApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMembershipPlans: builder.query<MembershipPlan[], void>({
      query: () => ({
        url: '/subscriptions/plans',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<MembershipPlan[]>) =>
        unwrapApiResponse(response, []),
      providesTags: ['Membership'],
    }),

    getActiveSubscription: builder.query<ActiveSubscription | null, void>({
      query: () => ({
        url: '/subscriptions/current',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<ActiveSubscription | null>) =>
        unwrapApiResponse(response, null),
      providesTags: ['Membership'],
    }),

    createMembershipOrder: builder.mutation<
      PaymentOrder,
      CreatePaymentOrderRequest
    >({
      query: (body) => ({
        url: '/payments/order',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<PaymentOrder>) =>
        unwrapApiResponse(response, {} as PaymentOrder),
      invalidatesTags: ['Payment'],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetMembershipPlansQuery,
  useGetActiveSubscriptionQuery,
  useCreateMembershipOrderMutation,
} = membershipApi;
