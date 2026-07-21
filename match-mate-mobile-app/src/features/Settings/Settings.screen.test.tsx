import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockReset = jest.fn();
const mockDispatch = jest.fn();
const mockLogoutMutation = jest.fn();
const mockClearRefreshToken = jest.fn();
const mockShowConfirm = jest.fn();
const mockShowSuccess = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, reset: mockReset }),
}));

jest.mock('expo-constants', () => ({
  expoConfig: { version: '9.9.9' },
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

jest.mock('@/core/components/Header', () => {
  const { Pressable, Text, View } = require('react-native');
  return {
    __esModule: true,
    default: ({
      title,
      onBackPress,
    }: {
      title: string;
      onBackPress?: () => void;
    }) => (
      <View>
        <Pressable onPress={onBackPress}>
          <Text>{title}</Text>
        </Pressable>
      </View>
    ),
  };
});

jest.mock('./components/Section', () => {
  const { Text, View } = require('react-native');
  return {
    Section: ({
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

jest.mock('./components/SettingRow', () => {
  const { Pressable, Text } = require('react-native');
  return {
    SettingRow: ({
      label,
      subLabel,
      onPress,
    }: {
      label: string;
      subLabel?: string;
      onPress: () => void;
    }) => (
      <Pressable onPress={onPress}>
        <Text>{label}</Text>
        {subLabel ? <Text>{subLabel}</Text> : null}
      </Pressable>
    ),
  };
});

jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      auth: {
        user: {
          userId: 'user-1',
          firstName: 'Asha',
          lastName: 'Sharma',
          email: 'asha@example.com',
        },
      },
    }),
}));

jest.mock('@/store/slices/auth.slice', () => ({
  logout: () => ({ type: 'auth/logout' }),
}));

jest.mock('@/store/services/authApi.service', () => ({
  useLogoutMutation: () => [mockLogoutMutation, { isLoading: false }],
}));

jest.mock('@/store/services/baseApi.service', () => ({
  clearRefreshToken: () => mockClearRefreshToken(),
  baseApi: { util: { resetApiState: () => ({ type: 'api/reset' }) } },
}));

jest.mock('@/store/services/profileApi.service', () => ({
  useGetMyProfileQuery: () => ({
    data: {
      success: true,
      data: { profileCompletionPercentage: 84 },
    },
  }),
}));

jest.mock('@/core/utils/confirm', () => ({
  showConfirm: (params: unknown) => mockShowConfirm(params),
}));

jest.mock('@/core/utils/toast', () => ({
  showSuccess: (params: unknown) => mockShowSuccess(params),
}));

import SettingsScreen from './Settings.screen';

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogoutMutation.mockReturnValue({
      unwrap: () => Promise.resolve({ success: true }),
    });
    mockClearRefreshToken.mockResolvedValue(undefined);
  });

  it('navigates settings rows and confirms sign out', async () => {
    const { getByText } = await render(
      <SettingsScreen
        navigation={{ navigate: mockNavigate, goBack: mockGoBack } as never}
      />
    );

    await fireEvent.press(getByText('settings.title'));
    await fireEvent.press(getByText('settings.edit_profile'));
    await fireEvent.press(getByText('settings.account_settings'));
    await fireEvent.press(getByText('settings.notification_settings.title'));
    await fireEvent.press(getByText('settings.sign_out'));

    expect(mockGoBack).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('EditProfile');
    expect(mockNavigate).toHaveBeenCalledWith('AccountSettings');
    expect(mockNavigate).toHaveBeenCalledWith('NotificationSettings');
    expect(mockShowConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'settings.sign_out',
        destructive: true,
      })
    );

    expect(mockShowSuccess).not.toHaveBeenCalled();
    expect(mockReset).not.toHaveBeenCalled();
  });
});
