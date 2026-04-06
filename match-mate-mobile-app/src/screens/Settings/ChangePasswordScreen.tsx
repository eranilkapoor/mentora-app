import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '../../core/constants/colors';
import { type RootNavigationProp } from '../../navigation/types';
import { useChangePasswordMutation } from '../../store/services/authApi';
import { PASSWORD_MIN_LENGTH } from '../../core/constants';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { chnagePasswordStyles } from './ChangePasswordScreen.styles';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChangePasswordScreenProps {
  navigation: RootNavigationProp;
}

interface FormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface PasswordFieldProps {
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  visible: boolean;
  onChangeText: (text: string) => void;
  onToggleVisibility: () => void;
  accessibilityLabel: string;
  editable?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PASSWORD_RULES = [
  {
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (p: string) => p.length >= PASSWORD_MIN_LENGTH,
  },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
  {
    label: 'One special character',
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function PasswordStrengthBar({
  password,
}: {
  password: string;
}): React.ReactElement | null {
  const styles = useThemedStyles(chnagePasswordStyles);

  if (password.length === 0) return null;

  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const strength =
    passed <= 1
      ? 'Weak'
      : passed <= 2
        ? 'Fair'
        : passed === 3
          ? 'Good'
          : 'Strong';
  const strengthColor =
    passed <= 1
      ? Colors.danger
      : passed <= 2
        ? Colors.accent
        : passed === 3
          ? Colors.link
          : Colors.success;

  return (
    <View style={styles.strengthWrapper}>
      <View style={styles.strengthBarRow}>
        {PASSWORD_RULES.map((rule, i) => (
          <View
            key={rule.label}
            style={[
              styles.strengthSegment,
              i < passed && { backgroundColor: strengthColor },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.strengthLabel, { color: strengthColor }]}>
        {strength}
      </Text>

      <View style={styles.rulesContainer}>
        {PASSWORD_RULES.map((rule) => {
          const isPassed = rule.test(password);
          return (
            <View key={rule.label} style={styles.ruleRow}>
              <Feather
                name={isPassed ? 'check-circle' : 'circle'}
                size={13}
                color={isPassed ? Colors.success : Colors.textMuted}
              />
              <Text
                style={[styles.ruleText, isPassed && styles.ruleTextPassed]}
              >
                {rule.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function PasswordField({
  label,
  value,
  placeholder,
  error,
  visible,
  onChangeText,
  onToggleVisibility,
  accessibilityLabel,
  editable = true,
}: PasswordFieldProps): React.ReactElement {
  const styles = useThemedStyles(chnagePasswordStyles);

  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          error !== undefined && styles.inputError,
          !editable && styles.inputDisabled,
        ]}
      >
        <Feather
          name="lock"
          size={18}
          color={Colors.textMuted}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={!visible}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          accessibilityLabel={accessibilityLabel}
        />
        <TouchableOpacity
          onPress={onToggleVisibility}
          style={styles.eyeButton}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          disabled={!editable}
        >
          <Feather
            name={visible ? 'eye-off' : 'eye'}
            size={18}
            color={Colors.textMuted}
          />
        </TouchableOpacity>
      </View>
      {error !== undefined && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ChangePasswordScreen({
  navigation,
}: ChangePasswordScreenProps): React.ReactElement {
  const styles = useThemedStyles(chnagePasswordStyles);

  const [values, setValues] = useState<FormValues>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [visibility, setVisibility] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [changePassword] = useChangePasswordMutation();

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const setValue = useCallback(
    (field: keyof FormValues, text: string): void => {
      setValues((prev) => ({ ...prev, [field]: text }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    []
  );

  const toggleVisibility = useCallback(
    (field: keyof typeof visibility): void => {
      setVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
    },
    []
  );

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!values.oldPassword) {
      newErrors.oldPassword = 'Current password is required';
    }

    if (!values.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (values.newPassword.length < PASSWORD_MIN_LENGTH) {
      newErrors.newPassword = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    } else if (values.newPassword === values.oldPassword) {
      newErrors.newPassword = 'New password must differ from current password';
    }

    if (!values.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (values.confirmPassword !== values.newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values]);

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!validate()) return;

    setLoading(true);
    try {
      await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      }).unwrap();

      Alert.alert(
        'Password Changed',
        'Your password has been updated successfully.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      const err = error as { message?: string };
      if (err.message?.toLowerCase().includes('incorrect')) {
        setErrors({ oldPassword: 'Current password is incorrect' });
      } else {
        Alert.alert(
          'Error',
          err.message ?? 'Failed to change password. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [validate, values, navigation, changePassword]);

  const handleReset = useCallback((): void => {
    setValues({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setErrors({});
    setVisibility({
      oldPassword: false,
      newPassword: false,
      confirmPassword: false,
    });
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: Colors.backgroundPage }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        style={styles.safe}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Feather name="shield" size={18} color={Colors.primary} />
            <Text style={styles.infoBannerText}>
              Choose a strong password you don't use elsewhere.
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <PasswordField
              label="Current Password"
              value={values.oldPassword}
              placeholder="Enter current password"
              error={errors.oldPassword}
              visible={visibility.oldPassword}
              onChangeText={(t) => setValue('oldPassword', t)}
              onToggleVisibility={() => toggleVisibility('oldPassword')}
              accessibilityLabel="current-password-input"
              editable={!loading}
            />

            <View style={styles.separator} />

            <PasswordField
              label="New Password"
              value={values.newPassword}
              placeholder="Enter new password"
              error={errors.newPassword}
              visible={visibility.newPassword}
              onChangeText={(t) => setValue('newPassword', t)}
              onToggleVisibility={() => toggleVisibility('newPassword')}
              accessibilityLabel="new-password-input"
              editable={!loading}
            />

            <PasswordStrengthBar password={values.newPassword} />

            <View style={styles.separator} />

            <PasswordField
              label="Confirm New Password"
              value={values.confirmPassword}
              placeholder="Re-enter new password"
              error={errors.confirmPassword}
              visible={visibility.confirmPassword}
              onChangeText={(t) => setValue('confirmPassword', t)}
              onToggleVisibility={() => toggleVisibility('confirmPassword')}
              accessibilityLabel="confirm-password-input"
              editable={!loading}
            />

            {/* Match indicator */}
            {values.confirmPassword.length > 0 && (
              <View style={styles.matchRow}>
                <Feather
                  name={
                    values.confirmPassword === values.newPassword
                      ? 'check-circle'
                      : 'x-circle'
                  }
                  size={14}
                  color={
                    values.confirmPassword === values.newPassword
                      ? Colors.success
                      : Colors.danger
                  }
                />
                <Text
                  style={[
                    styles.matchText,
                    {
                      color:
                        values.confirmPassword === values.newPassword
                          ? Colors.success
                          : Colors.danger,
                    },
                  ]}
                >
                  {values.confirmPassword === values.newPassword
                    ? 'Passwords match'
                    : 'Passwords do not match'}
                </Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={() => {
              void handleSubmit();
            }}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Update password"
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Feather name="check" size={18} color={Colors.white} />
                <Text style={styles.primaryButtonText}>Update Password</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Clear all fields"
          >
            <Text style={styles.resetButtonText}>Clear All Fields</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
