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
import { EMAIL_REGEX } from '@/core/constants';
import { useForgotPasswordMutation } from '@/store/services/authApi';
import { ForgotPasswordScreenProps, FormErrors } from './ForgotPassword.types';
import { forgotPasswordStyles } from './ForgotPassword.styles';

export default function ForgotPasswordScreen({
  navigation,
}: ForgotPasswordScreenProps): React.ReactElement {
  const styles = useThemedStyles(forgotPasswordStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const [forgotPassword, { isLoading: loading }] = useForgotPasswordMutation();

  const clearError = useCallback((field: keyof FormErrors) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const validate = useCallback((): FormErrors | null => {
    if (!email.trim()) return { email: t('auth.errors.email_required') };
    if (!EMAIL_REGEX.test(email.trim()))
      return { email: t('auth.errors.email_invalid') };
    return null;
  }, [email, t]);

  const handleSubmit = useCallback(async () => {
    const validationErrors = validate();
    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await forgotPassword({ email: email.trim() }).unwrap();
      if (response.success) {
        setSubmitted(true);
      } else {
        // Intentionally vague for security — don't reveal if email exists
        setSubmitted(true);
      }
    } catch {
      // Use error banner, not Alert.alert — consistent with rest of app
      setErrors({ error: t('auth.errors.network_error') });
    }
  }, [email, validate, forgotPassword, t]);

  if (submitted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <View style={styles.successIconWrapper}>
            <Feather name="mail" size={36} color={theme.colors.primary} />
          </View>
          <Text style={styles.successTitle}>
            {t('auth.forgot.success_title')}
          </Text>
          <Text style={styles.successSubtitle}>
            {t('auth.forgot.success_subtitle', { email })}
          </Text>

          <View style={styles.successTips}>
            {(t('auth.forgot.tips', { returnObjects: true }) as string[]).map(
              (tip) => (
                <View key={tip} style={styles.tipRow}>
                  <Feather
                    name="info"
                    size={13}
                    color={theme.colors.textMuted}
                  />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              )
            )}
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel={t('auth.actions.back_to_sign_in')}
          >
            <Feather name="arrow-left" size={16} color={theme.colors.white} />
            <Text style={styles.primaryButtonText}>
              {t('auth.actions.back_to_sign_in')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resendRow}
            onPress={() => setSubmitted(false)}
            accessibilityRole="button"
            accessibilityLabel={t('auth.actions.resend_reset_link')}
          >
            <Feather name="refresh-cw" size={13} color={theme.colors.link} />
            <Text style={styles.resendText}>
              {t('auth.actions.resend_reset_link')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
            <Feather name="lock" size={32} color={theme.colors.primary} />
          </View>

          <Text style={styles.title}>{t('auth.forgot.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.forgot.subtitle')}</Text>

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
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  clearError('email');
                }}
                placeholder={t('auth.placeholders.email')}
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                style={styles.input}
                editable={!loading}
                returnKeyType="send"
                onSubmitEditing={() => {
                  void handleSubmit();
                }}
                accessibilityLabel={t('auth.fields.email')}
              />
            </View>
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={() => {
                void handleSubmit();
              }}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={t('auth.actions.send_reset_link')}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>
                    {t('auth.actions.send_reset_link')}
                  </Text>
                  <Feather name="send" size={16} color={theme.colors.white} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backLink}
              onPress={() => navigation.goBack()}
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

          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>
              {t('auth.forgot.what_happens')}
            </Text>
            {(
              t('auth.forgot.steps', { returnObjects: true }) as Array<{
                icon: string;
                text: string;
              }>
            ).map((item) => (
              <View key={item.text} style={styles.infoRow}>
                <View style={styles.infoIconWrapper}>
                  <Feather
                    name={item.icon}
                    size={14}
                    color={theme.colors.primary}
                  />
                </View>
                <Text style={styles.infoText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
