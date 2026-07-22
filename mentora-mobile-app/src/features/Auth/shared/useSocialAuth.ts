import { useCallback } from 'react';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { SocialProvider } from './auth.types';
import { SocialLoginRequest } from '@/core/types';
import { getPublicEnv as getEnv } from '@/core/utils/config';

WebBrowser.maybeCompleteAuthSession();

type SocialProfile = SocialLoginRequest;

const DISABLED_GOOGLE_CLIENT_ID =
  'disabled-google-auth.apps.googleusercontent.com';
const DISABLED_FACEBOOK_CLIENT_ID = '0';

const getWebOrigin = (): string | undefined => {
  if (Platform.OS !== 'web') {
    return undefined;
  }

  return globalThis.location?.origin;
};

const pickNameParts = (
  fullName?: AppleAuthentication.AppleAuthenticationFullName | null
): { first_name?: string; last_name?: string } => {
  const firstName = fullName?.givenName?.trim();
  const lastName = fullName?.familyName?.trim();

  return {
    ...(firstName ? { first_name: firstName } : {}),
    ...(lastName ? { last_name: lastName } : {}),
  };
};

export function useSocialAuth(): {
  signInWithProvider: (provider: SocialProvider) => Promise<SocialProfile>;
} {
  const googleWebClientId = getEnv('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
  const googleIosClientId = getEnv('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID');
  const googleAndroidClientId = getEnv('EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID');
  const googleRedirectUri =
    Platform.OS === 'web'
      ? (getEnv('EXPO_PUBLIC_GOOGLE_REDIRECT_URI') ??
        getWebOrigin() ??
        AuthSession.makeRedirectUri())
      : AuthSession.makeRedirectUri({ scheme: 'mentora' });
  const facebookClientId = getEnv('EXPO_PUBLIC_FACEBOOK_CLIENT_ID');

  const [, , promptGoogle] = Google.useAuthRequest({
    androidClientId: googleAndroidClientId ?? DISABLED_GOOGLE_CLIENT_ID,
    iosClientId: googleIosClientId ?? DISABLED_GOOGLE_CLIENT_ID,
    webClientId: googleWebClientId ?? DISABLED_GOOGLE_CLIENT_ID,
    redirectUri: googleRedirectUri,
    scopes: ['openid', 'profile', 'email'],
  });

  const [, , promptFacebook] = Facebook.useAuthRequest({
    clientId: facebookClientId ?? DISABLED_FACEBOOK_CLIENT_ID,
    scopes: ['public_profile', 'email'],
  });

  const getGoogleClientIdForCurrentPlatform = useCallback(():
    string | undefined => {
    if (Platform.OS === 'ios') {
      return googleIosClientId;
    }

    if (Platform.OS === 'android') {
      return googleAndroidClientId;
    }

    return googleWebClientId;
  }, [googleAndroidClientId, googleIosClientId, googleWebClientId]);

  const signInWithGoogle = useCallback(async (): Promise<SocialProfile> => {
    if (!getGoogleClientIdForCurrentPlatform()) {
      throw new Error(`Google client id is not configured for ${Platform.OS}.`);
    }

    const result = await promptGoogle();
    if (result.type !== 'success' || !result.authentication?.accessToken) {
      throw new Error('Google sign in was cancelled.');
    }

    const accessToken = result.authentication.accessToken;
    const profileResponse = await fetch(
      'https://www.googleapis.com/userinfo/v2/me',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!profileResponse.ok) {
      throw new Error('Unable to fetch Google profile.');
    }

    const profile = (await profileResponse.json()) as {
      id?: string;
      email?: string;
      given_name?: string;
      family_name?: string;
      picture?: string;
    };

    if (!profile.id) {
      throw new Error('Google profile id missing.');
    }

    return {
      provider: 'google',
      accessToken,
      ...(profile.email ? { email: profile.email } : {}),
      ...(profile.given_name ? { first_name: profile.given_name } : {}),
      ...(profile.family_name ? { last_name: profile.family_name } : {}),
      ...(profile.picture ? { profile_photo: profile.picture } : {}),
    };
  }, [getGoogleClientIdForCurrentPlatform, promptGoogle]);

  const signInWithFacebook = useCallback(async (): Promise<SocialProfile> => {
    if (!facebookClientId) {
      throw new Error('Facebook app id is not configured.');
    }

    const result = await promptFacebook();
    if (result.type !== 'success' || !result.authentication?.accessToken) {
      throw new Error('Facebook sign in was cancelled.');
    }

    const accessToken = result.authentication.accessToken;
    const profileResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,first_name,last_name,email,picture.type(large)&access_token=${encodeURIComponent(
        accessToken
      )}`
    );

    if (!profileResponse.ok) {
      throw new Error('Unable to fetch Facebook profile.');
    }

    const profile = (await profileResponse.json()) as {
      id?: string;
      first_name?: string;
      last_name?: string;
      email?: string;
      picture?: { data?: { url?: string } };
    };

    if (!profile.id) {
      throw new Error('Facebook profile id missing.');
    }

    return {
      provider: 'facebook',
      accessToken,
      ...(profile.email ? { email: profile.email } : {}),
      ...(profile.first_name ? { first_name: profile.first_name } : {}),
      ...(profile.last_name ? { last_name: profile.last_name } : {}),
      ...(profile.picture?.data?.url
        ? { profile_photo: profile.picture.data.url }
        : {}),
    };
  }, [facebookClientId, promptFacebook]);

  const signInWithApple = useCallback(async (): Promise<SocialProfile> => {
    if (Platform.OS !== 'ios') {
      throw new Error('Apple sign in is only available on iOS.');
    }

    const available = await AppleAuthentication.isAvailableAsync();
    if (!available) {
      throw new Error('Apple sign in is not available on this device.');
    }

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      throw new Error('Apple identity token missing.');
    }

    return {
      provider: 'apple',
      accessToken: credential.identityToken,
      ...(credential.email ? { email: credential.email } : {}),
      ...pickNameParts(credential.fullName),
    };
  }, []);

  const signInWithProvider = useCallback(
    async (provider: SocialProvider): Promise<SocialProfile> => {
      if (provider === 'google') return signInWithGoogle();
      if (provider === 'facebook') return signInWithFacebook();
      return signInWithApple();
    },
    [signInWithApple, signInWithFacebook, signInWithGoogle]
  );

  return { signInWithProvider };
}
