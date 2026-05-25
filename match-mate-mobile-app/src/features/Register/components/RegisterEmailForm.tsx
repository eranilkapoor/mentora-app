import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useTheme } from '@/core/theme/ThemeProvider';
import { PASSWORD_MIN_LENGTH } from '@/core/constants';
import { FormErrors } from '@/features/Auth/shared/auth.types';
import { authSharedStyles } from '@/features/Auth/shared/auth.styles';

interface Props {
  errors: FormErrors;
  loading: boolean;
  email: string;
  password: string;
  showPassword: boolean;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onTogglePassword: () => void;
  onSubmit: () => void;
}

export function RegisterEmailForm({
  errors,
  loading,
  email,
  password,
  showPassword,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
}: Props): React.ReactElement {
  const styles = useThemedStyles(authSharedStyles) as ReturnType<
    typeof authSharedStyles
  >;
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(
    null
  );

  return (
    <>
      {/* Email */}
      <Text style={styles.label}>{t('auth.fields.email') as string}</Text>

      <View
        style={[
          styles.inputWrapper,
          focusedField === 'email' && styles.inputFocused,
          errors.email && styles.inputError,
        ]}
      >
        <Feather
          name="mail"
          size={16}
          color={
            focusedField === 'email'
              ? theme.colors.primary
              : theme.colors.textMuted
          }
          style={styles.inputIcon}
        />

        <TextInput
          style={styles.input}
          placeholder={t('auth.placeholders.email') as string}
          placeholderTextColor={theme.colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          value={email}
          onChangeText={onEmailChange}
          editable={!loading}
          textContentType="username"
          returnKeyType="next"
            accessibilityLabel={t('auth.fields.email') as string}
          onFocus={() => setFocusedField('email')}
          onBlur={() => setFocusedField(null)}
        />
      </View>

      {errors.email ? (
        <Text style={styles.errorText}>{errors.email}</Text>
      ) : null}

      {/* Password */}
      <Text style={[styles.label, styles.labelSpacing]}>
        {t('auth.fields.password') as string}
      </Text>

      <View
        style={[
          styles.inputWrapper,
          focusedField === 'password' && styles.inputFocused,
          errors.password && styles.inputError,
        ]}
      >
        <Feather
          name="lock"
          size={16}
          color={
            focusedField === 'password'
              ? theme.colors.primary
              : theme.colors.textMuted
          }
          style={styles.inputIcon}
        />

        <TextInput
          style={styles.input}
          placeholder={t('auth.placeholders.new_password', {
            min: PASSWORD_MIN_LENGTH,
          }) as string}
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={onPasswordChange}
          editable={!loading}
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          accessibilityLabel={t('auth.fields.password') as string}
          onFocus={() => setFocusedField('password')}
          onBlur={() => setFocusedField(null)}
        />

        <TouchableOpacity
          onPress={onTogglePassword}
          style={styles.eyeButton}
          disabled={loading}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={
            showPassword
              ? (t('auth.actions.hide_password') as string)
              : (t('auth.actions.show_password') as string)
          }
        >
          <Feather
            name={showPassword ? 'eye-off' : 'eye'}
            size={18}
            color={
              focusedField === 'password'
                ? theme.colors.primary
                : theme.colors.textMuted
            }
          />
        </TouchableOpacity>
      </View>

      {errors.password ? (
        <Text style={styles.errorText}>{errors.password}</Text>
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
