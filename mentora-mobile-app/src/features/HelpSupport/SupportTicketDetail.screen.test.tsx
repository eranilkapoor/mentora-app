import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockGoBack = jest.fn();
const mockRefetch = jest.fn();
const mockReplyToTicket = jest.fn();
const mockCloseTicket = jest.fn();
const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();

let mockTicketData: unknown;
let mockTicketLoading = false;
let mockTicketFetching = false;
let mockReplying = false;
let mockClosing = false;

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

jest.mock('@/core/utils/toast', () => ({
  showError: (params: unknown) => mockShowError(params),
  showSuccess: (params: unknown) => mockShowSuccess(params),
}));

jest.mock('@/store/services/supportApi.service', () => ({
  useGetSupportTicketQuery: () => ({
    data: mockTicketData,
    isLoading: mockTicketLoading,
    isFetching: mockTicketFetching,
    refetch: mockRefetch,
  }),
  useReplyToSupportTicketMutation: () => [
    mockReplyToTicket,
    { isLoading: mockReplying },
  ],
  useCloseSupportTicketMutation: () => [
    mockCloseTicket,
    { isLoading: mockClosing },
  ],
}));

import SupportTicketDetailScreen from './SupportTicketDetail.screen';

describe('SupportTicketDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTicketLoading = false;
    mockTicketFetching = false;
    mockReplying = false;
    mockClosing = false;
    mockTicketData = {
      success: true,
      data: {
        _id: 'ticket-1',
        subject: 'Payment issue',
        status: 'open',
        category: 'billing',
        priority: 'high',
        createdAt: '2026-07-21T10:00:00.000Z',
        messages: [
          {
            authorType: 'user',
            message: 'Initial issue',
            createdAt: '2026-07-21T10:00:00.000Z',
          },
        ],
      },
    };
    mockReplyToTicket.mockReturnValue({
      unwrap: () => Promise.resolve({ success: true }),
    });
    mockCloseTicket.mockReturnValue({
      unwrap: () => Promise.resolve({ success: true }),
    });
  });

  it('replies to and closes an open support ticket', async () => {
    const { getByPlaceholderText, getByText } = await render(
      <SupportTicketDetailScreen
        navigation={{ goBack: mockGoBack } as never}
        route={{ params: { ticketId: 'ticket-1' } } as never}
      />
    );

    await fireEvent.press(getByText('settings.support_tickets.detail_title'));
    await fireEvent.changeText(
      getByPlaceholderText('settings.support_tickets.reply_placeholder'),
      'Please check again'
    );
    await fireEvent.press(getByText('settings.support_tickets.send_reply'));
    await fireEvent.press(getByText('settings.support_tickets.close_ticket'));

    expect(mockGoBack).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockReplyToTicket).toHaveBeenCalledWith({
        ticketId: 'ticket-1',
        message: 'Please check again',
      });
      expect(mockCloseTicket).toHaveBeenCalledWith('ticket-1');
      expect(mockShowSuccess).toHaveBeenCalledWith({
        title: 'settings.support_tickets.closed',
      });
    });
  });

  it('shows loader while ticket details load', async () => {
    mockTicketLoading = true;
    mockTicketData = undefined;

    const { getByText } = await render(
      <SupportTicketDetailScreen
        navigation={{ goBack: mockGoBack } as never}
        route={{ params: { ticketId: 'ticket-1' } } as never}
      />
    );

    expect(getByText('loader')).toBeTruthy();
  });
});
