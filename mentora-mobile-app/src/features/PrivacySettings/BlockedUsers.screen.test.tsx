import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockGoBack = jest.fn();
const mockUnblockUser = jest.fn();
const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();

type ConfirmParams = {
  title?: string;
  onConfirm: () => void;
};

const mockShowConfirm: jest.Mock<void, [ConfirmParams]> = jest.fn();

let mockBlockedUsersData: unknown;
let mockBlockedUsersLoading = false;

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
    fontScale: 1,
    accessibility: {},
  }),
}));

jest.mock('@/core/theme/useThemedStyles', () => ({
  useThemedStyles: () => ({}),
}));

jest.mock('@/core/theme/accessibilityStyles', () => ({
  applyAccessibilityToStyles: (styles: unknown) => styles,
}));

jest.mock('@/core/utils/config', () => ({
  resolveApiUrl: (url?: string) => url ?? '',
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

jest.mock('@/store/services/privacySettingsApi.service', () => ({
  useGetBlockedUsersQuery: () => ({
    data: mockBlockedUsersData,
    isLoading: mockBlockedUsersLoading,
  }),
  useUnblockUserMutation: () => [mockUnblockUser],
}));

import BlockedUsersScreen from './BlockedUsers.screen';

describe('BlockedUsersScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBlockedUsersLoading = false;
    mockBlockedUsersData = {
      blockedUsers: [
        {
          userId: 'blocked-1',
          name: 'Blocked User',
          age: 31,
          location: 'Delhi',
        },
      ],
    };
    mockUnblockUser.mockReturnValue({
      unwrap: () => Promise.resolve({}),
    });
  });

  it('renders blocked users and confirms unblocking', async () => {
    const { getByText } = await render(
      <BlockedUsersScreen navigation={{ goBack: mockGoBack } as never} />
    );

    await fireEvent.press(getByText('settings.blocked_users_screen.unblock'));

    expect(getByText('Blocked User')).toBeTruthy();
    expect(mockShowConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'settings.blocked_users_screen.unblock_title',
      })
    );

    mockShowConfirm.mock.calls[0]?.[0].onConfirm();
    await waitFor(() => {
      expect(mockUnblockUser).toHaveBeenCalledWith({
        targetUserId: 'blocked-1',
      });
      expect(mockShowSuccess).toHaveBeenCalledWith({
        title: 'settings.blocked_users_screen.unblocked_title',
      });
    });
  });

  it('renders empty state', async () => {
    mockBlockedUsersData = { blockedUsers: [] };

    const { getByText } = await render(
      <BlockedUsersScreen navigation={{ goBack: mockGoBack } as never} />
    );

    expect(getByText('settings.blocked_users_screen.empty_title')).toBeTruthy();
  });
});
