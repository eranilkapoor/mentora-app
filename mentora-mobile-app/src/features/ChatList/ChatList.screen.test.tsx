import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockNavigate = jest.fn();
const mockParentNavigate = jest.fn();
const mockDispatch = jest.fn();
const mockUpdateRoomSettings = jest.fn();
const mockRespondChatRequest = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => callback(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number; filter?: string }) =>
      options?.count !== undefined
        ? `${key}:${options.count}`
        : options?.filter
          ? `${key}:${options.filter}`
          : key,
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
  const { Text, TextInput, View } = require('react-native');
  return {
    __esModule: true,
    default: ({
      title,
      subtitle,
      onSearchChange,
    }: {
      title: string;
      subtitle?: string;
      onSearchChange?: (value: string) => void;
    }) => (
      <View>
        <Text>{title}</Text>
        {subtitle ? <Text>{subtitle}</Text> : null}
        <TextInput testID="chat-list-search" onChangeText={onSearchChange} />
      </View>
    ),
  };
});

jest.mock('@/core/utils/config', () => ({
  resolveApiUrl: (url: string) => `api:${url}`,
}));

jest.mock('@/core/utils/toast', () => ({ showError: jest.fn() }));

jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ auth: { user: { userId: 'me' } } }),
}));

jest.mock('@/store/slices/chats.slice', () => ({
  setUnreadCount: (count: number) => ({ type: 'chats/setUnreadCount', count }),
}));

jest.mock('@/core/realtime/realtime.service', () => ({
  REALTIME_CONVERSATION_UPDATED_EVENT: 'conversation-updated',
  REALTIME_TYPING_EVENT: 'typing',
}));

const conversation = {
  roomId: 'room-1',
  status: 'ACTIVE',
  requestedById: 'match-1',
  participant: {
    userId: 'match-1',
    fullName: 'Asha Sharma',
    avatarUrl: '/asha.jpg',
    city: 'Delhi',
    country: 'India',
    isOnline: true,
  },
  lastMessage: {
    text: 'Hello',
    senderId: 'match-1',
    status: 'DELIVERED',
    deliveredAt: '2026-07-21T10:00:00.000Z',
  },
  unreadCount: 2,
  updatedAt: '2026-07-21T10:00:00.000Z',
  settings: { pinned: false, archived: false },
};
const mockConversationResponse = {
  success: true,
  data: { items: [conversation], unreadTotal: 2, hasMore: false },
};

jest.mock('@/store/services/chatApi.service', () => ({
  useGetConversationsQuery: () => ({
    data: mockConversationResponse,
    isLoading: false,
    isFetching: false,
    refetch: jest.fn(),
  }),
  useUpdateRoomSettingsMutation: () => [
    mockUpdateRoomSettings,
    { isLoading: false },
  ],
  useRespondChatRequestMutation: () => [
    mockRespondChatRequest,
    { isLoading: false },
  ],
}));

jest.mock('./components/SkeletonList', () => {
  const { Text } = require('react-native');
  return { SkeletonList: () => <Text>chat-list-skeleton</Text> };
});

jest.mock('./components/ChatRow', () => {
  const { Pressable, Text, View } = require('react-native');
  return {
    ChatRow: ({
      item,
      onPress,
      onTogglePin,
      onToggleMute,
      onToggleArchive,
      onAcceptRequest,
      onRejectRequest,
    }: {
      item: { name: string };
      onPress: () => void;
      onTogglePin: () => void;
      onToggleMute: () => void;
      onToggleArchive: () => void;
      onAcceptRequest: () => void;
      onRejectRequest: () => void;
    }) => (
      <View>
        <Text>{item.name}</Text>
        <Pressable onPress={onPress}>
          <Text>open-chat-row</Text>
        </Pressable>
        <Pressable onPress={onTogglePin}>
          <Text>pin-chat-row</Text>
        </Pressable>
        <Pressable onPress={onToggleMute}>
          <Text>mute-chat-row</Text>
        </Pressable>
        <Pressable onPress={onToggleArchive}>
          <Text>archive-chat-row</Text>
        </Pressable>
        <Pressable onPress={onAcceptRequest}>
          <Text>accept-chat-row</Text>
        </Pressable>
        <Pressable onPress={onRejectRequest}>
          <Text>reject-chat-row</Text>
        </Pressable>
      </View>
    ),
  };
});

import ChatListScreen from './ChatList.screen';

describe('ChatListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateRoomSettings.mockReturnValue({
      unwrap: () => Promise.resolve({ success: true }),
    });
    mockRespondChatRequest.mockReturnValue({
      unwrap: () => Promise.resolve({ success: true }),
    });
  });

  it('renders conversations and wires row actions', async () => {
    const navigation = {
      navigate: mockNavigate,
      getParent: () => ({ navigate: mockParentNavigate }),
    };
    const { getByText, getByTestId } = await render(
      <ChatListScreen navigation={navigation as never} />
    );

    expect(getByText('Asha Sharma')).toBeTruthy();
    expect(getByText('chat.unread_count:2')).toBeTruthy();
    expect(getByTestId('chat-list-search')).toBeTruthy();
    expect(getByText('chat.filters.unread')).toBeTruthy();
    await fireEvent.press(getByText('open-chat-row'));
    await fireEvent.press(getByText('pin-chat-row'));
    await fireEvent.press(getByText('mute-chat-row'));
    await fireEvent.press(getByText('archive-chat-row'));
    await fireEvent.press(getByText('accept-chat-row'));
    await fireEvent.press(getByText('reject-chat-row'));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'chats/setUnreadCount',
      count: 2,
    });
    expect(mockNavigate).toHaveBeenCalledWith('ChatDetails', {
      userId: 'match-1',
      roomId: 'room-1',
      partnerName: 'Asha Sharma',
      partnerPhoto: 'api:/asha.jpg',
    });
    await waitFor(() => {
      expect(mockUpdateRoomSettings).toHaveBeenCalledWith({
        roomId: 'room-1',
        pinned: true,
      });
    });
    expect(mockUpdateRoomSettings).toHaveBeenCalledWith(
      expect.objectContaining({ roomId: 'room-1', archived: true })
    );
    expect(mockRespondChatRequest).toHaveBeenCalledWith({
      roomId: 'room-1',
      action: 'ACCEPT',
    });
    expect(mockRespondChatRequest).toHaveBeenCalledWith({
      roomId: 'room-1',
      action: 'REJECT',
    });
  });
});
