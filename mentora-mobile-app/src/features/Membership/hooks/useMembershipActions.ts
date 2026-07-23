import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import type { ProductSubscription, Purchase } from 'expo-iap';
import {
  useCreateMembershipOrderMutation,
  useGetMembershipPlansQuery,
  useStartFreeTrialMutation,
  useVerifyStoreSubscriptionMutation,
} from '@/store/services/membershipApi.service';
import { showError, showSuccess } from '@/core/utils/toast';
import type { PaymentGateway } from '@mentora/api-contract';
import {
  getStoreBillingProvider,
  isStoreBillingAvailableForCurrentPlatform,
  isStoreBillingEnabled,
} from '@/core/utils/billingConfig';
import { DisplayPlan } from '../Membership.types';
import { getApiErrorMessage } from '@/core/utils/apiMessage';
import { reportError } from '@/core/utils/errorReporter';
import { useStoreBilling } from '@/core/hooks/useStoreBilling';

const processingStoreTransactions = new Set<string>();
const selectedStoreOfferIds = new Map<string, string | undefined>();

interface MembershipActionsOptions {
  onMembershipActivated?: () => void;
}

export function useMembershipActions(options: MembershipActionsOptions = {}) {
  const { t } = useTranslation();
  const { onMembershipActivated } = options;
  const { data: plans = [] } = useGetMembershipPlansQuery();
  const [createOrder, { isLoading: isCreatingOrder }] =
    useCreateMembershipOrderMutation();
  const [verifyStoreSubscription, { isLoading: isVerifyingStore }] =
    useVerifyStoreSubscriptionMutation();
  const [startTrial, { isLoading: isStartingTrial }] =
    useStartFreeTrialMutation();
  const finishTransactionRef = useRef<
    | ((input: { purchase: Purchase; isConsumable?: boolean }) => Promise<void>)
    | null
  >(null);

  const processStorePurchase = useCallback(
    async (purchase: Purchase): Promise<void> => {
      if (purchase.purchaseState !== 'purchased') return;

      const transactionId = purchase.transactionId ?? purchase.id;
      if (!transactionId || processingStoreTransactions.has(transactionId)) {
        return;
      }

      // Store callbacks may arrive before the API catalogue. Wait for the
      // catalogue effect to retry instead of showing a false mapping error.
      if (!plans.length) return;

      const productCandidates = plans.filter((candidate) => {
        const mapping =
          Platform.OS === 'android'
            ? candidate.storeProducts?.android
            : candidate.storeProducts?.ios;
        return mapping?.productId === purchase.productId;
      });
      const plan =
        Platform.OS === 'android' && purchase.currentPlanId
          ? productCandidates.find(
              (candidate) =>
                candidate.storeProducts?.android?.basePlanId ===
                purchase.currentPlanId
            )
          : productCandidates.length === 1
            ? productCandidates[0]
            : undefined;

      if (!plan) {
        showError({
          title: t('membership.payment_failed_title'),
          message: t('membership.store_product_unmapped_message'),
        });
        return;
      }

      const mapping =
        Platform.OS === 'android'
          ? plan.storeProducts?.android
          : plan.storeProducts?.ios;
      const purchaseToken = purchase.purchaseToken ?? undefined;
      if (!mapping || !purchaseToken) {
        showError({
          title: t('membership.payment_failed_title'),
          message: t('membership.store_purchase_token_missing_message'),
        });
        return;
      }
      const offerKey = `${mapping.productId}:${mapping.basePlanId ?? ''}`;

      processingStoreTransactions.add(transactionId);
      try {
        await verifyStoreSubscription({
          gateway: Platform.OS === 'ios' ? 'apple_iap' : 'google_play',
          planId: plan._id,
          productId: mapping.productId,
          basePlanId: mapping.basePlanId,
          offerId: selectedStoreOfferIds.get(offerKey),
          transactionId,
          originalTransactionId:
            'originalTransactionIdentifierIOS' in purchase
              ? (purchase.originalTransactionIdentifierIOS ?? undefined)
              : undefined,
          receiptData: Platform.OS === 'ios' ? purchaseToken : undefined,
          purchaseToken: Platform.OS === 'android' ? purchaseToken : undefined,
          payload: {
            currentPlanId: purchase.currentPlanId,
            isAutoRenewing: purchase.isAutoRenewing,
            store: purchase.store,
            transactionDate: purchase.transactionDate,
          },
        }).unwrap();

        if (!finishTransactionRef.current) return;
        await finishTransactionRef.current({ purchase, isConsumable: false });
        selectedStoreOfferIds.delete(offerKey);
        showSuccess({
          title: t('membership.payment_success_title'),
          message: t('membership.payment_success_message', {
            name: plan.name.replace(/_/g, ' '),
          }),
        });
        onMembershipActivated?.();
      } catch (error) {
        reportError(error, {
          source: 'membership.verifyStoreSubscription',
          gateway: Platform.OS === 'android' ? 'google_play' : 'apple_iap',
          productId: mapping.productId,
          basePlanId: mapping.basePlanId,
          transactionId,
        });
        showError({
          title: t('membership.payment_failed_title'),
          message: getApiErrorMessage(
            t,
            error,
            'membership.payment_failed_message'
          ),
        });
      } finally {
        processingStoreTransactions.delete(transactionId);
      }
    },
    [onMembershipActivated, plans, t, verifyStoreSubscription]
  );

  const {
    connected,
    subscriptions,
    availablePurchases,
    fetchProducts,
    requestPurchase,
    finishTransaction,
    restorePurchases,
    reconnect,
  } = useStoreBilling({
    onPurchaseSuccess: (purchase) => {
      void processStorePurchase(purchase);
    },
    onPurchaseError: (error) => {
      if (error.code === 'user-cancelled') return;
      const isConnectionError = [
        'not-prepared',
        'service-disconnected',
        'init-connection',
      ].includes(error.code ?? '');
      showError({
        title: t('membership.payment_failed_title'),
        message: isConnectionError
          ? t('membership.store_connection_unavailable_message')
          : t('membership.payment_failed_message'),
      });
    },
  });

  const restoreStorePurchases = useCallback(async (): Promise<void> => {
    if (!connected) await reconnect();
    // Refreshes availablePurchases; the effect verifies every active restored
    // subscription against our backend idempotently.
    await restorePurchases({
      includeSuspendedAndroid: false,
      onlyIncludeActiveItemsIOS: true,
    });
  }, [connected, reconnect, restorePurchases]);

  useEffect(() => {
    finishTransactionRef.current = finishTransaction;
  }, [finishTransaction]);

  useEffect(() => {
    availablePurchases.forEach((purchase) => {
      void processStorePurchase(purchase);
    });
  }, [availablePurchases, processStorePurchase]);

  const storeSkus = useMemo(
    () =>
      Array.from(
        new Set(
          plans
            .map((plan) =>
              Platform.OS === 'android'
                ? plan.storeProducts?.android?.productId
                : plan.storeProducts?.ios?.productId
            )
            .filter((sku): sku is string => Boolean(sku))
        )
      ),
    [plans]
  );

  useEffect(() => {
    if (
      !connected ||
      !isStoreBillingAvailableForCurrentPlatform() ||
      !storeSkus.length
    ) {
      return;
    }

    void fetchProducts({ skus: storeSkus, type: 'subs' });
  }, [connected, fetchProducts, storeSkus]);

  const storePrices = useMemo(() => {
    const prices: Record<string, string> = {};
    plans.forEach((plan) => {
      const mapping =
        Platform.OS === 'android'
          ? plan.storeProducts?.android
          : plan.storeProducts?.ios;
      const product = subscriptions.find(
        (item) => item.id === mapping?.productId
      );
      if (product?.platform === 'android') {
        const offers = (product.subscriptionOffers ?? []).filter(
          (item) => item.basePlanIdAndroid === mapping?.basePlanId
        );
        const offer =
          offers.find((item) => item.id === mapping?.offerId) ??
          offers.find((item) => !item.id) ??
          offers[0];
        const phases = offer?.pricingPhasesAndroid?.pricingPhaseList;
        const recurringPrice = phases?.[phases.length - 1]?.formattedPrice;
        if (recurringPrice) prices[plan._id] = recurringPrice;
      } else if (product?.displayPrice) {
        prices[plan._id] = product.displayPrice;
      }
    });
    return prices;
  }, [plans, subscriptions]);

  const purchaseNativeSubscription = useCallback(
    async (selectedPlanItem: DisplayPlan): Promise<boolean> => {
      const plan = selectedPlanItem.source;
      const mapping =
        Platform.OS === 'android'
          ? plan?.storeProducts?.android
          : plan?.storeProducts?.ios;

      if (mapping?.productType !== 'subscription') {
        showError({
          title: t('membership.store_billing_unavailable_title'),
          message: t('membership.store_product_unmapped_message'),
        });
        return false;
      }

      const billingReady = await reconnect();
      if (!billingReady) {
        showError({
          title: t('membership.store_billing_unavailable_title'),
          message: t('membership.store_connection_unavailable_message'),
        });
        return false;
      }

      if (Platform.OS === 'android') {
        const product = subscriptions.find(
          (
            item
          ): item is Extract<ProductSubscription, { platform: 'android' }> =>
            item.platform === 'android' && item.id === mapping.productId
        );
        const offers =
          product?.subscriptionOffers?.filter(
            (item) => item.basePlanIdAndroid === mapping.basePlanId
          ) ?? [];
        const offer =
          offers.find((item) => item.id === mapping.offerId) ??
          offers.find((item) => !item.id) ??
          offers[0];
        if (!offer?.offerTokenAndroid) {
          showError({
            title: t('membership.store_billing_unavailable_title'),
            message: t('membership.store_offer_unavailable_message'),
          });
          return false;
        }
        selectedStoreOfferIds.set(
          `${mapping.productId}:${mapping.basePlanId ?? ''}`,
          offer.id === mapping.offerId ? offer.id : undefined
        );
        await requestPurchase({
          request: {
            google: {
              skus: [mapping.productId],
              subscriptionOffers: [
                {
                  sku: mapping.productId,
                  offerToken: offer.offerTokenAndroid,
                },
              ],
            },
          },
          type: 'subs',
        });
        return true;
      }

      await requestPurchase({
        request: { apple: { sku: mapping.productId } },
        type: 'subs',
      });
      return true;
    },
    [reconnect, requestPurchase, subscriptions, t]
  );

  const handleCreateOrder = useCallback(
    async (
      selectedPlanItem: DisplayPlan | null,
      gateway: PaymentGateway = getStoreBillingProvider()
    ): Promise<boolean> => {
      if (!selectedPlanItem?.source?._id) {
        showError({
          title: t('membership.plans_unavailable_title'),
          message: t('membership.plans_unavailable_message'),
        });
        return false;
      }

      const isStoreGateway =
        gateway === 'apple_iap' || gateway === 'google_play';

      if (isStoreGateway && !isStoreBillingEnabled()) {
        showError({
          title: t('membership.store_billing_unavailable_title'),
          message: t('membership.store_billing_unavailable_message'),
        });
        return false;
      }

      if (isStoreGateway && isStoreBillingAvailableForCurrentPlatform()) {
        return purchaseNativeSubscription(selectedPlanItem);
      }

      if (isStoreGateway) {
        showError({
          title: t('membership.store_billing_unavailable_title'),
          message: t('membership.store_billing_unavailable_message'),
        });
        return false;
      }

      try {
        const order = await createOrder({
          planId: selectedPlanItem.source._id,
          currency: selectedPlanItem.source.currency,
          gateway,
          idempotencyKey: `${selectedPlanItem.source._id}-${Date.now()}`,
          description: `${selectedPlanItem.name} membership`,
        }).unwrap();

        showSuccess({
          title: t('membership.order_created_title'),
          message: t('membership.order_created_message', {
            orderId: order.orderId,
            currency: order.currency,
            amount: order.netAmount,
            gateway: order.gateway,
          }),
        });
        return true;
      } catch {
        showError({
          title: t('membership.payment_failed_title'),
          message: t('membership.payment_failed_message'),
        });
        return false;
      }
    },
    [createOrder, purchaseNativeSubscription, t]
  );

  const handleCreateBoostOrder = useCallback(
    async (selectedPlanItem: DisplayPlan | null): Promise<void> => {
      if (!selectedPlanItem?.source?._id) {
        showError({
          title: t('membership.plans_unavailable_title'),
          message: t('membership.plans_unavailable_message'),
        });
        return;
      }

      try {
        const order = await createOrder({
          planId: selectedPlanItem.source._id,
          currency: selectedPlanItem.source.currency,
          purpose: 'learning_boost',
          idempotencyKey: `boost-${selectedPlanItem.source._id}-${Date.now()}`,
          description: t('membership.boost.title'),
        }).unwrap();

        showSuccess({
          title: t('membership.order_created_title'),
          message: t('membership.order_created_message', {
            orderId: order.orderId,
            currency: order.currency,
            amount: order.netAmount,
          }),
        });
      } catch {
        showError({
          title: t('membership.payment_failed_title'),
          message: t('membership.payment_failed_message'),
        });
      }
    },
    [createOrder, t]
  );

  const handleStartTrial = useCallback(
    async (selectedPlanItem: DisplayPlan | null): Promise<void> => {
      if (
        !selectedPlanItem?.source?._id ||
        !selectedPlanItem.source.trialDays
      ) {
        showError({
          title: t('membership.plans_unavailable_title'),
          message: t('membership.plans_unavailable_message'),
        });
        return;
      }

      try {
        await startTrial({
          planId: selectedPlanItem.source._id,
          trialDays: selectedPlanItem.source.trialDays,
        }).unwrap();

        showSuccess({
          title: t('membership.trial_started_title'),
          message: t('membership.trial_started_message', {
            days: selectedPlanItem.source.trialDays,
            name: selectedPlanItem.name,
          }),
        });
      } catch {
        showError({
          title: t('membership.trial_failed_title'),
          message: t('membership.trial_failed_message'),
        });
      }
    },
    [startTrial, t]
  );

  return {
    handleCreateOrder,
    handleCreateBoostOrder,
    handleStartTrial,
    restoreStorePurchases,
    storePrices,
    isCreatingOrder: isCreatingOrder || isStartingTrial || isVerifyingStore,
  };
}
