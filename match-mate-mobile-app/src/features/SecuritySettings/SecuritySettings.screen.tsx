import React, { useCallback, useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { sharedSettingsStyles } from '../Settings/shared.settings.styles';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { SettingsToggleItem } from '@/core/components/settings/SettingsToggleItem';
import { SettingsSelectItem } from '@/core/components/settings/SettingsSelectItem';
import {
  SettingsOption,
  SettingsOptionSheet,
} from '@/core/components/settings/SettingsOptionSheet';
import { showConfirm } from '@/core/utils/confirm';
import { showSuccess } from '@/core/utils/toast';
import {
  useGetSecuritySettingsQuery,
  useUpdateSecuritySettingsMutation,
} from '@/store/services/securitySettingsApi.service';
import { useLogoutAllMutation } from '@/store/services/authApi.service';
import { baseApi, clearRefreshToken } from '@/store/services/baseApi.service';
import { useAppDispatch } from '@/store/hooks';
import { logout as logoutAction } from '@/store/slices/auth.slice';
import Loader from '@/core/components/Loader';
import {
  SecuritySettings,
  SecuritySettingsScreenProps,
} from './SecuritySettings.types';

const formatValue = <T extends string>(
  options: SettingsOption<T>[],
  value?: T
): string => options.find((option) => option.value === value)?.label ?? '';

export default function SecuritySettingsScreen({
  navigation,
}: SecuritySettingsScreenProps): React.ReactElement {
  const styles = useThemedStyles(sharedSettingsStyles);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { data, isLoading } = useGetSecuritySettingsQuery();
  const [update] = useUpdateSecuritySettingsMutation();
  const [logoutAll] = useLogoutAllMutation();
  const [twoFactorMethodOpen, setTwoFactorMethodOpen] = useState(false);

  const settings = data?.security;

  const twoFactorMethodOptions = useMemo<
    SettingsOption<SecuritySettings['twoFactorMethod']>[]
  >(
    () => [
      { value: 'none', label: t('settings.options.none') },
      { value: 'sms', label: t('settings.options.sms') },
      { value: 'email', label: t('settings.options.email') },
      {
        value: 'authenticator',
        label: t('settings.options.authenticator'),
      },
    ],
    [t]
  );

  const handleToggle = useCallback(
    (key: keyof SecuritySettings, value: boolean) => {
      void update({ [key]: value });
    },
    [update]
  );

  const handleUpdate = useCallback(
    <K extends keyof SecuritySettings>(key: K, value: SecuritySettings[K]) => {
      void update({ [key]: value });
    },
    [update]
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
          <SettingsToggleItem
            icon="lock"
            label={t('settings.security.two_factor')}
            sublabel={t('settings.security.two_factor_sub')}
            value={settings?.twoFactorEnabled ?? false}
            onChange={(v) => handleToggle('twoFactorEnabled', v)}
          />
          <SettingsSelectItem
            icon="smartphone"
            label={t('settings.security.two_factor_method')}
            value={formatValue(
              twoFactorMethodOptions,
              settings?.twoFactorMethod
            )}
            sublabel={t('settings.security.two_factor_method_sub')}
            onPress={() => setTwoFactorMethodOpen(true)}
          />
          <SettingsToggleItem
            icon="cpu"
            label={t('settings.security.biometric')}
            sublabel={t('settings.security.biometric_sub')}
            value={settings?.biometricEnabled ?? false}
            onChange={(v) => handleToggle('biometricEnabled', v)}
          />
          <SettingsToggleItem
            icon="hash"
            label={t('settings.security.app_pin')}
            sublabel={t('settings.security.app_pin_sub')}
            value={settings?.appPinEnabled ?? false}
            isLast
            onChange={(v) => handleToggle('appPinEnabled', v)}
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
            onChange={(v) => handleToggle('suspiciousLoginAlerts', v)}
          />
          <SettingsToggleItem
            icon="log-in"
            label={t('settings.security.login_notifications')}
            sublabel={t('settings.security.login_notifications_sub')}
            value={settings?.loginNotifications ?? true}
            isLast
            onChange={(v) => handleToggle('loginNotifications', v)}
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
            label="Login History"
            sublabel="Recent sign-ins, devices, and session status"
            onPress={() => navigation.navigate('LoginHistory')}
          />
          <SettingsSelectItem
            icon="list"
            label={t('settings.security.manage_devices')}
            sublabel={t('settings.security.manage_devices_sub', {
              count: settings?.loginDevices?.length ?? 0,
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

      <SettingsOptionSheet
        visible={twoFactorMethodOpen}
        title={t('settings.security.two_factor_method')}
        options={twoFactorMethodOptions}
        selectedValue={settings?.twoFactorMethod ?? 'none'}
        onSelect={(value) =>
          handleUpdate(
            'twoFactorMethod',
            value as SecuritySettings['twoFactorMethod']
          )
        }
        onClose={() => setTwoFactorMethodOpen(false)}
      />
    </SafeAreaView>
  );
}
