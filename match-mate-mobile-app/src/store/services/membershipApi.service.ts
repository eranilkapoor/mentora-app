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
  planId?: string;
  amount?: number;
  coinAmount?: number;
  currency?: string;
  purpose?: 'subscription' | 'profile_boost' | 'coin_pack';
  gateway?: 'razorpay' | 'stripe' | 'apple_iap' | 'google_play' | 'manual';
  idempotencyKey?: string;
  description?: string;
  couponCode?: string;
  customerGstin?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentOrder {
  orderId: string;
  gatewayOrderId?: string;
  amount: number;
  taxAmount: number;
  discountAmount?: number;
  netAmount: number;
  couponCode?: string;
  currency: string;
  status: string;
  gateway: string;
  expiresAt: string;
}

export interface ValidateCouponRequest {
  planId: string;
  code: string;
}

export interface CouponValidationResult {
  couponCode?: string;
  discountAmount: number;
  couponSummary?: {
    code: string;
    title?: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
  };
}

export interface VerifyStoreSubscriptionRequest {
  gateway: 'apple_iap' | 'google_play';
  planId: string;
  productId: string;
  transactionId: string;
  originalTransactionId?: string;
  receiptData?: string;
  purchaseToken?: string;
  couponCode?: string;
  payload?: Record<string, unknown>;
}

export interface StartFreeTrialRequest {
  planId: string;
  trialDays?: number;
}

export interface PaymentInvoice {
  invoiceNumber: string;
  orderId: string;
  currency: string;
  taxableAmount: number;
  discountAmount: number;
  gstPercentage: number;
  gstAmount: number;
  totalAmount: number;
  issuedAt: string;
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

    validateMembershipCoupon: builder.mutation<
      CouponValidationResult,
      ValidateCouponRequest
    >({
      query: (body) => ({
        url: '/payments/coupons/validate',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<CouponValidationResult>) =>
        unwrapApiResponse(response, { discountAmount: 0 }),
    }),

    verifyStoreSubscription: builder.mutation<
      BillingPayment,
      VerifyStoreSubscriptionRequest
    >({
      query: (body) => ({
        url: '/payments/store/verify-subscription',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<BillingPayment>) =>
        unwrapApiResponse(response, {} as BillingPayment),
      invalidatesTags: ['Membership', 'Payment'],
    }),

    startFreeTrial: builder.mutation<ActiveSubscription, StartFreeTrialRequest>(
      {
        query: (body) => ({
          url: '/subscriptions/trial',
          method: 'POST',
          body,
        }),
        transformResponse: (
          response: ApiResponse<{ subscription?: ActiveSubscription }>
        ) => unwrapApiResponse(response, {}).subscription as ActiveSubscription,
        invalidatesTags: ['Membership'],
      }
    ),

    getPaymentInvoice: builder.query<PaymentInvoice | null, string>({
      query: (orderId) => ({
        url: `/payments/${orderId}/invoice`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<PaymentInvoice>) =>
        unwrapApiResponse(response, null),
      providesTags: ['Payment'],
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
  useValidateMembershipCouponMutation,
  useVerifyStoreSubscriptionMutation,
  useStartFreeTrialMutation,
  useGetPaymentInvoiceQuery,
} = membershipApi;
