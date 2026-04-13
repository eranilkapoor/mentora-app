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
  const token = useAppSelector((s) => s.auth.token);

  const { data, error, isLoading, isFetching } = useVerifyUserQuery(undefined, {
    skip: !token, // 🚀 only call if token exists
  });

  useEffect(() => {
    if (data?.success && data?.data) {
      dispatch(setUser(data?.data));
    }

    if (error) {
      dispatch(logout());
    }
  }, [data, error, dispatch]);

  if (token && (isLoading || isFetching)) {
    return <Loader fullScreen />;
  }

  return <>{children}</>;
}
