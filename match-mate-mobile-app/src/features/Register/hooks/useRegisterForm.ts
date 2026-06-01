import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/auth.slice';
import {
  useRegisterMutation,
  useSendOtpMutation,
  useSocialLoginMutation,
  useVerifyOtpMutation,
} from '@/store/services/authApi.service';
import {
  DEFAULT_COUNTRY_CODE,
  EMAIL_REGEX,
  OTP_LENGTH,
  PASSWORD_MIN_LENGTH,
  PHONE_MAX_LENGTH,
  PHONE_REGEX,
} from '@/core/constants';
import { User } from '@/core/types';
import {
  ActiveTab,
  FormErrors,
  SocialProvider,
} from '@/features/Auth/shared/auth.types';
import { setRefreshToken } from '@/store/services/baseApi.service';
import { baseApi } from '@/store/services/baseApi.service';
import {
  getApiErrorMessage,
  getApiResponseMessage,
} from '@/core/utils/apiMessage';
import { useSocialAuth } from '@/features/Auth/shared/useSocialAuth';
import {
  authMethodConfig,
  isSocialProviderEnabled,
} from '@/features/Auth/shared/authMethodConfig';

export function useRegisterForm() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [register] = useRegisterMutation();
  const [sendOtp] = useSendOtpMutation();
  const [verifyOtp] = useVerifyOtpMutation();
  const [socialLogin] = useSocialLoginMutation();
  const { signInWithProvider } = useSocialAuth();

  // ─── UI state ─────────────────────────────────────────────────────────────

  const [activeTab, setActiveTab] = useState<ActiveTab>('email');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // ─── Email form state ─────────────────────────────────────────────────────

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [showReferralCode, setShowReferralCode] = useState(false);

  // ─── Phone form state ─────────────────────────────────────────────────────

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [showCountryCodeDropdown, setShowCountryCodeDropdown] = useState(false);

  // ─── Error helpers ────────────────────────────────────────────────────────

  const clearError = useCallback((field: keyof FormErrors) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearAllErrors = useCallback(() => setErrors({}), []);

  // ─── Persist refresh token on mobile ─────────────────────────────────────

  const persistRefreshToken = useCallback(
    async (token: string) => setRefreshToken(token),
    []
  );

  const applyCredentials = useCallback(
    async (data: {
      accessToken: string;
      refreshToken?: string;
      user: unknown;
    }) => {
      dispatch(baseApi.util.resetApiState());
      dispatch(
        setCredentials({
          accessToken: data.accessToken,
          user: data.user as User,
        })
      );
      if (data.refreshToken) {
        await persistRefreshToken(data.refreshToken);
      }
    },
    [dispatch, persistRefreshToken]
  );

  // ─── Tab ──────────────────────────────────────────────────────────────────

  const handleTabSwitch = useCallback(
    (tab: ActiveTab) => {
      setActiveTab(tab);
      setOtpSent(false);
      setOtp('');
      clearAllErrors();
    },
    [clearAllErrors]
  );

  const handleResendOtp = useCallback(() => {
    setOtpSent(false);
    setOtp('');
    clearAllErrors();
  }, [clearAllErrors]);

  // ─── Email register ───────────────────────────────────────────────────────

  const handleEmailRegister = useCallback(async () => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = t('auth.errors.email_required');
    } else if (!EMAIL_REGEX.test(email.trim())) {
      newErrors.email = t('auth.errors.email_invalid');
    }

    if (!password) {
      newErrors.password = t('auth.errors.password_required');
    } else if (password.length < PASSWORD_MIN_LENGTH) {
      newErrors.password = t('auth.errors.password_min', {
        min: PASSWORD_MIN_LENGTH,
      });
    }

    if (
      showReferralCode &&
      referralCode.trim() &&
      !/^[a-zA-Z0-9]{6,10}$/.test(referralCode.trim())
    ) {
      newErrors.referralCode = 'Enter a valid 6-10 character referral code';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const trimmedReferralCode = referralCode.trim();
      const response = await register({
        email: email.trim(),
        password,
        ...(trimmedReferralCode ? { referralCode: trimmedReferralCode } : {}),
      }).unwrap();

      if (!response.success) {
        setErrors({ email: getApiResponseMessage(t, response) });
        return;
      }

      if (response.data?.accessToken && response.data?.user) {
        await applyCredentials(response.data);
      } else {
        setErrors({ error: t('auth.errors.server_error') });
      }
    } catch (err) {
      setErrors({
        error: getApiErrorMessage(t, err, 'auth.errors.register_failed'),
      });
    } finally {
      setLoading(false);
    }
  }, [
    email,
    password,
    referralCode,
    showReferralCode,
    register,
    applyCredentials,
    t,
  ]);

  // ─── Phone / OTP ──────────────────────────────────────────────────────────

  const handleGetOtp = useCallback(async () => {
    if (!authMethodConfig.phoneOtp) {
      setErrors({ error: t('auth.errors.auth_method_disabled') });
      return;
    }

    if (!phone) {
      setErrors({ phone: t('auth.errors.phone_required') });
      return;
    }
    if (!PHONE_REGEX.test(phone)) {
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
        setErrors({ error: getApiResponseMessage(t, response) });
        return;
      }
      setOtpSent(true);
      clearAllErrors();
    } catch (err) {
      setErrors({
        error: getApiErrorMessage(t, err, 'auth.errors.otp_send_failed'),
      });
    } finally {
      setLoading(false);
    }
  }, [phone, countryCode, sendOtp, clearAllErrors, t]);

  const handleVerifyOtp = useCallback(async () => {
    if (!authMethodConfig.phoneOtp) {
      setErrors({ error: t('auth.errors.auth_method_disabled') });
      return;
    }

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
      const trimmedReferralCode = referralCode.trim();
      const response = await verifyOtp({
        country_code: countryCode,
        phone,
        otp,
        ...(trimmedReferralCode ? { referralCode: trimmedReferralCode } : {}),
      }).unwrap();

      if (!response.success) {
        setErrors({ otp: getApiResponseMessage(t, response) });
        return;
      }
      if (response.data?.accessToken && response.data?.user) {
        await applyCredentials(response.data);
      } else {
        setErrors({ error: t('auth.errors.server_error') });
      }
    } catch (err) {
      setErrors({
        error: getApiErrorMessage(t, err, 'auth.errors.otp_verify_failed'),
      });
    } finally {
      setLoading(false);
    }
  }, [otp, countryCode, phone, referralCode, verifyOtp, applyCredentials, t]);

  // ─── Social ───────────────────────────────────────────────────────────────

  const handleSocialRegister = useCallback(
    async (provider: SocialProvider) => {
      setLoading(true);
      clearAllErrors();
      try {
        if (!isSocialProviderEnabled(provider)) {
          setErrors({ error: t('auth.errors.auth_method_disabled') });
          return;
        }

        if (
          showReferralCode &&
          referralCode.trim() &&
          !/^[a-zA-Z0-9]{6,10}$/.test(referralCode.trim())
        ) {
          setErrors({
            referralCode: 'Enter a valid 6-10 character referral code',
          });
          return;
        }

        const socialProfile = await signInWithProvider(provider);
        const trimmedReferralCode = referralCode.trim();
        const response = await socialLogin({
          ...socialProfile,
          ...(trimmedReferralCode ? { referralCode: trimmedReferralCode } : {}),
        }).unwrap();

        if (!response.success) {
          setErrors({ error: getApiResponseMessage(t, response) });
          return;
        }

        if (response.data?.accessToken && response.data?.user) {
          await applyCredentials(response.data);
        } else {
          setErrors({ error: t('auth.errors.server_error') });
        }
      } catch (error) {
        setErrors({
          error:
            error instanceof Error && error.message
              ? error.message
              : t('auth.errors.social_failed', { provider }),
        });
      } finally {
        setLoading(false);
      }
    },
    [
      applyCredentials,
      clearAllErrors,
      referralCode,
      showReferralCode,
      signInWithProvider,
      socialLogin,
      t,
    ]
  );

  // ─── Input handlers ───────────────────────────────────────────────────────

  const handleEmailChange = useCallback(
    (text: string) => {
      setEmail(text);
      clearError('email');
    },
    [clearError]
  );

  const handlePasswordChange = useCallback(
    (text: string) => {
      setPassword(text);
      clearError('password');
    },
    [clearError]
  );

  const handlePhoneChange = useCallback(
    (text: string) => {
      setPhone(text.replace(/\D/g, '').slice(0, PHONE_MAX_LENGTH));
      clearError('phone');
    },
    [clearError]
  );

  const handleOtpChange = useCallback(
    (text: string) => {
      setOtp(text.replace(/\D/g, '').slice(0, OTP_LENGTH));
      clearError('otp');
    },
    [clearError]
  );

  const handleReferralCodeChange = useCallback(
    (text: string) => {
      setReferralCode(
        text
          .replace(/[^a-zA-Z0-9]/g, '')
          .toUpperCase()
          .slice(0, 10)
      );
      clearError('referralCode');
    },
    [clearError]
  );

  const toggleReferralCode = useCallback(
    () => setShowReferralCode((value) => !value),
    []
  );

  const togglePasswordVisibility = useCallback(
    () => setShowPassword((p) => !p),
    []
  );
  const toggleCountryCodeDropdown = useCallback(
    () => setShowCountryCodeDropdown((p) => !p),
    []
  );
  const closeCountryCodeDropdown = useCallback(
    () => setShowCountryCodeDropdown(false),
    []
  );

  return {
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
    handleResendOtp,
    handleEmailRegister,
    handleGetOtp,
    handleVerifyOtp,
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
  };
}
