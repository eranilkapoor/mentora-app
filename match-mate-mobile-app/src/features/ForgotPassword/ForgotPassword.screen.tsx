import React, { useState, useCallback, useMemo } from 'react';

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

import { EMAIL_REGEX } from '@/core/constants';

import { useForgotPasswordMutation } from '@/store/services/authApi';

import { ForgotPasswordScreenProps, FormErrors } from './ForgotPassword.types';

import { forgotPasswordStyles } from './ForgotPassword.styles';

import { EmailInputField } from './components/EmailInputField';
import { ForgotPasswordInfoCard } from './components/ForgotPasswordInfoCard';
import { ForgotPasswordSuccess } from './components/ForgotPasswordSuccess';

export default function ForgotPasswordScreen({
  navigation,
}: ForgotPasswordScreenProps): React.ReactElement {
  const styles = useThemedStyles(forgotPasswordStyles);

  const { theme } = useTheme();

  const { t } = useTranslation();

  const [email, setEmail] = useState('');

  const [submitted, setSubmitted] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});

  const [forgotPassword, { isLoading: loading }] = useForgotPasswordMutation();

  const clearError = useCallback((field: keyof FormErrors) => {
    setErrors((prev) => {
      const next = { ...prev };

      delete next[field];

      return next;
    });
  }, []);

  const validate = useCallback((): FormErrors | null => {
    if (!email.trim()) {
      return {
        email: t('auth.errors.email_required'),
      };
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      return {
        email: t('auth.errors.email_invalid'),
      };
    }

    return null;
  }, [email, t]);

  const handleSubmit = useCallback(async () => {
    const validationErrors = validate();

    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }

    try {
      await forgotPassword({
        email: email.trim(),
      }).unwrap();

      setSubmitted(true);
    } catch {
      setErrors({
        error: t('auth.errors.network_error'),
      });
    }
  }, [email, forgotPassword, t, validate]);

  const handleEmailChange = useCallback(
    (text: string) => {
      setEmail(text);

      clearError('email');
      clearError('error');
    },
    [clearError]
  );

  const keyboardBehavior = useMemo(
    () => (Platform.OS === 'ios' ? 'padding' : undefined),
    []
  );

  if (submitted) {
    return (
      <SafeAreaView style={styles.safe}>
        <ForgotPasswordSuccess
          email={email}
          onBack={navigation.goBack}
          onResend={() => setSubmitted(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={keyboardBehavior}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
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

          {!!errors.error && (
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
            <EmailInputField
              value={email}
              error={errors.email}
              loading={loading}
              onChange={handleEmailChange}
              onSubmit={() => {
                void handleSubmit();
              }}
            />

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={() => {
                void handleSubmit();
              }}
              disabled={loading}
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
              onPress={navigation.goBack}
              disabled={loading}
            >
              <Feather name="arrow-left" size={14} color={theme.colors.link} />

              <Text style={styles.backLinkText}>
                {t('auth.actions.back_to_sign_in')}
              </Text>
            </TouchableOpacity>
          </View>

          <ForgotPasswordInfoCard />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
