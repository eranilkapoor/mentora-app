import React, { useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import Loader from '@/core/components/Loader';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { SettingsSelectItem } from '@/core/components/settings/SettingsSelectItem';
import { showConfirm } from '@/core/utils/confirm';
import { showWarning } from '@/core/utils/toast';
import { SettingsNavigationProp } from '@/navigation/types';
import {
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
  const [disconnectProvider] = useDisconnectLinkedAccountMutation();

  const handleDisconnect = useCallback(
    (provider: string, label: string, canDisconnect: boolean) => {
      if (!canDisconnect) {
        showWarning({
          title: t('settings.account.cannot_disconnect_title', {
            defaultValue: 'Cannot disconnect',
          }),
          message: t('settings.account.cannot_disconnect_message', {
            provider: label,
            defaultValue:
              'Add another sign-in method before disconnecting this account.',
          }),
        });
        return;
      }

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
            const canDisconnect = Boolean(linked?.canDisconnect);
            const sublabel = connected
              ? canDisconnect
                ? t('settings.account.linked_connected')
                : t('settings.account.linked_primary_required', {
                    defaultValue:
                      'Add another sign-in method before disconnecting this account',
                  })
              : t('settings.account.linked_not_connected_sub', {
                  defaultValue:
                    'Sign in with this provider to link it to your account',
                });
            const value = connected
              ? canDisconnect
                ? t('settings.account.disconnect_confirm')
                : t('settings.account.primary', { defaultValue: 'Primary' })
              : t('settings.account.not_available', {
                  defaultValue: 'Not connected',
                });

            return (
              <SettingsSelectItem
                key={item.provider}
                icon={item.icon}
                label={item.label}
                sublabel={sublabel}
                value={value}
                isLast={index === PROVIDERS.length - 1}
                disabled={!connected}
                onPress={() =>
                  handleDisconnect(item.provider, item.label, canDisconnect)
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
