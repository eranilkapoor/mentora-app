import React, { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';
import { useVerifyUserQuery } from '@/store/services/authApi';
import { useUpdateProfileLocationMutation } from '@/store/services/profileApi.service';
import Loader from '@/core/components/Loader';
import i18n from '@/i18n';

interface Props {
  children: React.ReactNode;
}

export default function AppInitializer({ children }: Props) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const lang = useAppSelector((s) => s.settings.language);

  const [langReady, setLangReady] = useState(false);
  const isFirstLoad = useRef(true);
  const locationSyncedForToken = useRef<string | null>(null);
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
        await i18n.changeLanguage(lang);
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
    if (!accessToken || locationSyncedForToken.current === accessToken) {
      return;
    }

    let isCancelled = false;
    locationSyncedForToken.current = accessToken;

    const syncLocation = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== Location.PermissionStatus.GRANTED) {
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (isCancelled) {
          return;
        }

        await updateProfileLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }).unwrap();
      } catch (error) {
        if (__DEV__) {
          console.warn('[AppInitializer] location sync failed:', error);
        }
      }
    };

    void syncLocation();

    return () => {
      isCancelled = true;
    };
  }, [accessToken, updateProfileLocation]);

  if (!langReady || (accessToken && isLoading)) {
    return <Loader fullScreen size="large" loadingText="App initializing..." />;
  }

  return <>{children}</>;
}
