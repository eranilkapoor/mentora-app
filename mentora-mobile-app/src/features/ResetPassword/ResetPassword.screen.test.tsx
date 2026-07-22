import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockNavigate = jest.fn();
const mockExchangeResetCode = jest.fn();
const mockResetPassword = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { min?: number }) =>
      options?.min ? `${key}:${options.min}` : key,
  }),
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

jest.mock('@/features/Auth/shared/components/AuthTextField', () => {
  const { Text, TextInput, View } = require('react-native');
  return {
    AuthTextField: ({
      label,
      value,
      error,
      onChange,
    }: {
      label: string;
      value: string;
      error?: string;
      onChange: (value: string) => void;
    }) => (
      <View>
        <Text>{label}</Text>
        <TextInput testID={label} value={value} onChangeText={onChange} />
        {error ? <Text>{error}</Text> : null}
      </View>
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
  isPasswordStrongEnough: () => true,
}));

jest.mock('@/store/services/authApi.service', () => ({
  useExchangeResetPasswordCodeMutation: () => [mockExchangeResetCode],
  useResetPasswordMutation: () => [mockResetPassword, { isLoading: false }],
}));

import ResetPasswordScreen from './ResetPassword.screen';

describe('ResetPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExchangeResetCode.mockReturnValue({
      unwrap: () =>
        Promise.resolve({ success: true, data: { token: 'reset-token' } }),
    });
    mockResetPassword.mockReturnValue({
      unwrap: () => Promise.resolve({ success: true, data: {} }),
    });
  });

  it('shows invalid-link state when no reset code is available', async () => {
    const { getByText } = await render(
      <ResetPasswordScreen
        navigation={{ navigate: mockNavigate } as never}
        route={{ params: {} }}
      />
    );

    expect(getByText('auth.reset.invalid_link_title')).toBeTruthy();

    await fireEvent.press(getByText('auth.actions.request_new_link'));
    expect(mockNavigate).toHaveBeenCalledWith('ForgotPassword');
  });

  it('shows loading while exchanging a reset code', async () => {
    mockExchangeResetCode.mockReturnValue({
      unwrap: () => new Promise(() => undefined),
    });

    const { getByText, getByTestId } = await render(
      <ResetPasswordScreen
        navigation={{ navigate: mockNavigate } as never}
        route={{ params: { code: 'abc123' } }}
      />
    );

    await waitFor(() => {
      expect(getByText('auth.reset.subtitle')).toBeTruthy();
    });

    expect(mockExchangeResetCode).toHaveBeenCalledWith({ code: 'abc123' });
    expect(() => getByTestId('auth.fields.new_password')).toThrow();
    expect(mockResetPassword).not.toHaveBeenCalled();
  });
});
