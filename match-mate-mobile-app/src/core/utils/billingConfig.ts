import { Platform } from 'react-native';
import { getPublicEnv } from './config';

const parseBooleanFlag = (value: string | undefined): boolean => {
  const normalizedValue = value?.toLowerCase();
  return (
    normalizedValue === 'true' ||
    normalizedValue === '1' ||
    normalizedValue === 'yes' ||
    normalizedValue === 'on' ||
    normalizedValue === 'enabled'
  );
};

export const isNativeStoreBillingPlatform = (): boolean =>
  Platform.OS === 'ios' || Platform.OS === 'android';

export const isStoreBillingEnabled = (): boolean =>
  parseBooleanFlag(getPublicEnv('EXPO_PUBLIC_STORE_BILLING_ENABLED'));

export const isAppleStoreBillingEnabled = (): boolean =>
  Platform.OS === 'ios' &&
  isStoreBillingEnabled() &&
  parseBooleanFlag(getPublicEnv('EXPO_PUBLIC_STORE_BILLING_APPLE_ENABLED'));

export const isStoreBillingAvailableForCurrentPlatform = (): boolean => {
  if (Platform.OS === 'ios') return isAppleStoreBillingEnabled();
  if (Platform.OS === 'android') return isStoreBillingEnabled();
  return false;
};

export const getStoreBillingProvider = ():
  'apple_iap' | 'google_play' | 'razorpay' => {
  if (isAppleStoreBillingEnabled()) return 'apple_iap';
  if (Platform.OS === 'android' && isStoreBillingEnabled()) {
    return 'google_play';
  }
  return 'razorpay';
};
