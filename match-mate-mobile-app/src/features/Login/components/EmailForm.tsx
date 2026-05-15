import React from 'react';
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
import { loginStyles } from '../Login.styles';
import { EmailFormProps } from '../Login.types';

export function EmailForm({
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
}: EmailFormProps): React.ReactElement {
  const styles = useThemedStyles(loginStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <>
      {/* Email */}
      <Text style={styles.label}>{t('auth.fields.email')}</Text>
      <View
        style={[styles.inputWrapper, errors.email && styles.inputError]}
      >
        <Feather
          name="mail"
          size={16}
          color={theme.colors.textMuted}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={t('auth.placeholders.email')}
          placeholderTextColor={theme.colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          value={email}
          onChangeText={onEmailChange}
          editable={!loading}
          textContentType="username"
          returnKeyType="next"
          accessibilityLabel={t('auth.fields.email')}
        />
      </View>
      {errors.email ? (
        <Text style={styles.errorText}>{errors.email}</Text>
      ) : null}

      {/* Password */}
      <Text style={[styles.label, styles.labelSpacing]}>
        {t('auth.fields.password')}
      </Text>
      <View
        style={[styles.inputWrapper, errors.password && styles.inputError]}
      >
        <Feather
          name="lock"
          size={16}
          color={theme.colors.textMuted}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={t('auth.placeholders.password')}
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={onPasswordChange}
          editable={!loading}
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          accessibilityLabel={t('auth.fields.password')}
        />
        <TouchableOpacity
          onPress={onTogglePassword}
          style={styles.eyeButton}
          disabled={loading}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={
            showPassword
              ? t('auth.actions.hide_password')
              : t('auth.actions.show_password')
          }
        >
          <Feather
            name={showPassword ? 'eye-off' : 'eye'}
            size={18}
            color={theme.colors.textMuted}
          />
        </TouchableOpacity>
      </View>
      {errors.password ? (
        <Text style={styles.errorText}>{errors.password}</Text>
      ) : null}

      {/* Forgot password */}
      <TouchableOpacity
        onPress={onNavigateForgot}
        disabled={loading}
        style={styles.forgotRow}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t('auth.actions.forgot_password')}
      >
        <Text style={styles.forgotText}>
          {t('auth.actions.forgot_password')}
        </Text>
      </TouchableOpacity>

      {/* Sign in button */}
      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.disabledButton]}
        onPress={onSubmit}
        disabled={loading}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={t('auth.actions.sign_in')}
        accessibilityState={{ disabled: loading }}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.white} />
        ) : (
          <>
            <Text style={styles.primaryButtonText}>
              {t('auth.actions.sign_in')}
            </Text>
            <Feather name="arrow-right" size={18} color={theme.colors.white} />
          </>
        )}
      </TouchableOpacity>
    </>
  );
}