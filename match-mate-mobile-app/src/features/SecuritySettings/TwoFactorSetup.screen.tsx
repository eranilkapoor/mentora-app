import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/core/components/Header';
import Loader from '@/core/components/Loader';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { SettingsSelectItem } from '@/core/components/settings/SettingsSelectItem';
import { useTheme } from '@/core/theme/ThemeProvider';
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
  const styles = useThemedStyles(sharedSettingsStyles);
  const { theme } = useTheme();
  const local = React.useMemo(() => createStyles(theme), [theme]);
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
        showSuccess({ title: 'Authenticator enabled' });
        void refetch();
      }
    } catch {
      showError({ title: 'Invalid code', message: 'Please try again.' });
    }
  }, [enableTotp, refetch, totpCode]);

  const handleEnableSms = useCallback(async () => {
    try {
      const response = await enableSms({ code: smsCode }).unwrap();
      if (response.success) {
        setSmsCode('');
        showSuccess({ title: 'SMS 2FA enabled' });
        void refetch();
      }
    } catch {
      showError({ title: 'Invalid OTP', message: 'Please try again.' });
    }
  }, [enableSms, refetch, smsCode]);

  const handleRequestSms = useCallback(async () => {
    try {
      const response = await requestSms().unwrap();
      if (response.success) {
        showSuccess({
          title: 'OTP sent',
          message: 'Enter the SMS code to enable two-factor authentication.',
        });
      }
    } catch {
      showError({
        title: 'SMS OTP failed',
        message: 'Please verify your phone number and try again.',
      });
    }
  }, [requestSms]);

  const handleDisable = useCallback(async () => {
    try {
      await disableTwoFactor(disableCode ? { code: disableCode } : {}).unwrap();
      setDisableCode('');
      showSuccess({ title: 'Two-factor authentication disabled' });
      void refetch();
    } catch {
      showError({
        title: 'Disable failed',
        message: 'Enter a valid authenticator code if required.',
      });
    }
  }, [disableCode, disableTwoFactor, refetch]);

  const handleRegenerateRecoveryCodes = useCallback(async () => {
    try {
      const response = await regenerateRecoveryCodes({
        code: recoveryCodeInput,
      }).unwrap();
      if (response.success) {
        setRecoveryCodes(response.data?.recoveryCodes ?? []);
        setRecoveryCodeInput('');
        showSuccess({ title: 'Recovery codes regenerated' });
        void refetch();
      }
    } catch {
      showError({
        title: 'Invalid code',
        message: 'Enter a valid authenticator code to regenerate codes.',
      });
    }
  }, [recoveryCodeInput, refetch, regenerateRecoveryCodes]);

  if (isLoading || !data) {
    return <Loader fullScreen size="large" />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title="Two-factor authentication"
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SettingsCard
          icon="shield"
          title="Current status"
          subtitle={`2FA is ${data.enabled ? 'enabled' : 'disabled'}`}
        >
          <View style={local.statusBox}>
            <Text style={local.statusTitle}>{data.method}</Text>
            <Text style={local.statusText}>
              Recovery codes remaining: {data.recoveryCodesRemaining}
            </Text>
          </View>
        </SettingsCard>

        <SettingsCard
          icon="key"
          title="Authenticator app"
          subtitle="Use Google Authenticator, Authy, or any TOTP app"
        >
          <SettingsSelectItem
            icon="plus-circle"
            label="Start authenticator setup"
            sublabel="Generate a secret and verify a 6-digit code"
            onPress={() => void setupTotp()}
          />
          {setupData?.data ? (
            <View style={local.setupBox}>
              <Text style={local.label}>Manual secret</Text>
              <Text selectable style={local.secret}>
                {setupData.data.secret}
              </Text>
              <Text style={local.help}>
                Add this secret in your authenticator app, then enter the code.
              </Text>
              <TextInput
                value={totpCode}
                onChangeText={setTotpCode}
                placeholder="6-digit code"
                placeholderTextColor={theme.colors.inputPlaceholder}
                keyboardType="number-pad"
                style={local.input}
              />
              <SettingsSelectItem
                icon="check"
                label="Enable authenticator"
                onPress={handleEnableTotp}
                isLast
              />
            </View>
          ) : null}
        </SettingsCard>

        <SettingsCard
          icon="smartphone"
          title="SMS 2FA"
          subtitle="Send a one-time code to your verified phone"
        >
          <SettingsSelectItem
            icon="send"
            label="Send SMS OTP"
            onPress={handleRequestSms}
          />
          <View style={local.setupBox}>
            <TextInput
              value={smsCode}
              onChangeText={setSmsCode}
              placeholder="SMS OTP"
              placeholderTextColor={theme.colors.inputPlaceholder}
              keyboardType="number-pad"
              style={local.input}
            />
            <SettingsSelectItem
              icon="check"
              label="Enable SMS 2FA"
              onPress={handleEnableSms}
              isLast
            />
          </View>
        </SettingsCard>

        {recoveryCodes.length ? (
          <SettingsCard
            icon="lock"
            title="Recovery codes"
            subtitle="Store these codes securely. Each code works once."
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
            title="Recovery code backup"
            subtitle="Regenerate backup codes after verifying your authenticator"
          >
            <View style={local.setupBox}>
              <TextInput
                value={recoveryCodeInput}
                onChangeText={setRecoveryCodeInput}
                placeholder="Authenticator code"
                placeholderTextColor={theme.colors.inputPlaceholder}
                keyboardType="number-pad"
                style={local.input}
              />
              <SettingsSelectItem
                icon="refresh-cw"
                label="Regenerate recovery codes"
                onPress={handleRegenerateRecoveryCodes}
                isLast
              />
            </View>
          </SettingsCard>
        ) : null}

        {data.enabled ? (
          <SettingsCard icon="x-circle" title="Disable 2FA">
            <View style={local.setupBox}>
              <TextInput
                value={disableCode}
                onChangeText={setDisableCode}
                placeholder="Authenticator code if required"
                placeholderTextColor={theme.colors.inputPlaceholder}
                keyboardType="number-pad"
                style={local.input}
              />
              <SettingsSelectItem
                icon="x-circle"
                label="Disable two-factor authentication"
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
