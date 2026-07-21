import { Platform } from 'react-native';

const setPlatform = (os: typeof Platform.OS) => {
  Object.defineProperty(Platform, 'OS', {
    configurable: true,
    value: os,
  });
};

const loadBillingConfig = (env: Record<string, string | undefined> = {}) => {
  jest.resetModules();
  jest.doMock('./config', () => ({
    getPublicEnv: (key: string) => env[key],
  }));

  return require('./billingConfig') as typeof import('./billingConfig');
};

describe('billingConfig', () => {
  afterEach(() => {
    jest.dontMock('./config');
    setPlatform('ios');
  });

  it('detects native billing platforms', () => {
    const billing = loadBillingConfig();

    setPlatform('ios');
    expect(billing.isNativeStoreBillingPlatform()).toBe(true);
    setPlatform('android');
    expect(billing.isNativeStoreBillingPlatform()).toBe(true);
    setPlatform('web');
    expect(billing.isNativeStoreBillingPlatform()).toBe(false);
  });

  it('uses Apple billing only when global and Apple flags are enabled on iOS', () => {
    const billing = loadBillingConfig({
      EXPO_PUBLIC_STORE_BILLING_ENABLED: 'yes',
      EXPO_PUBLIC_STORE_BILLING_APPLE_ENABLED: 'enabled',
    });

    setPlatform('ios');
    expect(billing.isAppleStoreBillingEnabled()).toBe(true);
    expect(billing.isStoreBillingAvailableForCurrentPlatform()).toBe(true);
    expect(billing.getStoreBillingProvider()).toBe('apple_iap');
  });

  it('uses Google Play on Android and Razorpay elsewhere', () => {
    const enabled = loadBillingConfig({
      EXPO_PUBLIC_STORE_BILLING_ENABLED: 'true',
    });

    setPlatform('android');
    expect(enabled.isStoreBillingAvailableForCurrentPlatform()).toBe(true);
    expect(enabled.getStoreBillingProvider()).toBe('google_play');

    const disabled = loadBillingConfig({
      EXPO_PUBLIC_STORE_BILLING_ENABLED: 'false',
    });
    setPlatform('web');
    expect(disabled.isStoreBillingAvailableForCurrentPlatform()).toBe(false);
    expect(disabled.getStoreBillingProvider()).toBe('razorpay');
  });
});
