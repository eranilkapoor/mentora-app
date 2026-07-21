import React, { useCallback } from 'react';
import { Platform, View, ScrollView } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { sharedSettingsStyles } from '../Settings/shared.settings.styles';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { SettingsToggleItem } from '@/core/components/settings/SettingsToggleItem';
import { SettingsSelectItem } from '@/core/components/settings/SettingsSelectItem';
import { showConfirm } from '@/core/utils/confirm';
import { showError, showSuccess } from '@/core/utils/toast';
import {
  useGetSecuritySettingsQuery,
  useUpdateSecuritySettingsMutation,
} from '@/store/services/securitySettingsApi.service';
import {
  useGetSessionsQuery,
  useLogoutAllMutation,
} from '@/store/services/authApi.service';
import { baseApi, clearRefreshToken } from '@/store/services/baseApi.service';
import { useAppDispatch } from '@/store/hooks';
import { logout as logoutAction } from '@/store/slices/auth.slice';
import Loader from '@/core/components/Loader';
import {
  SecuritySettings,
  SecuritySettingsScreenProps,
} from './SecuritySettings.types';
import { authMethodConfig } from '@/features/Auth/shared/authMethodConfig';

export default function SecuritySettingsScreen({
  navigation,
}: SecuritySettingsScreenProps): React.ReactElement {
  const styles = useThemedStyles(sharedSettingsStyles);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { data, isLoading } = useGetSecuritySettingsQuery();
  const { data: sessionsData } = useGetSessionsQuery();
  const [update] = useUpdateSecuritySettingsMutation();
  const [logoutAll] = useLogoutAllMutation();

  const settings = data?.security;
  const activeDeviceCount = sessionsData?.success
    ? sessionsData.data.sessions.length
    : (settings?.loginDevices?.length ?? 0);

  const handleToggle = useCallback(
    async (key: keyof SecuritySettings, value: boolean) => {
      if (key === 'biometricEnabled' && value) {
        if (!authMethodConfig.biometric || Platform.OS === 'web') {
          showError({
            title: t('common.error'),
            message: t('settings.security.biometric_unavailable'),
          });
          return;
        }

        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardware || !enrolled) {
          showError({
            title: t('common.error'),
            message: t('settings.security.biometric_not_enrolled'),
          });
          return;
        }

        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: t('settings.security.biometric_prompt'),
          cancelLabel: t('common.cancel'),
          disableDeviceFallback: false,
        });

        if (!result.success) {
          showError({
            title: t('common.error'),
            message: t('settings.security.biometric_failed'),
          });
          return;
        }
      }

      void update({ [key]: value });
    },
    [t, update]
  );

  const handleRevokeAllDevices = useCallback(() => {
    showConfirm({
      title: t('settings.security.revoke_all_title'),
      message: t('settings.security.revoke_all_message'),
      confirmText: t('settings.security.revoke_all_confirm'),
      destructive: true,
      onConfirm: () => {
        void logoutAll().then(async () => {
          await clearRefreshToken();
          dispatch(logoutAction());
          dispatch(baseApi.util.resetApiState());
          showSuccess({
            title: t('common.success'),
            message: t('settings.security.revoke_all_success'),
          });
        });
      },
    });
  }, [dispatch, logoutAll, t]);

  if (isLoading || !data) {
    return <Loader fullScreen size="large" />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('settings.security.title')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Authentication */}
        <SettingsCard
          icon="shield"
          title={t('settings.security.authentication')}
          subtitle={t('settings.security.authentication_subtitle')}
        >
          <SettingsSelectItem
            icon="lock"
            label={t('settings.security.two_factor')}
            sublabel={t('settings.security.two_factor_sub')}
            value={
              settings?.twoFactorEnabled
                ? settings.twoFactorMethod
                  ? t(`settings.options.${settings.twoFactorMethod}`)
                  : t('settings.security.status_enabled')
                : t('settings.security.status_disabled')
            }
            onPress={() => navigation.navigate('TwoFactorSetup')}
          />
          <SettingsToggleItem
            icon="cpu"
            label={t('settings.security.biometric')}
            sublabel={t('settings.security.biometric_sub')}
            value={settings?.biometricEnabled ?? false}
            onChange={(v) => {
              void handleToggle('biometricEnabled', v);
            }}
          />
        </SettingsCard>

        {/* Login Alerts */}
        <SettingsCard
          icon="alert-triangle"
          title={t('settings.security.alerts')}
          subtitle={t('settings.security.alerts_subtitle')}
        >
          <SettingsToggleItem
            icon="alert-circle"
            label={t('settings.security.suspicious_alerts')}
            sublabel={t('settings.security.suspicious_alerts_sub')}
            value={settings?.suspiciousLoginAlerts ?? true}
            onChange={(v) => {
              void handleToggle('suspiciousLoginAlerts', v);
            }}
          />
          <SettingsToggleItem
            icon="log-in"
            label={t('settings.security.login_notifications')}
            sublabel={t('settings.security.login_notifications_sub')}
            value={settings?.loginNotifications ?? true}
            isLast
            onChange={(v) => {
              void handleToggle('loginNotifications', v);
            }}
          />
        </SettingsCard>

        {/* Devices */}
        <SettingsCard
          icon="monitor"
          title={t('settings.security.devices')}
          subtitle={t('settings.security.devices_subtitle')}
        >
          <SettingsSelectItem
            icon="clock"
            label={t('settings.security.login_history_title')}
            sublabel={t('settings.security.login_history_sub')}
            onPress={() => navigation.navigate('LoginHistory')}
          />
          <SettingsSelectItem
            icon="list"
            label={t('settings.security.manage_devices')}
            sublabel={t('settings.security.manage_devices_sub', {
              count: activeDeviceCount,
            })}
            onPress={() => navigation.navigate('ManageDevices')}
          />
          <SettingsSelectItem
            icon="log-out"
            label={t('settings.security.revoke_all')}
            sublabel={t('settings.security.revoke_all_sub')}
            destructive
            isLast
            onPress={handleRevokeAllDevices}
          />
        </SettingsCard>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}
