import React, { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser } from '@/store/slices/auth.slice';
import { useVerifyUserQuery } from '@/store/services/authApi.service';
import { useUpdateProfileLocationMutation } from '@/store/services/profileApi.service';
import Loader from '@/core/components/Loader';
import { getDeviceId } from '@/core/utils/device';
import { Storage } from '@/core/utils/storage';
import i18n from '@/i18n';

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

const getLocationSyncKey = (userId: string): string =>
  `profile-location-sync:${userId}`;

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
  const isFirstLoad = useRef(true);
  const locationSyncInFlight = useRef(false);
  const [updateProfileLocation] = useUpdateProfileLocationMutation();

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

  if (!langReady || (accessToken && isLoading)) {
    return <Loader fullScreen size="large" loadingText="App initializing..." />;
  }

  return <>{children}</>;
}
