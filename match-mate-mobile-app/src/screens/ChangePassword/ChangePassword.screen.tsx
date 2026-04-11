import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '../../core/constants/colors';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { changePasswordStyles } from './ChangePassword.styles';
import { InfoBanner } from './components/InfoBanner';
import { PasswordField } from './components/PasswordField';
import { PasswordStrengthBar } from './components/PasswordStrengthBar';
import { ChangePasswordScreenProps } from './ChangePassword.types';
import { useChangePassword } from './ChangePassword.hooks';

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ChangePasswordScreen({
  navigation,
}: ChangePasswordScreenProps): React.ReactElement {
  const styles = useThemedStyles(changePasswordStyles);

  const {
    values,
    errors,
    visibility,
    loading,
    setValue,
    toggleVisibility,
    handleSubmit,
    handleReset,
  } = useChangePassword(navigation);

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
          <InfoBanner styles={styles} />

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
