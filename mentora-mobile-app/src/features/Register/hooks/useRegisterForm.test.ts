import { act, renderHook } from '@testing-library/react-native';
import { useRegisterForm } from './useRegisterForm';

const mockDispatch = jest.fn();
const mockRegister = jest.fn();
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
  useRegisterMutation: () => [mockRegister],
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

describe('useRegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRegister.mockReturnValue({ unwrap: jest.fn() });
    mockSendOtp.mockReturnValue({ unwrap: jest.fn() });
    mockVerifyOtp.mockReturnValue({ unwrap: jest.fn() });
    mockSocialLogin.mockReturnValue({ unwrap: jest.fn() });
    mockSetRefreshToken.mockResolvedValue(undefined);
  });

  it('validates email registration and normalizes referral/phone/otp input', async () => {
    const { result } = await renderHook(() => useRegisterForm());

    await act(async () => {
      await result.current.handleEmailRegister();
    });

    expect(result.current.errors).toEqual({
      email: 'auth.errors.email_required',
      password: 'auth.errors.password_required',
    });

    await act(async () => {
      result.current.handleEmailChange('bad-email');
      result.current.handlePasswordChange('weak');
      result.current.toggleReferralCode();
      result.current.handleReferralCodeChange('ab-12 cd345678');
      result.current.handlePhoneChange('98a76-54321099');
      result.current.handleOtpChange('12ab345678');
    });

    expect(result.current.referralCode).toBe('AB12CD3456');
    expect(result.current.phone).toBe('9876543210');
    expect(result.current.otp).toBe('123456');

    await act(async () => {
      await result.current.handleEmailRegister();
    });

    expect(result.current.errors.email).toBe('auth.errors.email_invalid');
    expect(result.current.errors.password).toBe('auth.errors.password_min');
  });

  it('registers with email credentials and optional referral code', async () => {
    mockRegister.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        success: true,
        data: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          user: { _id: 'user-1', email: 'user@example.com' },
        },
      }),
    });

    const { result } = await renderHook(() => useRegisterForm());

    await act(async () => {
      result.current.handleEmailChange(' user@example.com ');
      result.current.handlePasswordChange('StrongPassword123!');
      result.current.toggleReferralCode();
      result.current.handleReferralCodeChange('mate99');
    });
    await act(async () => {
      await result.current.handleEmailRegister();
    });

    expect(mockRegister).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'StrongPassword123!',
      referralCode: 'MATE99',
    });
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'api/reset' });
    expect(mockSetCredentials).toHaveBeenCalledWith({
      accessToken: 'access-token',
      user: { _id: 'user-1', email: 'user@example.com' },
    });
    expect(mockSetRefreshToken).toHaveBeenCalledWith('refresh-token');
  });

  it('sends and verifies phone OTP registration', async () => {
    mockSendOtp.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({ success: true }),
    });
    mockVerifyOtp.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        success: true,
        data: {
          accessToken: 'access-token',
          user: { _id: 'user-2' },
        },
      }),
    });

    const { result } = await renderHook(() => useRegisterForm());

    await act(async () => {
      result.current.handleTabSwitch('phone');
      result.current.handlePhoneChange('9876543210');
      result.current.setCountryCode('+91');
      result.current.handleReferralCodeChange('ref123');
    });
    await act(async () => {
      await result.current.handleGetOtp();
    });

    expect(result.current.otpSent).toBe(true);
    expect(mockSendOtp).toHaveBeenCalledWith({
      country_code: '+91',
      phone: '9876543210',
    });

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
      referralCode: 'REF123',
    });
    expect(mockSetCredentials).toHaveBeenCalledWith({
      accessToken: 'access-token',
      user: { _id: 'user-2' },
    });

    await act(async () => {
      result.current.handleResendOtp();
    });
    expect(result.current.otpSent).toBe(false);
  });

  it('registers with social provider and surfaces provider failures', async () => {
    mockSignInWithProvider.mockResolvedValue({
      provider: 'facebook',
      providerId: 'facebook-1',
      email: 'user@example.com',
    });
    mockSocialLogin.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        success: true,
        data: {
          accessToken: 'access-token',
          user: { _id: 'user-3' },
        },
      }),
    });

    const { result } = await renderHook(() => useRegisterForm());

    await act(async () => {
      result.current.toggleReferralCode();
      result.current.handleReferralCodeChange('friend9');
    });
    await act(async () => {
      await result.current.handleSocialRegister('facebook');
    });

    expect(mockSocialLogin).toHaveBeenCalledWith({
      provider: 'facebook',
      providerId: 'facebook-1',
      email: 'user@example.com',
      referralCode: 'FRIEND9',
    });

    mockSignInWithProvider.mockRejectedValueOnce(new Error('Facebook failed'));
    await act(async () => {
      await result.current.handleSocialRegister('facebook');
    });

    expect(result.current.errors.error).toBe('Facebook failed');
  });
});
