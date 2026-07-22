import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockNavigate = jest.fn();
const mockDispatch = jest.fn();
const mockVerifyMagicLink = jest.fn();
const mockSetRefreshToken = jest.fn();
const mockSetCredentials = jest.fn((payload: unknown) => ({
  type: 'auth/setCredentials',
  payload,
}));

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

jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('@/store/slices/auth.slice', () => ({
  setCredentials: (payload: unknown) => mockSetCredentials(payload),
}));

jest.mock('@/store/services/baseApi.service', () => ({
  setRefreshToken: (token: string) => mockSetRefreshToken(token),
  baseApi: { util: { resetApiState: () => ({ type: 'api/reset' }) } },
}));

jest.mock('@/store/services/authApi.service', () => ({
  useVerifyMagicLinkMutation: () => [mockVerifyMagicLink],
}));

import MagicLoginScreen from './MagicLogin.screen';

describe('MagicLoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetRefreshToken.mockResolvedValue(undefined);
    mockVerifyMagicLink.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          success: true,
          data: {
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            user: { userId: 'user-1', email: 'asha@example.com' },
          },
        }),
    });
  });

  it('verifies a magic link and stores credentials', async () => {
    const { getByText } = await render(
      <MagicLoginScreen
        navigation={{ navigate: mockNavigate } as never}
        route={{ params: { token: 'magic-token' } } as never}
      />
    );

    await waitFor(() => {
      expect(mockVerifyMagicLink).toHaveBeenCalledWith({
        token: 'magic-token',
      });
      expect(mockSetCredentials).toHaveBeenCalledWith({
        accessToken: 'access-token',
        user: { userId: 'user-1', email: 'asha@example.com' },
      });
      expect(mockSetRefreshToken).toHaveBeenCalledWith('refresh-token');
      expect(getByText('auth.magic_link.success')).toBeTruthy();
    });
  });

  it('routes two factor challenges and handles invalid links', async () => {
    mockVerifyMagicLink.mockReturnValueOnce({
      unwrap: () =>
        Promise.resolve({
          success: true,
          data: {
            requiresTwoFactor: true,
            challengeId: 'challenge-1',
            method: 'sms',
          },
        }),
    });

    await render(
      <MagicLoginScreen
        navigation={{ navigate: mockNavigate } as never}
        route={{ params: { token: 'magic-token' } } as never}
      />
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('TwoFactorChallenge', {
        challengeId: 'challenge-1',
        method: 'sms',
      });
    });

    const { getByText } = await render(
      <MagicLoginScreen
        navigation={{ navigate: mockNavigate } as never}
        route={{ params: {} } as never}
      />
    );

    await waitFor(() => {
      expect(getByText('auth.magic_link.invalid')).toBeTruthy();
    });

    await fireEvent.press(getByText('auth.actions.back_to_sign_in'));
    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });
});
