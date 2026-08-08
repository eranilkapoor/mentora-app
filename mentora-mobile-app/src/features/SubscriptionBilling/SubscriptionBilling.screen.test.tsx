import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockRefetch = jest.fn();
const mockCancelSubscription = jest.fn();
const mockRestoreStorePurchases = jest.fn();
const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();

type ConfirmParams = {
  title?: string;
  destructive?: boolean;
  onConfirm: () => void;
};

const mockShowConfirm: jest.Mock<void, [ConfirmParams]> = jest.fn();

let mockBillingData: unknown;
let mockBillingLoading = false;
let mockPlansData: unknown[] = [];
let mockCancelling = false;
let mockRestoring = false;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
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

jest.mock('@/core/components/settings/SettingsSelectItem', () => {
  const { Pressable, Text } = require('react-native');
  return {
    SettingsSelectItem: ({
      label,
      disabled,
      onPress,
    }: {
      label: string;
      disabled?: boolean;
      onPress: () => void;
    }) => (
      <Pressable disabled={disabled} onPress={onPress}>
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

jest.mock('@/features/Membership/hooks/useMembershipActions', () => ({
  useMembershipActions: () => ({
    restoreStorePurchases: mockRestoreStorePurchases,
    isCreatingOrder: mockRestoring,
  }),
}));

jest.mock('@/core/utils/billingConfig', () => ({
  isNativeStoreBillingPlatform: () => false,
  isStoreBillingEnabled: () => false,
}));

jest.mock('@/store/services/membershipApi.service', () => ({
  useGetBillingSummaryQuery: () => ({
    data: mockBillingData,
    isLoading: mockBillingLoading,
    refetch: mockRefetch,
  }),
  useGetMembershipPlansQuery: () => ({ data: mockPlansData }),
  useCancelSubscriptionMutation: () => [
    mockCancelSubscription,
    { isLoading: mockCancelling },
  ],
}));

import SubscriptionBillingScreen from './SubscriptionBilling.screen';

describe('SubscriptionBillingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBillingLoading = false;
    mockCancelling = false;
    mockRestoring = false;
    mockBillingData = {
      currentPlan: {
        planId: 'premium',
        status: 'active',
        endDate: '2026-08-21T10:00:00.000Z',
      },
      billing: {
        autoRenew: true,
        totalPaid: 1200,
        currency: 'INR',
      },
      payments: [
        {
          id: 'payment-1',
          amount: 1200,
          currency: 'INR',
          status: 'success',
          gateway: 'razorpay',
          createdAt: '2026-07-21T10:00:00.000Z',
        },
      ],
      invoices: [],
      subscriptions: [],
    };
    mockPlansData = [{ id: 'premium', name: 'Premium' }];
    mockCancelSubscription.mockReturnValue({
      unwrap: () => Promise.resolve({}),
    });
    mockRestoreStorePurchases.mockResolvedValue(undefined);
  });

  it('navigates membership, refreshes billing, and cancels renewal', async () => {
    const { getByText } = await render(
      <SubscriptionBillingScreen navigation={{ goBack: mockGoBack } as never} />
    );

    await fireEvent.press(getByText('membership.billing.title'));
    await fireEvent.press(getByText('membership.billing.manage_membership'));
    await fireEvent.press(getByText('membership.billing.refresh_billing'));
    await fireEvent.press(getByText('membership.billing.cancel_auto_renew'));

    expect(mockGoBack).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('Tabs', { screen: 'Progress' });
    expect(mockRefetch).toHaveBeenCalled();
    expect(mockShowConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'membership.billing.cancel_auto_renew',
        destructive: true,
      })
    );

    mockShowConfirm.mock.calls[0]?.[0].onConfirm();
    await waitFor(() => {
      expect(mockCancelSubscription).toHaveBeenCalledWith({
        reason: 'user_requested_from_billing_screen',
      });
      expect(mockShowSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'membership.billing.cancel_auto_renew_success_title',
        })
      );
    });
  });

  it('shows loader while billing loads', async () => {
    mockBillingLoading = true;
    mockBillingData = undefined;

    const { getByText } = await render(
      <SubscriptionBillingScreen navigation={{ goBack: mockGoBack } as never} />
    );

    expect(getByText('loader')).toBeTruthy();
  });
});
