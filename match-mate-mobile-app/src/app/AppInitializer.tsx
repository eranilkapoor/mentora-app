import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Loader from '../core/components/Loader';
import { logout, setUser } from '../store/slices/authSlice';
import { useVerifyUserQuery } from '@/store/services/authApi';

export default function AppInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const access_token = useAppSelector((s) => s.auth.access_token);

  const { data, error, isLoading, isFetching } = useVerifyUserQuery(undefined, {
    skip: !access_token, // 🚀 only call if access_token exists
  });

  useEffect(() => {
    if (data?.success && data?.data) {
      dispatch(setUser(data?.data));
    }

    if (error) {
      dispatch(logout());
    }
  }, [data, error, dispatch]);

  if (access_token && (isLoading || isFetching)) {
    return <Loader fullScreen size="large" loadingText="App initializing..." />;
  }

  return <>{children}</>;
}
