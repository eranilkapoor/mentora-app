import { baseApi } from './baseApi.service';
import { ApiResponse } from '@/core/types';
import type {
  ActiveSubscription,
  BillingPayment,
  BillingSummary,
  CancelSubscriptionRequest,
  CouponValidationResult,
  CreatePaymentOrderRequest,
  MembershipPlan,
  PaymentInvoice,
  PaymentOrder,
  ProfileBoost,
  StartFreeTrialRequest,
  ValidateCouponRequest,
  VerifyStoreSubscriptionRequest,
} from '@mentora/api-contract';

export type {
  ActiveSubscription,
  BillingPayment,
  BillingSummary,
  CancelSubscriptionRequest,
  CouponValidationResult,
  CreatePaymentOrderRequest,
  MembershipPlan,
  MembershipPlanFeature,
  PaymentGateway,
  PaymentInvoice,
  PaymentOrder,
  ProfileBoost,
  StartFreeTrialRequest,
  ValidateCouponRequest,
  VerifyPaymentRequest,
  VerifyStoreSubscriptionRequest,
} from '@mentora/api-contract';

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

    cancelSubscription: builder.mutation<
      { success: boolean },
      CancelSubscriptionRequest | void
    >({
      query: (body) => ({
        url: '/subscriptions/cancel',
        method: 'POST',
        body: body ?? {},
      }),
      transformResponse: (response: ApiResponse<{ success: boolean }>) =>
        unwrapApiResponse(response, { success: false }),
      invalidatesTags: ['Membership', 'Payment'],
    }),

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
  useCancelSubscriptionMutation,
  useGetPaymentInvoiceQuery,
} = membershipApi;
