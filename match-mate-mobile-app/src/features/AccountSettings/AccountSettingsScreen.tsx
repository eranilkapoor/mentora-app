import React, { useCallback } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import Loader from '@/core/components/Loader';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { SettingsSelectItem } from '@/core/components/settings/SettingsSelectItem';
import { VerificationStatusRow } from '@/core/components/settings/VerificationStatusRow';
import { showConfirm } from '@/core/utils/confirm';
import {
  useGetAccountSettingsQuery,
  useConnectProviderMutation,
  useDeactivateAccountMutation,
  useDeleteAccountRequestMutation,
  useDisconnectLinkedAccountMutation,
} from '@/store/services/accountSettings.service';
import { AccountSettingsScreenProps } from './accountSettings.types';
import { sharedSettingsStyles } from '../Settings/shared.settings.styles';

// ─── Provider config ──────────────────────────────────────────────────────────

const PROVIDER_CONFIG: Record<
  string,
  { label: string; icon: 'search' | 'smartphone' | 'facebook' }
> = {
  google: { label: 'Google', icon: 'search' },
  apple: { label: 'Apple', icon: 'smartphone' },
  facebook: { label: 'Facebook', icon: 'facebook' },
};

export default function AccountSettingsScreen({
  navigation,
}: AccountSettingsScreenProps): React.ReactElement {
  const styles = useThemedStyles(sharedSettingsStyles);
  const { t } = useTranslation();

  const { data, isLoading } = useGetAccountSettingsQuery();
  const [deactivateAccount] = useDeactivateAccountMutation();
  const [deleteAccountRequest] = useDeleteAccountRequestMutation();
  const [connectProvider] = useConnectProviderMutation();
  const [disconnectLinked] = useDisconnectLinkedAccountMutation();

  const settings = data?.account;

  // ─── Deactivate ──────────────────────────────────────────────────────────

  const handleDeactivate = useCallback(() => {
    showConfirm({
      title: t('settings.account.deactivate_title'),
      message: t('settings.account.deactivate_message'),
      confirmText: t('settings.account.deactivate_confirm'),
      destructive: true,
      onConfirm: () => {
        void deactivateAccount({ reason: 'User requested' }).then(() => {
          Alert.alert(
            t('common.success'),
            t('settings.account.deactivate_success')
          );
        });
      },
    });
  }, [deactivateAccount, t]);

  // ─── Delete ──────────────────────────────────────────────────────────────

  const handleDeleteRequest = useCallback(() => {
    showConfirm({
      title: t('settings.account.delete_title'),
      message: t('settings.account.delete_message'),
      confirmText: t('settings.account.delete_confirm'),
      destructive: true,
      onConfirm: () => {
        void deleteAccountRequest().then(() => {
          Alert.alert(
            t('settings.account.delete_scheduled_title'),
            t('settings.account.delete_scheduled_message')
          );
        });
      },
    });
  }, [deleteAccountRequest, t]);

  // ─── Disconnect linked account ────────────────────────────────────────────

  const handleDisconnect = useCallback(
    (provider: string) => {
      showConfirm({
        title: t('settings.account.disconnect_title', { provider }),
        message: t('settings.account.disconnect_message', { provider }),
        confirmText: t('settings.account.disconnect_confirm'),
        destructive: true,
        onConfirm: () => {
          void disconnectLinked({ provider });
        },
      });
    },
    [disconnectLinked, t]
  );

  const handleConnect = useCallback(
    (provider: string) => {
      void connectProvider({ provider }).catch((error: unknown) => {
        console.error('Connect provider error:', error);
      });
    },
    [connectProvider]
  );

  if (isLoading || !data) {
    return <Loader fullScreen size="large" />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('settings.account.title')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Verification Status ───────────────────────────────────── */}
        <SettingsCard
          icon="check-circle"
          title={t('settings.account.verification')}
          subtitle={t('settings.account.verification_subtitle')}
        >
          <VerificationStatusRow
            icon="mail"
            label={t('settings.account.email_verified')}
            sublabel={t('settings.account.email_verified_sub')}
            verified={settings?.emailVerified ?? false}
          />
          <VerificationStatusRow
            icon="phone"
            label={t('settings.account.phone_verified')}
            sublabel={t('settings.account.phone_verified_sub')}
            verified={settings?.phoneVerified ?? false}
            isLast
          />
        </SettingsCard>

        {/* ── Login & Security ──────────────────────────────────────── */}
        <SettingsCard
          icon="lock"
          title={t('settings.account.login_security')}
          subtitle={t('settings.account.login_security_subtitle')}
        >
          <SettingsSelectItem
            icon="mail"
            label={t('settings.account.change_email')}
            sublabel={t('settings.account.change_email_sub')}
            onPress={() =>
              Alert.alert(
                t('settings.account.change_email'),
                t('settings.account.change_email_message')
              )
            }
          />
          <SettingsSelectItem
            icon="phone"
            label={t('settings.account.change_phone')}
            sublabel={t('settings.account.change_phone_sub')}
            onPress={() =>
              Alert.alert(
                t('settings.account.change_phone'),
                t('settings.account.change_phone_message')
              )
            }
          />
          <SettingsSelectItem
            icon="lock"
            label={t('settings.account.change_password')}
            sublabel={
              settings?.deletionScheduledAt
                ? t('settings.account.change_password_sub')
                : undefined
            }
            onPress={() => navigation.navigate('ChangePassword' as never)}
            isLast
          />
        </SettingsCard>

        {/* ── Linked Accounts ───────────────────────────────────────── */}
        <SettingsCard
          icon="link"
          title={t('settings.account.linked_accounts')}
          subtitle={t('settings.account.linked_accounts_subtitle')}
        >
          {(['google', 'apple', 'facebook'] as const).map(
            (provider, index, arr) => {
              const config = PROVIDER_CONFIG[provider];
              const linked = settings?.linkedAccounts?.find(
                (a) => a.provider === provider
              );
              const isConnected = linked?.connected ?? false;
              const isLast = index === arr.length - 1;

              return isConnected ? (
                <SettingsSelectItem
                  key={provider}
                  icon={config.icon}
                  label={config.label}
                  sublabel={t('settings.account.linked_connected')}
                  isLast={isLast}
                  destructive={false}
                  onPress={() => handleDisconnect(provider)}
                />
              ) : (
                <SettingsSelectItem
                  key={provider}
                  icon={config.icon}
                  label={config.label}
                  sublabel={t('settings.account.linked_not_connected')}
                  value={t('settings.account.connect')}
                  isLast={isLast}
                  onPress={() => handleConnect(provider)}
                />
              );
            }
          )}
        </SettingsCard>

        {/* ── Account Actions ───────────────────────────────────────── */}
        <SettingsCard
          icon="alert-triangle"
          title={t('settings.account.danger_zone')}
          subtitle={t('settings.account.danger_zone_subtitle')}
        >
          <SettingsSelectItem
            icon="pause-circle"
            label={t('settings.account.deactivate')}
            sublabel={t('settings.account.deactivate_sub')}
            destructive
            onPress={handleDeactivate}
          />
          <SettingsSelectItem
            icon="trash-2"
            label={t('settings.account.delete')}
            sublabel={
              settings?.deletionScheduledAt
                ? t('settings.account.delete_scheduled', {
                    date: new Date(
                      settings.deletionScheduledAt
                    ).toLocaleDateString(),
                  })
                : t('settings.account.delete_sub')
            }
            destructive
            isLast
            onPress={handleDeleteRequest}
          />
        </SettingsCard>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}
