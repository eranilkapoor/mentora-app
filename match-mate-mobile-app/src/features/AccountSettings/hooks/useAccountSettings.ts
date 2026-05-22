import { useCallback, useEffect, useState } from 'react';
import { AccountSettingsResponse } from '../types/accountSettings.types';
import {
  useGetAccountSettingsQuery,
  useUpdateTwoFactorMutation,
} from '@/store/services/accountSettings.service';

export function useAccountSettings() {
  const [loading, setLoading] = useState(true);
  const { data, isLoading, isFetching, isError, refetch } =
    useGetAccountSettingsQuery();
  const [updateTwoFactor] = useUpdateTwoFactorMutation();

  const [settings, setSettings] = useState<AccountSettingsResponse | null>(
    null
  );

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);

      setSettings(data ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  const toggleTwoFactor = useCallback(
    async (enabled: boolean) => {
      if (!settings) {
        return;
      }

      setSettings({
        ...settings,
        twoFactorEnabled: enabled,
      });

      try {
        await updateTwoFactor({ enabled }).unwrap();
      } catch {
        setSettings({
          ...settings,
        });
      }
    },
    [settings]
  );

  return {
    loading,
    settings,
    refresh: fetchSettings,
    toggleTwoFactor,
  };
}
