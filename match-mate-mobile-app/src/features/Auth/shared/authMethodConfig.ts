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

export const authMethodConfig = {
  emailPassword: true,
  phoneOtp: isEnabled('EXPO_PUBLIC_AUTH_PHONE_OTP_ENABLED'),
  social: {
    google:
      isEnabled('EXPO_PUBLIC_AUTH_SOCIAL_GOOGLE_ENABLED') &&
      Boolean(getGoogleClientIdForCurrentPlatform()),
    facebook:
      isEnabled('EXPO_PUBLIC_AUTH_SOCIAL_FACEBOOK_ENABLED') &&
      Boolean(getEnv('EXPO_PUBLIC_FACEBOOK_CLIENT_ID')),
    apple:
      isEnabled('EXPO_PUBLIC_AUTH_SOCIAL_APPLE_ENABLED') &&
      Platform.OS === 'ios',
  },
};

export const isSocialProviderEnabled = (provider: SocialProvider): boolean =>
  authMethodConfig.social[provider];

export const hasAnySocialProviderEnabled = (): boolean =>
  Object.values(authMethodConfig.social).some(Boolean);
