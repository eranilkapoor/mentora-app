import React, { useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const styles = useThemedStyles(sharedSettingsStyles);
  const { data, isLoading } = useGetSessionsQuery();
  const [logoutSession] = useLogoutSessionMutation();

  const handleRevoke = useCallback(
    (deviceId: string, label: string) => {
      showConfirm({
        title: 'Sign out device?',
        message: `${label} will be signed out of your account.`,
        confirmText: 'Sign Out',
        destructive: true,
        onConfirm: () => {
          void logoutSession({ sessionId: deviceId })
            .unwrap()
            .then(() => {
              showSuccess({ title: 'Device signed out' });
            })
            .catch((error: unknown) => {
              console.error('Revoke device failed:', error);
              showError({
                title: 'Unable to sign out device',
                message: 'Please try again.',
              });
            });
        },
      });
    },
    [logoutSession]
  );

  if (isLoading || !data) {
    return <Loader fullScreen size="large" />;
  }

  const devices: AuthSession[] = data?.success ? data.data.sessions : [];

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
                device.deviceName ?? device.platform ?? device.sessionId;
              const lastActive = device.lastActive
                ? new Date(device.lastActive).toLocaleString()
                : 'Last active time unknown';
              const sublabel = `${device.platform ?? 'Unknown platform'}${
                device.ipAddress ? ` • ${device.ipAddress}` : ''
              }\n${lastActive}`;

              return (
                <SettingsSelectItem
                  key={device.sessionId}
                  icon="smartphone"
                  label={label}
                  sublabel={sublabel}
                  value="Sign Out"
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
