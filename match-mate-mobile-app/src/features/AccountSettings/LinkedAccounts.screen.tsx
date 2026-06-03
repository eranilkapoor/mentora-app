import React, { useCallback } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const styles = useThemedStyles(sharedSettingsStyles);
  const { data, isLoading } = useGetAccountSettingsQuery();
  const [connectProvider] = useConnectProviderMutation();
  const [disconnectProvider] = useDisconnectLinkedAccountMutation();

  const handleConnect = useCallback(
    async (provider: string, label: string) => {
      try {
        await connectProvider({ provider }).unwrap();
        Alert.alert(
          t('settings.account.provider_connected_title', { provider: label }),
          t('settings.account.provider_connected_message')
        );
      } catch (error) {
        console.error('Connect provider failed:', error);
        Alert.alert(
          t('settings.account.provider_connect_failed'),
          t('common.try_again_message')
        );
      }
    },
    [connectProvider, t]
  );

  const handleDisconnect = useCallback(
    (provider: string, label: string) => {
      showConfirm({
        title: t('settings.account.disconnect_title', { provider: label }),
        message: t('settings.account.disconnect_message', { provider: label }),
        confirmText: t('settings.account.disconnect_confirm'),
        destructive: true,
        onConfirm: () => {
          void disconnectProvider({ provider });
        },
      });
    },
    [disconnectProvider, t]
  );

  if (isLoading || !data) {
    return <Loader fullScreen size="large" />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('settings.account.linked_accounts')}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SettingsCard
          icon="link"
          title={t('settings.account.linked_accounts')}
          subtitle={t('settings.account.linked_accounts_subtitle')}
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
                sublabel={
                  connected
                    ? t('settings.account.connected')
                    : t('settings.account.linked_not_connected')
                }
                value={
                  connected
                    ? t('settings.account.disconnect_confirm')
                    : t('settings.account.connect')
                }
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
