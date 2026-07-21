import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockNavigate = jest.fn();
const mockHandleSocialLogin = jest.fn();

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

jest.mock('@/features/Auth/shared/authMethodConfig', () => ({
  authMethodConfig: {
    social: { google: true, apple: false, facebook: true },
  },
}));

jest.mock('@/features/Auth/shared/components/SocialButton', () => {
  const { Pressable, Text } = require('react-native');
  return {
    SocialButton: ({
      label,
      onPress,
      disabled,
    }: {
      label: string;
      onPress: () => void;
      disabled?: boolean;
    }) => (
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
      >
        <Text>{label}</Text>
      </Pressable>
    ),
  };
});

jest.mock('@/features/Login/hooks/useLoginForm', () => ({
  useLoginForm: () => ({
    loading: false,
    errors: {},
    handleSocialLogin: mockHandleSocialLogin,
  }),
}));

import WelcomeScreen from './Welcome.screen';

describe('WelcomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to register, login, and legal pages', async () => {
    const { getByText } = await render(
      <WelcomeScreen
        navigation={{ navigate: mockNavigate } as never}
        route={{} as never}
      />
    );

    await fireEvent.press(getByText('auth.actions.create_account'));
    await fireEvent.press(getByText('auth.actions.sign_in'));
    await fireEvent.press(getByText('auth.welcome.terms'));
    await fireEvent.press(getByText('auth.welcome.privacy'));

    expect(mockNavigate).toHaveBeenNthCalledWith(1, 'Register');
    expect(mockNavigate).toHaveBeenNthCalledWith(2, 'Login');
    expect(mockNavigate).toHaveBeenNthCalledWith(3, 'TermsConditions');
    expect(mockNavigate).toHaveBeenNthCalledWith(4, 'PrivacyPolicy');
  });
});
