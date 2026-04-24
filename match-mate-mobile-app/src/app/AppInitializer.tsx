import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Loader from '../core/components/Loader';
import { logout, setUser } from '../store/slices/authSlice';
import { useVerifyUserQuery } from '@/store/services/authApi';
import i18n from '../i18n';

export default function AppInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const access_token = useAppSelector((s) => s.auth.access_token);
  const lang = useAppSelector((s) => s.settings.language);

  const [langReady, setLangReady] = useState(false);
  const isFirstLoad = React.useRef(true);

  const { data, error, isLoading, isFetching } = useVerifyUserQuery(undefined, {
    skip: !access_token, // 🚀 only call if access_token exists
  });

  // ✅ Language sync (runs on mount + whenever lang changes)
  useEffect(() => {
    let isMounted = true;

    const applyLanguage = async () => {
      if (isFirstLoad.current && isMounted) {
        setLangReady(false);
      }

      try {
        await i18n.changeLanguage(lang);
      } catch (err) {
        console.error('i18n error:', err);
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

  // ✅ Auth sync (unchanged)
  useEffect(() => {
    if (data?.success && data?.data) {
      dispatch(setUser(data.data));
    }

    if (error) {
      dispatch(logout());
    }
  }, [data, error, dispatch]);

  // ✅ Block render until both auth AND language are ready
  if (!langReady || (access_token && (isLoading || isFetching))) {
    return <Loader fullScreen size="large" loadingText="App initializing..." />;
  }

  return <>{children}</>;
}
