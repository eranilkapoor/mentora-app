import React, { useCallback } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/core/components/Header';
import Loader from '@/core/components/Loader';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { SettingsSelectItem } from '@/core/components/settings/SettingsSelectItem';
import { showConfirm } from '@/core/utils/confirm';
import { SettingsNavigationProp } from '@/navigation/types';
import {
  useGetSecuritySettingsQuery,
  useRevokeDeviceMutation,
} from '@/store/services/securitySettings.service';
import { sharedSettingsStyles } from '../Settings/shared.settings.styles';
import { useThemedStyles } from '@/core/theme/useThemedStyles';

type Props = {
  navigation: SettingsNavigationProp;
};

export default function ManageDevicesScreen({
  navigation,
}: Props): React.ReactElement {
  const styles = useThemedStyles(sharedSettingsStyles);
  const { data, isLoading } = useGetSecuritySettingsQuery();
  const [revokeDevice] = useRevokeDeviceMutation();

  const handleRevoke = useCallback(
    (deviceId: string, label: string) => {
      showConfirm({
        title: 'Sign out device?',
        message: `${label} will be signed out of your account.`,
        confirmText: 'Sign Out',
        destructive: true,
        onConfirm: () => {
          void revokeDevice({ deviceId }).catch((error: unknown) => {
            console.error('Revoke device failed:', error);
            Alert.alert('Unable to sign out device', 'Please try again.');
          });
        },
      });
    },
    [revokeDevice]
  );

  if (isLoading || !data) {
    return <Loader fullScreen size="large" />;
  }

  const devices = data.security.loginDevices ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      <Header showBack onBackPress={navigation.goBack} title="Manage Devices" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SettingsCard
          icon="monitor"
          title="Active Devices"
          subtitle="Review and remove signed-in devices"
        >
          {devices.length === 0 ? (
            <SettingsSelectItem
              icon="info"
              label="No active devices"
              sublabel="New sign-ins will appear here."
              disabled
              isLast
              onPress={() => undefined}
            />
          ) : (
            devices.map((device, index) => {
              const label =
                device.deviceName ?? device.platform ?? device.deviceId;
              const lastActive = device.lastActive
                ? new Date(device.lastActive).toLocaleString()
                : 'Last active time unknown';
              const sublabel = `${device.platform ?? 'Unknown platform'}${
                device.ipAddress ? ` • ${device.ipAddress}` : ''
              }\n${lastActive}${device.isCurrent ? ' • Current device' : ''}`;

              return (
                <SettingsSelectItem
                  key={device.deviceId}
                  icon="smartphone"
                  label={label}
                  sublabel={sublabel}
                  value={device.isCurrent ? 'Current' : 'Sign Out'}
                  disabled={device.isCurrent}
                  isLast={index === devices.length - 1}
                  onPress={() => handleRevoke(device.deviceId, label)}
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
