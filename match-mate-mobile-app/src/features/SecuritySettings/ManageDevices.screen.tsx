import React, { useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import Loader from '@/core/components/Loader';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { SettingsSelectItem } from '@/core/components/settings/SettingsSelectItem';
import { showConfirm } from '@/core/utils/confirm';
import { showError, showSuccess } from '@/core/utils/toast';
import { SettingsNavigationProp } from '@/navigation/types';
import { AuthSession } from '@/core/types';
import {
  useGetSessionsQuery,
  useLogoutSessionMutation,
} from '@/store/services/authApi.service';
import { sharedSettingsStyles } from '../Settings/shared.settings.styles';
import { useThemedStyles } from '@/core/theme/useThemedStyles';

type Props = {
  navigation: SettingsNavigationProp;
};

export default function ManageDevicesScreen({
  navigation,
}: Props): React.ReactElement {
  const { t } = useTranslation();
  const styles = useThemedStyles(sharedSettingsStyles);
  const { data, isLoading, refetch } = useGetSessionsQuery();
  const [logoutSession] = useLogoutSessionMutation();

  const handleRevoke = useCallback(
    (deviceId: string, label: string) => {
      showConfirm({
        title: t('settings.security.sign_out_device_title'),
        message: t('settings.security.sign_out_device_message', {
          device: label,
        }),
        confirmText: t('settings.security.sign_out_device_confirm'),
        destructive: true,
        onConfirm: () => {
          void logoutSession({ sessionId: deviceId })
            .unwrap()
            .then(() => {
              showSuccess({ title: t('settings.security.device_signed_out') });
              void refetch();
            })
            .catch((error: unknown) => {
              console.error('Revoke device failed:', error);
              showError({
                title: t('settings.security.unable_sign_out_device'),
                message: t('common.try_again_message'),
              });
            });
        },
      });
    },
    [logoutSession, refetch, t]
  );

  if (isLoading || !data) {
    return <Loader fullScreen size="large" />;
  }

  const devices: AuthSession[] = data?.success ? data.data.sessions : [];

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('settings.security.manage_devices')}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SettingsCard
          icon="monitor"
          title={t('settings.security.active_devices')}
          subtitle={t('settings.security.active_devices_sub')}
        >
          {devices.length === 0 ? (
            <SettingsSelectItem
              icon="info"
              label={t('settings.security.no_active_devices')}
              sublabel={t('settings.security.no_active_devices_sub')}
              disabled
              isLast
              onPress={() => undefined}
            />
          ) : (
            devices.map((device, index) => {
              const label =
                device.deviceName ?? device.platform ?? device.sessionId;
              const lastActive = device.lastActive
                ? new Date(device.lastActive).toLocaleString()
                : t('settings.security.unknown_activity');
              const sublabel = `${device.platform ?? t('settings.security.unknown_platform')}${
                device.ipAddress ? ` • ${device.ipAddress}` : ''
              }\n${lastActive}`;

              return (
                <SettingsSelectItem
                  key={device.sessionId}
                  icon="smartphone"
                  label={label}
                  sublabel={sublabel}
                  value={t('settings.security.sign_out_device_confirm')}
                  isLast={index === devices.length - 1}
                  onPress={() => handleRevoke(device.sessionId, label)}
                />
              );
            })
          )}
        </SettingsCard>
        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}
