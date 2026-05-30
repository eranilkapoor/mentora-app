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
  useConnectProviderMutation,
  useDisconnectLinkedAccountMutation,
  useGetAccountSettingsQuery,
} from '@/store/services/accountSettingsApi.service';
import { sharedSettingsStyles } from '../Settings/shared.settings.styles';
import { useThemedStyles } from '@/core/theme/useThemedStyles';

type Props = {
  navigation: SettingsNavigationProp;
};

const PROVIDERS = [
  { provider: 'google', label: 'Google', icon: 'search' },
  { provider: 'facebook', label: 'Facebook', icon: 'facebook' },
  { provider: 'apple', label: 'Apple', icon: 'smartphone' },
] as const;

export default function LinkedAccountsScreen({
  navigation,
}: Props): React.ReactElement {
  const styles = useThemedStyles(sharedSettingsStyles);
  const { data, isLoading } = useGetAccountSettingsQuery();
  const [connectProvider] = useConnectProviderMutation();
  const [disconnectProvider] = useDisconnectLinkedAccountMutation();

  const handleConnect = useCallback(
    async (provider: string, label: string) => {
      try {
        await connectProvider({ provider }).unwrap();
        Alert.alert(
          `${label} connected`,
          'This account can now be used for sign in.'
        );
      } catch (error) {
        console.error('Connect provider failed:', error);
        Alert.alert('Unable to connect', 'Please try again.');
      }
    },
    [connectProvider]
  );

  const handleDisconnect = useCallback(
    (provider: string, label: string) => {
      showConfirm({
        title: `Disconnect ${label}?`,
        message: `You will no longer be able to sign in with ${label}.`,
        confirmText: 'Disconnect',
        destructive: true,
        onConfirm: () => {
          void disconnectProvider({ provider });
        },
      });
    },
    [disconnectProvider]
  );

  if (isLoading || !data) {
    return <Loader fullScreen size="large" />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title="Linked Accounts"
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SettingsCard
          icon="link"
          title="Linked Accounts"
          subtitle="Connect social accounts for faster sign in"
        >
          {PROVIDERS.map((item, index) => {
            const linked = data.account.linkedAccounts?.find(
              (account) => account.provider === item.provider
            );
            const connected = linked?.connected ?? false;

            return (
              <SettingsSelectItem
                key={item.provider}
                icon={item.icon}
                label={item.label}
                sublabel={connected ? 'Connected' : 'Not connected'}
                value={connected ? 'Disconnect' : 'Connect'}
                isLast={index === PROVIDERS.length - 1}
                onPress={() =>
                  connected
                    ? handleDisconnect(item.provider, item.label)
                    : void handleConnect(item.provider, item.label)
                }
              />
            );
          })}
        </SettingsCard>
        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}
