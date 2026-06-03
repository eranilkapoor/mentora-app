import React, { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout as logoutAction, setUser } from '@/store/slices/auth.slice';
import { useVerifyUserQuery } from '@/store/services/authApi.service';
import { useUpdateProfileLocationMutation } from '@/store/services/profileApi.service';
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

interface Props {
  children: React.ReactNode;
}

interface LocationSyncSnapshot {
  latitude: number;
  longitude: number;
  deviceId: string;
  syncedAt: number;
}

const LOCATION_SYNC_TTL_MS = 24 * 60 * 60 * 1000;
const LOCATION_SYNC_DISTANCE_METERS = 2000;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const getLocationSyncKey = (userId: string): string =>
  `profile-location-sync:${userId}`;

const getPushTokenSyncKey = (userId: string): string =>
  `notification-push-token:${userId}`;

const toRadians = (value: number): number => (value * Math.PI) / 180;

const distanceInMeters = (
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
): number => {
  const earthRadiusMeters = 6371000;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const fromLat = toRadians(from.latitude);
  const toLat = toRadians(to.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(fromLat) *
      Math.cos(toLat) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

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
  const locationSyncInFlight = useRef(false);
  const biometricPromptInFlight = useRef(false);
  const [updateProfileLocation] = useUpdateProfileLocationMutation();
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
        console.error('[AppInitializer] i18n error:', err);
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
        if (__DEV__) {
          console.warn('[AppInitializer] push registration failed:', error);
        }
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

  useEffect(() => {
    if (!accessToken || !userId || locationSyncInFlight.current) {
      return;
    }

    let isCancelled = false;
    locationSyncInFlight.current = true;

    const syncLocation = async () => {
      try {
        const deviceId = await getDeviceId();
        const storageKey = getLocationSyncKey(userId);
        const cached = await Storage.getItem<LocationSyncSnapshot>(storageKey);

        const now = Date.now();
        const sameDevice = cached?.deviceId === deviceId;
        const isFresh =
          cached !== null && now - cached.syncedAt < LOCATION_SYNC_TTL_MS;

        if (sameDevice && isFresh) {
          return;
        }

        let permission = await Location.getForegroundPermissionsAsync();
        if (permission.status === Location.PermissionStatus.UNDETERMINED) {
          permission = await Location.requestForegroundPermissionsAsync();
        }

        if (permission.status !== Location.PermissionStatus.GRANTED) {
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (isCancelled) {
          return;
        }

        const nextLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        const movedEnough =
          !cached ||
          !sameDevice ||
          distanceInMeters(
            {
              latitude: cached.latitude,
              longitude: cached.longitude,
            },
            nextLocation
          ) >= LOCATION_SYNC_DISTANCE_METERS;

        if (!movedEnough) {
          await Storage.setItem<LocationSyncSnapshot>(storageKey, {
            ...nextLocation,
            deviceId,
            syncedAt: now,
          });
          return;
        }

        await updateProfileLocation({
          latitude: nextLocation.latitude,
          longitude: nextLocation.longitude,
        }).unwrap();

        await Storage.setItem<LocationSyncSnapshot>(storageKey, {
          ...nextLocation,
          deviceId,
          syncedAt: now,
        });
      } catch (error) {
        if (__DEV__) {
          console.warn('[AppInitializer] location sync failed:', error);
        }
      } finally {
        locationSyncInFlight.current = false;
      }
    };

    void syncLocation();

    return () => {
      isCancelled = true;
      locationSyncInFlight.current = false;
    };
  }, [accessToken, updateProfileLocation, userId]);

  if (
    !langReady ||
    (accessToken && isLoading) ||
    (accessToken && !biometricUnlocked)
  ) {
    return <Loader fullScreen size="large" loadingText="App initializing..." />;
  }

  return <>{children}</>;
}
