import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
const mockMarkNotificationRead = jest.fn();
const mockMarkAllNotificationsRead = jest.fn();
const mockNavigateFromNotificationAction = jest.fn();
const mockNotificationResponse = {
  success: true,
  data: {
    items: [
      {
        _id: 'notif-1',
        title: 'New match',
        message: 'Asha liked you',
        category: 'match',
        type: 'info',
        createdAt: '2026-07-21T10:00:00.000Z',
        isRead: false,
        actorId: 'match-1',
        actorName: 'Asha',
      },
    ],
    hasNextPage: false,
  },
};
const mockUnreadNotificationResponse = {
  success: true,
  data: { unreadCount: 1 },
};

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) =>
      options?.count !== undefined ? `${key}:${options.count}` : key,
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

jest.mock('@/core/components/Header', () => {
  const { Pressable, Text, View } = require('react-native');
  return {
    __esModule: true,
    default: ({
      title,
      subtitle,
      onBackPress,
      actions,
    }: {
      title: string;
      subtitle?: string;
      onBackPress?: () => void;
      actions?: Array<{
        icon: string;
        accessibilityLabel?: string;
        onPress: () => void;
      }>;
    }) => (
      <View>
        <Pressable onPress={onBackPress}>
          <Text>{title}</Text>
        </Pressable>
        {subtitle ? <Text>{subtitle}</Text> : null}
        {actions?.map((action) => (
          <Pressable key={action.icon} onPress={action.onPress}>
            <Text>{action.accessibilityLabel ?? action.icon}</Text>
          </Pressable>
        ))}
      </View>
    ),
  };
});

jest.mock('./components/EmptyState', () => {
  const { Text } = require('react-native');
  return { EmptyState: () => <Text>notifications-empty</Text> };
});

jest.mock('./components/NotifItem', () => {
  const { Pressable, Text } = require('react-native');
  return {
    NotifItem: ({
      item,
      onPress,
    }: {
      item: { title: string };
      onPress: (item: unknown) => void;
    }) => (
      <Pressable onPress={() => onPress(item)}>
        <Text>{item.title}</Text>
      </Pressable>
    ),
  };
});

jest.mock('./notificationNavigation', () => ({
  navigateFromNotificationAction: (...args: unknown[]) =>
    mockNavigateFromNotificationAction(...args),
}));

jest.mock('./Notifications.constants', () => ({
  notificationIconByCategory: { match: 'heart' },
  notificationColorByType: () => '#111827',
}));

jest.mock('@/store/services/notificationApi.service', () => ({
  useGetNotificationsQuery: () => ({
    data: mockNotificationResponse,
    isLoading: false,
    isFetching: false,
    refetch: jest.fn(),
  }),
  useGetUnreadNotificationCountQuery: () => ({
    data: mockUnreadNotificationResponse,
    refetch: jest.fn(),
  }),
  useMarkNotificationReadMutation: () => [mockMarkNotificationRead],
  useMarkAllNotificationsReadMutation: () => [
    mockMarkAllNotificationsRead,
    { isLoading: false },
  ],
}));

import NotificationsScreen from './Notifications.screen';

describe('NotificationsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigateFromNotificationAction.mockReturnValue(false);
    mockMarkNotificationRead.mockReturnValue({
      unwrap: () => Promise.resolve({ success: true }),
    });
    mockMarkAllNotificationsRead.mockReturnValue({
      unwrap: () => Promise.resolve({ success: true }),
    });
  });

  it('marks notifications read and opens detail fallback', async () => {
    const { getByText } = await render(
      <NotificationsScreen
        navigation={{ goBack: mockGoBack, navigate: mockNavigate } as never}
      />
    );

    expect(getByText('notifications.unread_count:1')).toBeTruthy();
    await waitFor(() => {
      expect(getByText('New match')).toBeTruthy();
    });
    await fireEvent.press(getByText('notifications.title'));
    await fireEvent.press(getByText('New match'));
    await fireEvent.press(getByText('notifications.mark_all_read'));

    expect(mockGoBack).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockMarkAllNotificationsRead).toHaveBeenCalled();
    });
    expect(mockMarkNotificationRead).toHaveBeenCalledWith({ id: 'notif-1' });
    expect(mockNavigate).toHaveBeenCalledWith(
      'NotificationDetail',
      expect.objectContaining({ id: 'notif-1', title: 'New match' })
    );
  });
});
