import { baseApi } from './baseApi.service';
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
  planType?: 'self_service' | 'assisted' | 'profile_boost';
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
  autoRenew?: boolean;
  cancelledAt?: string;
  cancelledReason?: string;
}

export interface BillingPayment {
  _id: string;
  orderId: string;
  planId?: MembershipPlan | string;
  amount: number;
  taxAmount: number;
  discountAmount: number;
  netAmount: number;
  currency: string;
  gateway: string;
  method?: string;
  purpose: string;
  status: string;
  initiatedAt: string;
  paidAt?: string;
  failedAt?: string;
  failureReason?: string;
}

export interface BillingSummary {
  currentPlan: ActiveSubscription | null;
  subscriptions: ActiveSubscription[];
  payments: BillingPayment[];
  billing: {
    currency: string;
    totalPaid: number;
    successfulPayments: number;
    lastPaymentAt?: string;
    nextRenewalAt?: string | null;
    autoRenew: boolean;
  };
}

export interface ProfileBoost {
  _id: string;
  userId: string;
  startsAt: string;
  endsAt: string;
  multiplier: number;
  status: string;
  source?: string;
}

export interface CreatePaymentOrderRequest {
  planId: string;
  currency?: string;
  purpose?: 'subscription' | 'profile_boost';
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

    getBillingSummary: builder.query<BillingSummary, void>({
      query: () => ({
        url: '/subscriptions/billing',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<BillingSummary>) =>
        unwrapApiResponse(response, {
          currentPlan: null,
          subscriptions: [],
          payments: [],
          billing: {
            currency: 'INR',
            totalPaid: 0,
            successfulPayments: 0,
            autoRenew: false,
          },
        }),
      providesTags: ['Membership', 'Payment'],
    }),

    getProfileBoosts: builder.query<ProfileBoost[], void>({
      query: () => ({
        url: '/subscriptions/boosts',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<ProfileBoost[]>) =>
        unwrapApiResponse(response, []),
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
  useGetBillingSummaryQuery,
  useGetProfileBoostsQuery,
  useCreateMembershipOrderMutation,
} = membershipApi;
