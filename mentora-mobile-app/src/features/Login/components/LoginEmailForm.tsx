import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator } from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useTheme } from '@/core/theme/ThemeProvider';
import { EmailFormProps } from '@/features/Auth/shared/auth.types';
import { authSharedStyles } from '@/features/Auth/shared/auth.styles';
import { AuthTextField } from '@/features/Auth/shared/components/AuthTextField';

export function LoginEmailForm({
  errors,
  loading,
  email,
  password,
  showPassword,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onNavigateForgot,
  onRequestMagicLink,
  magicLinkEnabled,
}: EmailFormProps): React.ReactElement {
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
        placeholder={t('auth.placeholders.password') as string}
        secure
        secureVisible={showPassword}
        textContentType="password"
        returnKeyType="done"
        onSubmitEditing={onSubmit}
        disabled={loading}
        labelSpacing
        onToggleSecure={onTogglePassword}
        showSecureLabel={t('auth.actions.show_password') as string}
        hideSecureLabel={t('auth.actions.hide_password') as string}
      />

      {/* Forgot password */}
      <TouchableOpacity
        onPress={onNavigateForgot}
        disabled={loading}
        style={styles.forgotRow}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t('auth.actions.forgot_password') as string}
      >
        <Text style={styles.forgotText}>
          {t('auth.actions.forgot_password') as string}
        </Text>
      </TouchableOpacity>

      {magicLinkEnabled && onRequestMagicLink ? (
        <TouchableOpacity
          onPress={onRequestMagicLink}
          disabled={loading}
          style={styles.forgotRow}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('auth.actions.magic_link') as string}
        >
          <Text style={styles.forgotText}>
            {t('auth.actions.magic_link') as string}
          </Text>
        </TouchableOpacity>
      ) : null}

      {/* Sign in button */}
      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.disabledButton]}
        onPress={onSubmit}
        disabled={loading}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={t('auth.actions.sign_in') as string}
        accessibilityState={{ disabled: loading }}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.white} />
        ) : (
          <>
            <Text style={styles.primaryButtonText}>
              {t('auth.actions.sign_in') as string}
            </Text>

            <Feather name="arrow-right" size={18} color={theme.colors.white} />
          </>
        )}
      </TouchableOpacity>
    </>
  );
}
