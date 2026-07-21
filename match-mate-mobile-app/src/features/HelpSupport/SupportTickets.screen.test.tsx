import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockRefetch = jest.fn();
const mockCreateSupportTicket = jest.fn();
const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();

let mockTicketsData: unknown;
let mockTicketsLoading = false;
let mockTicketsFetching = false;
let mockSubmitting = false;

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

jest.mock('@/core/utils/toast', () => ({
  showError: (params: unknown) => mockShowError(params),
  showSuccess: (params: unknown) => mockShowSuccess(params),
}));

jest.mock('@/store/services/supportApi.service', () => ({
  useGetSupportTicketsQuery: () => ({
    data: mockTicketsData,
    isLoading: mockTicketsLoading,
    isFetching: mockTicketsFetching,
    refetch: mockRefetch,
  }),
  useCreateSupportTicketMutation: () => [
    mockCreateSupportTicket,
    { isLoading: mockSubmitting },
  ],
}));

import SupportTicketsScreen from './SupportTickets.screen';

describe('SupportTicketsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTicketsLoading = false;
    mockTicketsFetching = false;
    mockSubmitting = false;
    mockTicketsData = {
      success: true,
      data: {
        items: [
          {
            _id: 'ticket-1',
            subject: 'Payment issue',
            status: 'open',
            category: 'billing',
            priority: 'high',
            createdAt: '2026-07-21T10:00:00.000Z',
          },
        ],
      },
    };
    mockCreateSupportTicket.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          success: true,
          data: { _id: 'ticket-new' },
        }),
    });
  });

  it('creates a ticket and navigates to ticket details', async () => {
    const { getByPlaceholderText, getByText } = await render(
      <SupportTicketsScreen
        navigation={{ navigate: mockNavigate, goBack: mockGoBack } as never}
      />
    );

    await fireEvent.changeText(
      getByPlaceholderText('settings.support_tickets.subject_placeholder'),
      'Need billing help'
    );
    await fireEvent.press(
      getByText('settings.support_tickets.categories.billing')
    );
    await fireEvent.press(
      getByText('settings.support_tickets.priorities.high')
    );
    await fireEvent.changeText(
      getByPlaceholderText('settings.support_tickets.message_placeholder'),
      'My receipt is not visible in billing history.'
    );
    await fireEvent.press(getByText('settings.support_tickets.submit'));

    await waitFor(() => {
      expect(mockCreateSupportTicket).toHaveBeenCalled();
      expect(mockShowSuccess).toHaveBeenCalledWith({
        title: 'settings.support_tickets.created',
      });
      expect(mockNavigate).toHaveBeenCalledWith('SupportTicketDetail', {
        ticketId: 'ticket-new',
      });
    });
  });

  it('opens existing tickets', async () => {
    const { getByText } = await render(
      <SupportTicketsScreen
        navigation={{ navigate: mockNavigate, goBack: mockGoBack } as never}
      />
    );

    await fireEvent.press(getByText('settings.support_tickets.title'));
    await fireEvent.press(getByText('Payment issue'));
    await fireEvent.press(getByText('settings.support_tickets.submit'));

    expect(mockGoBack).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('SupportTicketDetail', {
      ticketId: 'ticket-1',
    });
  });
});
