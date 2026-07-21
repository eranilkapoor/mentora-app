import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockDispatch = jest.fn();
const mockUpdateSecuritySettings = jest.fn();
const mockLogoutAll = jest.fn();
const mockClearRefreshToken = jest.fn();
const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();

type ConfirmParams = {
  title?: string;
  destructive?: boolean;
  onConfirm: () => void;
};

const mockShowConfirm: jest.Mock<void, [ConfirmParams]> = jest.fn();

let mockSecurityData: unknown;
let mockSecurityLoading = false;
let mockSessionsData: unknown;

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(() => Promise.resolve(true)),
  isEnrolledAsync: jest.fn(() => Promise.resolve(true)),
  authenticateAsync: jest.fn(() => Promise.resolve({ success: true })),
}));

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

jest.mock('@/features/Auth/shared/authMethodConfig', () => ({
  authMethodConfig: { biometric: true },
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

jest.mock('@/core/components/settings/SettingsToggleItem', () => {
  const { Pressable, Text } = require('react-native');
  return {
    SettingsToggleItem: ({
      label,
      onChange,
      value,
    }: {
      label: string;
      onChange: (value: boolean) => void;
      value?: boolean;
    }) => (
      <Pressable onPress={() => onChange(!(value ?? false))}>
        <Text>{label}</Text>
      </Pressable>
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
      onPress,
    }: {
      label: string;
      sublabel?: string;
      value?: string;
      onPress: () => void;
    }) => (
      <Pressable onPress={onPress}>
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

jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('@/store/slices/auth.slice', () => ({
  logout: () => ({ type: 'auth/logout' }),
}));

jest.mock('@/store/services/baseApi.service', () => ({
  clearRefreshToken: () => mockClearRefreshToken(),
  baseApi: { util: { resetApiState: () => ({ type: 'api/reset' }) } },
}));

jest.mock('@/store/services/securitySettingsApi.service', () => ({
  useGetSecuritySettingsQuery: () => ({
    data: mockSecurityData,
    isLoading: mockSecurityLoading,
  }),
  useUpdateSecuritySettingsMutation: () => [mockUpdateSecuritySettings],
}));

jest.mock('@/store/services/authApi.service', () => ({
  useGetSessionsQuery: () => ({ data: mockSessionsData }),
  useLogoutAllMutation: () => [mockLogoutAll],
}));

import SecuritySettingsScreen from './SecuritySettings.screen';

describe('SecuritySettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSecurityLoading = false;
    mockSecurityData = {
      security: {
        twoFactorEnabled: false,
        twoFactorMethod: 'none',
        biometricEnabled: false,
        suspiciousLoginAlerts: true,
        loginNotifications: true,
        loginDevices: [{ deviceId: 'local-device' }],
      },
    };
    mockSessionsData = {
      success: true,
      data: { sessions: [{ sessionId: 'one' }, { sessionId: 'two' }] },
    };
    mockUpdateSecuritySettings.mockReturnValue({
      unwrap: () => Promise.resolve({}),
    });
    mockLogoutAll.mockReturnValue({ then: (cb: () => void) => cb() });
    mockClearRefreshToken.mockResolvedValue(undefined);
  });

  it('navigates security detail screens and shows active device count', async () => {
    const { getByText } = await render(
      <SecuritySettingsScreen
        navigation={{ navigate: mockNavigate, goBack: mockGoBack } as never}
      />
    );

    await fireEvent.press(getByText('settings.security.title'));
    await fireEvent.press(getByText('settings.security.two_factor'));
    await fireEvent.press(getByText('settings.security.login_history_title'));
    await fireEvent.press(getByText('settings.security.manage_devices'));

    expect(mockGoBack).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('TwoFactorSetup');
    expect(mockNavigate).toHaveBeenCalledWith('LoginHistory');
    expect(mockNavigate).toHaveBeenCalledWith('ManageDevices');
    expect(getByText('settings.security.manage_devices_sub')).toBeTruthy();
  });

  it('updates security toggles and confirms revoke all devices', async () => {
    const { getByText } = await render(
      <SecuritySettingsScreen
        navigation={{ navigate: mockNavigate, goBack: mockGoBack } as never}
      />
    );

    await fireEvent.press(getByText('settings.security.login_notifications'));
    await fireEvent.press(getByText('settings.security.revoke_all'));

    await waitFor(() => {
      expect(mockUpdateSecuritySettings).toHaveBeenCalledWith({
        loginNotifications: false,
      });
    });
    expect(mockShowConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'settings.security.revoke_all_title',
        destructive: true,
      })
    );

    mockShowConfirm.mock.calls[0]?.[0].onConfirm();
    await waitFor(() => {
      expect(mockLogoutAll).toHaveBeenCalled();
      expect(mockShowSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'settings.security.revoke_all_success',
        })
      );
    });
  });
});
