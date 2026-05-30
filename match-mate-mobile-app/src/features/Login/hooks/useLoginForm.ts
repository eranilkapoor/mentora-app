import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/auth.slice';
import {
  useLoginMutation,
  useSendOtpMutation,
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

export function useLoginForm() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [login] = useLoginMutation();
  const [sendOtp] = useSendOtpMutation();
  const [verifyOtp] = useVerifyOtpMutation();

  // ─── UI state ─────────────────────────────────────────────────────────────

  const [activeTab, setActiveTab] = useState<ActiveTab>('email');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // ─── Email form state ─────────────────────────────────────────────────────

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

  // ─── Email login ──────────────────────────────────────────────────────────

  const handleEmailLogin = useCallback(async () => {
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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await login({
        email: email.trim(),
        password,
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
    } catch (err) {
      setErrors({
        error: getApiErrorMessage(t, err, 'auth.errors.unknown'),
      });
    } finally {
      setLoading(false);
    }
  }, [email, password, login, applyCredentials, t]);

  // ─── Phone / OTP ──────────────────────────────────────────────────────────

  const handleGetOtp = useCallback(async () => {
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
  }, [otp, countryCode, phone, verifyOtp, applyCredentials, t]);

  // ─── Social ───────────────────────────────────────────────────────────────

  const handleSocialLogin = useCallback(
    async (provider: SocialProvider) => {
      setLoading(true);
      clearAllErrors();
      try {
        // TODO: integrate real social SDK
        setErrors({ error: t('auth.errors.social_failed', { provider }) });
      } catch {
        setErrors({ error: t('auth.errors.social_failed', { provider }) });
      } finally {
        setLoading(false);
      }
    },
    [clearAllErrors, t]
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
    handleTabSwitch,
    handleResendOtp,
    handleEmailLogin,
    handleGetOtp,
    handleVerifyOtp,
    handleSocialLogin,
    handleEmailChange,
    handlePasswordChange,
    handlePhoneChange,
    handleOtpChange,
    togglePasswordVisibility,
    toggleCountryCodeDropdown,
    closeCountryCodeDropdown,
    setCountryCode,
  };
}
