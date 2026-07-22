import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockGoBack = jest.fn();
const mockRefetch = jest.fn();
const mockLogoutSession = jest.fn();
const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();
let mockSessions: unknown;
let mockLoading = false;

type ConfirmParams = {
  onConfirm: () => void;
  title?: string;
  destructive?: boolean;
};

const mockShowConfirm: jest.Mock<void, [ConfirmParams]> = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

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
      subtitle,
      children,
    }: {
      title: string;
      subtitle?: string;
      children: React.ReactNode;
    }) => (
      <View>
        <Text>{title}</Text>
        {subtitle ? <Text>{subtitle}</Text> : null}
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
      sublabel,
      value,
      disabled,
      onPress,
    }: {
      label: string;
      sublabel?: string;
      value?: string;
      disabled?: boolean;
      onPress: () => void;
    }) => (
      <Pressable disabled={disabled} onPress={onPress}>
        <Text>{label}</Text>
        {sublabel ? <Text>{sublabel}</Text> : null}
        {value ? <Text>{value}</Text> : null}
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

jest.mock('@/store/services/authApi.service', () => ({
  useGetSessionsQuery: () => ({
    data: mockSessions,
    isLoading: mockLoading,
    refetch: mockRefetch,
  }),
  useLogoutSessionMutation: () => [mockLogoutSession],
}));

import ManageDevicesScreen from './ManageDevices.screen';

describe('ManageDevicesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoading = false;
    mockLogoutSession.mockReturnValue({ unwrap: () => Promise.resolve({}) });
    mockSessions = {
      success: true,
      data: {
        sessions: [
          {
            sessionId: 'session-1',
            deviceName: 'Pixel 8',
            platform: 'android',
            ipAddress: '10.0.0.2',
            lastActive: '2026-07-21T10:00:00.000Z',
          },
        ],
      },
    };
  });

  it('shows a loader while sessions are loading', async () => {
    mockLoading = true;

    const { getByText } = await render(
      <ManageDevicesScreen navigation={{ goBack: mockGoBack } as never} />
    );

    expect(getByText('loader')).toBeTruthy();
  });

  it('renders active devices and confirms session revocation', async () => {
    const { getByText } = await render(
      <ManageDevicesScreen navigation={{ goBack: mockGoBack } as never} />
    );

    await fireEvent.press(getByText('Pixel 8'));

    expect(mockShowConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'settings.security.sign_out_device_title',
        destructive: true,
      })
    );

    const confirmParams = mockShowConfirm.mock.calls[0]?.[0] as ConfirmParams;
    confirmParams.onConfirm();
    await Promise.resolve();

    expect(mockLogoutSession).toHaveBeenCalledWith({ sessionId: 'session-1' });
    expect(mockShowSuccess).toHaveBeenCalledWith({
      title: 'settings.security.device_signed_out',
    });
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('renders the empty device state', async () => {
    mockSessions = { success: true, data: { sessions: [] } };

    const { getByText } = await render(
      <ManageDevicesScreen navigation={{ goBack: mockGoBack } as never} />
    );

    expect(getByText('settings.security.no_active_devices')).toBeTruthy();
  });
});
