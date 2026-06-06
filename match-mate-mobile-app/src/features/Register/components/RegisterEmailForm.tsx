import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator } from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useTheme } from '@/core/theme/ThemeProvider';
import { PASSWORD_MIN_LENGTH } from '@/core/constants';
import { FormErrors } from '@/features/Auth/shared/auth.types';
import { authSharedStyles } from '@/features/Auth/shared/auth.styles';
import { AuthTextField } from '@/features/Auth/shared/components/AuthTextField';

interface Props {
  errors: FormErrors;
  loading: boolean;
  email: string;
  password: string;
  referralCode: string;
  showReferralCode: boolean;
  showPassword: boolean;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onReferralCodeChange: (v: string) => void;
  onToggleReferralCode: () => void;
  onTogglePassword: () => void;
  onSubmit: () => void;
}

export function RegisterEmailForm({
  errors,
  loading,
  email,
  password,
  referralCode,
  showReferralCode,
  showPassword,
  onEmailChange,
  onPasswordChange,
  onReferralCodeChange,
  onToggleReferralCode,
  onTogglePassword,
  onSubmit,
}: Props): React.ReactElement {
  const styles = useThemedStyles(authSharedStyles) as ReturnType<
    typeof authSharedStyles
  >;
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <AuthTextField
        label={t('auth.fields.email') as string}
        icon="mail"
        value={email}
        onChange={onEmailChange}
        error={errors.email}
        placeholder={t('auth.placeholders.email') as string}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="username"
        returnKeyType="next"
        disabled={loading}
      />

      <AuthTextField
        label={t('auth.fields.password') as string}
        icon="lock"
        value={password}
        onChange={onPasswordChange}
        error={errors.password}
        placeholder={
          t('auth.placeholders.new_password', {
            min: PASSWORD_MIN_LENGTH,
          }) as string
        }
        secure
        secureVisible={showPassword}
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={onSubmit}
        disabled={loading}
        labelSpacing
        onToggleSecure={onTogglePassword}
        showSecureLabel={t('auth.actions.show_password') as string}
        hideSecureLabel={t('auth.actions.hide_password') as string}
      />

      <TouchableOpacity
        style={styles.inlineLinkRow}
        onPress={onToggleReferralCode}
        disabled={loading}
        activeOpacity={0.7}
        accessibilityRole="button"
      >
        <Feather name="gift" size={14} color={theme.colors.link} />
        <Text style={styles.linkText}>
          {showReferralCode
            ? t('auth.referral.hide')
            : t('auth.referral.have_code')}
        </Text>
      </TouchableOpacity>

      {showReferralCode ? (
        <AuthTextField
          label={t('auth.referral.label')}
          icon="gift"
          value={referralCode}
          onChange={onReferralCodeChange}
          error={errors.referralCode}
          placeholder={t('auth.referral.placeholder')}
          autoCapitalize="characters"
          maxLength={10}
          returnKeyType="done"
          disabled={loading}
          labelSpacing
        />
      ) : null}

      {/* Create account button */}
      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.disabledButton]}
        onPress={onSubmit}
        disabled={loading}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={t('auth.actions.create_account') as string}
        accessibilityState={{ disabled: loading }}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.white} />
        ) : (
          <>
            <Text style={styles.primaryButtonText}>
              {t('auth.actions.create_account') as string}
            </Text>
            <Feather name="arrow-right" size={18} color={theme.colors.white} />
          </>
        )}
      </TouchableOpacity>
    </>
  );
}
