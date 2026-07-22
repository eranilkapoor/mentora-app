import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockGoBack = jest.fn();
const mockSetValue = jest.fn();
const mockToggleVisibility = jest.fn();
const mockHandleSubmit = jest.fn();
const mockHandleReset = jest.fn();

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

jest.mock('./components/InfoBanner', () => {
  const { Text } = require('react-native');
  return {
    InfoBanner: ({ infoText }: { infoText: string }) => <Text>{infoText}</Text>,
  };
});

jest.mock('./components/PasswordStrengthBar', () => {
  const { Text } = require('react-native');
  return {
    PasswordStrengthBar: ({ password }: { password: string }) => (
      <Text>{`strength:${password}`}</Text>
    ),
  };
});

jest.mock('./components/PasswordField', () => {
  const { Pressable, Text, TextInput, View } = require('react-native');
  return {
    PasswordField: ({
      label,
      value,
      accessibilityLabel,
      onChangeText,
      onToggleVisibility,
    }: {
      label: string;
      value: string;
      accessibilityLabel: string;
      onChangeText: (text: string) => void;
      onToggleVisibility: () => void;
    }) => (
      <View>
        <Text>{label}</Text>
        <TextInput
          accessibilityLabel={accessibilityLabel}
          value={value}
          onChangeText={onChangeText}
        />
        <Pressable onPress={onToggleVisibility}>
          <Text>{`${accessibilityLabel}:toggle`}</Text>
        </Pressable>
      </View>
    ),
  };
});

jest.mock('./ChangePassword.hooks', () => ({
  useChangePassword: () => ({
    values: {
      oldPassword: 'old-pass',
      newPassword: 'new-pass',
      confirmPassword: 'new-pass',
    },
    errors: {},
    visibility: {
      oldPassword: false,
      newPassword: false,
      confirmPassword: false,
    },
    loading: false,
    setValue: mockSetValue,
    toggleVisibility: mockToggleVisibility,
    handleSubmit: mockHandleSubmit,
    handleReset: mockHandleReset,
  }),
}));

import ChangePasswordScreen from './ChangePassword.screen';

describe('ChangePasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHandleSubmit.mockResolvedValue(undefined);
  });

  it('wires password fields, visibility toggles, submit, and reset', async () => {
    const { getByLabelText, getByText } = await render(
      <ChangePasswordScreen navigation={{ goBack: mockGoBack } as never} />
    );

    await fireEvent.changeText(
      getByLabelText('current-password-input'),
      'old2'
    );
    await fireEvent.changeText(getByLabelText('new-password-input'), 'new2');
    await fireEvent.press(getByText('new-password-input:toggle'));
    await fireEvent.press(getByText('change_password.update'));
    await fireEvent.press(getByText('change_password.reset'));

    expect(mockSetValue).toHaveBeenCalledWith('oldPassword', 'old2');
    expect(mockSetValue).toHaveBeenCalledWith('newPassword', 'new2');
    expect(mockToggleVisibility).toHaveBeenCalledWith('newPassword');
    expect(mockHandleSubmit).toHaveBeenCalled();
    expect(mockHandleReset).toHaveBeenCalled();
    expect(getByText('strength:new-pass')).toBeTruthy();
  });
});
