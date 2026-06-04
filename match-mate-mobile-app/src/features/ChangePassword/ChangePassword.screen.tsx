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
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { changePasswordStyles } from './ChangePassword.styles';
import { InfoBanner } from './components/InfoBanner';
import { PasswordField } from './components/PasswordField';
import { PasswordStrengthBar } from './components/PasswordStrengthBar';
import { ChangePasswordScreenProps } from './ChangePassword.types';
import { useChangePassword } from './ChangePassword.hooks';
import Header from '@/core/components/Header';

export default function ChangePasswordScreen({
  navigation,
}: ChangePasswordScreenProps): React.ReactElement {
  const styles = useThemedStyles(changePasswordStyles);
  const { t } = useTranslation();

  const {
    values,
    errors,
    visibility,
    loading,
    setValue,
    toggleVisibility,
    handleSubmit,
    handleReset,
  } = useChangePassword();

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('settings.change_password')}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.safe}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <InfoBanner infoText={t('change_password.info')} />

          <View style={styles.card}>
            <PasswordField
              label={t('change_password.current')}
              value={values.oldPassword}
              placeholder={t('change_password.placeholders.current')}
              error={errors?.oldPassword}
              visible={visibility.oldPassword}
              onChangeText={(t) => setValue('oldPassword', t)}
              onToggleVisibility={() => toggleVisibility('oldPassword')}
              accessibilityLabel="current-password-input"
              editable={!loading}
            />

            <View style={styles.separator} />

            <PasswordField
              label={t('change_password.new')}
              value={values.newPassword}
              placeholder={t('change_password.placeholders.new')}
              error={errors?.newPassword}
              visible={visibility.newPassword}
              onChangeText={(t) => setValue('newPassword', t)}
              onToggleVisibility={() => toggleVisibility('newPassword')}
              accessibilityLabel="new-password-input"
              editable={!loading}
            />

            <PasswordStrengthBar password={values.newPassword} />

            <View style={styles.separator} />

            <PasswordField
              label={t('change_password.confirm')}
              value={values.confirmPassword}
              placeholder={t('change_password.placeholders.confirm')}
              error={errors?.confirmPassword}
              visible={visibility.confirmPassword}
              onChangeText={(t) => setValue('confirmPassword', t)}
              onToggleVisibility={() => toggleVisibility('confirmPassword')}
              accessibilityLabel="confirm-password-input"
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={() => void handleSubmit()}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="check" size={18} color="#fff" />
                <Text style={styles.primaryButtonText}>
                  {t('change_password.update')}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
            disabled={loading}
          >
            <Text style={styles.resetButtonText}>
              {t('change_password.reset')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
