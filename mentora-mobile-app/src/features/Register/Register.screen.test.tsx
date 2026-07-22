import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockNavigate = jest.fn();
const mockHandleEmailRegister = jest.fn();
const mockHandleSocialRegister = jest.fn();
const mockHandleEmailChange = jest.fn();
const mockHandlePasswordChange = jest.fn();
const mockHandleReferralCodeChange = jest.fn();
const mockToggleReferralCode = jest.fn();
const mockTogglePasswordVisibility = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

jest.mock('react-native-vector-icons/Feather', () => {
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

jest.mock('@/core/theme/useThemedStyles', () => ({
  useThemedStyles: () => ({}),
}));

jest.mock('@/core/theme/ThemeProvider', () => ({
  useTheme: () => ({
    theme: {
      colors: new Proxy(
        {},
        {
          get: () => '#111827',
        }
      ),
    },
  }),
}));

jest.mock('../Auth/shared/authMethodConfig', () => ({
  authMethodConfig: {
    phoneOtp: false,
    social: { google: true, apple: false, facebook: true },
  },
  hasAnySocialProviderEnabled: () => true,
}));

jest.mock('./components/RegisterEmailForm', () => {
  const { Pressable, Text, TextInput, View } = require('react-native');
  return {
    RegisterEmailForm: ({
      onEmailChange,
      onPasswordChange,
      onReferralCodeChange,
      onToggleReferralCode,
      onTogglePassword,
      onSubmit,
    }: {
      onEmailChange: (value: string) => void;
      onPasswordChange: (value: string) => void;
      onReferralCodeChange: (value: string) => void;
      onToggleReferralCode: () => void;
      onTogglePassword: () => void;
      onSubmit: () => void;
    }) => (
      <View>
        <TextInput testID="register-email" onChangeText={onEmailChange} />
        <TextInput testID="register-password" onChangeText={onPasswordChange} />
        <TextInput
          testID="register-referral"
          onChangeText={onReferralCodeChange}
        />
        <Pressable onPress={onToggleReferralCode}>
          <Text>toggle-referral</Text>
        </Pressable>
        <Pressable onPress={onTogglePassword}>
          <Text>toggle-password</Text>
        </Pressable>
        <Pressable onPress={onSubmit}>
          <Text>submit-register</Text>
        </Pressable>
      </View>
    ),
  };
});

jest.mock('../Auth/shared/components/SocialButton', () => {
  const { Pressable, Text } = require('react-native');
  return {
    SocialButton: ({
      label,
      onPress,
    }: {
      label: string;
      onPress: () => void;
    }) => (
      <Pressable onPress={onPress}>
        <Text>{label}</Text>
      </Pressable>
    ),
  };
});

jest.mock('./hooks/useRegisterForm', () => ({
  useRegisterForm: () => ({
    activeTab: 'email',
    loading: false,
    errors: {},
    email: '',
    password: '',
    showPassword: false,
    phone: '',
    otp: '',
    otpSent: false,
    countryCode: '91',
    showCountryCodeDropdown: false,
    referralCode: '',
    showReferralCode: false,
    handleTabSwitch: jest.fn(),
    handleEmailRegister: mockHandleEmailRegister,
    handleGetOtp: jest.fn(),
    handleVerifyOtp: jest.fn(),
    handleResendOtp: jest.fn(),
    handleSocialRegister: mockHandleSocialRegister,
    handleEmailChange: mockHandleEmailChange,
    handlePasswordChange: mockHandlePasswordChange,
    handlePhoneChange: jest.fn(),
    handleOtpChange: jest.fn(),
    handleReferralCodeChange: mockHandleReferralCodeChange,
    togglePasswordVisibility: mockTogglePasswordVisibility,
    toggleReferralCode: mockToggleReferralCode,
    toggleCountryCodeDropdown: jest.fn(),
    closeCountryCodeDropdown: jest.fn(),
    setCountryCode: jest.fn(),
  }),
}));

import RegisterScreen from './Register.screen';

describe('RegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('wires email registration actions and navigation', async () => {
    const { getByText, getByTestId } = await render(
      <RegisterScreen navigation={{ navigate: mockNavigate } as never} />
    );

    await fireEvent.changeText(
      getByTestId('register-email'),
      'new@example.com'
    );
    await fireEvent.changeText(
      getByTestId('register-password'),
      'Password123!'
    );
    await fireEvent.changeText(getByTestId('register-referral'), 'FRIEND');
    await fireEvent.press(getByText('toggle-referral'));
    await fireEvent.press(getByText('toggle-password'));
    await fireEvent.press(getByText('submit-register'));
    await fireEvent.press(getByText('auth.actions.sign_in'));

    expect(mockHandleEmailChange).toHaveBeenCalledWith('new@example.com');
    expect(mockHandlePasswordChange).toHaveBeenCalledWith('Password123!');
    expect(mockHandleReferralCodeChange).toHaveBeenCalledWith('FRIEND');
    expect(mockToggleReferralCode).toHaveBeenCalled();
    expect(mockTogglePasswordVisibility).toHaveBeenCalled();
    expect(mockHandleEmailRegister).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });

  it('starts enabled social registration providers', async () => {
    const { getByText } = await render(
      <RegisterScreen navigation={{ navigate: mockNavigate } as never} />
    );

    await fireEvent.press(getByText('auth.social.google'));
    await fireEvent.press(getByText('auth.social.facebook'));

    expect(mockHandleSocialRegister).toHaveBeenNthCalledWith(1, 'google');
    expect(mockHandleSocialRegister).toHaveBeenNthCalledWith(2, 'facebook');
  });
});
