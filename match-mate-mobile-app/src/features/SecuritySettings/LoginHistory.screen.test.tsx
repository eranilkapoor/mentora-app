import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockGoBack = jest.fn();
const mockRefetch = jest.fn();
const mockRevokeSession = jest.fn();
const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();

type ConfirmParams = {
  title?: string;
  destructive?: boolean;
  onConfirm: () => void;
};

const mockShowConfirm: jest.Mock<void, [ConfirmParams]> = jest.fn();

let mockLoginHistoryData: unknown;
let mockLoginHistoryLoading = false;

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

jest.mock('@/core/components/Loader', () => {
  const { Text } = require('react-native');
  return { __esModule: true, default: () => <Text>loader</Text> };
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

jest.mock('@/core/utils/confirm', () => ({
  showConfirm: (params: ConfirmParams) => mockShowConfirm(params),
}));

jest.mock('@/core/utils/toast', () => ({
  showError: (params: unknown) => mockShowError(params),
  showSuccess: (params: unknown) => mockShowSuccess(params),
}));

jest.mock('@/store/services/securitySettingsApi.service', () => ({
  useGetLoginHistoryQuery: () => ({
    data: mockLoginHistoryData,
    isLoading: mockLoginHistoryLoading,
    refetch: mockRefetch,
  }),
  useRevokeSessionMutation: () => [mockRevokeSession],
}));

import LoginHistoryScreen from './LoginHistory.screen';

describe('LoginHistoryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoginHistoryLoading = false;
    mockLoginHistoryData = {
      sessions: [
        {
          sessionId: 'session-1',
          userAgent: 'Android Chrome',
          ip: '10.0.0.5',
          isActive: true,
          status: 'active',
          signedInAt: '2026-07-21T10:00:00.000Z',
        },
      ],
      timeline: [
        {
          id: 'activity-1',
          action: 'LOGIN',
          device: 'Pixel',
          ip: '10.0.0.5',
          createdAt: '2026-07-21T10:00:00.000Z',
        },
      ],
    };
    mockRevokeSession.mockReturnValue({
      unwrap: () => Promise.resolve({}),
    });
  });

  it('renders login history, refreshes, and confirms session revocation', async () => {
    const { getByText } = await render(
      <LoginHistoryScreen navigation={{ goBack: mockGoBack } as never} />
    );

    await fireEvent.press(getByText('settings.security.login_history_title'));
    await fireEvent.press(getByText('settings.security.refresh_history'));
    await fireEvent.press(getByText('settings.security.sign_out_this_session'));

    expect(mockGoBack).toHaveBeenCalled();
    expect(mockRefetch).toHaveBeenCalled();
    expect(mockShowConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'settings.security.sign_out_session_title',
        destructive: true,
      })
    );

    mockShowConfirm.mock.calls[0]?.[0].onConfirm();
    await waitFor(() => {
      expect(mockRevokeSession).toHaveBeenCalledWith({
        sessionId: 'session-1',
      });
      expect(mockShowSuccess).toHaveBeenCalledWith({
        title: 'settings.security.session_signed_out',
      });
    });
  });

  it('renders empty history states', async () => {
    mockLoginHistoryData = { sessions: [], timeline: [] };

    const { getByText } = await render(
      <LoginHistoryScreen navigation={{ goBack: mockGoBack } as never} />
    );

    expect(getByText('settings.security.no_login_history')).toBeTruthy();
    expect(getByText('settings.security.no_security_activity')).toBeTruthy();
  });
});
