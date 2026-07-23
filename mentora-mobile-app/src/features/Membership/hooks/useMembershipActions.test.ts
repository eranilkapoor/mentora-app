import { Platform } from 'react-native';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { MembershipPlan } from '@mentora/api-contract';
import type { DisplayPlan } from '../Membership.types';
import { useMembershipActions } from './useMembershipActions';

const mockCreateOrder = jest.fn();
const mockVerifyStoreSubscription = jest.fn();
const mockStartTrial = jest.fn();
const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();
const mockReportError = jest.fn();
const mockFetchProducts = jest.fn();
const mockRequestPurchase = jest.fn();
const mockFinishTransaction = jest.fn();
const mockRestorePurchases = jest.fn();
const mockReconnect = jest.fn();

let mockPlans: MembershipPlan[] = [];
let mockConnected = true;
let mockSubscriptions: unknown[] = [];
let mockAvailablePurchases: unknown[] = [];
let mockStoreCallbacks: {
  onPurchaseSuccess: (purchase: never) => void;
  onPurchaseError: (error: { code?: string }) => void;
};
let mockStoreEnabled = true;
let mockStoreAvailable = true;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) =>
      options?.defaultValue ?? key,
  }),
}));

jest.mock('@/core/utils/toast', () => ({
  showSuccess: (payload: unknown) => mockShowSuccess(payload),
  showError: (payload: unknown) => mockShowError(payload),
}));

jest.mock('@/core/utils/errorReporter', () => ({
  reportError: (error: unknown, context: unknown) =>
    mockReportError(error, context),
}));

jest.mock('@/core/utils/billingConfig', () => ({
  getStoreBillingProvider: () => 'google_play',
  isStoreBillingAvailableForCurrentPlatform: () => mockStoreAvailable,
  isStoreBillingEnabled: () => mockStoreEnabled,
}));

jest.mock('@/store/services/membershipApi.service', () => ({
  useGetMembershipPlansQuery: () => ({ data: mockPlans }),
  useCreateMembershipOrderMutation: () => [
    mockCreateOrder,
    { isLoading: false },
  ],
  useVerifyStoreSubscriptionMutation: () => [
    mockVerifyStoreSubscription,
    { isLoading: false },
  ],
  useStartFreeTrialMutation: () => [mockStartTrial, { isLoading: false }],
}));

jest.mock('@/core/hooks/useStoreBilling', () => ({
  useStoreBilling: (callbacks: typeof mockStoreCallbacks) => {
    mockStoreCallbacks = callbacks;
    return {
      connected: mockConnected,
      subscriptions: mockSubscriptions,
      availablePurchases: mockAvailablePurchases,
      fetchProducts: mockFetchProducts,
      requestPurchase: mockRequestPurchase,
      finishTransaction: mockFinishTransaction,
      restorePurchases: mockRestorePurchases,
      reconnect: mockReconnect,
    };
  },
}));

const setPlatform = (os: 'android' | 'ios') => {
  Object.defineProperty(Platform, 'OS', {
    configurable: true,
    value: os,
  });
};

const plan = (overrides: Partial<MembershipPlan> = {}): MembershipPlan => ({
  _id: 'gold-quarterly',
  name: 'GOLD_QUARTERLY',
  slug: 'gold-quarterly',
  tier: 'gold',
  planType: 'self_service',
  billingCycle: 'quarterly',
  price: 1899,
  currency: 'INR',
  durationDays: 90,
  trialDays: 7,
  autoRenewDefault: true,
  storeProducts: {
    android: {
      productId: 'gold.sub',
      productType: 'subscription',
      basePlanId: 'quarterly',
      offerId: 'intro',
    },
    ios: {
      productId: 'gold.ios',
      productType: 'subscription',
    },
  },
  ...overrides,
});

const displayPlan = (
  source: MembershipPlan | undefined = plan()
): DisplayPlan =>
  ({
    id: source?._id ?? 'missing',
    name: 'Gold Quarterly',
    source,
  }) as DisplayPlan;

describe('useMembershipActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setPlatform('android');
    mockPlans = [plan()];
    mockConnected = true;
    mockSubscriptions = [];
    mockAvailablePurchases = [];
    mockStoreEnabled = true;
    mockStoreAvailable = true;
    mockCreateOrder.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        orderId: 'order-1',
        currency: 'INR',
        netAmount: 1899,
        gateway: 'razorpay',
      }),
    });
    mockVerifyStoreSubscription.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({}),
    });
    mockStartTrial.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
    mockReconnect.mockResolvedValue(true);
    mockFinishTransaction.mockResolvedValue(undefined);
    mockFetchProducts.mockResolvedValue(undefined);
    mockRequestPurchase.mockResolvedValue(undefined);
    mockRestorePurchases.mockResolvedValue(undefined);
  });

  it('creates gateway orders, boost orders, and free trials', async () => {
    const { result } = await renderHook(() => useMembershipActions());

    await act(async () => {
      await expect(
        result.current.handleCreateOrder(displayPlan(), 'razorpay')
      ).resolves.toBe(true);
      await result.current.handleCreateBoostOrder(displayPlan());
      await result.current.handleStartTrial(displayPlan());
    });

    expect(mockCreateOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        planId: 'gold-quarterly',
        gateway: 'razorpay',
        currency: 'INR',
      })
    );
    expect(mockCreateOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        planId: 'gold-quarterly',
        purpose: 'learning_boost',
      })
    );
    expect(mockStartTrial).toHaveBeenCalledWith({
      planId: 'gold-quarterly',
      trialDays: 7,
    });
    expect(mockShowSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'membership.order_created_title' })
    );
  });

  it('rejects missing plans and unavailable store billing', async () => {
    const { result } = await renderHook(() => useMembershipActions());

    await act(async () => {
      await expect(result.current.handleCreateOrder(null)).resolves.toBe(false);
    });

    expect(mockShowError).toHaveBeenCalledWith({
      title: 'membership.plans_unavailable_title',
      message: 'membership.plans_unavailable_message',
    });

    mockStoreEnabled = false;
    const next = await renderHook(() => useMembershipActions());
    await act(async () => {
      await expect(
        next.result.current.handleCreateOrder(displayPlan(), 'google_play')
      ).resolves.toBe(false);
    });

    expect(mockShowError).toHaveBeenCalledWith({
      title: 'membership.store_billing_unavailable_title',
      message: 'membership.store_billing_unavailable_message',
    });
  });

  it('fetches store products, purchases native subscriptions, and exposes store prices', async () => {
    mockSubscriptions = [
      {
        platform: 'android',
        id: 'gold.sub',
        subscriptionOffers: [
          {
            id: 'intro',
            basePlanIdAndroid: 'quarterly',
            offerTokenAndroid: 'offer-token',
            pricingPhasesAndroid: {
              pricingPhaseList: [{ formattedPrice: 'Rs. 1,899' }],
            },
          },
        ],
      },
    ];

    const { result } = await renderHook(() => useMembershipActions());

    await waitFor(() => {
      expect(mockFetchProducts).toHaveBeenCalledWith({
        skus: ['gold.sub'],
        type: 'subs',
      });
    });

    expect(result.current.storePrices).toEqual({
      'gold-quarterly': 'Rs. 1,899',
    });

    await act(async () => {
      await expect(
        result.current.handleCreateOrder(displayPlan(), 'google_play')
      ).resolves.toBe(true);
    });

    expect(mockRequestPurchase).toHaveBeenCalledWith({
      request: {
        google: {
          skus: ['gold.sub'],
          subscriptionOffers: [
            {
              sku: 'gold.sub',
              offerToken: 'offer-token',
            },
          ],
        },
      },
      type: 'subs',
    });
  });

  it('restores purchases after reconnect when store is disconnected', async () => {
    mockConnected = false;
    const { result } = await renderHook(() => useMembershipActions());

    await act(async () => {
      await result.current.restoreStorePurchases();
    });

    expect(mockReconnect).toHaveBeenCalled();
    expect(mockRestorePurchases).toHaveBeenCalledWith({
      includeSuspendedAndroid: false,
      onlyIncludeActiveItemsIOS: true,
    });
  });

  it('verifies restored store purchases and ignores user-cancelled purchase errors', async () => {
    const onMembershipActivated = jest.fn();
    mockAvailablePurchases = [
      {
        id: 'purchase-1',
        purchaseState: 'purchased',
        productId: 'gold.sub',
        currentPlanId: 'quarterly',
        purchaseToken: 'purchase-token',
        transactionId: 'txn-1',
        isAutoRenewing: true,
        store: 'play',
        transactionDate: 123,
      },
    ];

    await renderHook(() => useMembershipActions({ onMembershipActivated }));

    await waitFor(() => {
      expect(mockVerifyStoreSubscription).toHaveBeenCalledWith(
        expect.objectContaining({
          gateway: 'google_play',
          planId: 'gold-quarterly',
          productId: 'gold.sub',
          basePlanId: 'quarterly',
          purchaseToken: 'purchase-token',
          transactionId: 'txn-1',
        })
      );
    });

    await waitFor(() => {
      expect(mockFinishTransaction).toHaveBeenCalledWith({
        purchase: mockAvailablePurchases[0],
        isConsumable: false,
      });
      expect(onMembershipActivated).toHaveBeenCalled();
    });

    await act(async () => {
      mockStoreCallbacks.onPurchaseError({ code: 'user-cancelled' });
    });
    expect(mockShowError).not.toHaveBeenCalledWith(
      expect.objectContaining({ title: 'membership.payment_failed_title' })
    );
  });
});
