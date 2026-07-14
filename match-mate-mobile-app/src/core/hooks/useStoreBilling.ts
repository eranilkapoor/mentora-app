import { useCallback } from 'react';
import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { useIAP } from 'expo-iap';

type StoreBilling = Pick<
  ReturnType<typeof useIAP>,
  | 'connected'
  | 'subscriptions'
  | 'availablePurchases'
  | 'fetchProducts'
  | 'requestPurchase'
  | 'finishTransaction'
  | 'restorePurchases'
  | 'reconnect'
>;

type StoreBillingOptions = Parameters<typeof useIAP>[0];

const EMPTY_SUBSCRIPTIONS: StoreBilling['subscriptions'] = [];
const EMPTY_PURCHASES: StoreBilling['availablePurchases'] = [];

export const isStoreBillingModuleAvailable =
  (Platform.OS === 'android' || Platform.OS === 'ios') &&
  requireOptionalNativeModule('ExpoIap') !== null;

function useUnavailableStoreBilling(
  _options?: StoreBillingOptions
): StoreBilling {
  const fetchProducts = useCallback<StoreBilling['fetchProducts']>(
    async () => undefined,
    []
  );
  const requestPurchase = useCallback<
    StoreBilling['requestPurchase']
  >(async () => {
    throw new Error('Native store billing is unavailable in this runtime.');
  }, []);
  const finishTransaction = useCallback<StoreBilling['finishTransaction']>(
    async () => undefined,
    []
  );
  const restorePurchases = useCallback<StoreBilling['restorePurchases']>(
    async () => undefined,
    []
  );
  const reconnect = useCallback<StoreBilling['reconnect']>(
    async () => false,
    []
  );

  return {
    connected: false,
    subscriptions: EMPTY_SUBSCRIPTIONS,
    availablePurchases: EMPTY_PURCHASES,
    fetchProducts,
    requestPurchase,
    finishTransaction,
    restorePurchases,
    reconnect,
  };
}

const useStoreBillingImplementation: (
  options?: StoreBillingOptions
) => StoreBilling = isStoreBillingModuleAvailable
  ? useIAP
  : useUnavailableStoreBilling;

export function useStoreBilling(options?: StoreBillingOptions): StoreBilling {
  return useStoreBillingImplementation(options);
}
