import React, { useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import Loader from '@/core/components/Loader';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { SettingsSelectItem } from '@/core/components/settings/SettingsSelectItem';
import { showConfirm } from '@/core/utils/confirm';
import { showError, showSuccess, showWarning } from '@/core/utils/toast';
import { SettingsNavigationProp } from '@/navigation/types';
import {
  useDisconnectLinkedAccountMutation,
  useConnectSocialLinkedAccountMutation,
  useGetAccountSettingsQuery,
  useSetPrimaryLinkedAccountMutation,
} from '@/store/services/accountSettingsApi.service';
import { sharedSettingsStyles } from '../Settings/shared.settings.styles';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useSocialAuth } from '@/features/Auth/shared/useSocialAuth';
import { SocialProvider } from '@/features/Auth/shared/auth.types';
import { authMethodConfig } from '@/features/Auth/shared/authMethodConfig';
import { getLinkedAccountErrorMessage } from './linkedAccountError.utils';

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
    labelKey: 'settings.account.provider_facebook',
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
  const [connectSocialProvider, { isLoading: isConnecting }] =
    useConnectSocialLinkedAccountMutation();
  const [setPrimary] = useSetPrimaryLinkedAccountMutation();
  const { signInWithProvider } = useSocialAuth();

  const handleConnect = useCallback(
    async (provider: string, label: string) => {
      if (provider === 'email' || provider === 'phone') {
        navigation.navigate('ChangeEmailPhone', { mode: provider });
        return;
      }

      try {
        const profile = await signInWithProvider(provider as SocialProvider);
        await connectSocialProvider({
          provider: provider as SocialProvider,
          accessToken: profile.accessToken,
          ...(profile.email ? { email: profile.email } : {}),
          ...(profile.first_name ? { first_name: profile.first_name } : {}),
          ...(profile.last_name ? { last_name: profile.last_name } : {}),
          ...(profile.profile_photo
            ? { profile_photo: profile.profile_photo }
            : {}),
        }).unwrap();
        showSuccess({
          title: t('settings.account.provider_connected_title', {
            provider: label,
          }),
          message: t('settings.account.provider_connected_message'),
        });
      } catch (error) {
        const linkedAccountError = getLinkedAccountErrorMessage(
          t,
          error,
          provider as SocialProvider
        );
        if (!linkedAccountError) {
          console.error('Linked account connection failed:', error);
        }
        showError({
          title:
            linkedAccountError?.title ??
            t('settings.account.provider_connect_failed'),
          message: linkedAccountError?.message ?? t('common.try_again_message'),
          visibilityTime: linkedAccountError?.visibilityTime,
        });
      }
    },
    [connectSocialProvider, navigation, signInWithProvider, t]
  );

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
          {PROVIDERS.filter(
            (item) => item.provider !== 'apple' || authMethodConfig.social.apple
          ).map((item, index, providers) => {
            const label = t(item.labelKey);
            const linked = data.account.linkedAccounts?.find(
              (account) => account.provider === item.provider
            );
            const canDisconnect = Boolean(linked?.canDisconnect);
            const connected = Boolean(linked?.connected);
            const isPrimary = Boolean(linked?.isPrimary);
            const sublabel = connected
              ? isPrimary
                ? t('settings.account.primary_cannot_disconnect')
                : t('settings.account.linked_connected')
              : t('settings.account.linked_not_connected_sub');
            const value = connected
              ? isPrimary
                ? t('settings.account.primary', { defaultValue: 'Primary' })
                : t('settings.account.make_primary')
              : t('settings.account.connect');

            return (
              <SettingsSelectItem
                key={item.provider}
                icon={item.icon}
                iconFamily={'iconFamily' in item ? item.iconFamily : 'feather'}
                label={label}
                sublabel={sublabel}
                value={value}
                isLast={index === providers.length - 1}
                disabled={isPrimary || (!connected && isConnecting)}
                onPress={() =>
                  isPrimary
                    ? undefined
                    : connected
                      ? handleMakePrimary(item.provider, label)
                      : void handleConnect(item.provider, label)
                }
                actionIcon={connected && !isPrimary ? 'link-2' : undefined}
                showChevron={!connected}
                actionAccessibilityLabel={t(
                  'settings.account.disconnect_title',
                  { provider: label }
                )}
                actionDestructive
                onActionPress={
                  connected && !isPrimary
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
