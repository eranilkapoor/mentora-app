import { act, renderHook } from '@testing-library/react-native';
import { useLoginForm } from './useLoginForm';

const mockDispatch = jest.fn();
const mockLogin = jest.fn();
const mockRequestMagicLink = jest.fn();
const mockSendOtp = jest.fn();
const mockVerifyOtp = jest.fn();
const mockSocialLogin = jest.fn();
const mockSignInWithProvider = jest.fn();
const mockSetRefreshToken = jest.fn();
const mockResetApiState = jest.fn(() => ({ type: 'api/reset' }));
const mockSetCredentials = jest.fn((payload: unknown) => ({
  type: 'auth/setCredentials',
  payload,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('@/store/slices/auth.slice', () => ({
  setCredentials: (payload: unknown) => mockSetCredentials(payload),
}));

jest.mock('@/store/services/baseApi.service', () => ({
  setRefreshToken: (token: string) => mockSetRefreshToken(token),
  baseApi: {
    util: {
      resetApiState: () => mockResetApiState(),
    },
  },
}));

jest.mock('@/store/services/authApi.service', () => ({
  useLoginMutation: () => [mockLogin],
  useRequestMagicLinkMutation: () => [mockRequestMagicLink],
  useSendOtpMutation: () => [mockSendOtp],
  useVerifyOtpMutation: () => [mockVerifyOtp],
  useSocialLoginMutation: () => [mockSocialLogin],
}));

jest.mock('@/features/Auth/shared/useSocialAuth', () => ({
  useSocialAuth: () => ({ signInWithProvider: mockSignInWithProvider }),
}));

jest.mock('@/features/Auth/shared/authMethodConfig', () => ({
  authMethodConfig: {
    emailPassword: true,
    phoneOtp: true,
    magicLink: true,
    biometric: false,
    social: {
      google: true,
      facebook: true,
      apple: false,
    },
  },
  isSocialProviderEnabled: (provider: string) =>
    provider === 'google' || provider === 'facebook',
}));

describe('useLoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogin.mockReturnValue({ unwrap: jest.fn() });
    mockRequestMagicLink.mockReturnValue({ unwrap: jest.fn() });
    mockSendOtp.mockReturnValue({ unwrap: jest.fn() });
    mockVerifyOtp.mockReturnValue({ unwrap: jest.fn() });
    mockSocialLogin.mockReturnValue({ unwrap: jest.fn() });
    mockSetRefreshToken.mockResolvedValue(undefined);
  });

  it('validates email login fields and sanitizes phone/otp input', async () => {
    const { result } = await renderHook(() => useLoginForm());

    await act(async () => {
      await result.current.handleEmailLogin();
    });

    expect(result.current.errors).toEqual({
      email: 'auth.errors.email_required',
      password: 'auth.errors.password_required',
    });

    await act(async () => {
      result.current.handleEmailChange('bad-email');
      result.current.handlePasswordChange('secret');
    });
    await act(async () => {
      await result.current.handleEmailLogin();
    });

    expect(result.current.errors.email).toBe('auth.errors.email_invalid');

    await act(async () => {
      result.current.handlePhoneChange('98a76-54321099');
      result.current.handleOtpChange('12ab345678');
      result.current.togglePasswordVisibility();
      result.current.toggleCountryCodeDropdown();
      result.current.closeCountryCodeDropdown();
    });

    expect(result.current.phone).toBe('9876543210');
    expect(result.current.otp).toBe('123456');
    expect(result.current.showPassword).toBe(true);
    expect(result.current.showCountryCodeDropdown).toBe(false);
  });

  it('applies credentials after successful email login and requests magic link', async () => {
    mockLogin.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        success: true,
        data: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          user: { _id: 'user-1', email: 'user@example.com' },
        },
      }),
    });
    mockRequestMagicLink.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({ success: true }),
    });

    const { result } = await renderHook(() => useLoginForm());

    await act(async () => {
      result.current.handleEmailChange(' user@example.com ');
      result.current.handlePasswordChange('Secret123!');
    });
    await act(async () => {
      await result.current.handleEmailLogin();
    });

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'Secret123!',
    });
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'api/reset' });
    expect(mockSetCredentials).toHaveBeenCalledWith({
      accessToken: 'access-token',
      user: { _id: 'user-1', email: 'user@example.com' },
    });
    expect(mockSetRefreshToken).toHaveBeenCalledWith('refresh-token');

    await act(async () => {
      await result.current.handleMagicLinkRequest();
    });

    expect(mockRequestMagicLink).toHaveBeenCalledWith({
      email: 'user@example.com',
    });
    expect(result.current.errors.error).toBe('auth.magic_link.sent');
  });

  it('handles phone OTP flow and two factor challenge', async () => {
    const onTwoFactorRequired = jest.fn();
    mockSendOtp.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({ success: true }),
    });
    mockVerifyOtp.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        success: true,
        data: {
          requiresTwoFactor: true,
          challengeId: 'challenge-1',
          method: 'sms',
        },
      }),
    });

    const { result } = await renderHook(() =>
      useLoginForm(onTwoFactorRequired)
    );

    await act(async () => {
      result.current.handleTabSwitch('phone');
      result.current.handlePhoneChange('9876543210');
      result.current.setCountryCode('+91');
    });
    await act(async () => {
      await result.current.handleGetOtp();
    });

    expect(mockSendOtp).toHaveBeenCalledWith({
      country_code: '+91',
      phone: '9876543210',
    });
    expect(result.current.otpSent).toBe(true);

    await act(async () => {
      result.current.handleOtpChange('123456');
    });
    await act(async () => {
      await result.current.handleVerifyOtp();
    });

    expect(mockVerifyOtp).toHaveBeenCalledWith({
      country_code: '+91',
      phone: '9876543210',
      otp: '123456',
    });
    expect(onTwoFactorRequired).toHaveBeenCalledWith({
      challengeId: 'challenge-1',
      method: 'sms',
    });

    await act(async () => {
      result.current.handleResendOtp();
    });

    expect(result.current.otpSent).toBe(false);
    expect(result.current.otp).toBe('');
  });

  it('logs in with enabled social provider and reports social errors', async () => {
    mockSignInWithProvider.mockResolvedValue({
      provider: 'google',
      providerId: 'google-1',
      email: 'user@example.com',
    });
    mockSocialLogin.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        success: true,
        data: {
          accessToken: 'access-token',
          user: { _id: 'user-1' },
        },
      }),
    });

    const { result } = await renderHook(() => useLoginForm());

    await act(async () => {
      await result.current.handleSocialLogin('google');
    });

    expect(mockSignInWithProvider).toHaveBeenCalledWith('google');
    expect(mockSocialLogin).toHaveBeenCalledWith({
      provider: 'google',
      providerId: 'google-1',
      email: 'user@example.com',
    });
    expect(mockSetCredentials).toHaveBeenCalledWith({
      accessToken: 'access-token',
      user: { _id: 'user-1' },
    });

    mockSignInWithProvider.mockRejectedValueOnce(new Error('Google cancelled'));
    await act(async () => {
      await result.current.handleSocialLogin('google');
    });

    expect(result.current.errors.error).toBe('Google cancelled');
  });
});
