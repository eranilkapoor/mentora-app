import React, { useEffect, useRef, useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Notifications from 'expo-notifications';
import * as ScreenCapture from 'expo-screen-capture';
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
import { useGetAccountSettingsQuery } from '@/store/services/accountSettingsApi.service';
import { useGetPrivacySettingsQuery } from '@/store/services/privacySettingsApi.service';
import { useGetCommunicationSettingsQuery } from '@/store/services/communicationSettingsApi.service';
import { useRegisterNotificationDeviceTokenMutation } from '@/store/services/notificationApi.service';
import { useGetLocalizationSettingsQuery } from '@/store/services/localizationSettingsApi.service';
import { useGetNotificationSettingsQuery } from '@/store/services/notificationSettingsApi.service';
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_PRIVACY_SETTINGS,
} from '@/store/slices/settings.slice';
import {
  navigateFromNotificationAction,
  parseNotificationAction,
} from '@/features/Notifications/notificationNavigation';
import { reportError, setErrorReporterUser } from '@/core/utils/errorReporter';
import type { QuietHours } from '@/features/NotificationSettings/NotificationSettings.types';

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

const getTimeInMinutes = (value?: string): number | null => {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return null;
  const [hours = '0', minutes = '0'] = value.split(':');
  return Number(hours) * 60 + Number(minutes);
};

const getCurrentMinutesForTimezone = (timezone?: string): number => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timezone ?? 'UTC',
    }).formatToParts(new Date());
    const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
    const minute = Number(
      parts.find((part) => part.type === 'minute')?.value ?? 0
    );
    return hour * 60 + minute;
  } catch {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }
};

const isWithinQuietHours = (quietHours?: QuietHours): boolean => {
  if (!quietHours?.enabled) return false;

  const start = getTimeInMinutes(quietHours.start);
  const end = getTimeInMinutes(quietHours.end);
  if (start === null || end === null || start === end) return false;

  const current = getCurrentMinutesForTimezone(quietHours.timezone);
  return start < end
    ? current >= start && current < end
    : current >= start || current < end;
};

export default function AppInitializer({ children }: Props) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const userId = useAppSelector((s) => s.auth.user?.userId);
  const lang = useAppSelector((s) => s.settings.language);
  const notificationSettings = useAppSelector(
    (s) => s.settings.notification ?? DEFAULT_NOTIFICATION_SETTINGS
  );
  const privacySettings = useAppSelector(
    (s) => s.settings.privacy ?? DEFAULT_PRIVACY_SETTINGS
  );
  const notificationsMuted =
    notificationSettings.doNotDisturb ||
    isWithinQuietHours(notificationSettings.quietHours);

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
  useGetLocalizationSettingsQuery(undefined, { skip: !accessToken });
  useGetNotificationSettingsQuery(undefined, { skip: !accessToken });
  useGetAccountSettingsQuery(undefined, { skip: !accessToken });
  useGetPrivacySettingsQuery(undefined, { skip: !accessToken });
  useGetCommunicationSettingsQuery(undefined, { skip: !accessToken });

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
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound:
          notificationSettings.soundEnabled && !notificationsMuted,
        shouldSetBadge: !notificationsMuted,
        shouldShowBanner:
          notificationSettings.inAppEnabled && !notificationsMuted,
        shouldShowList: notificationSettings.inAppEnabled,
      }),
    });
  }, [
    notificationSettings.inAppEnabled,
    notificationSettings.soundEnabled,
    notificationsMuted,
  ]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const applyScreenCapturePolicy = async () => {
      try {
        if (!accessToken || privacySettings.allowScreenshots) {
          await ScreenCapture.allowScreenCaptureAsync();
          return;
        }

        await ScreenCapture.preventScreenCaptureAsync();
      } catch (error) {
        reportError(error, {
          source: 'AppInitializer.applyScreenCapturePolicy',
          allowScreenshots: privacySettings.allowScreenshots,
        });
      }
    };

    void applyScreenCapturePolicy();

    return () => {
      void ScreenCapture.allowScreenCaptureAsync().catch((error) => {
        reportError(error, {
          source: 'AppInitializer.releaseScreenCapturePolicy',
        });
      });
    };
  }, [accessToken, privacySettings.allowScreenshots]);

  useEffect(() => {
    if (
      !accessToken ||
      !userId ||
      !isPushNotificationsEnabled() ||
      !notificationSettings.pushEnabled ||
      notificationsMuted ||
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
  }, [
    accessToken,
    notificationSettings.pushEnabled,
    notificationsMuted,
    registerPushToken,
    userId,
  ]);

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
