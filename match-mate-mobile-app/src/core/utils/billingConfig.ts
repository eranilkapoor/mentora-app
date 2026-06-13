import { Platform } from 'react-native';
import { getPublicEnv } from './config';

export const isNativeStoreBillingPlatform = (): boolean =>
  Platform.OS === 'ios' || Platform.OS === 'android';

export const isStoreBillingEnabled = (): boolean =>
  getPublicEnv('EXPO_PUBLIC_STORE_BILLING_ENABLED') === 'true';

export const getStoreBillingProvider = ():
  | 'apple_iap'
  | 'google_play'
  | 'razorpay' => {
  if (Platform.OS === 'ios') return 'apple_iap';
  if (Platform.OS === 'android') return 'google_play';
  return 'razorpay';
};
