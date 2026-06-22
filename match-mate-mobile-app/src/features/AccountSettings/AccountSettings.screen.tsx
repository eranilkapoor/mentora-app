import React, { useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import Loader from '@/core/components/Loader';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { SettingsSelectItem } from '@/core/components/settings/SettingsSelectItem';
import { VerificationStatusRow } from '@/core/components/settings/VerificationStatusRow';
import { showConfirm } from '@/core/utils/confirm';
import { showSuccess } from '@/core/utils/toast';
import { useAppDispatch } from '@/store/hooks';
import { baseApi, clearRefreshToken } from '@/store/services/baseApi.service';
import { logout as logoutAction } from '@/store/slices/auth.slice';
import {
  useDeactivateAccountMutation,
  useDeleteAccountRequestMutation,
  useGetAccountSettingsQuery,
} from '@/store/services/accountSettingsApi.service';
import { AccountSettingsScreenProps } from './accountSettings.types';
import { sharedSettingsStyles } from '../Settings/shared.settings.styles';

export default function AccountSettingsScreen({
  navigation,
}: AccountSettingsScreenProps): React.ReactElement {
  const styles = useThemedStyles(sharedSettingsStyles);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { data, isLoading } = useGetAccountSettingsQuery();
  const [deactivateAccount] = useDeactivateAccountMutation();
  const [deleteAccountRequest] = useDeleteAccountRequestMutation();

  const settings = data?.account;
  const linkedCount =
    settings?.linkedAccounts?.filter((account) => account.connected).length ??
    0;

  const handleDeactivate = useCallback(() => {
    showConfirm({
      title: t('settings.account.deactivate_title'),
      message: t('settings.account.deactivate_message'),
      confirmText: t('settings.account.deactivate_confirm'),
      destructive: true,
      onConfirm: () => {
        void deactivateAccount({ reason: 'User requested' }).then(async () => {
          await clearRefreshToken();
          dispatch(logoutAction());
          dispatch(baseApi.util.resetApiState());
          showSuccess({
            title: t('common.success'),
            message: t('settings.account.deactivate_success'),
          });
        });
      },
    });
  }, [deactivateAccount, dispatch, t]);

  const handleDeleteRequest = useCallback(() => {
    showConfirm({
      title: t('settings.account.delete_title'),
      message: t('settings.account.delete_message'),
      confirmText: t('settings.account.delete_confirm'),
      destructive: true,
      onConfirm: () => {
        void deleteAccountRequest().then(async () => {
          await clearRefreshToken();
          dispatch(logoutAction());
          dispatch(baseApi.util.resetApiState());
          showSuccess({
            title: t('settings.account.delete_scheduled_title'),
            message: t('settings.account.delete_scheduled_message'),
          });
        });
      },
    });
  }, [deleteAccountRequest, dispatch, t]);

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
          />
          <SettingsSelectItem
            icon="shield"
            label={t('settings.account.profile_kyc_verification')}
            sublabel={t('settings.account.profile_kyc_verification_sub')}
            value={
              settings?.profileVerified
                ? t('settings.account.approved')
                : t('settings.account.manage')
            }
            isLast
            onPress={() => navigation.navigate('ProfileVerification')}
          />
        </SettingsCard>

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
              navigation.navigate('ChangeEmailPhone', { mode: 'email' })
            }
          />
          <SettingsSelectItem
            icon="phone"
            label={t('settings.account.change_phone')}
            sublabel={t('settings.account.change_phone_sub')}
            onPress={() =>
              navigation.navigate('ChangeEmailPhone', { mode: 'phone' })
            }
          />
          <SettingsSelectItem
            icon="lock"
            label={t('settings.account.change_password')}
            sublabel={t('settings.change_password_sub')}
            onPress={() => navigation.navigate('ChangePassword')}
            isLast
          />
        </SettingsCard>

        <SettingsCard
          icon="link"
          title={t('settings.account.linked_accounts')}
          subtitle={t('settings.account.linked_accounts_subtitle')}
        >
          <SettingsSelectItem
            icon="link"
            label={t('settings.account.manage_linked_accounts')}
            sublabel={t('settings.account.manage_linked_accounts_sub')}
            value={`${linkedCount}/3`}
            isLast
            onPress={() => navigation.navigate('LinkedAccounts')}
          />
        </SettingsCard>

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
            icon="file-text"
            label={t('settings.account.account_deletion_policy')}
            sublabel={t('settings.account.account_deletion_policy_sub')}
            onPress={() => navigation.navigate('AccountDeletion')}
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
