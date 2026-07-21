import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockGoBack = jest.fn();
const mockForgotPassword = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { email?: string; returnObjects?: boolean }) => {
      if (options?.returnObjects) {
        return ['tip one', 'tip two'];
      }
      return options?.email ? `${key}:${options.email}` : key;
    },
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

jest.mock('./components/ForgotPasswordInfoCard', () => {
  const { Text } = require('react-native');
  return {
    ForgotPasswordInfoCard: () => <Text>forgot-password-info</Text>,
  };
});

jest.mock('./components/ForgotPasswordSuccess', () => {
  const { Pressable, Text, View } = require('react-native');
  return {
    ForgotPasswordSuccess: ({
      email,
      onBack,
      onResend,
    }: {
      email: string;
      onBack: () => void;
      onResend: () => void;
    }) => (
      <View>
        <Text>auth.forgot.success_title</Text>
        <Text>{email}</Text>
        <Pressable onPress={onBack}>
          <Text>auth.actions.back_to_sign_in</Text>
        </Pressable>
        <Pressable onPress={onResend}>
          <Text>auth.actions.resend_reset_link</Text>
        </Pressable>
      </View>
    ),
  };
});

jest.mock('@/store/services/authApi.service', () => ({
  useForgotPasswordMutation: () => [mockForgotPassword, { isLoading: false }],
}));

import ForgotPasswordScreen from './ForgotPassword.screen';

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockForgotPassword.mockReturnValue({
      unwrap: () => Promise.resolve({ success: true }),
    });
  });

  it('validates email before requesting a reset link', async () => {
    const { getByText } = await render(
      <ForgotPasswordScreen navigation={{ goBack: mockGoBack } as never} />
    );

    await fireEvent.press(getByText('auth.actions.send_reset_link'));

    expect(getByText('auth.errors.email_required')).toBeTruthy();
    expect(mockForgotPassword).not.toHaveBeenCalled();
  });

  it('requests a reset link and renders success actions', async () => {
    const { getByText, getByTestId } = await render(
      <ForgotPasswordScreen navigation={{ goBack: mockGoBack } as never} />
    );

    await fireEvent.changeText(
      getByTestId('auth.fields.email'),
      'user@example.com'
    );
    await fireEvent.press(getByText('auth.actions.send_reset_link'));

    await waitFor(() => {
      expect(getByText('auth.forgot.success_title')).toBeTruthy();
    });
    expect(mockForgotPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
    });

    await fireEvent.press(getByText('auth.actions.back_to_sign_in'));
    expect(mockGoBack).toHaveBeenCalled();
  });
});
