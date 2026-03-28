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
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthService } from '../../services/authService';
import { useAppDispatch } from '../../store';
import { country_codes } from '../../constants';
import { fakeApi } from '../../services/fakeApi';
import { Colors } from '../../constants/colors';
import { type RootStackParamList } from '../../navigation/types';
import { loginUser } from '../../store/authActions';

// ─── Types ────────────────────────────────────────────────────────────────────

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
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
  icon: string;
  iconColor?: string;
}

interface CountryCodeDropdownProps {
  visible: boolean;
  onClose: () => void;
  selectedCode: string;
  onSelectCode: (code: string) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{6,15}$/;
const DEFAULT_COUNTRY_CODE = country_codes[2] as string;
const PASSWORD_MIN_LENGTH = 6;
const PHONE_MAX_LENGTH = 10;
const OTP_LENGTH = 6;

// ─── Sub-components ──────────────────────────────────────────────────────────

const SocialButton = React.memo<SocialButtonProps>(
  ({ label, onPress, disabled = false, icon, iconColor }) => (
    <TouchableOpacity
      style={[styles.socialButton, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Feather
        name={icon}
        size={20}
        color={iconColor ?? Colors.textSecondary}
        style={styles.socialIcon}
      />
      <Text style={styles.socialLabel}>{label}</Text>
    </TouchableOpacity>
  )
);

SocialButton.displayName = 'SocialButton';

const CountryCodeDropdown = React.memo<CountryCodeDropdownProps>(
  ({ visible, onClose, selectedCode, onSelectCode }) => (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalDropdown}>
          <ScrollView keyboardShouldPersistTaps="handled">
            {country_codes.map((code) => (
              <TouchableOpacity
                key={code}
                style={[
                  styles.countryCodeItem,
                  selectedCode === code && styles.countryCodeItemActive,
                ]}
                onPress={() => {
                  onSelectCode(code as string);
                  onClose();
                }}
                accessibilityRole="button"
                accessibilityLabel={`Country code ${code}`}
              >
                <Text
                  style={[
                    styles.countryCodeItemText,
                    selectedCode === code && styles.countryCodeItemTextActive,
                  ]}
                >
                  +{code}
                </Text>
                {selectedCode === code && (
                  <Feather name="check" size={14} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  )
);

CountryCodeDropdown.displayName = 'CountryCodeDropdown';

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function LoginScreen({
  navigation,
}: LoginScreenProps): React.ReactElement {
  const dispatch = useAppDispatch();

  // ─── State ───────────────────────────────────────────────────────────────

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

  // ─── Validation Helpers ──────────────────────────────────────────────────

  const validateEmail = useCallback((value: string): boolean => {
    return EMAIL_REGEX.test(value.trim());
  }, []);

  const validatePhone = useCallback((value: string): boolean => {
    return PHONE_REGEX.test(value);
  }, []);

  const validatePassword = useCallback((value: string): boolean => {
    return value.length >= PASSWORD_MIN_LENGTH;
  }, []);

  // ─── Error Management ────────────────────────────────────────────────────

  const clearError = useCallback((field: keyof FormErrors): void => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback((): void => {
    setErrors({});
  }, []);

  // ─── Navigation ──────────────────────────────────────────────────────────

  const navigateAfterAuth = useCallback(
    (isProfileCompleted: boolean): void => {
      if (!isProfileCompleted) {
        navigation.navigate('Onboarding');
      }
    },
    [navigation]
  );

  // ─── Tab Management ──────────────────────────────────────────────────────

  const handleTabSwitch = useCallback((tab: ActiveTab): void => {
    setActiveTab(tab);
    setOtpSent(false);
    setOtp('');
    setErrors({});
  }, []);

  // ─── Email Login ─────────────────────────────────────────────────────────

  const handleEmailLogin = useCallback(async (): Promise<void> => {
    const newErrors: FormErrors = {};

    // Validate email
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Enter a valid email address';
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(password)) {
      newErrors.password = `Minimum ${PASSWORD_MIN_LENGTH} characters`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await AuthService.login({ email: email.trim(), password });
      const { data } = res;

      if (!data.success) {
        setErrors({ error: 'Invalid email or password' });
        return;
      }

      if (data.data?.token && data.data?.user) {
        dispatch(loginUser(data.data.token, data.data.user));
        navigateAfterAuth(data.data.user.isProfileCompleted ?? false);
      } else {
        setErrors({ error: 'Invalid response from server' });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setErrors({
        error: `Failed to sign in. Please try again. (${errorMessage})`,
      });
    } finally {
      setLoading(false);
    }
  }, [
    email,
    password,
    dispatch,
    navigateAfterAuth,
    validateEmail,
    validatePassword,
  ]);

  // ─── Phone/OTP Login ─────────────────────────────────────────────────────

  const handleGetOtp = useCallback(async (): Promise<void> => {
    const newErrors: FormErrors = {};

    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(phone)) {
      newErrors.phone = 'Enter a valid phone number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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
      clearAllErrors();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setErrors({
        error: `Failed to send OTP. Please try again. (${errorMessage})`,
      });
    } finally {
      setLoading(false);
    }
  }, [phone, countryCode, validatePhone, clearAllErrors]);

  const handleVerifyOtp = useCallback(async (): Promise<void> => {
    if (!otp) {
      setErrors({ otp: 'OTP is required' });
      return;
    }

    if (otp.length !== OTP_LENGTH) {
      setErrors({ otp: `OTP must be ${OTP_LENGTH} digits` });
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

      if (data.data?.token && data.data?.user) {
        dispatch(loginUser(data.data.token, data.data.user));
        navigateAfterAuth(data.data.user.isProfileCompleted ?? false);
      } else {
        setErrors({ error: 'Invalid response from server' });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setErrors({
        error: `Failed to verify OTP. Please try again. (${errorMessage})`,
      });
    } finally {
      setLoading(false);
    }
  }, [otp, countryCode, phone, dispatch, navigateAfterAuth]);

  const handleResendOtp = useCallback((): void => {
    setOtpSent(false);
    setOtp('');
    clearAllErrors();
  }, [clearAllErrors]);

  // ─── Social Login ────────────────────────────────────────────────────────

  const handleSocialLogin = useCallback(
    async (provider: SocialProvider): Promise<void> => {
      setLoading(true);
      clearAllErrors();

      try {
        const res = await fakeApi(
          {
            success: true,
            data: { token: 'fake-jwt-token', user: { provider } },
          },
          1000
        );

        if (!res.success) {
          setErrors({ error: res.error as string });
        }
        // TODO: Implement actual social login
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        setErrors({
          error: `Failed to sign in with ${provider}. (${errorMessage})`,
        });
      } finally {
        setLoading(false);
      }
    },
    [clearAllErrors]
  );

  // ─── Input Handlers ──────────────────────────────────────────────────────

  const handleEmailChange = useCallback(
    (text: string) => {
      setEmail(text);
      if (errors.email) clearError('email');
    },
    [errors.email, clearError]
  );

  const handlePasswordChange = useCallback(
    (text: string) => {
      setPassword(text);
      if (errors.password) clearError('password');
    },
    [errors.password, clearError]
  );

  const handlePhoneChange = useCallback(
    (text: string) => {
      const sanitized = text.replace(/\D/g, '').slice(0, PHONE_MAX_LENGTH);
      setPhone(sanitized);
      if (errors.phone) clearError('phone');
    },
    [errors.phone, clearError]
  );

  const handleOtpChange = useCallback(
    (text: string) => {
      const sanitized = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
      setOtp(sanitized);
      if (errors.otp) clearError('otp');
    },
    [errors.otp, clearError]
  );

  const handleCountryCodeSelect = useCallback((code: string) => {
    setCountryCode(code);
  }, []);

  const toggleCountryCodeDropdown = useCallback(() => {
    setShowCountryCodeDropdown((prev) => !prev);
  }, []);

  const closeCountryCodeDropdown = useCallback(() => {
    setShowCountryCodeDropdown(false);
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  // ─── Navigation Handlers ─────────────────────────────────────────────────

  const handleForgotPassword = useCallback(() => {
    navigation.navigate('ForgotPassword');
  }, [navigation]);

  const handleRegister = useCallback(() => {
    navigation.navigate('Register');
  }, [navigation]);

  // ─── Render ───────────────────────────────────────────────────────────────

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
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={styles.title}>Welcome to MatchMate</Text>
          <Text style={styles.subtitle}>
            Sign in to find your perfect match
          </Text>

          {/* Global error */}
          {errors.error && (
            <View style={styles.errorBanner}>
              <Feather name="alert-circle" size={14} color={Colors.error} />
              <Text style={styles.errorBannerText}>{errors.error}</Text>
            </View>
          )}

          {/* Tabs */}
          <View style={styles.tabRow}>
            {(['email', 'phone'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  activeTab === tab && styles.tabActive,
                ]}
                onPress={() => handleTabSwitch(tab)}
                disabled={loading}
                accessibilityRole="tab"
                accessibilityLabel={`${tab} tab`}
                accessibilityState={{ selected: activeTab === tab }}
              >
                <Feather
                  name={tab === 'email' ? 'mail' : 'smartphone'}
                  size={14}
                  color={
                    activeTab === tab ? Colors.white : Colors.textSecondary
                  }
                  style={styles.tabIcon}
                />
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
                {/* Email Field */}
                <Text style={styles.label}>Email</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.email && styles.inputError,
                  ]}
                >
                  <Feather
                    name="mail"
                    size={16}
                    color={Colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={email}
                    onChangeText={handleEmailChange}
                    editable={!loading}
                    textContentType="username"
                    accessibilityLabel="Email input"
                  />
                </View>
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}

                {/* Password Field */}
                <Text style={[styles.label, styles.labelSpacing]}>
                  Password
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
                    color={Colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.textMuted}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={handlePasswordChange}
                    accessibilityLabel="Password input"
                    editable={!loading}
                    textContentType="password"
                  />
                  <TouchableOpacity
                    onPress={togglePasswordVisibility}
                    style={styles.eyeButton}
                    disabled={loading}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    <Feather
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={18}
                      color={Colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}

                {/* Forgot Password */}
                <TouchableOpacity
                  onPress={handleForgotPassword}
                  disabled={loading}
                  style={styles.forgotRow}
                  accessibilityRole="button"
                  accessibilityLabel="Forgot password"
                >
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>

                {/* Sign In Button */}
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    loading && styles.disabledButton,
                  ]}
                  onPress={() => {
                    void handleEmailLogin();
                  }}
                  disabled={loading}
                  accessibilityRole="button"
                  accessibilityLabel="Sign in with email"
                >
                  {loading ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>Sign In</Text>
                      <Feather
                        name="arrow-right"
                        size={18}
                        color={Colors.white}
                      />
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Phone Field */}
                <Text style={styles.label}>Phone Number</Text>
                <View
                  style={[styles.phoneRow, errors.phone && styles.inputError]}
                >
                  <TouchableOpacity
                    style={styles.countryCodeBtn}
                    onPress={toggleCountryCodeDropdown}
                    accessibilityRole="button"
                    accessibilityLabel="Select country code"
                  >
                    <Text style={styles.countryCodeText}>+{countryCode}</Text>
                    <Feather
                      name="chevron-down"
                      size={14}
                      color={Colors.textMuted}
                    />
                  </TouchableOpacity>

                  <CountryCodeDropdown
                    visible={showCountryCodeDropdown}
                    onClose={closeCountryCodeDropdown}
                    selectedCode={countryCode}
                    onSelectCode={handleCountryCodeSelect}
                  />

                  <TextInput
                    style={[styles.input, styles.phoneInput]}
                    placeholder="9911002233"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    value={phone}
                    onChangeText={handlePhoneChange}
                    editable={!loading && !otpSent}
                    maxLength={PHONE_MAX_LENGTH}
                    accessibilityLabel="Phone number input"
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
                    accessibilityLabel="Get OTP"
                  >
                    {loading ? (
                      <ActivityIndicator color={Colors.white} />
                    ) : (
                      <>
                        <Text style={styles.primaryButtonText}>Get OTP</Text>
                        <Feather name="send" size={16} color={Colors.white} />
                      </>
                    )}
                  </TouchableOpacity>
                ) : (
                  <>
                    {/* OTP sent info */}
                    <View style={styles.otpInfoBanner}>
                      <Feather
                        name="check-circle"
                        size={14}
                        color={Colors.success}
                      />
                      <Text style={styles.otpInfoText}>
                        OTP sent to +{countryCode} {phone}
                      </Text>
                    </View>

                    <Text style={[styles.label, styles.labelSpacing]}>
                      Enter OTP
                    </Text>
                    <TextInput
                      style={[styles.otpInput, errors.otp && styles.inputError]}
                      placeholder="• • • • • •"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="number-pad"
                      value={otp}
                      onChangeText={handleOtpChange}
                      editable={!loading}
                      maxLength={OTP_LENGTH}
                      accessibilityLabel="OTP input"
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
                      accessibilityLabel="Verify OTP"
                    >
                      {loading ? (
                        <ActivityIndicator color={Colors.white} />
                      ) : (
                        <>
                          <Text style={styles.primaryButtonText}>
                            Verify & Sign In
                          </Text>
                          <Feather
                            name="arrow-right"
                            size={18}
                            color={Colors.white}
                          />
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.resendRow}
                      onPress={handleResendOtp}
                      disabled={loading}
                      accessibilityRole="button"
                      accessibilityLabel="Resend OTP or change number"
                    >
                      <Feather
                        name="refresh-cw"
                        size={13}
                        color={Colors.link}
                      />
                      <Text style={styles.resendText}>
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
                  void handleSocialLogin('google');
                }}
                disabled={loading}
                icon="search"
                iconColor="#EA4335"
              />
            )}
            {Platform.OS === 'ios' && (
              <SocialButton
                label="Continue with Apple"
                onPress={() => {
                  void handleSocialLogin('apple');
                }}
                disabled={loading}
                icon="smartphone"
              />
            )}
            <SocialButton
              label="Continue with Facebook"
              onPress={() => {
                void handleSocialLogin('facebook');
              }}
              disabled={loading}
              icon="facebook"
              iconColor="#1877F2"
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Create account"
            >
              <Text style={styles.linkText}> Create account</Text>
            </TouchableOpacity>
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
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 80,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
    color: Colors.textPrimary,
    textAlign: 'center',
    fontFamily: 'clebri-bold',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 24,
    textAlign: 'center',
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
  tabRow: {
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: Colors.backgroundLight,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    gap: 6,
  },
  tabActive: {
    backgroundColor: Colors.black,
  },
  tabIcon: {
    marginRight: 2,
  },
  tabText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  tabTextActive: {
    color: Colors.white,
  },
  form: {
    marginTop: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  labelSpacing: {
    marginTop: 12,
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
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  eyeButton: {
    padding: 6,
  },
  phoneRow: {
    flexDirection: 'row',
    marginBottom: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    backgroundColor: Colors.inputBackground,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 0,
  },
  otpInput: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 28,
    letterSpacing: 12,
    textAlign: 'center',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  countryCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 13,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    minWidth: 80,
  },
  countryCodeText: {
    fontWeight: '600',
    color: Colors.textPrimary,
    fontSize: 15,
  },
  countryCodeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  countryCodeItemActive: {
    backgroundColor: Colors.primaryLight,
  },
  countryCodeItemText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  countryCodeItemTextActive: {
    color: Colors.primary,
    fontWeight: '600',
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
  otpInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.successLight,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    marginTop: 4,
  },
  otpInfoText: {
    fontSize: 13,
    color: Colors.success,
    fontWeight: '500',
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: 6,
    marginBottom: 4,
  },
  forgotText: {
    color: Colors.link,
    fontSize: 13,
    fontWeight: '500',
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
  disabledButton: {
    opacity: 0.6,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  resendText: {
    color: Colors.link,
    fontSize: 13,
    fontWeight: '500',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: 12,
    color: Colors.textMuted,
    fontWeight: '600',
    fontSize: 13,
  },
  socialContainer: {
    gap: 10,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: Colors.border,
    borderWidth: 1,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.white,
  },
  socialIcon: {
    marginRight: 12,
  },
  socialLabel: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  footerText: {
    color: Colors.textMuted,
  },
  linkText: {
    color: Colors.link,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDropdown: {
    width: 140,
    maxHeight: 300,
    backgroundColor: Colors.white,
    borderRadius: 10,
    elevation: 10,
    shadowColor: Colors.black,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});
