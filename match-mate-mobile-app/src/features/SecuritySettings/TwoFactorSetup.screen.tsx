import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import Loader from '@/core/components/Loader';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { SettingsSelectItem } from '@/core/components/settings/SettingsSelectItem';
import { useTheme } from '@/core/theme/ThemeProvider';
import { applyAccessibilityToStyles } from '@/core/theme/accessibilityStyles';
import { Theme } from '@/core/theme/types';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { SettingsNavigationProp } from '@/navigation/types';
import { showError, showSuccess } from '@/core/utils/toast';
import {
  useDisableTwoFactorMutation,
  useEnableSmsTwoFactorMutation,
  useEnableTotpMutation,
  useGetTwoFactorStatusQuery,
  useRegenerateRecoveryCodesMutation,
  useRequestSmsTwoFactorMutation,
  useSetupTotpMutation,
} from '@/store/services/securitySettingsApi.service';
import { sharedSettingsStyles } from '../Settings/shared.settings.styles';

type Props = {
  navigation: SettingsNavigationProp;
};

export default function TwoFactorSetupScreen({
  navigation,
}: Props): React.ReactElement {
  const { t } = useTranslation();
  const styles = useThemedStyles(sharedSettingsStyles);
  const { theme, fontScale, accessibility } = useTheme();
  const local = React.useMemo(
    () =>
      applyAccessibilityToStyles(
        createStyles(theme),
        fontScale,
        accessibility.boldText
      ),
    [accessibility.boldText, fontScale, theme]
  );
  const { data, isLoading, refetch } = useGetTwoFactorStatusQuery();
  const [setupTotp, { data: setupData }] = useSetupTotpMutation();
  const [enableTotp] = useEnableTotpMutation();
  const [requestSms] = useRequestSmsTwoFactorMutation();
  const [enableSms] = useEnableSmsTwoFactorMutation();
  const [disableTwoFactor] = useDisableTwoFactorMutation();
  const [regenerateRecoveryCodes] = useRegenerateRecoveryCodesMutation();
  const [totpCode, setTotpCode] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  const handleEnableTotp = useCallback(async () => {
    try {
      const response = await enableTotp({ code: totpCode }).unwrap();
      if (response.success) {
        setRecoveryCodes(response.data?.recoveryCodes ?? []);
        setTotpCode('');
        showSuccess({ title: t('settings.two_factor.authenticator_enabled') });
        void refetch();
      }
    } catch {
      showError({
        title: t('settings.two_factor.invalid_code'),
        message: t('common.try_again_message'),
      });
    }
  }, [enableTotp, refetch, t, totpCode]);

  const handleEnableSms = useCallback(async () => {
    try {
      const response = await enableSms({ code: smsCode }).unwrap();
      if (response.success) {
        setSmsCode('');
        showSuccess({ title: t('settings.two_factor.sms_enabled') });
        void refetch();
      }
    } catch {
      showError({
        title: t('settings.two_factor.invalid_otp'),
        message: t('common.try_again_message'),
      });
    }
  }, [enableSms, refetch, smsCode, t]);

  const handleRequestSms = useCallback(async () => {
    try {
      const response = await requestSms().unwrap();
      if (response.success) {
        showSuccess({
          title: t('settings.two_factor.otp_sent'),
          message: t('settings.two_factor.otp_sent_message'),
        });
      }
    } catch {
      showError({
        title: t('settings.two_factor.sms_failed'),
        message: t('settings.two_factor.sms_failed_message'),
      });
    }
  }, [requestSms, t]);

  const handleDisable = useCallback(async () => {
    try {
      await disableTwoFactor(disableCode ? { code: disableCode } : {}).unwrap();
      setDisableCode('');
      showSuccess({ title: t('settings.two_factor.disabled_title') });
      void refetch();
    } catch {
      showError({
        title: t('settings.two_factor.disable_failed'),
        message: t('settings.two_factor.disable_failed_message'),
      });
    }
  }, [disableCode, disableTwoFactor, refetch, t]);

  const handleRegenerateRecoveryCodes = useCallback(async () => {
    try {
      const response = await regenerateRecoveryCodes({
        code: recoveryCodeInput,
      }).unwrap();
      if (response.success) {
        setRecoveryCodes(response.data?.recoveryCodes ?? []);
        setRecoveryCodeInput('');
        showSuccess({ title: t('settings.two_factor.recovery_regenerated') });
        void refetch();
      }
    } catch {
      showError({
        title: t('settings.two_factor.invalid_code'),
        message: t('settings.two_factor.recovery_invalid_message'),
      });
    }
  }, [recoveryCodeInput, refetch, regenerateRecoveryCodes, t]);

  if (isLoading || !data) {
    return <Loader fullScreen size="large" />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('settings.two_factor.title')}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SettingsCard
          icon="shield"
          title={t('settings.two_factor.current_status')}
          subtitle={t('settings.two_factor.status_subtitle', {
            status: data.enabled ? t('common.enabled') : t('common.disabled'),
          })}
        >
          <View style={local.statusBox}>
            <Text style={local.statusTitle}>{data.method}</Text>
            <Text style={local.statusText}>
              {t('settings.two_factor.recovery_remaining', {
                count: data.recoveryCodesRemaining,
              })}
            </Text>
          </View>
        </SettingsCard>

        <SettingsCard
          icon="key"
          title={t('settings.two_factor.authenticator_app')}
          subtitle={t('settings.two_factor.authenticator_app_sub')}
        >
          <SettingsSelectItem
            icon="plus-circle"
            label={t('settings.two_factor.start_authenticator')}
            sublabel={t('settings.two_factor.start_authenticator_sub')}
            onPress={() => void setupTotp()}
          />
          {setupData?.data ? (
            <View style={local.setupBox}>
              <Text style={local.label}>
                {t('settings.two_factor.manual_secret')}
              </Text>
              <Text selectable style={local.secret}>
                {setupData.data.secret}
              </Text>
              <Text style={local.help}>
                {t('settings.two_factor.manual_secret_help')}
              </Text>
              <TextInput
                value={totpCode}
                onChangeText={setTotpCode}
                placeholder={t('settings.two_factor.six_digit_code')}
                placeholderTextColor={theme.colors.inputPlaceholder}
                keyboardType="number-pad"
                style={local.input}
              />
              <SettingsSelectItem
                icon="check"
                label={t('settings.two_factor.enable_authenticator')}
                onPress={handleEnableTotp}
                isLast
              />
            </View>
          ) : null}
        </SettingsCard>

        <SettingsCard
          icon="smartphone"
          title={t('settings.two_factor.sms_title')}
          subtitle={t('settings.two_factor.sms_subtitle')}
        >
          <SettingsSelectItem
            icon="send"
            label={t('settings.two_factor.send_sms_otp')}
            onPress={handleRequestSms}
          />
          <View style={local.setupBox}>
            <TextInput
              value={smsCode}
              onChangeText={setSmsCode}
              placeholder={t('settings.two_factor.sms_otp')}
              placeholderTextColor={theme.colors.inputPlaceholder}
              keyboardType="number-pad"
              style={local.input}
            />
            <SettingsSelectItem
              icon="check"
              label={t('settings.two_factor.enable_sms')}
              onPress={handleEnableSms}
              isLast
            />
          </View>
        </SettingsCard>

        {recoveryCodes.length ? (
          <SettingsCard
            icon="lock"
            title={t('settings.two_factor.recovery_codes')}
            subtitle={t('settings.two_factor.recovery_codes_sub')}
          >
            <View style={local.codesBox}>
              {recoveryCodes.map((item) => (
                <Text selectable key={item} style={local.code}>
                  {item}
                </Text>
              ))}
            </View>
          </SettingsCard>
        ) : null}

        {data.enabled && data.method === 'authenticator' ? (
          <SettingsCard
            icon="refresh-cw"
            title={t('settings.two_factor.recovery_backup')}
            subtitle={t('settings.two_factor.recovery_backup_sub')}
          >
            <View style={local.setupBox}>
              <TextInput
                value={recoveryCodeInput}
                onChangeText={setRecoveryCodeInput}
                placeholder={t('settings.two_factor.authenticator_code')}
                placeholderTextColor={theme.colors.inputPlaceholder}
                keyboardType="number-pad"
                style={local.input}
              />
              <SettingsSelectItem
                icon="refresh-cw"
                label={t('settings.two_factor.regenerate_recovery_codes')}
                onPress={handleRegenerateRecoveryCodes}
                isLast
              />
            </View>
          </SettingsCard>
        ) : null}

        {data.enabled ? (
          <SettingsCard
            icon="x-circle"
            title={t('settings.two_factor.disable_title')}
          >
            <View style={local.setupBox}>
              <TextInput
                value={disableCode}
                onChangeText={setDisableCode}
                placeholder={t(
                  'settings.two_factor.authenticator_code_optional'
                )}
                placeholderTextColor={theme.colors.inputPlaceholder}
                keyboardType="number-pad"
                style={local.input}
              />
              <SettingsSelectItem
                icon="x-circle"
                label={t('settings.two_factor.disable_action')}
                destructive
                onPress={handleDisable}
                isLast
              />
            </View>
          </SettingsCard>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    statusBox: { padding: 14 },
    statusTitle: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: '800',
      textTransform: 'capitalize',
    },
    statusText: {
      color: theme.colors.textMuted,
      fontSize: 13,
      marginTop: 4,
    },
    setupBox: {
      padding: 14,
      gap: 10,
    },
    label: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    secret: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 1,
    },
    help: {
      color: theme.colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
    },
    input: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 11,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.inputBackground,
    },
    codesBox: {
      padding: 14,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    code: {
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 8,
      backgroundColor: theme.colors.backgroundLight,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
  });
