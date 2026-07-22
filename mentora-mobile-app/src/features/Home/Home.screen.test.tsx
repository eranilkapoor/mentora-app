import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockNavigate = jest.fn();
const mockParentNavigate = jest.fn();
const mockHandlePrimaryAction = jest.fn();
const mockHandleShortlist = jest.fn();
const mockHandleRefresh = jest.fn();
const mockSetPage = jest.fn();
const mockRefetch = jest.fn();
const mockRefetchMatches = jest.fn();
const mockRefetchShortlisted = jest.fn();
const mockRefetchSentInterests = jest.fn();

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
  const { Pressable, Text, TextInput, View } = require('react-native');
  return {
    __esModule: true,
    default: ({
      title,
      subtitle,
      actions,
      onSearchChange,
    }: {
      title: string;
      subtitle?: string;
      actions?: Array<{ icon: string; badge?: boolean; onPress: () => void }>;
      onSearchChange?: (value: string) => void;
    }) => (
      <View>
        <Text>{title}</Text>
        {subtitle ? <Text>{subtitle}</Text> : null}
        <TextInput testID="home-search" onChangeText={onSearchChange} />
        {actions?.map((action) => (
          <Pressable key={action.icon} onPress={action.onPress}>
            <Text>{action.icon}</Text>
            {action.badge ? <Text>{`${action.icon}-badge`}</Text> : null}
          </Pressable>
        ))}
      </View>
    ),
  };
});

jest.mock('./components/ProfileCard', () => {
  const { Pressable, Text, View } = require('react-native');
  return {
    ProfileCard: ({
      item,
      onPrimaryAction,
      onView,
      onShortlist,
    }: {
      item: { name: string };
      onPrimaryAction: () => void;
      onView: () => void;
      onShortlist: () => void;
    }) => (
      <View>
        <Text>{item.name}</Text>
        <Pressable onPress={onPrimaryAction}>
          <Text>home-primary</Text>
        </Pressable>
        <Pressable onPress={onView}>
          <Text>home-view</Text>
        </Pressable>
        <Pressable onPress={onShortlist}>
          <Text>home-shortlist</Text>
        </Pressable>
      </View>
    ),
  };
});

jest.mock('./components/HomeListHeader', () => {
  const { Pressable, Text } = require('react-native');
  return {
    HomeListHeader: ({
      matchCount,
      onSeeAll,
    }: {
      matchCount: number;
      onSeeAll: () => void;
    }) => (
      <Pressable onPress={onSeeAll}>
        <Text>{`matches:${matchCount}`}</Text>
      </Pressable>
    ),
  };
});

jest.mock('./components/HomeEmpty', () => {
  const { Text } = require('react-native');
  return { HomeEmpty: () => <Text>home-empty</Text> };
});

jest.mock('./hooks/useHomeData', () => ({
  useHomeData: () => ({
    profiles: [
      {
        userId: 'match-1',
        name: 'Asha',
        isMatched: false,
        isShortlisted: false,
        isInterestPending: false,
        shouldBlurPhotos: false,
      },
    ],
    myMatches: { data: [{ id: 'accepted-1' }] },
    isFetching: false,
    page: 1,
    setPage: mockSetPage,
    hasNextPage: true,
    refetch: mockRefetch,
    refetchMatches: mockRefetchMatches,
    refetchShortlisted: mockRefetchShortlisted,
    refetchSentInterests: mockRefetchSentInterests,
  }),
}));

jest.mock('./hooks/useHomeActions', () => ({
  useHomeActions: () => ({
    handlePrimaryAction: mockHandlePrimaryAction,
    handleShortlist: mockHandleShortlist,
    handleRefresh: mockHandleRefresh,
  }),
}));

jest.mock('@/store/services/notificationApi.service', () => ({
  useGetUnreadNotificationCountQuery: () => ({
    data: { success: true, data: { unreadCount: 3 } },
  }),
}));

import HomeScreen from './Home.screen';

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders notification badge and wires profile actions', async () => {
    const navigation = {
      navigate: mockNavigate,
      getParent: () => ({ navigate: mockParentNavigate }),
    };

    const { getByText, getByTestId } = await render(
      <HomeScreen navigation={navigation as never} />
    );

    expect(getByText('bell-badge')).toBeTruthy();
    await fireEvent.press(getByText('bell'));
    await fireEvent.changeText(getByTestId('home-search'), 'asha');
    await fireEvent.press(getByText('matches:1'));
    await fireEvent.press(getByText('home-primary'));
    await fireEvent.press(getByText('home-view'));
    await fireEvent.press(getByText('home-shortlist'));

    expect(mockNavigate).toHaveBeenNthCalledWith(1, 'Notifications');
    expect(mockParentNavigate).toHaveBeenCalledWith('Matches');
    expect(mockHandlePrimaryAction).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'match-1' })
    );
    expect(mockNavigate).toHaveBeenNthCalledWith(2, 'MatchDetails', {
      userId: 'match-1',
    });
    expect(mockHandleShortlist).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'match-1' })
    );
  });
});
