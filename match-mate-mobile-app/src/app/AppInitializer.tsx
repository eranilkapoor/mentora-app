import React, { useEffect, useRef, useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout as logoutAction, setUser } from '@/store/slices/auth.slice';
import { useVerifyUserQuery } from '@/store/services/authApi.service';
import { baseApi, clearRefreshToken } from '@/store/services/baseApi.service';
import Loader from '@/core/components/Loader';
import { getDeviceId } from '@/core/utils/device';
import { Storage } from '@/core/utils/storage';
import i18n from '@/i18n';
import {
  connectRealtime,
  disconnectRealtime,
} from '@/core/realtime/realtime.service';
import { isPushNotificationsEnabled } from '@/core/utils/config';
import { authMethodConfig } from '@/features/Auth/shared/authMethodConfig';
import { useGetSecuritySettingsQuery } from '@/store/services/securitySettingsApi.service';
import { useRegisterNotificationDeviceTokenMutation } from '@/store/services/notificationApi.service';
import {
  navigateFromNotificationAction,
  parseNotificationAction,
} from '@/features/Notifications/notificationNavigation';
import { reportError, setErrorReporterUser } from '@/core/utils/errorReporter';

interface Props {
  children: React.ReactNode;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const getPushTokenSyncKey = (userId: string): string =>
  `notification-push-token:${userId}`;

export default function AppInitializer({ children }: Props) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const userId = useAppSelector((s) => s.auth.user?.userId);
  const lang = useAppSelector((s) => s.settings.language);

  const [langReady, setLangReady] = useState(false);
  const [biometricUnlocked, setBiometricUnlocked] = useState(
    !authMethodConfig.biometric || Platform.OS === 'web'
  );
  const isFirstLoad = useRef(true);
  const biometricPromptInFlight = useRef(false);
  const [registerPushToken] = useRegisterNotificationDeviceTokenMutation();
  const { data: securityData, isLoading: securityLoading } =
    useGetSecuritySettingsQuery(undefined, {
      skip:
        !accessToken || !authMethodConfig.biometric || Platform.OS === 'web',
    });

  const { data, isLoading } = useVerifyUserQuery(undefined, {
    // Only call the endpoint when a token exists
    skip: !accessToken,
  });

  // Sync i18n language on mount and whenever the user changes it
  useEffect(() => {
    let isMounted = true;

    const applyLanguage = async () => {
      // Show loader only on the very first language application
      if (isFirstLoad.current && isMounted) {
        setLangReady(false);
      }

      try {
        await Promise.race([
          i18n.changeLanguage(lang),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('i18n timeout')), 3000)
          ),
        ]);
      } catch (err) {
        reportError(err, { source: 'AppInitializer.applyLanguage' });
      } finally {
        if (isMounted) {
          setLangReady(true);
          isFirstLoad.current = false;
        }
      }
    };

    void applyLanguage();

    return () => {
      isMounted = false;
    };
  }, [lang]);

  // Keep Redux auth state in sync with server verification
  useEffect(() => {
    if (data?.success && data?.data) {
      dispatch(setUser(data.data));
    }
  }, [data, dispatch]);

  useEffect(() => {
    setErrorReporterUser(userId ? { id: userId } : null);
  }, [userId]);

  useEffect(() => {
    if (!accessToken) {
      disconnectRealtime();
      setBiometricUnlocked(
        !authMethodConfig.biometric || Platform.OS === 'web'
      );
      return;
    }

    connectRealtime(accessToken, dispatch);

    return () => {
      disconnectRealtime();
    };
  }, [accessToken, dispatch]);

  useEffect(() => {
    if (
      !accessToken ||
      !userId ||
      !isPushNotificationsEnabled() ||
      Platform.OS === 'web'
    ) {
      return;
    }

    let isCancelled = false;

    const registerDeviceForPush = async () => {
      try {
        const existingPermission = await Notifications.getPermissionsAsync();
        let status = existingPermission.status;

        if (status !== 'granted') {
          const requestedPermission =
            await Notifications.requestPermissionsAsync();
          status = requestedPermission.status;
        }

        if (status !== 'granted' || isCancelled) {
          return;
        }

        const devicePushToken = await Notifications.getDevicePushTokenAsync();
        const token = String(devicePushToken.data ?? '').trim();
        if (!token) {
          return;
        }

        const deviceId = await getDeviceId();
        const storageKey = getPushTokenSyncKey(userId);
        const cached = await Storage.getItem<{
          token: string;
          deviceId: string;
        }>(storageKey);

        if (cached?.token === token && cached.deviceId === deviceId) {
          return;
        }

        await registerPushToken({
          token,
          deviceId,
          platform:
            Platform.OS === 'ios' || Platform.OS === 'android'
              ? Platform.OS
              : 'unknown',
        }).unwrap();

        await Storage.setItem(storageKey, { token, deviceId });
      } catch (error) {
        reportError(error, {
          source: 'AppInitializer.registerDeviceForPush',
          userId,
        });
      }
    };

    void registerDeviceForPush();

    return () => {
      isCancelled = true;
    };
  }, [accessToken, registerPushToken, userId]);

  useEffect(() => {
    if (!isPushNotificationsEnabled() || Platform.OS === 'web') {
      return;
    }

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as Record<
          string,
          unknown
        >;
        const action =
          parseNotificationAction(data.action) ??
          parseNotificationAction({
            screen: data.screen,
            params: data.params,
          });

        const title =
          typeof data.title === 'string'
            ? data.title
            : response.notification.request.content.title;

        navigateFromNotificationAction(action, {
          ...(typeof data.actorId === 'string'
            ? { actorId: data.actorId }
            : {}),
          ...(title ? { title } : {}),
          ...(typeof data.actorImage === 'string'
            ? { image: data.actorImage }
            : {}),
        });
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!authMethodConfig.biometric || Platform.OS === 'web') {
      setBiometricUnlocked(true);
      return;
    }

    if (!accessToken) {
      setBiometricUnlocked(false);
      return;
    }

    if (securityLoading || biometricPromptInFlight.current) {
      return;
    }

    const biometricEnabled = Boolean(securityData?.security?.biometricEnabled);

    if (!biometricEnabled) {
      setBiometricUnlocked(true);
      return;
    }

    biometricPromptInFlight.current = true;

    const authenticate = async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardware || !enrolled) {
          await clearRefreshToken();
          dispatch(logoutAction());
          dispatch(baseApi.util.resetApiState());
          setBiometricUnlocked(false);
          return;
        }

        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Unlock MatchMate',
          cancelLabel: 'Sign out',
          disableDeviceFallback: false,
        });

        if (result.success) {
          setBiometricUnlocked(true);
          return;
        }

        await clearRefreshToken();
        dispatch(logoutAction());
        dispatch(baseApi.util.resetApiState());
        setBiometricUnlocked(false);
      } finally {
        biometricPromptInFlight.current = false;
      }
    };

    void authenticate();
  }, [accessToken, dispatch, securityData, securityLoading]);

  if (
    !langReady ||
    (accessToken && isLoading) ||
    (accessToken && !biometricUnlocked)
  ) {
    return <Loader fullScreen size="large" loadingText="App initializing..." />;
  }

  return <>{children}</>;
}
