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
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../core/constants/colors';
import { fakeApi } from '../../core/services/fakeApi';
import { EMAIL_REGEX } from '../../core/constants';
import { ForgotPasswordScreenProps, FormErrors } from '../../screens/Login/Auth.types';
import { forgotPasswordStyles } from './ForgotPasswordScreen.styles';
import { useThemedStyles } from '../../core/theme/useThemedStyles';

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ForgotPasswordScreen({
  navigation,
}: ForgotPasswordScreenProps): React.ReactElement {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const styles = useThemedStyles(forgotPasswordStyles);

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const clearError = useCallback((field: keyof FormErrors): void => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const validate = useCallback((): FormErrors | null => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    return Object.keys(newErrors).length > 0 ? newErrors : null;
  }, [email]);

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async (): Promise<void> => {
    const validationErrors = validate();
    setErrors(validationErrors ?? {});
    if (validationErrors !== null) return;

    setLoading(true);
    try {
      const res = await fakeApi(
        { success: true },
        800,
        email === 'notfound@example.com'
      );

      if (res.success) {
        setSubmitted(true);
      } else {
        setErrors({
          error:
            (res.error as string | undefined) ??
            'Failed to send reset link. Please try again.',
        });
      }
    } catch {
      Alert.alert(
        'Network Error',
        'Please check your internet connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [email, validate]);

  // ─── Success State ────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <View style={styles.successIconWrapper}>
            <Feather name="mail" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.successTitle}>Check your inbox</Text>
          <Text style={styles.successSubtitle}>
            If an account exists for{' '}
            <Text style={styles.successEmail}>{email}</Text>, you'll receive a
            password reset link shortly.
          </Text>

          <View style={styles.successTips}>
            {[
              'Check your spam or junk folder',
              'The link expires in 30 minutes',
              'Request a new link if needed',
            ].map((tip) => (
              <View key={tip} style={styles.tipRow}>
                <Feather name="info" size={13} color={Colors.textMuted} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
          >
            <Feather name="arrow-left" size={16} color={Colors.white} />
            <Text style={styles.primaryButtonText}>Back to Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resendRow}
            onPress={() => setSubmitted(false)}
            accessibilityRole="button"
          >
            <Feather name="refresh-cw" size={13} color={Colors.link} />
            <Text style={styles.resendText}>Resend reset link</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Form State ───────────────────────────────────────────────────────────

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
          {/* Icon */}
          <View style={styles.iconWrapper}>
            <Feather name="lock" size={32} color={Colors.primary} />
          </View>

          <Text style={styles.title}>Reset your password</Text>
          <Text style={styles.subtitle}>
            Enter the email address associated with your account and we'll send
            you a link to reset your password.
          </Text>

          {/* Global error banner */}
          {errors.error !== undefined && (
            <View style={styles.errorBanner}>
              <Feather name="alert-circle" size={14} color={Colors.error} />
              <Text style={styles.errorBannerText}>{errors.error}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.label}>Email Address</Text>
            <View
              style={[
                styles.inputWrapper,
                errors.email !== undefined && styles.inputError,
              ]}
            >
              <Feather
                name="mail"
                size={16}
                color={Colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  clearError('email');
                }}
                placeholder="you@example.com"
                placeholderTextColor={Colors.textMuted}
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
                accessibilityLabel="Email address input"
              />
            </View>
            {errors.email !== undefined && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={() => {
                void handleSubmit();
              }}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Send reset link"
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Send Reset Link</Text>
                  <Feather name="send" size={16} color={Colors.white} />
                </>
              )}
            </TouchableOpacity>

            {/* Back link */}
            <TouchableOpacity
              style={styles.backLink}
              onPress={() => navigation.goBack()}
              disabled={loading}
              accessibilityRole="button"
            >
              <Feather name="arrow-left" size={14} color={Colors.link} />
              <Text style={styles.backLinkText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>What happens next?</Text>
            {[
              { icon: 'mail', text: "We'll send a reset link to your email" },
              { icon: 'clock', text: 'The link expires in 30 minutes' },
              { icon: 'lock', text: 'Create a new strong password' },
            ].map((item) => (
              <View key={item.text} style={styles.infoRow}>
                <View style={styles.infoIconWrapper}>
                  <Feather name={item.icon} size={14} color={Colors.primary} />
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
