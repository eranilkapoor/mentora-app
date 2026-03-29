import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../../core/constants/colors';
import { type RootNavigationProp } from '../../navigation/types';
import { fakeApi } from '../../core/services/fakeApi';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ForgotPasswordScreenProps {
  navigation: RootNavigationProp;
}

interface FormErrors {
  email?: string;
  error?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ForgotPasswordScreen({
  navigation,
}: ForgotPasswordScreenProps): React.ReactElement {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
      <SafeAreaProvider style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Forgot Password</Text>
          <View style={styles.headerSpacer} />
        </View>

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
      </SafeAreaProvider>
    );
  }

  // ─── Form State ───────────────────────────────────────────────────────────

  return (
    <SafeAreaProvider style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Forgot Password</Text>
        <View style={styles.headerSpacer} />
      </View>

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
    </SafeAreaProvider>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  backButton: { padding: 4 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  headerSpacer: { width: 30 },
  scrollContent: {
    padding: 20,
    paddingTop: 32,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'clebri-bold',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 21,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.errorLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorBannerText: {
    color: Colors.error,
    fontSize: 13,
    flex: 1,
  },
  form: { marginTop: 4 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginBottom: 8,
    marginTop: 2,
  },
  primaryButton: {
    marginTop: 16,
    backgroundColor: Colors.black,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  disabledButton: { opacity: 0.6 },
  backLink: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  backLinkText: {
    color: Colors.link,
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    marginTop: 28,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  infoCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  infoIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  successContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'clebri-bold',
  },
  successSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  successEmail: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  successTips: {
    width: '100%',
    backgroundColor: Colors.backgroundPage,
    borderRadius: 12,
    padding: 16,
    gap: 10,
    marginBottom: 28,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipText: {
    fontSize: 13,
    color: Colors.textMuted,
    flex: 1,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  resendText: {
    color: Colors.link,
    fontSize: 13,
    fontWeight: '500',
  },
});
