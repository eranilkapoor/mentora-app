import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/store/hooks';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { setCredentials } from '@/store/slices/authSlice';
import {
  DEFAULT_COUNTRY_CODE,
  EMAIL_REGEX,
  OTP_LENGTH,
  PASSWORD_MIN_LENGTH,
  PHONE_MAX_LENGTH,
  PHONE_REGEX,
} from '@/core/constants';
import {
  useRegisterMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
} from '@/store/services/authApi';
import {
  RegisterScreenProps,
  ActiveTab,
  SocialProvider,
  FormErrors,
} from './Register.types';
import { registerStyles } from './Register.styles';
import { SocialButton } from './components/SocialButton';
import { CountryCodeDropdown } from './components/CountryCodeDropdown';

export default function RegisterScreen({
  navigation,
}: RegisterScreenProps): React.ReactElement {
  const dispatch = useAppDispatch();
  const styles = useThemedStyles(registerStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<ActiveTab>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showCountryCodeDropdown, setShowCountryCodeDropdown] = useState(false);
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [register] = useRegisterMutation();
  const [sendOtp] = useSendOtpMutation();
  const [verifyOtp] = useVerifyOtpMutation();

  // ─── Validation ───────────────────────────────────────────────────────────

  const validateEmail = useCallback(
    (v: string) => EMAIL_REGEX.test(v.trim()),
    []
  );
  const validatePhone = useCallback((v: string) => PHONE_REGEX.test(v), []);

  // ─── Error Management ─────────────────────────────────────────────────────

  const clearError = useCallback((field: keyof FormErrors) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleTabSwitch = useCallback((tab: ActiveTab) => {
    setActiveTab(tab);
    setOtpSent(false);
    setOtp('');
    setErrors({});
  }, []);

  const handleResendOtp = useCallback(() => {
    setOtpSent(false);
    setOtp('');
    setErrors({});
  }, []);

  // ─── Email Register ───────────────────────────────────────────────────────

  const handleEmailRegister = useCallback(async () => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = t('auth.errors.email_required');
    } else if (!validateEmail(email)) {
      newErrors.email = t('auth.errors.email_invalid');
    }

    if (!password) {
      newErrors.password = t('auth.errors.password_required');
    } else if (password.length < PASSWORD_MIN_LENGTH) {
      newErrors.password = t('auth.errors.password_min', {
        min: PASSWORD_MIN_LENGTH,
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await register({
        email: email.trim(),
        password,
      }).unwrap();

      if (!response.success) {
        setErrors({ email: t('auth.errors.email_already_registered') });
        return;
      }

      if (response.data) {
        // Dispatch — RootNavigator handles routing automatically
        dispatch(setCredentials(response.data));
        // ✅ Save refresh token (ONLY MOBILE)
        if (Platform.OS !== 'web' && response.data?.refreshToken) {
          await SecureStore.setItemAsync('refreshToken', response.data.refreshToken);
        }
      }
    } catch {
      setErrors({ error: t('auth.errors.register_failed') });
    } finally {
      setLoading(false);
    }
  }, [email, password, register, dispatch, validateEmail, t]);

  // ─── Phone / OTP ──────────────────────────────────────────────────────────

  const handleGetOtp = useCallback(async () => {
    if (!phone) {
      setErrors({ phone: t('auth.errors.phone_required') });
      return;
    }
    if (!validatePhone(phone)) {
      setErrors({ phone: t('auth.errors.phone_invalid') });
      return;
    }

    setLoading(true);
    try {
      const response = await sendOtp({
        country_code: countryCode,
        phone,
      }).unwrap();
      if (!response.success) {
        setErrors({ error: t('auth.errors.otp_send_failed') });
        return;
      }
      setOtpSent(true);
      setErrors({});
    } catch {
      setErrors({ error: t('auth.errors.otp_send_failed') });
    } finally {
      setLoading(false);
    }
  }, [phone, countryCode, validatePhone, sendOtp, t]);

  const handleVerifyOtp = useCallback(async () => {
    if (!otp) {
      setErrors({ otp: t('auth.errors.otp_required') });
      return;
    }
    if (otp.length !== OTP_LENGTH) {
      setErrors({ otp: t('auth.errors.otp_length', { length: OTP_LENGTH }) });
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOtp({
        country_code: countryCode,
        phone,
        otp,
      }).unwrap();
      if (!response.success) {
        setErrors({ otp: t('auth.errors.otp_invalid') });
        return;
      }
      if (response.data) {
        dispatch(setCredentials(response.data));
        // ✅ Save refresh token (ONLY MOBILE)
        if (Platform.OS !== 'web' && response.data?.refreshToken) {
          await SecureStore.setItemAsync('refreshToken', response.data.refreshToken);
        }
      }
    } catch {
      setErrors({ error: t('auth.errors.otp_verify_failed') });
    } finally {
      setLoading(false);
    }
  }, [otp, countryCode, phone, verifyOtp, dispatch, t]);

  const handleSocialRegister = useCallback(
    async (provider: SocialProvider) => {
      setLoading(true);
      setErrors({});
      try {
        // TODO: implement real social SDK
        setErrors({ error: t('auth.errors.social_failed', { provider }) });
      } catch {
        setErrors({ error: t('auth.errors.social_failed', { provider }) });
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  // ─── Render ───────────────────────────────────────────────────────────────

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

          <View style={styles.tabRow}>
            {(['email', 'phone'] as ActiveTab[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  activeTab === tab && styles.tabActive,
                ]}
                onPress={() => handleTabSwitch(tab)}
                disabled={loading}
                accessibilityRole="tab"
                accessibilityLabel={t(`auth.tabs.${tab}`)}
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
                  {t(`auth.tabs.${tab}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.form}>
            {activeTab === 'email' ? (
              <>
                <Text style={styles.label}>{t('auth.fields.email')}</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.email && styles.inputError,
                  ]}
                >
                  <Feather
                    name="mail"
                    size={16}
                    color={theme.colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.placeholders.email')}
                    placeholderTextColor={theme.colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={email}
                    onChangeText={(t) => {
                      setEmail(t);
                      clearError('email');
                    }}
                    editable={!loading}
                    textContentType="username"
                    accessibilityLabel={t('auth.fields.email')}
                  />
                </View>
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}

                <Text style={[styles.label, styles.labelSpacing]}>
                  {t('auth.fields.password')}
                </Text>
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
                    placeholder={t('auth.placeholders.password_new')}
                    placeholderTextColor={theme.colors.textMuted}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(t) => {
                      setPassword(t);
                      clearError('password');
                    }}
                    editable={!loading}
                    textContentType="newPassword"
                    accessibilityLabel={t('auth.fields.password')}
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
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    loading && styles.disabledButton,
                  ]}
                  onPress={() => {
                    void handleEmailRegister();
                  }}
                  disabled={loading}
                  accessibilityRole="button"
                  accessibilityLabel={t('auth.actions.create_account')}
                >
                  {loading ? (
                    <ActivityIndicator color={theme.colors.white} />
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>
                        {t('auth.actions.create_account')}
                      </Text>
                      <Feather
                        name="arrow-right"
                        size={18}
                        color={theme.colors.white}
                      />
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.label}>{t('auth.fields.phone')}</Text>
                <View
                  style={[styles.phoneRow, errors.phone && styles.inputError]}
                >
                  <TouchableOpacity
                    style={styles.countryCodeBtn}
                    onPress={() => setShowCountryCodeDropdown((p) => !p)}
                    accessibilityRole="button"
                    accessibilityLabel={t('auth.actions.select_country_code')}
                  >
                    <Text style={styles.countryCodeText}>+{countryCode}</Text>
                    <Feather
                      name="chevron-down"
                      size={14}
                      color={theme.colors.textMuted}
                    />
                  </TouchableOpacity>

                  <CountryCodeDropdown
                    visible={showCountryCodeDropdown}
                    onClose={() => setShowCountryCodeDropdown(false)}
                    selectedCode={countryCode}
                    onSelectCode={(code) => setCountryCode(code)}
                  />

                  <TextInput
                    style={[styles.input, styles.phoneInput]}
                    placeholder={t('auth.placeholders.phone')}
                    placeholderTextColor={theme.colors.textMuted}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={(text) => {
                      setPhone(
                        text.replace(/\D/g, '').slice(0, PHONE_MAX_LENGTH)
                      );
                      clearError('phone');
                    }}
                    editable={!loading && !otpSent}
                    maxLength={PHONE_MAX_LENGTH}
                    accessibilityLabel={t('auth.fields.phone')}
                  />
                </View>
                {errors.phone && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}

                {!otpSent ? (
                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      loading && styles.disabledButton,
                    ]}
                    onPress={() => {
                      void handleGetOtp();
                    }}
                    disabled={loading}
                    accessibilityRole="button"
                    accessibilityLabel={t('auth.actions.get_otp')}
                  >
                    {loading ? (
                      <ActivityIndicator color={theme.colors.white} />
                    ) : (
                      <>
                        <Text style={styles.primaryButtonText}>
                          {t('auth.actions.get_otp')}
                        </Text>
                        <Feather
                          name="send"
                          size={16}
                          color={theme.colors.white}
                        />
                      </>
                    )}
                  </TouchableOpacity>
                ) : (
                  <>
                    <View style={styles.otpInfoBanner}>
                      <Feather
                        name="check-circle"
                        size={14}
                        color={theme.colors.success}
                      />
                      <Text style={styles.otpInfoText}>
                        {t('auth.otp.sent_to', { code: countryCode, phone })}
                      </Text>
                    </View>

                    <Text style={[styles.label, styles.labelSpacing]}>
                      {t('auth.fields.otp')}
                    </Text>
                    <TextInput
                      style={[styles.otpInput, errors.otp && styles.inputError]}
                      placeholder="• • • • • •"
                      placeholderTextColor={theme.colors.textMuted}
                      keyboardType="number-pad"
                      value={otp}
                      onChangeText={(text) => {
                        setOtp(text.replace(/\D/g, '').slice(0, OTP_LENGTH));
                        clearError('otp');
                      }}
                      editable={!loading}
                      maxLength={OTP_LENGTH}
                      accessibilityLabel={t('auth.fields.otp')}
                    />
                    {errors.otp && (
                      <Text style={styles.errorText}>{errors.otp}</Text>
                    )}

                    <TouchableOpacity
                      style={[
                        styles.primaryButton,
                        loading && styles.disabledButton,
                      ]}
                      onPress={() => {
                        void handleVerifyOtp();
                      }}
                      disabled={loading}
                      accessibilityRole="button"
                      accessibilityLabel={t('auth.actions.verify_create')}
                    >
                      {loading ? (
                        <ActivityIndicator color={theme.colors.white} />
                      ) : (
                        <>
                          <Text style={styles.primaryButtonText}>
                            {t('auth.actions.verify_create')}
                          </Text>
                          <Feather
                            name="arrow-right"
                            size={18}
                            color={theme.colors.white}
                          />
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.resendRow}
                      onPress={handleResendOtp}
                      disabled={loading}
                      accessibilityRole="button"
                      accessibilityLabel={t('auth.actions.resend_otp')}
                    >
                      <Feather
                        name="refresh-cw"
                        size={13}
                        color={theme.colors.link}
                      />
                      <Text style={styles.resendText}>
                        {t('auth.actions.resend_otp')}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>{t('common.or')}</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialContainer}>
            {Platform.OS !== 'ios' && (
              <SocialButton
                label={t('auth.social.google')}
                onPress={() => {
                  void handleSocialRegister('google');
                }}
                disabled={loading}
                icon="search"
                iconColor="#EA4335"
              />
            )}
            {Platform.OS === 'ios' && (
              <SocialButton
                label={t('auth.social.apple')}
                onPress={() => {
                  void handleSocialRegister('apple');
                }}
                disabled={loading}
                icon="smartphone"
              />
            )}
            <SocialButton
              label={t('auth.social.facebook')}
              onPress={() => {
                void handleSocialRegister('facebook');
              }}
              disabled={loading}
              icon="facebook"
              iconColor="#1877F2"
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {t('auth.register.have_account')}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              disabled={loading}
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
