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
  useSetPrimaryLinkedAccountMutation,
} from '@/store/services/accountSettingsApi.service';
import { sharedSettingsStyles } from '../Settings/shared.settings.styles';
import { useThemedStyles } from '@/core/theme/useThemedStyles';

type Props = {
  navigation: SettingsNavigationProp;
};

const PROVIDERS = [
  {
    provider: 'email',
    labelKey: 'settings.account.provider_email',
    icon: 'mail',
  },
  {
    provider: 'phone',
    labelKey: 'settings.account.provider_phone',
    icon: 'phone',
  },
  {
    provider: 'google',
    labelKey: 'settings.account.provider_google',
    icon: 'google',
    iconFamily: 'fontAwesome',
  },
  {
    provider: 'facebook',
    label: 'Facebook',
    icon: 'facebook',
    iconFamily: 'fontAwesome',
  },
  {
    provider: 'apple',
    labelKey: 'settings.account.provider_apple',
    icon: 'apple',
    iconFamily: 'fontAwesome',
  },
] as const;

export default function LinkedAccountsScreen({
  navigation,
}: Props): React.ReactElement {
  const { t } = useTranslation();
  const styles = useThemedStyles(sharedSettingsStyles);
  const { data, isLoading } = useGetAccountSettingsQuery();
  const [disconnectProvider] = useDisconnectLinkedAccountMutation();
  const [setPrimary] = useSetPrimaryLinkedAccountMutation();

  const handleMakePrimary = useCallback(
    (provider: string, label: string) => {
      showConfirm({
        title: t('settings.account.make_primary_title', { provider: label }),
        message: t('settings.account.make_primary_message', {
          provider: label,
        }),
        confirmText: t('settings.account.make_primary'),
        onConfirm: () => {
          void setPrimary({ provider });
        },
      });
    },
    [setPrimary, t]
  );

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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SettingsCard
          icon="link"
          title={t('settings.account.linked_accounts')}
          subtitle={t('settings.account.linked_accounts_subtitle')}
        >
          {PROVIDERS.filter((item) =>
            data.account.linkedAccounts?.some(
              (account) =>
                account.provider === item.provider && account.connected
            )
          ).map((item, index, connectedProviders) => {
            const label = 'labelKey' in item ? t(item.labelKey) : item.label;
            const linked = data.account.linkedAccounts?.find(
              (account) => account.provider === item.provider
            );
            const canDisconnect = Boolean(linked?.canDisconnect);
            const isPrimary = Boolean(linked?.isPrimary);
            const sublabel = isPrimary
              ? t('settings.account.primary_cannot_disconnect')
              : t('settings.account.linked_connected');
            const value = isPrimary
              ? t('settings.account.primary', { defaultValue: 'Primary' })
              : t('settings.account.make_primary');

            return (
              <SettingsSelectItem
                key={item.provider}
                icon={item.icon}
                iconFamily={'iconFamily' in item ? item.iconFamily : 'feather'}
                label={label}
                sublabel={sublabel}
                value={value}
                isLast={index === connectedProviders.length - 1}
                disabled={isPrimary}
                onPress={() => handleMakePrimary(item.provider, label)}
                actionIcon={!isPrimary ? 'unlink' : undefined}
                actionAccessibilityLabel={t(
                  'settings.account.disconnect_title',
                  { provider: label }
                )}
                actionDestructive
                onActionPress={
                  !isPrimary
                    ? () =>
                        handleDisconnect(item.provider, label, canDisconnect)
                    : undefined
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
