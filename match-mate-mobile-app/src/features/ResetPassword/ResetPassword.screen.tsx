import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
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
import { useResetPasswordMutation } from '@/store/services/authApi';
import { AuthNavigationProp } from './ResetPassword.types';
import { resetPasswordStyles } from './ResetPassword.styles';
import { PASSWORD_MIN_LENGTH } from '@/core/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ResetPasswordScreenProps {
  navigation: AuthNavigationProp;
  // Token arrives via deep link query param — passed as route param
  route: { params: { accessToken: string } };
}

interface FormErrors {
  password?: string;
  confirmPassword?: string;
  error?: string;
}

// ─── Password strength check ──────────────────────────────────────────────────

type StrengthLevel = 'weak' | 'fair' | 'strong' | 'very_strong';

function getPasswordStrength(password: string): StrengthLevel {
  if (password.length === 0) return 'weak';
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return 'weak';
  if (score === 2) return 'fair';
  if (score === 3) return 'strong';
  return 'very_strong';
}

// ─── Password Strength Bar ────────────────────────────────────────────────────

const STRENGTH_COLORS: Record<StrengthLevel, string> = {
  weak: '#EF4444',
  fair: '#F59E0B',
  strong: '#3B82F6',
  very_strong: '#16A34A',
};

const STRENGTH_FILL: Record<StrengthLevel, number> = {
  weak: 1,
  fair: 2,
  strong: 3,
  very_strong: 4,
};

function StrengthBar({ password }: { password: string }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const strength = getPasswordStrength(password);
  const fill = STRENGTH_FILL[strength];
  const color = STRENGTH_COLORS[strength];

  if (!password) return null;

  return (
    <View style={{ marginTop: 6, marginBottom: 4 }}>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: i <= fill ? color : theme.colors.border,
            }}
          />
        ))}
      </View>
      <Text style={{ fontSize: 11, color, marginTop: 4, fontWeight: '500' }}>
        {t(`auth.password_strength.${strength}`)}
      </Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ResetPasswordScreen({
  navigation,
  route,
}: ResetPasswordScreenProps): React.ReactElement {
  const styles = useThemedStyles(resetPasswordStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const { accessToken } = route.params;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

  const [resetPassword, { isLoading: loading }] = useResetPasswordMutation();

  // ─── Validation ───────────────────────────────────────────────────────────

  const validate = useCallback((): FormErrors | null => {
    const newErrors: FormErrors = {};

    if (!password) {
      newErrors.password = t('auth.errors.password_required');
    } else if (password.length < PASSWORD_MIN_LENGTH) {
      newErrors.password = t('auth.errors.password_min', {
        min: PASSWORD_MIN_LENGTH,
      });
    } else if (getPasswordStrength(password) === 'weak') {
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
      const response = await resetPassword({ accessToken, password }).unwrap();
      if (response.success) {
        setSuccess(true);
      } else {
        setErrors({ error: t('auth.errors.reset_failed') });
      }
    } catch {
      setErrors({ error: t('auth.errors.network_error') });
    }
  }, [password, accessToken, resetPassword, validate, t]);

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
            style={styles.primaryButton}
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

  if (!accessToken) {
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
            style={styles.primaryButton}
            onPress={() => navigation.navigate('ForgotPassword')}
            accessibilityRole="button"
            accessibilityLabel={t('auth.actions.request_new_link')}
          >
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
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
            {/* New Password */}
            <Text style={styles.label}>{t('auth.fields.new_password')}</Text>
            <View
              style={[
                styles.inputWrapper,
                errors.password && styles.inputError,
              ]}
            >
              <Feather
                name="lock"
                size={16}
                color={theme.colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={t('auth.placeholders.new_password')}
                placeholderTextColor={theme.colors.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  clearError('password');
                }}
                editable={!loading}
                textContentType="newPassword"
                autoComplete="password-new"
                accessibilityLabel={t('auth.fields.new_password')}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((p) => !p)}
                style={styles.eyeButton}
                disabled={loading}
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

            {/* Strength indicator */}
            <StrengthBar password={password} />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            {/* Password rules hint */}
            <View style={styles.rulesCard}>
              {[
                {
                  rule: t('auth.reset.rule_length', {
                    min: PASSWORD_MIN_LENGTH,
                  }),
                  met: password.length >= PASSWORD_MIN_LENGTH,
                },
                {
                  rule: t('auth.reset.rule_uppercase'),
                  met: /[A-Z]/.test(password),
                },
                {
                  rule: t('auth.reset.rule_number'),
                  met: /[0-9]/.test(password),
                },
                {
                  rule: t('auth.reset.rule_special'),
                  met: /[^A-Za-z0-9]/.test(password),
                },
              ].map(({ rule, met }) => (
                <View key={rule} style={styles.ruleRow}>
                  <Feather
                    name={met ? 'check-circle' : 'circle'}
                    size={13}
                    color={met ? theme.colors.success : theme.colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.ruleText,
                      met && { color: theme.colors.success },
                    ]}
                  >
                    {rule}
                  </Text>
                </View>
              ))}
            </View>

            {/* Confirm Password */}
            <Text style={[styles.label, styles.labelSpacing]}>
              {t('auth.fields.confirm_password')}
            </Text>
            <View
              style={[
                styles.inputWrapper,
                errors.confirmPassword && styles.inputError,
              ]}
            >
              <Feather
                name="lock"
                size={16}
                color={theme.colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={t('auth.placeholders.confirm_password')}
                placeholderTextColor={theme.colors.textMuted}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  clearError('confirmPassword');
                }}
                editable={!loading}
                textContentType="newPassword"
                autoComplete="password-new"
                accessibilityLabel={t('auth.fields.confirm_password')}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword((p) => !p)}
                style={styles.eyeButton}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel={
                  showConfirmPassword
                    ? t('auth.actions.hide_password')
                    : t('auth.actions.show_password')
                }
              >
                <Feather
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={18}
                  color={theme.colors.textMuted}
                />
              </TouchableOpacity>
            </View>

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
                  style={{
                    fontSize: 12,
                    marginLeft: 5,
                    color:
                      password === confirmPassword
                        ? theme.colors.success
                        : theme.colors.error,
                  }}
                >
                  {password === confirmPassword
                    ? t('auth.reset.passwords_match')
                    : t('auth.errors.passwords_do_not_match')}
                </Text>
              </View>
            )}
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
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
              disabled={loading}
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
