import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { SettingsSelectItem } from '@/core/components/settings/SettingsSelectItem';
import { createBaseStyles } from '@/core/theme/baseStyles';
import { useTheme } from '@/core/theme/ThemeProvider';
import { Theme } from '@/core/theme/types';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import {
  SettingsNavigationProp,
  SettingsStackParamList,
} from '@/navigation/types';
import {
  useRequestEmailChangeMutation,
  useRequestPhoneChangeMutation,
} from '@/store/services/accountSettingsApi.service';
import { showError, showSuccess } from '@/core/utils/toast';

type Props = {
  navigation: SettingsNavigationProp;
};

const createStyles = (
  theme: Theme,
  base: ReturnType<typeof createBaseStyles>
) =>
  StyleSheet.create({
    safe: StyleSheet.flatten(base.safe),
    scrollContent: {
      ...StyleSheet.flatten(base.scrollContent),
      paddingBottom: 32,
    },
    input: {
      marginHorizontal: 14,
      marginTop: 14,
      marginBottom: 6,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 11,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.surface,
      fontSize: 15,
    },
    helper: {
      marginHorizontal: 14,
      marginBottom: 12,
      color: theme.colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
    },
    footer: {
      ...StyleSheet.flatten(base.footer),
      height: 16,
    },
  });

export default function ChangeEmailPhoneScreen({
  navigation,
}: Props): React.ReactElement {
  const { t } = useTranslation();
  const route =
    useRoute<RouteProp<SettingsStackParamList, 'ChangeEmailPhone'>>();
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [value, setValue] = useState('');
  const [requestEmailChange, { isLoading: isEmailLoading }] =
    useRequestEmailChangeMutation();
  const [requestPhoneChange, { isLoading: isPhoneLoading }] =
    useRequestPhoneChangeMutation();

  const mode = route.params.mode;
  const isEmail = mode === 'email';
  const title = isEmail
    ? t('settings.account.change_email')
    : t('settings.account.change_phone');
  const helper = isEmail
    ? t('settings.account.change_email_helper')
    : t('settings.account.change_phone_helper');
  const placeholder = isEmail ? 'name@example.com' : '9876543210';
  const isLoading = isEmail ? isEmailLoading : isPhoneLoading;

  const canSubmit = useMemo(() => {
    const trimmed = value.trim();
    if (isEmail) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    return /^\d{6,15}$/.test(trimmed.replace(/\D/g, ''));
  }, [isEmail, value]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || isLoading) return;

    try {
      if (isEmail) {
        await requestEmailChange({ email: value.trim() }).unwrap();
      } else {
        await requestPhoneChange({
          countryCode: '+91',
          phone: value.replace(/\D/g, ''),
        }).unwrap();
      }

      showSuccess({
        title: t('settings.account.verification_started'),
        message: t('settings.account.verification_started_message'),
      });
      navigation.goBack();
    } catch (error) {
      console.error('Account change request failed:', error);
      showError({
        title: t('settings.account.verification_failed'),
        message: t('common.try_again_message'),
      });
    }
  }, [
    canSubmit,
    isEmail,
    isLoading,
    navigation,
    requestEmailChange,
    requestPhoneChange,
    t,
    value,
  ]);

  return (
    <SafeAreaView style={styles.safe}>
      <Header showBack onBackPress={navigation.goBack} title={title} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SettingsCard
          icon={isEmail ? 'mail' : 'phone'}
          title={title}
          subtitle={t('settings.account.verification_required')}
        >
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textMuted}
            keyboardType={isEmail ? 'email-address' : 'phone-pad'}
            autoCapitalize="none"
            style={styles.input}
          />
          <Text style={styles.helper}>{helper}</Text>
          <SettingsSelectItem
            icon="send"
            label={
              isLoading
                ? t('settings.account.sending')
                : t('settings.account.send_verification')
            }
            sublabel={canSubmit ? '' : t('settings.account.enter_valid_value')}
            disabled={!canSubmit || isLoading}
            isLast
            onPress={handleSubmit}
          />
        </SettingsCard>
        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}
