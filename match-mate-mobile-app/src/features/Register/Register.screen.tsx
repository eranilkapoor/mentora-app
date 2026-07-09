import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useTheme } from '@/core/theme/ThemeProvider';
import { RegisterEmailForm } from './components/RegisterEmailForm';
import { useRegisterForm } from './hooks/useRegisterForm';
import {
  RegisterScreenProps,
  TAB_LABEL_KEYS,
} from '@/features/Auth/shared/auth.types';
import { SocialButton } from '../Auth/shared/components/SocialButton';
import { PhoneForm } from '../Auth/shared/components/PhoneForm';
import { authSharedStyles } from '../Auth/shared/auth.styles';
import {
  authMethodConfig,
  hasAnySocialProviderEnabled,
} from '../Auth/shared/authMethodConfig';

export default function RegisterScreen({
  navigation,
}: RegisterScreenProps): React.ReactElement {
  const styles = useThemedStyles(authSharedStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const visibleTabs: Array<'email' | 'phone'> = authMethodConfig.phoneOtp
    ? ['email', 'phone']
    : ['email'];
  const hasSocialMethods = hasAnySocialProviderEnabled();

  const {
    activeTab,
    loading,
    errors,
    email,
    password,
    showPassword,
    phone,
    otp,
    otpSent,
    countryCode,
    showCountryCodeDropdown,
    referralCode,
    showReferralCode,
    handleTabSwitch,
    handleEmailRegister,
    handleGetOtp,
    handleVerifyOtp,
    handleResendOtp,
    handleSocialRegister,
    handleEmailChange,
    handlePasswordChange,
    handlePhoneChange,
    handleOtpChange,
    handleReferralCodeChange,
    togglePasswordVisibility,
    toggleReferralCode,
    toggleCountryCodeDropdown,
    closeCountryCodeDropdown,
    setCountryCode,
  } = useRegisterForm();

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
          <Text style={styles.title}>{t('auth.register.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.register.subtitle')}</Text>

          {/* Global error banner */}
          {errors.error ? (
            <View style={styles.errorBanner}>
              <Feather
                name="alert-circle"
                size={14}
                color={theme.colors.error}
              />
              <Text style={styles.errorBannerText}>{errors.error}</Text>
            </View>
          ) : null}

          {/* Tabs */}
          <View style={styles.tabRow}>
            {visibleTabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  activeTab === tab && styles.tabActive,
                ]}
                onPress={() => handleTabSwitch(tab)}
                disabled={loading}
                activeOpacity={0.8}
                accessibilityRole="tab"
                accessibilityLabel={t(TAB_LABEL_KEYS[tab])}
                accessibilityState={{ selected: activeTab === tab }}
              >
                <Feather
                  name={tab === 'email' ? 'mail' : 'smartphone'}
                  size={14}
                  color={
                    activeTab === tab
                      ? theme.colors.primary
                      : theme.colors.textSecondary
                  }
                  style={styles.tabIcon}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.tabTextActive,
                  ]}
                >
                  {t(TAB_LABEL_KEYS[tab])}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Active form */}
          <View style={styles.form}>
            {activeTab === 'phone' && authMethodConfig.phoneOtp ? (
              <PhoneForm
                errors={errors}
                loading={loading}
                phone={phone}
                otp={otp}
                otpSent={otpSent}
                countryCode={countryCode}
                showCountryCodeDropdown={showCountryCodeDropdown}
                submitLabel={t('auth.actions.get_otp')}
                verifyLabel={t('auth.actions.verify_create')}
                onPhoneChange={handlePhoneChange}
                onOtpChange={handleOtpChange}
                onGetOtp={() => {
                  void handleGetOtp();
                }}
                onVerifyOtp={() => {
                  void handleVerifyOtp();
                }}
                onResendOtp={handleResendOtp}
                onToggleDropdown={toggleCountryCodeDropdown}
                onCloseDropdown={closeCountryCodeDropdown}
                onSelectCountryCode={setCountryCode}
                referralCode={referralCode}
                showReferralCode={showReferralCode}
                onReferralCodeChange={handleReferralCodeChange}
                onToggleReferralCode={toggleReferralCode}
              />
            ) : (
              <RegisterEmailForm
                errors={errors}
                loading={loading}
                email={email}
                password={password}
                referralCode={referralCode}
                showReferralCode={showReferralCode}
                showPassword={showPassword}
                onEmailChange={handleEmailChange}
                onPasswordChange={handlePasswordChange}
                onReferralCodeChange={handleReferralCodeChange}
                onToggleReferralCode={toggleReferralCode}
                onTogglePassword={togglePasswordVisibility}
                onSubmit={() => {
                  void handleEmailRegister();
                }}
              />
            )}
          </View>

          {/* Divider */}
          {hasSocialMethods ? (
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>
                {t('auth.welcome.or_continue')}
              </Text>
              <View style={styles.divider} />
            </View>
          ) : null}

          {/* Social buttons */}
          {hasSocialMethods ? (
            <View style={styles.socialContainer}>
              {authMethodConfig.social.google ? (
                <SocialButton
                  label={t('auth.social.google')}
                  onPress={() => {
                    void handleSocialRegister('google');
                  }}
                  disabled={loading}
                  icon="chrome"
                  iconColor="#EA4335"
                />
              ) : null}
              {authMethodConfig.social.apple ? (
                <SocialButton
                  label={t('auth.social.apple')}
                  onPress={() => {
                    void handleSocialRegister('apple');
                  }}
                  disabled={loading}
                  icon="command"
                />
              ) : null}
              {authMethodConfig.social.facebook ? (
                <SocialButton
                  label={t('auth.social.facebook')}
                  onPress={() => {
                    void handleSocialRegister('facebook');
                  }}
                  disabled={loading}
                  icon="facebook"
                  iconColor="#1877F2"
                />
              ) : null}
            </View>
          ) : null}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {t('auth.register.have_account')}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('auth.actions.sign_in')}
            >
              <Text style={styles.linkText}> {t('auth.actions.sign_in')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
