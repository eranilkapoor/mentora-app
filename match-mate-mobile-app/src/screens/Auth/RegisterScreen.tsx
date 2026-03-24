import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthService } from '../../services/authService';
import { useAppDispatch } from '../../store';
import { setCredentials } from '../../store/authSlice';
import { country_codes } from '../../constants';
import { fakeApi } from '../../services/fakeApi';
import { Colors } from '../../constants/colors';
import { type RootNavigationProp } from '../../navigation/types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface RegisterScreenProps {
  navigation: RootNavigationProp;
}

type ActiveTab = 'email' | 'phone';
type SocialProvider = 'google' | 'apple' | 'facebook';

interface FormErrors {
  email?: string;
  password?: string;
  phone?: string;
  otp?: string;
  error?: string;
}

interface SocialButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  emoji?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?\d{6,15}$/;
const DEFAULT_COUNTRY_CODE = country_codes[2] as string;

// ─── Sub-components ──────────────────────────────────────────────────────────

function SocialButton({
  label,
  onPress,
  disabled = false,
  emoji,
}: SocialButtonProps): React.ReactElement {
  return (
    <TouchableOpacity
      style={[styles.socialButton, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={`social-${label}`}
      accessibilityRole="button"
    >
      <Text style={styles.socialEmoji}>{emoji}</Text>
      <Text style={styles.socialLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function RegisterScreen({
  navigation,
}: RegisterScreenProps): React.ReactElement {
  const dispatch = useAppDispatch();

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

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const clearError = useCallback((field: keyof FormErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const validateEmail = (value: string): boolean => EMAIL_REGEX.test(value);

  const validatePhone = (value: string): boolean => PHONE_REGEX.test(value);

  const navigateAfterAuth = useCallback(
    (isProfileCompleted: boolean) => {
      if (!isProfileCompleted) {
        navigation.navigate('Onboarding');
      }
    },
    [navigation]
  );

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleTabSwitch = useCallback((tab: ActiveTab) => {
    setActiveTab(tab);
    setOtpSent(false);
    setErrors({});
  }, []);

  const handleEmailRegister = useCallback(async (): Promise<void> => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Minimum 6 characters';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await AuthService.register({ email, password });
      const { data } = res;

      if (!data.success) {
        setErrors({ email: 'Email already registered. Please try login!' });
        return;
      }

      if (data.data) {
        dispatch(setCredentials(data.data));
        navigateAfterAuth(data.data.user?.isProfileCompleted ?? false);
      }
    } catch {
      setErrors({ error: 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, [email, password, dispatch, navigateAfterAuth]);

  const handleGetOtp = useCallback(async (): Promise<void> => {
    const newErrors: FormErrors = {};

    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(phone)) {
      newErrors.phone = 'Enter a valid phone number';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await AuthService.sendOtp({
        country_code: countryCode,
        phone,
      });
      const { data } = res;

      if (!data.success) {
        setErrors({ error: 'Failed to send OTP. Please try again.' });
        return;
      }

      setOtpSent(true);
    } catch {
      setErrors({ error: 'Failed to send OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, [phone, countryCode]);

  const handleVerifyOtp = useCallback(async (): Promise<void> => {
    if (!otp) {
      setErrors({ otp: 'OTP is required' });
      return;
    }

    setLoading(true);
    try {
      const res = await AuthService.verifyOtp({
        country_code: countryCode,
        phone,
        otp,
      });
      const { data } = res;

      if (!data.success) {
        setErrors({ otp: 'Invalid OTP' });
        return;
      }

      if (data.data) {
        dispatch(setCredentials(data.data));
        navigateAfterAuth(data.data.user?.isProfileCompleted ?? false);
      }
    } catch {
      setErrors({ error: 'Failed to verify OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, [otp, countryCode, phone, dispatch, navigateAfterAuth]);

  const handleSocialRegister = useCallback(
    async (provider: SocialProvider): Promise<void> => {
      setLoading(true);
      setErrors({});
      try {
        await fakeApi({ success: true }, 1000);
        navigation.navigate('Onboarding');
      } catch {
        setErrors({ error: `Failed to sign up with ${provider}.` });
      } finally {
        setLoading(false);
      }
    },
    [navigation]
  );

  const handleResendOtp = useCallback(() => {
    setOtpSent(false);
    setOtp('');
  }, []);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaProvider style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Create an account</Text>
          <Text style={styles.subtitle}>
            Start your journey to find your perfect match
          </Text>

          {errors.error !== undefined && (
            <Text style={styles.error}>{errors.error}</Text>
          )}

          {/* Tabs */}
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
                accessibilityLabel={`tab-${tab}`}
                accessibilityRole="tab"
                accessibilityState={{ selected: activeTab === tab }}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.tabTextActive,
                  ]}
                >
                  {tab === 'email' ? 'Email' : 'Phone (OTP)'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Form */}
          <View style={styles.form}>
            {activeTab === 'email' ? (
              <>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.email !== undefined && styles.inputError,
                  ]}
                  placeholder="you@example.com"
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
                  accessibilityLabel="email-input"
                />
                {errors.email !== undefined && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}

                <Text style={[styles.label, styles.labelSpacing]}>
                  Password
                </Text>
                <View
                  style={[
                    styles.passwordContainer,
                    errors.password !== undefined && styles.inputError,
                  ]}
                >
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="••••••••"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(t) => {
                      setPassword(t);
                      clearError('password');
                    }}
                    accessibilityLabel="password-input"
                    editable={!loading}
                    textContentType="password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((prev) => !prev)}
                    style={styles.eyeIcon}
                    disabled={loading}
                    accessibilityLabel={
                      showPassword ? 'hide-password' : 'show-password'
                    }
                    accessibilityRole="button"
                  >
                    <Feather
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={Colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
                {errors.password !== undefined && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    loading && styles.disabledButton,
                  ]}
                  onPress={handleEmailRegister}
                  disabled={loading}
                  accessibilityLabel="email-register-button"
                  accessibilityRole="button"
                >
                  {loading ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <Text style={styles.primaryButtonText}>Continue</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.label}>Phone Number</Text>
                <View
                  style={[
                    styles.phoneRow,
                    errors.phone !== undefined && styles.inputError,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.countryCodeBtn}
                    onPress={() => setShowCountryCodeDropdown((prev) => !prev)}
                    accessibilityLabel="country-code-selector"
                    accessibilityRole="button"
                  >
                    <Text style={styles.countryCodeText}>+{countryCode}</Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                  </TouchableOpacity>

                  <Modal
                    visible={showCountryCodeDropdown}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowCountryCodeDropdown(false)}
                  >
                    <TouchableOpacity
                      style={styles.modalOverlay}
                      activeOpacity={1}
                      onPress={() => setShowCountryCodeDropdown(false)}
                    >
                      <View style={styles.modalDropdown}>
                        <ScrollView>
                          {country_codes.map((code) => (
                            <TouchableOpacity
                              key={code}
                              style={styles.countryCodeItem}
                              onPress={() => {
                                setCountryCode(code as string);
                                setShowCountryCodeDropdown(false);
                              }}
                              accessibilityLabel={`country-code-${code}`}
                              accessibilityRole="button"
                            >
                              <Text>+{code}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    </TouchableOpacity>
                  </Modal>

                  <TextInput
                    style={[styles.input, styles.phoneInput]}
                    placeholder="9911002233"
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    value={phone}
                    onChangeText={(t) => {
                      setPhone(t.slice(0, 10));
                      clearError('phone');
                    }}
                    editable={!loading && !otpSent}
                    maxLength={10}
                    accessibilityLabel="phone-input"
                  />
                </View>
                {errors.phone !== undefined && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}

                {!otpSent ? (
                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      loading && styles.disabledButton,
                    ]}
                    onPress={handleGetOtp}
                    disabled={loading}
                    accessibilityLabel="get-otp-button"
                    accessibilityRole="button"
                  >
                    {loading ? (
                      <ActivityIndicator color={Colors.white} />
                    ) : (
                      <Text style={styles.primaryButtonText}>Get OTP</Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <>
                    <Text style={[styles.label, styles.labelSpacing]}>
                      Enter OTP
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        styles.otpInput,
                        errors.otp !== undefined && styles.inputError,
                      ]}
                      placeholder="123456"
                      keyboardType="number-pad"
                      value={otp}
                      onChangeText={(t) => {
                        setOtp(t.slice(0, 6));
                        clearError('otp');
                      }}
                      editable={!loading}
                      maxLength={6}
                      accessibilityLabel="otp-input"
                    />
                    {errors.otp !== undefined && (
                      <Text style={styles.errorText}>{errors.otp}</Text>
                    )}

                    <TouchableOpacity
                      style={[
                        styles.primaryButton,
                        loading && styles.disabledButton,
                      ]}
                      onPress={handleVerifyOtp}
                      disabled={loading}
                      accessibilityLabel="verify-otp-button"
                      accessibilityRole="button"
                    >
                      {loading ? (
                        <ActivityIndicator color={Colors.white} />
                      ) : (
                        <Text style={styles.primaryButtonText}>
                          Verify & Continue
                        </Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.linkRow}
                      onPress={handleResendOtp}
                      disabled={loading}
                      accessibilityRole="button"
                    >
                      <Text style={styles.linkSmall}>
                        Resend / change number
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialContainer}>
            {Platform.OS !== 'ios' && (
              <SocialButton
                label="Continue with Google"
                onPress={() => {
                  void handleSocialRegister('google');
                }}
                disabled={loading}
                emoji="G"
              />
            )}
            {Platform.OS === 'ios' && (
              <SocialButton
                label="Continue with Apple"
                onPress={() => {
                  void handleSocialRegister('apple');
                }}
                disabled={loading}
                emoji=""
              />
            )}
            <SocialButton
              label="Continue with Facebook"
              onPress={() => {
                void handleSocialRegister('facebook');
              }}
              disabled={loading}
              emoji="f"
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              disabled={loading}
              accessibilityRole="button"
            >
              <Text style={styles.linkText}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1 },
  scrollContent: {
    padding: 20,
    paddingTop: 100,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 26,
    color: Colors.black,
    textAlign: 'center',
    fontFamily: 'clebri-bold',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 18,
  },
  tabRow: {
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: Colors.backgroundLight,
    padding: 4,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: { backgroundColor: Colors.black },
  tabText: { color: Colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: Colors.white },
  form: { marginTop: 8 },
  label: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6 },
  labelSpacing: { marginTop: 12 },
  input: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: Colors.black,
  },
  phoneRow: { flexDirection: 'row', marginBottom: 12 },
  phoneInput: { flex: 1, marginLeft: 8, marginBottom: 0 },
  otpInput: { fontSize: 24, letterSpacing: 8, textAlign: 'center' },
  countryCodeBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    minWidth: 80,
  },
  countryCodeText: { fontWeight: '600', marginRight: 4 },
  dropdownArrow: { fontSize: 16, color: Colors.textMuted },
  countryCodeItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.transparent,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.black,
  },
  eyeIcon: { paddingHorizontal: 6, paddingVertical: 4 },
  primaryButton: {
    marginTop: 18,
    backgroundColor: Colors.black,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  disabledButton: { opacity: 0.6 },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: { flex: 1, height: 1, backgroundColor: Colors.divider },
  dividerText: {
    marginHorizontal: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  socialContainer: { gap: 10 },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: Colors.border,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: Colors.white,
    marginBottom: 8,
  },
  socialEmoji: { fontSize: 18, marginRight: 10 },
  socialLabel: { fontSize: 15, color: Colors.black, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'flex-start', marginTop: 24 },
  footerText: { color: Colors.textMuted },
  linkText: { color: Colors.link, fontWeight: '700' },
  linkRow: { alignItems: 'center', marginTop: 10 },
  linkSmall: { color: Colors.link, fontSize: 13 },
  error: { color: Colors.error, marginBottom: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDropdown: {
    width: 120,
    maxHeight: 300,
    backgroundColor: Colors.white,
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.black,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  inputError: { borderWidth: 1, borderColor: Colors.error },
  errorText: { color: Colors.error, marginTop: 6, fontSize: 12 },
});
