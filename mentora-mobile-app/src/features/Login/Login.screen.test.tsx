import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockNavigate = jest.fn();
const mockHandleEmailLogin = jest.fn();
const mockHandleMagicLinkRequest = jest.fn();
const mockHandleSocialLogin = jest.fn();
const mockHandleEmailChange = jest.fn();
const mockHandlePasswordChange = jest.fn();
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
    magicLink: true,
    phoneOtp: false,
    social: { google: true, apple: false, facebook: true },
  },
  hasAnySocialProviderEnabled: () => true,
}));

jest.mock('./components/LoginEmailForm', () => {
  const { Pressable, Text, TextInput, View } = require('react-native');
  return {
    LoginEmailForm: ({
      onEmailChange,
      onPasswordChange,
      onTogglePassword,
      onSubmit,
      onNavigateForgot,
      onRequestMagicLink,
    }: {
      onEmailChange: (value: string) => void;
      onPasswordChange: (value: string) => void;
      onTogglePassword: () => void;
      onSubmit: () => void;
      onNavigateForgot: () => void;
      onRequestMagicLink?: () => void;
    }) => (
      <View>
        <TextInput testID="login-email" onChangeText={onEmailChange} />
        <TextInput testID="login-password" onChangeText={onPasswordChange} />
        <Pressable onPress={onTogglePassword}>
          <Text>toggle-password</Text>
        </Pressable>
        <Pressable onPress={onSubmit}>
          <Text>submit-login</Text>
        </Pressable>
        <Pressable onPress={onNavigateForgot}>
          <Text>forgot-login</Text>
        </Pressable>
        <Pressable onPress={onRequestMagicLink}>
          <Text>magic-link</Text>
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

jest.mock('./hooks/useLoginForm', () => ({
  useLoginForm: () => ({
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
    handleTabSwitch: jest.fn(),
    handleEmailLogin: mockHandleEmailLogin,
    handleMagicLinkRequest: mockHandleMagicLinkRequest,
    handleGetOtp: jest.fn(),
    handleVerifyOtp: jest.fn(),
    handleResendOtp: jest.fn(),
    handleSocialLogin: mockHandleSocialLogin,
    handleEmailChange: mockHandleEmailChange,
    handlePasswordChange: mockHandlePasswordChange,
    handlePhoneChange: jest.fn(),
    handleOtpChange: jest.fn(),
    togglePasswordVisibility: mockTogglePasswordVisibility,
    toggleCountryCodeDropdown: jest.fn(),
    closeCountryCodeDropdown: jest.fn(),
    setCountryCode: jest.fn(),
  }),
}));

import LoginScreen from './Login.screen';

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('wires email login actions and navigation', async () => {
    const { getByText, getByTestId } = await render(
      <LoginScreen navigation={{ navigate: mockNavigate } as never} />
    );

    await fireEvent.changeText(getByTestId('login-email'), 'user@example.com');
    await fireEvent.changeText(getByTestId('login-password'), 'Password123!');
    await fireEvent.press(getByText('toggle-password'));
    await fireEvent.press(getByText('submit-login'));
    await fireEvent.press(getByText('magic-link'));
    await fireEvent.press(getByText('forgot-login'));
    await fireEvent.press(getByText('auth.actions.create_account'));

    expect(mockHandleEmailChange).toHaveBeenCalledWith('user@example.com');
    expect(mockHandlePasswordChange).toHaveBeenCalledWith('Password123!');
    expect(mockTogglePasswordVisibility).toHaveBeenCalled();
    expect(mockHandleEmailLogin).toHaveBeenCalled();
    expect(mockHandleMagicLinkRequest).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenNthCalledWith(1, 'ForgotPassword');
    expect(mockNavigate).toHaveBeenNthCalledWith(2, 'Register');
  });

  it('starts enabled social login providers', async () => {
    const { getByText } = await render(
      <LoginScreen navigation={{ navigate: mockNavigate } as never} />
    );

    await fireEvent.press(getByText('auth.social.google'));
    await fireEvent.press(getByText('auth.social.facebook'));

    expect(mockHandleSocialLogin).toHaveBeenNthCalledWith(1, 'google');
    expect(mockHandleSocialLogin).toHaveBeenNthCalledWith(2, 'facebook');
  });
});
