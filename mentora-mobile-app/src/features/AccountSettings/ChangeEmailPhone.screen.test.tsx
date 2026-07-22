import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockGoBack = jest.fn();
const mockRequestEmailChange = jest.fn();
const mockRequestPhoneChange = jest.fn();
const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();

let mockMode: 'email' | 'phone' = 'email';
let mockEmailLoading = false;
let mockPhoneLoading = false;

jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({ params: { mode: mockMode } }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

jest.mock('@/core/theme/ThemeProvider', () => ({
  useTheme: () => ({
    theme: {
      colors: new Proxy(
        {},
        {
          get: () => '#111827',
        }
      ),
      spacing: new Proxy(
        {},
        {
          get: () => 12,
        }
      ),
      radius: new Proxy(
        {},
        {
          get: () => 8,
        }
      ),
    },
  }),
}));

jest.mock('@/core/theme/useThemedStyles', () => ({
  useThemedStyles: () => ({}),
}));

jest.mock('@/core/components/Header', () => {
  const { Pressable, Text } = require('react-native');
  return {
    __esModule: true,
    default: ({
      title,
      onBackPress,
    }: {
      title: string;
      onBackPress: () => void;
    }) => (
      <Pressable onPress={onBackPress}>
        <Text>{title}</Text>
      </Pressable>
    ),
  };
});

jest.mock('@/core/components/settings/SettingsCard', () => {
  const { Text, View } = require('react-native');
  return {
    SettingsCard: ({
      title,
      children,
    }: {
      title: string;
      children: React.ReactNode;
    }) => (
      <View>
        <Text>{title}</Text>
        {children}
      </View>
    ),
  };
});

jest.mock('@/core/components/settings/SettingsSelectItem', () => {
  const { Pressable, Text } = require('react-native');
  return {
    SettingsSelectItem: ({
      label,
      disabled,
      onPress,
    }: {
      label: string;
      disabled?: boolean;
      onPress: () => void;
    }) => (
      <Pressable disabled={disabled} onPress={onPress}>
        <Text>{label}</Text>
      </Pressable>
    ),
  };
});

jest.mock('@/features/Auth/shared/components/PasswordStrengthHint', () => {
  const { Text } = require('react-native');
  return {
    PasswordStrengthHint: ({ password }: { password: string }) =>
      password ? <Text>password-strength</Text> : null,
  };
});

jest.mock('@/features/Auth/shared/passwordStrength', () => ({
  isPasswordStrongEnough: (password: string) => password.includes('Strong1!'),
}));

jest.mock('@/core/utils/toast', () => ({
  showError: (params: unknown) => mockShowError(params),
  showSuccess: (params: unknown) => mockShowSuccess(params),
}));

jest.mock('@/store/services/accountSettingsApi.service', () => ({
  useRequestEmailChangeMutation: () => [
    mockRequestEmailChange,
    { isLoading: mockEmailLoading },
  ],
  useRequestPhoneChangeMutation: () => [
    mockRequestPhoneChange,
    { isLoading: mockPhoneLoading },
  ],
}));

import ChangeEmailPhoneScreen from './ChangeEmailPhone.screen';

describe('ChangeEmailPhoneScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMode = 'email';
    mockEmailLoading = false;
    mockPhoneLoading = false;
    mockRequestEmailChange.mockReturnValue({
      unwrap: () => Promise.resolve({}),
    });
    mockRequestPhoneChange.mockReturnValue({
      unwrap: () => Promise.resolve({}),
    });
  });

  it('requests email verification with a strong password', async () => {
    const { getAllByDisplayValue, getByPlaceholderText, getByText } =
      await render(
        <ChangeEmailPhoneScreen navigation={{ goBack: mockGoBack } as never} />
      );

    await fireEvent.changeText(
      getByPlaceholderText('name@example.com'),
      'new@example.com'
    );
    await fireEvent.changeText(
      getByPlaceholderText('settings.account.password_placeholder'),
      'Strong1!Password'
    );
    await fireEvent.changeText(
      getByPlaceholderText('settings.account.confirm_password_placeholder'),
      'Strong1!Password'
    );
    await fireEvent.press(getByText('settings.account.send_verification'));

    expect(getAllByDisplayValue('Strong1!Password')).toHaveLength(2);
    await waitFor(() => {
      expect(mockRequestEmailChange).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'Strong1!Password',
      });
      expect(mockShowSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'settings.account.verification_started',
        })
      );
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('requests phone verification with normalized digits', async () => {
    mockMode = 'phone';

    const { getByPlaceholderText, getByText } = await render(
      <ChangeEmailPhoneScreen navigation={{ goBack: mockGoBack } as never} />
    );

    await fireEvent.changeText(
      getByPlaceholderText('9876543210'),
      '987 654 3210'
    );
    await fireEvent.press(getByText('settings.account.send_verification'));

    await waitFor(() => {
      expect(mockRequestPhoneChange).toHaveBeenCalledWith({
        countryCode: '+91',
        phone: '9876543210',
      });
      expect(mockShowSuccess).toHaveBeenCalled();
      expect(mockGoBack).toHaveBeenCalled();
    });
  });
});
