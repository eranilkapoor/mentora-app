import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockNavigate = jest.fn();
const mockParentNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockSendMessage = jest.fn();
const mockMarkRoomRead = jest.fn();
const mockDeleteMessage = jest.fn();
const mockReportUser = jest.fn();
const mockBlockUser = jest.fn();
const mockShowConfirm = jest.fn();
const mockEmitTyping = jest.fn();

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}));

jest.mock('expo-av', () => ({
  Audio: {
    Recording: jest.fn(),
    RecordingOptionsPresets: { HIGH_QUALITY: {} },
    requestPermissionsAsync: jest.fn(),
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { name?: string; user?: string }) =>
      options?.name ? `${key}:${options.name}` : key,
  }),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View, useSafeAreaInsets: () => ({ bottom: 0 }) };
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
      onIdentityPress,
      actions,
    }: {
      title: string;
      subtitle?: string;
      onBackPress?: () => void;
      onIdentityPress?: () => void;
      actions?: Array<{
        icon: string;
        accessibilityLabel?: string;
        onPress: () => void;
      }>;
    }) => (
      <View>
        <Pressable onPress={onBackPress}>
          <Text>chat-back</Text>
        </Pressable>
        <Pressable onPress={onIdentityPress}>
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

jest.mock('@/store/hooks', () => ({
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      auth: { user: { userId: 'me' } },
      settings: { communication: { showTypingIndicator: true } },
    }),
}));

jest.mock('@/features/Membership/hooks/usePlanFeatureAccess', () => ({
  usePlanFeatureAccess: () => ({ hasFeature: true, isLoading: false }),
}));

jest.mock('@/features/Membership/hooks/useUpgradePrompt', () => ({
  useUpgradePrompt: () => jest.fn(),
}));

jest.mock('@/store/services/chatApi.service', () => ({
  useCreateDirectRoomMutation: () => [
    jest.fn(() => ({ unwrap: () => Promise.resolve({ success: true }) })),
    { isLoading: false },
  ],
  useGetMessagesQuery: () => ({
    isFetching: false,
    data: {
      success: true,
      data: {
        items: [
          {
            id: 'message-1',
            senderId: 'match-1',
            content: 'Hello',
            type: 'TEXT',
            status: 'DELIVERED',
            createdAt: '2026-07-21T10:00:00.000Z',
          },
          {
            id: 'message-2',
            senderId: 'me',
            content: 'Mine',
            type: 'TEXT',
            status: 'SENT',
            createdAt: '2026-07-21T10:01:00.000Z',
          },
        ],
      },
    },
  }),
  useMarkRoomReadMutation: () => [mockMarkRoomRead],
  useSendMessageMutation: () => [mockSendMessage, { isLoading: false }],
  useUploadChatAttachmentsMutation: () => [jest.fn(), { isLoading: false }],
  useDeleteChatMessageMutation: () => [mockDeleteMessage],
}));

jest.mock('@/store/services/privacySettingsApi.service', () => ({
  useBlockUserMutation: () => [mockBlockUser],
  useReportUserMutation: () => [mockReportUser],
}));

jest.mock('@/core/utils/confirm', () => ({
  showConfirm: (params: unknown) => mockShowConfirm(params),
}));

jest.mock('@/core/utils/toast', () => ({
  showError: jest.fn(),
  showInfo: jest.fn(),
  showSuccess: jest.fn(),
}));

jest.mock('@/core/utils/config', () => ({
  resolveApiUrl: (url: string) => `api:${url}`,
}));

jest.mock('@/core/utils/apiMessage', () => ({
  isPlanAccessError: () => false,
}));

jest.mock('@/core/realtime/realtime.service', () => ({
  emitTyping: (...args: unknown[]) => mockEmitTyping(...args),
  joinChatRoom: jest.fn(),
  leaveChatRoom: jest.fn(),
  REALTIME_USER_BLOCKED_EVENT: 'user-blocked',
}));

jest.mock('./components/DateSeparator', () => {
  const { Text } = require('react-native');
  return { DateSeparator: () => <Text>date-separator</Text> };
});

jest.mock('./components/MessageBubble', () => {
  const { Pressable, Text } = require('react-native');
  return {
    MessageBubble: ({
      item,
      onLongPress,
    }: {
      item: { text?: string };
      onLongPress: (item: unknown) => void;
    }) => (
      <Pressable onLongPress={() => onLongPress(item)}>
        <Text>{item.text}</Text>
      </Pressable>
    ),
  };
});

import ChatScreen from './Chat.screen';

describe('ChatScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSendMessage.mockReturnValue({
      unwrap: () => Promise.resolve({ success: true }),
    });
    mockMarkRoomRead.mockReturnValue({
      unwrap: () => Promise.resolve({ success: true }),
    });
    mockDeleteMessage.mockReturnValue({
      unwrap: () => Promise.resolve({ success: true }),
    });
    mockReportUser.mockReturnValue({
      unwrap: () => Promise.resolve({ success: true }),
    });
    mockBlockUser.mockReturnValue({
      unwrap: () => Promise.resolve({ success: true }),
    });
  });

  it('renders messages and wires chat actions', async () => {
    const { getByLabelText, getByText } = await render(
      <ChatScreen
        navigation={
          {
            navigate: mockNavigate,
            getParent: () => ({ navigate: mockParentNavigate }),
            goBack: mockGoBack,
          } as never
        }
        route={
          {
            params: {
              userId: 'match-1',
              roomId: 'room-1',
              partnerName: 'Asha',
              partnerPhoto: '/asha.jpg',
            },
          } as never
        }
      />
    );

    expect(getByText('Hello')).toBeTruthy();
    expect(getByText('Mine')).toBeTruthy();

    await fireEvent.press(getByText('Asha'));
    expect(mockParentNavigate).toHaveBeenCalledWith('Profile');

    await fireEvent.changeText(getByLabelText('chat.message_input'), 'Hi');
    await fireEvent.press(getByLabelText('chat.send_message'));

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith(
        expect.objectContaining({ roomId: 'room-1', content: 'Hi' })
      );
    });
    expect(mockEmitTyping).toHaveBeenCalledWith('room-1', true);

    await fireEvent(getByText('Mine'), 'longPress');
    expect(mockShowConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'chat.delete_message_title' })
    );

    await fireEvent.press(getByText('chat.report_user'));
    await fireEvent.press(getByText('chat.block_user'));

    expect(mockShowConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'chat.report_user_title' })
    );
    expect(mockShowConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'chat.block_user_title' })
    );

    await fireEvent.press(getByText('chat-back'));
    expect(mockGoBack).toHaveBeenCalled();
  });
});
