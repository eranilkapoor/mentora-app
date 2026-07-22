import React from 'react';
import { Linking, Share } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockGoBack = jest.fn();
const mockReferralRefetch = jest.fn();
const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();

let mockReferralData: unknown;
let mockReferralLoading = false;
let mockWalletData: unknown;

jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });
jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);

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
      title?: string;
      onBackPress: () => void;
    }) => (
      <Pressable onPress={onBackPress}>
        <Text>{title ?? 'header'}</Text>
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

jest.mock('@/store/services/referralApi.service', () => ({
  useGetReferralSummaryQuery: () => ({
    data: mockReferralData,
    isLoading: mockReferralLoading,
    refetch: mockReferralRefetch,
  }),
}));

jest.mock('@/store/services/walletApi.service', () => ({
  useGetWalletSummaryQuery: () => ({ data: mockWalletData }),
}));

import ReferRewardsScreen from './ReferRewards.screen';

describe('ReferRewardsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReferralLoading = false;
    mockReferralData = {
      data: {
        referralCode: 'MATCH123',
        redeemablePoints: 500,
        redemptionThreshold: 1000,
        subscriptionRewardRate: 0.1,
        referredUsers: [
          {
            id: 'ref-1',
            name: 'Riya',
            joinedAt: '2026-07-21T10:00:00.000Z',
            status: 'joined',
            rewardStatus: 'credited',
          },
        ],
      },
    };
    mockWalletData = {
      data: {
        balance: 750,
        currency: 'INR',
        transactions: [
          {
            id: 'txn-1',
            type: 'credit',
            source: 'referral_reward',
            amount: 250,
            createdAt: '2026-07-21T10:00:00.000Z',
          },
        ],
      },
    };
  });

  it('renders rewards, shares referral code, and refreshes', async () => {
    const { getByLabelText, getByText } = await render(
      <ReferRewardsScreen navigation={{ goBack: mockGoBack } as never} />
    );

    await fireEvent.press(getByText('settings.referrals.title'));
    await fireEvent.press(getByText('settings.referrals.share_option_native'));
    await fireEvent.press(getByText('settings.referrals.share_option_email'));
    await fireEvent.press(getByLabelText('settings.referrals.refresh_rewards'));

    expect(mockGoBack).toHaveBeenCalled();
    expect(getByText('MATCH123')).toBeTruthy();
    expect(getByText('Riya')).toBeTruthy();
    await waitFor(() => {
      expect(Share.share).toHaveBeenCalled();
      expect(Linking.openURL).toHaveBeenCalledWith(
        expect.stringContaining('mailto:?subject=')
      );
      expect(mockReferralRefetch).toHaveBeenCalled();
    });
  });

  it('shows loader while referral data loads', async () => {
    mockReferralLoading = true;
    mockReferralData = undefined;

    const { getByText } = await render(
      <ReferRewardsScreen navigation={{ goBack: mockGoBack } as never} />
    );

    expect(getByText('loader')).toBeTruthy();
  });
});
