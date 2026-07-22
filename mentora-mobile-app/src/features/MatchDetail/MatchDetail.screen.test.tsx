import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockGoBack = jest.fn();
const mockRevealContact = jest.fn();
const mockHandleSendInterest = jest.fn();
const mockHandleOpenChat = jest.fn();
const mockHandleReport = jest.fn();
const mockHandleBlock = jest.fn();
const mockResetOptimistic = jest.fn();
const mockShowUpgradePrompt = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number; name?: string }) =>
      options?.count !== undefined
        ? `${key}:${options.count}`
        : options?.name
          ? `${key}:${options.name}`
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
  useThemedStyles: () =>
    new Proxy(
      {},
      {
        get: () => ({}),
      }
    ),
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

jest.mock('@/core/utils/config', () => ({
  resolveApiUrl: (url: string) => `api:${url}`,
}));

jest.mock('@/core/utils/apiMessage', () => ({
  getApiErrorCode: () => undefined,
  getApiErrorMessage: (_t: unknown, _error: unknown, fallback: string) =>
    fallback,
  isPlanAccessError: () => false,
}));

jest.mock('@/core/utils/format', () => ({
  cmToFeetInches: (value: string | number) => `${value}cm`,
  formatEnumLabel: (
    _t: unknown,
    _ns: string,
    value: unknown,
    fallback: string
  ) => (value ? String(value) : fallback),
}));

const matchProfile = {
  userId: 'match-1',
  firstName: 'Asha',
  lastName: 'Sharma',
  age: 29,
  matchScore: 91,
  lastActiveAt: '2026-07-21T10:00:00.000Z',
  images: [{ url: '/asha.jpg', isPrimary: true, isActive: true }],
  personal: {
    firstName: 'Asha',
    lastName: 'Sharma',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    aboutMe: 'Kind and curious',
    religion: 'hindu',
    religiousDetails: { caste: 'brahmin' },
    maritalStatus: 'never_married',
  },
  physical: { height: 164 },
  education: {
    qualification: 'masters',
    jobRole: 'Designer',
    companyName: 'Studio',
    annualIncomeAmount: 1200000,
  },
  family: {
    familyType: 'nuclear',
    familyStatus: 'middle',
    fatherOccupation: 'Teacher',
  },
  privacy: {
    canViewPersonalDetails: true,
    isMatched: false,
    showIncome: true,
  },
  relationship: {},
  contactAccess: {
    canRevealPhone: true,
    canRevealEmail: true,
    canRequestContact: false,
  },
  compatibility: { score: 91, signals: [] },
};

jest.mock('@/store/services/matchApi.service', () => ({
  useGetMatchProfileQuery: () => ({
    data: { success: true, data: matchProfile },
    isLoading: false,
    isFetching: false,
    isError: false,
    error: undefined,
    refetch: jest.fn(),
  }),
  useRevealMatchContactMutation: () => [
    mockRevealContact,
    { isLoading: false },
  ],
}));

jest.mock('@/store/services/profileApi.service', () => ({
  useGetMyProfileQuery: () => ({
    data: {
      success: true,
      data: {
        personal: {
          firstName: 'Meera',
          lastName: 'Kapoor',
          dateOfBirth: '1995-01-01',
          religion: 'hindu',
          religiousDetails: { caste: 'brahmin' },
        },
        physical: { height: 162 },
        education: { qualification: 'masters', occupation: 'Designer' },
        images: [{ url: '/me.jpg', isPrimary: true }],
      },
    },
  }),
}));

jest.mock('@/store/services/preferenceApi.service', () => ({
  useGetMyPreferenceQuery: () => ({
    data: { success: true, data: { filters: {} } },
  }),
}));

jest.mock('../Membership/hooks/useUpgradePrompt', () => ({
  useUpgradePrompt: () => mockShowUpgradePrompt,
}));

jest.mock('./hooks/useMatchDetailActions', () => ({
  useMatchDetailActions: () => ({
    optimisticPendingInterest: false,
    resetOptimistic: mockResetOptimistic,
    handleSendInterest: mockHandleSendInterest,
    handleWithdrawInterest: jest.fn(),
    handleOpenChat: mockHandleOpenChat,
    handleReport: mockHandleReport,
    handleBlock: mockHandleBlock,
    isSendingInterest: false,
    isWithdrawingInterest: false,
    isOpeningChat: false,
    isBlocking: false,
    isReporting: false,
  }),
}));

jest.mock('./components/DetailPhotoCarousel', () => {
  const { Text } = require('react-native');
  return { DetailPhotoCarousel: () => <Text>detail-photo-carousel</Text> };
});

jest.mock('./components/MatchScoreBar', () => {
  const { Text } = require('react-native');
  return {
    MatchScoreBar: ({ matchScore }: { matchScore: number }) => (
      <Text>{`score:${matchScore}`}</Text>
    ),
  };
});

jest.mock('./components/DetailSection', () => {
  const { Text, View } = require('react-native');
  return {
    DetailSection: ({
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

jest.mock('./components/DetailRow', () => {
  const { Text, View } = require('react-native');
  return {
    DetailRow: ({
      label,
      value,
    }: {
      label: string;
      value: string | number;
    }) => (
      <View>
        <Text>{label}</Text>
        <Text>{String(value)}</Text>
      </View>
    ),
  };
});

jest.mock('./components/MatchDetailCta', () => {
  const { Pressable, Text, View } = require('react-native');
  return {
    MatchDetailCta: ({
      primaryAction,
      onBack,
    }: {
      primaryAction: { labelKey: string; onPress: () => void };
      onBack: () => void;
    }) => (
      <View>
        <Pressable onPress={onBack}>
          <Text>detail-back</Text>
        </Pressable>
        <Pressable onPress={primaryAction.onPress}>
          <Text>{primaryAction.labelKey}</Text>
        </Pressable>
      </View>
    ),
  };
});

jest.mock('./components/MatchDetailEmpty', () => {
  const { Text } = require('react-native');
  return { MatchDetailEmpty: () => <Text>match-detail-empty</Text> };
});

import MatchDetailScreen from './MatchDetail.screen';

describe('MatchDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRevealContact.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          success: true,
          data: {
            contactDetails: {
              phone: { countryCode: '+91', number: '9876543210' },
              email: { address: 'asha@example.com' },
            },
          },
        }),
    });
  });

  it('renders match details and wires contact, safety, and CTA actions', async () => {
    const { getByText } = await render(
      <MatchDetailScreen
        navigation={{ goBack: mockGoBack } as never}
        route={{ params: { userId: 'match-1' } } as never}
      />
    );

    expect(getByText('Asha Sharma, 29')).toBeTruthy();
    expect(getByText('score:91')).toBeTruthy();
    expect(getByText('match_detail.section_contact')).toBeTruthy();

    await fireEvent.press(getByText('match_detail.contact_reveal_action'));

    await waitFor(() => {
      expect(mockRevealContact).toHaveBeenCalledWith({ userId: 'match-1' });
    });
    expect(getByText('+91 9876543210')).toBeTruthy();
    expect(getByText('asha@example.com')).toBeTruthy();

    await fireEvent.press(getByText('match_detail.action_send_interest'));
    await fireEvent.press(getByText('match_detail.action_report'));
    await fireEvent.press(getByText('match_detail.action_block'));
    await fireEvent.press(getByText('detail-back'));

    expect(mockHandleSendInterest).toHaveBeenCalled();
    expect(mockHandleReport).toHaveBeenCalled();
    expect(mockHandleBlock).toHaveBeenCalled();
    expect(mockGoBack).toHaveBeenCalled();
    expect(mockResetOptimistic).toHaveBeenCalled();
    expect(mockShowUpgradePrompt).not.toHaveBeenCalled();
  });
});
