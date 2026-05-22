import React, { useCallback } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { sharedSettingsStyles } from '../Settings/shared.settings.styles';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { SettingsToggleItem } from '@/core/components/settings/SettingsToggleItem';
import { SettingsSelectItem } from '@/core/components/settings/SettingsSelectItem';
import { showConfirm } from '@/core/utils/confirm';
import {
  useGetSecuritySettingsQuery,
  useUpdateSecuritySettingsMutation,
} from '@/store/services/securitySettings.service';
import Loader from '@/core/components/Loader';
import { SecuritySettingsScreenProps } from './SecuritySettings.types';

export default function SecuritySettingsScreen({
  navigation,
}: SecuritySettingsScreenProps): React.ReactElement {
  const styles = useThemedStyles(sharedSettingsStyles);
  const { t } = useTranslation();

  const { data, isLoading } = useGetSecuritySettingsQuery();
  const [update] = useUpdateSecuritySettingsMutation();

  const settings = data?.security;

  const handleToggle = useCallback(
    (key: string, value: boolean) => {
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
        Alert.alert(t('common.success'), t('settings.security.revoke_all_success'));
      },
    });
  }, [t]);

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
            value={settings?.twoFactorMethod ?? 'none'}
            sublabel={t('settings.security.two_factor_method_sub')}
            onPress={() => {}}
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
            icon="list"
            label={t('settings.security.manage_devices')}
            sublabel={t('settings.security.manage_devices_sub', {
              count: settings?.loginDevices?.length ?? 0,
            })}
            onPress={() => {}}
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