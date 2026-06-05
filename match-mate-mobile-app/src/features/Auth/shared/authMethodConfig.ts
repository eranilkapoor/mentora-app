import { Platform } from 'react-native';
import { SocialProvider } from './auth.types';

const getEnv = (key: string): string | undefined => {
  const value = (process.env as Record<string, string | undefined>)[key];
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  return trimmed;
};

const isEnabled = (key: string): boolean => getEnv(key) === 'true';

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
  phoneOtp:
    isEnabled('EXPO_PUBLIC_AUTH_PHONE_OTP_ENABLED') ?? DEFAULTS.phoneOtp,
  magicLink:
    isEnabled('EXPO_PUBLIC_AUTH_MAGIC_LINK_ENABLED') ?? DEFAULTS.magicLink,
  biometric:
    isEnabled('EXPO_PUBLIC_AUTH_BIOMETRIC_ENABLED') ?? DEFAULTS.biometric,
  social: {
    google:
      (isEnabled('EXPO_PUBLIC_AUTH_SOCIAL_GOOGLE_ENABLED') &&
        Boolean(getGoogleClientIdForCurrentPlatform())) ??
      DEFAULTS.social.google,
    facebook:
      (isEnabled('EXPO_PUBLIC_AUTH_SOCIAL_FACEBOOK_ENABLED') &&
        Boolean(getEnv('EXPO_PUBLIC_FACEBOOK_CLIENT_ID'))) ??
      DEFAULTS.social.facebook,
    apple:
      (isEnabled('EXPO_PUBLIC_AUTH_SOCIAL_APPLE_ENABLED') &&
        Platform.OS === 'ios') ??
      DEFAULTS.social.apple,
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
