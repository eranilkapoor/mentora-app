import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import {
  getApiErrorMessage,
  getApiResponseMessage,
} from '@/core/utils/apiMessage';
import {
  useExchangeResetPasswordCodeMutation,
  useResetPasswordMutation,
} from '@/store/services/authApi.service';
import {
  ApiResponse,
  ResetPasswordCodeExchangeResponse,
  User,
} from '@/core/types';
import { resetPasswordStyles } from './ResetPassword.styles';
import { PASSWORD_MIN_LENGTH } from '@/core/constants';
import { FormErrors, ResetPasswordScreenProps } from './ResetPassword.types';
import { AuthTextField } from '@/features/Auth/shared/components/AuthTextField';
import { PasswordStrengthHint } from '@/features/Auth/shared/components/PasswordStrengthHint';
import { isPasswordStrongEnough } from '@/features/Auth/shared/passwordStrength';

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ResetPasswordScreen({
  navigation,
  route,
}: ResetPasswordScreenProps): React.ReactElement {
  const styles = useThemedStyles(resetPasswordStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const routeCode = route.params?.code ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [exchangingCode, setExchangingCode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

  const [exchangeResetCode] = useExchangeResetPasswordCodeMutation();
  const [resetPassword, { isLoading: loading }] = useResetPasswordMutation();

  useEffect(() => {
    let isMounted = true;

    if (!routeCode) {
      return () => {
        isMounted = false;
      };
    }

    const exchangeCode = async () => {
      try {
        setExchangingCode(true);
        const response: ApiResponse<ResetPasswordCodeExchangeResponse> =
          await exchangeResetCode({ code: routeCode }).unwrap();
        const token = response?.data?.token;

        if (!isMounted) return;

        if (token) {
          setResetToken(token);
          return;
        }

        setErrors({
          error: getApiResponseMessage(t, response, 'auth.errors.reset_failed'),
        });
      } catch (error) {
        if (!isMounted) return;
        setErrors({
          error: getApiErrorMessage(t, error, 'auth.errors.reset_failed'),
        });
      } finally {
        if (isMounted) {
          setExchangingCode(false);
        }
      }
    };

    void exchangeCode();

    return () => {
      isMounted = false;
    };
  }, [exchangeResetCode, routeCode, t]);

  // ─── Validation ───────────────────────────────────────────────────────────

  const validate = useCallback((): FormErrors | null => {
    const newErrors: FormErrors = {};

    if (!password) {
      newErrors.password = t('auth.errors.password_required');
    } else if (password.length < PASSWORD_MIN_LENGTH) {
      newErrors.password = t('auth.errors.password_min', {
        min: PASSWORD_MIN_LENGTH,
      });
    } else if (!isPasswordStrongEnough(password)) {
      newErrors.password = t('auth.errors.password_too_weak');
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t('auth.errors.confirm_password_required');
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('auth.errors.passwords_do_not_match');
    }

    return Object.keys(newErrors).length > 0 ? newErrors : null;
  }, [password, confirmPassword, t]);

  const clearError = useCallback((field: keyof FormErrors) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    const validationErrors = validate();
    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response: ApiResponse<User> = await resetPassword({
        token: resetToken,
        newPassword: password,
        confirmPassword,
      }).unwrap();
      if (response.success) {
        setSuccess(true);
      } else {
        setErrors({
          error: getApiResponseMessage(t, response, 'auth.errors.reset_failed'),
        });
      }
    } catch (error) {
      setErrors({
        error: getApiErrorMessage(t, error, 'auth.errors.reset_failed'),
      });
    }
  }, [password, confirmPassword, resetPassword, resetToken, validate, t]);

  // ─── Success State ────────────────────────────────────────────────────────

  if (success) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <View style={styles.successIconWrapper}>
            <Feather
              name="check-circle"
              size={48}
              color={theme.colors.success}
            />
          </View>

          <Text style={styles.successTitle}>
            {t('auth.reset.success_title')}
          </Text>
          <Text style={styles.successSubtitle}>
            {t('auth.reset.success_subtitle')}
          </Text>

          <TouchableOpacity
            style={styles.successPrimaryButton}
            onPress={() => navigation.navigate('Login')}
            accessibilityRole="button"
            accessibilityLabel={t('auth.actions.sign_in')}
          >
            <Feather name="log-in" size={16} color={theme.colors.white} />
            <Text style={styles.primaryButtonText}>
              {t('auth.actions.sign_in')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Expired / Invalid Token ──────────────────────────────────────────────

  if (!resetToken && exchangingCode) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={styles.successSubtitle}>{t('auth.reset.subtitle')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!resetToken) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <View
            style={[
              styles.successIconWrapper,
              { backgroundColor: theme.colors.errorLight },
            ]}
          >
            <Feather
              name="alert-triangle"
              size={48}
              color={theme.colors.error}
            />
          </View>
          <Text style={styles.successTitle}>
            {t('auth.reset.invalid_link_title')}
          </Text>
          <Text style={styles.successSubtitle}>
            {t('auth.reset.invalid_link_subtitle')}
          </Text>
          <TouchableOpacity
            style={styles.successPrimaryButton}
            onPress={() => navigation.navigate('ForgotPassword')}
            accessibilityRole="button"
            accessibilityLabel={t('auth.actions.request_new_link')}
          >
            <Feather name="mail" size={16} color={theme.colors.white} />
            <Text style={styles.primaryButtonText}>
              {t('auth.actions.request_new_link')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Form ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconWrapper}>
            <Feather name="key" size={32} color={theme.colors.primary} />
          </View>

          <Text style={styles.title}>{t('auth.reset.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.reset.subtitle')}</Text>

          {errors.error && (
            <View style={styles.errorBanner}>
              <Feather
                name="alert-circle"
                size={14}
                color={theme.colors.error}
              />
              <Text style={styles.errorBannerText}>{errors.error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <AuthTextField
              label={t('auth.fields.new_password')}
              icon="lock"
              value={password}
              onChange={(text) => {
                setPassword(text);
                clearError('password');
              }}
              error={errors.password}
              placeholder={t('auth.placeholders.new_password', {
                min: PASSWORD_MIN_LENGTH,
              })}
              secure
              secureVisible={showPassword}
              textContentType="newPassword"
              autoComplete="password-new"
              disabled={loading || exchangingCode}
              onToggleSecure={() => setShowPassword((p) => !p)}
              showSecureLabel={t('auth.actions.show_password')}
              hideSecureLabel={t('auth.actions.hide_password')}
            />

            <PasswordStrengthHint password={password} />

            <AuthTextField
              label={t('auth.fields.confirm_password')}
              icon="lock"
              value={confirmPassword}
              onChange={(text) => {
                setConfirmPassword(text);
                clearError('confirmPassword');
              }}
              error={errors.confirmPassword}
              placeholder={t('auth.placeholders.confirm_password')}
              secure
              secureVisible={showConfirmPassword}
              textContentType="newPassword"
              autoComplete="password-new"
              disabled={loading || exchangingCode}
              labelSpacing
              onToggleSecure={() => setShowConfirmPassword((p) => !p)}
              showSecureLabel={t('auth.actions.show_password')}
              hideSecureLabel={t('auth.actions.hide_password')}
            />

            {/* Match indicator */}
            {confirmPassword.length > 0 && (
              <View style={styles.matchRow}>
                <Feather
                  name={
                    password === confirmPassword ? 'check-circle' : 'x-circle'
                  }
                  size={13}
                  color={
                    password === confirmPassword
                      ? theme.colors.success
                      : theme.colors.error
                  }
                />
                <Text
                  style={[
                    styles.confirmBtn,
                    {
                      color:
                        password === confirmPassword
                          ? theme.colors.success
                          : theme.colors.error,
                    },
                  ]}
                >
                  {password === confirmPassword
                    ? t('auth.reset.passwords_match')
                    : t('auth.errors.passwords_do_not_match')}
                </Text>
              </View>
            )}
            {/* Submit */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={() => {
                void handleSubmit();
              }}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={t('auth.actions.reset_password')}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>
                    {t('auth.actions.reset_password')}
                  </Text>
                  <Feather name="check" size={18} color={theme.colors.white} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backLink}
              onPress={() => navigation.navigate('Login')}
              disabled={loading || exchangingCode}
              accessibilityRole="button"
              accessibilityLabel={t('auth.actions.back_to_sign_in')}
            >
              <Feather name="arrow-left" size={14} color={theme.colors.link} />
              <Text style={styles.backLinkText}>
                {t('auth.actions.back_to_sign_in')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
