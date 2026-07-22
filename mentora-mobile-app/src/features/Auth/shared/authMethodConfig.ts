import { Platform } from 'react-native';
import { SocialProvider } from './auth.types';
import { getPublicEnv as getEnv } from '@/core/utils/config';

const parseBooleanFlag = (key: string, defaultValue: boolean): boolean => {
  const value = getEnv(key);

  if (!value) {
    return defaultValue;
  }

  const normalizedValue = value.toLowerCase();

  if (['true', '1', 'yes', 'y', 'on', 'enabled'].includes(normalizedValue)) {
    return true;
  }

  if (['false', '0', 'no', 'n', 'off', 'disabled'].includes(normalizedValue)) {
    return false;
  }

  return defaultValue;
};

const getGoogleClientIdForCurrentPlatform = (): string | undefined => {
  if (Platform.OS === 'ios') {
    return getEnv('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID');
  }

  if (Platform.OS === 'android') {
    return getEnv('EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID');
  }

  return getEnv('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
};

const DEFAULTS = {
  emailPassword: true,
  phoneOtp: true,
  magicLink: false,
  biometric: false,
  social: {
    google: false,
    facebook: false,
    apple: false,
  },
} as const;

const getAuthMethodConfig = () => ({
  emailPassword: true,
  phoneOtp: parseBooleanFlag(
    'EXPO_PUBLIC_AUTH_PHONE_OTP_ENABLED',
    DEFAULTS.phoneOtp
  ),
  magicLink: parseBooleanFlag(
    'EXPO_PUBLIC_AUTH_MAGIC_LINK_ENABLED',
    DEFAULTS.magicLink
  ),
  biometric: parseBooleanFlag(
    'EXPO_PUBLIC_AUTH_BIOMETRIC_ENABLED',
    DEFAULTS.biometric
  ),
  social: {
    google:
      parseBooleanFlag(
        'EXPO_PUBLIC_AUTH_SOCIAL_GOOGLE_ENABLED',
        DEFAULTS.social.google
      ) && Boolean(getGoogleClientIdForCurrentPlatform()),
    facebook:
      parseBooleanFlag(
        'EXPO_PUBLIC_AUTH_SOCIAL_FACEBOOK_ENABLED',
        DEFAULTS.social.facebook
      ) && Boolean(getEnv('EXPO_PUBLIC_FACEBOOK_CLIENT_ID')),
    apple:
      parseBooleanFlag(
        'EXPO_PUBLIC_AUTH_SOCIAL_APPLE_ENABLED',
        DEFAULTS.social.apple
      ) && Platform.OS === 'ios',
  },
});

export const authMethodConfig = new Proxy(
  {} as ReturnType<typeof getAuthMethodConfig>,
  {
    get(_target, prop: string) {
      const config = getAuthMethodConfig();
      return config[prop as keyof typeof config];
    },
  }
);

export const isSocialProviderEnabled = (provider: SocialProvider): boolean =>
  getAuthMethodConfig().social[provider];

export const hasAnySocialProviderEnabled = (): boolean =>
  Object.values(getAuthMethodConfig().social).some(Boolean);
