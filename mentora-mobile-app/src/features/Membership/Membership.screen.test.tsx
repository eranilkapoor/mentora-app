import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockSetSelectedPlan = jest.fn();
const mockSetSelectedBillingCycle = jest.fn();
const mockHandleCreateOrder = jest.fn();
const mockHandleCreateBoostOrder = jest.fn();
const mockShowUpgradePrompt = jest.fn();

jest.mock('@react-navigation/native', () => ({
  CommonActions: { navigate: jest.fn((...args: unknown[]) => args) },
  useNavigation: () => ({ navigate: jest.fn(), dispatch: jest.fn() }),
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
  const { Text, View } = require('react-native');
  return {
    __esModule: true,
    default: ({ title }: { title: string }) => (
      <View>
        <Text>{title}</Text>
      </View>
    ),
  };
});

jest.mock('@/navigation/navigationRef', () => ({
  navigationRef: { isReady: () => false, dispatch: jest.fn() },
}));

jest.mock('@/core/utils/confirm', () => ({
  showConfirm: jest.fn(),
}));

const selectedPlanItem = {
  id: 'premium',
  name: 'Premium',
  price: 'INR 999',
  durationLabel: 'monthly',
  featureValues: {},
  purchaseState: 'upgrade' as const,
};

jest.mock('./hooks/useMembershipData', () => ({
  useMembershipData: () => ({
    displayPlans: [selectedPlanItem],
    featureRows: [{ key: 'chat', label: 'Chat', values: ['yes'] }],
    selectedPlan: 'premium',
    setSelectedPlan: mockSetSelectedPlan,
    selectedPlanItem,
    boostPlan: {
      _id: 'boost-1',
      name: 'LEARNING_BOOST',
      currency: 'INR',
      price: 149,
    },
    canUseProfileBoost: true,
    selectedIndex: 0,
    activePlanName: 'Free',
    isFetchingPlans: false,
    billingCycles: ['monthly'],
    selectedBillingCycle: 'monthly',
    setSelectedBillingCycle: mockSetSelectedBillingCycle,
  }),
}));

jest.mock('./hooks/useMembershipActions', () => ({
  useMembershipActions: () => ({
    handleCreateOrder: mockHandleCreateOrder,
    handleCreateBoostOrder: mockHandleCreateBoostOrder,
    storePrices: { premium: 'INR 899' },
    isCreatingOrder: false,
  }),
}));

jest.mock('./hooks/useUpgradePrompt', () => ({
  useUpgradePrompt: () => mockShowUpgradePrompt,
}));

jest.mock('./components/MembershipHeroCard', () => {
  const { Text } = require('react-native');
  return {
    MembershipHeroCard: ({ activePlanName }: { activePlanName: string }) => (
      <Text>{`active:${activePlanName}`}</Text>
    ),
  };
});

jest.mock('./components/SelfServiceTab', () => {
  const { Pressable, Text, View } = require('react-native');
  return {
    SelfServiceTab: ({
      displayPlans,
      onSelectPlan,
      onSelectBillingCycle,
    }: {
      displayPlans: Array<{ id?: string; price: string }>;
      onSelectPlan: (id: string) => void;
      onSelectBillingCycle: (cycle: string) => void;
    }) => (
      <View>
        <Text>{`self:${displayPlans[0]?.price}`}</Text>
        <Pressable onPress={() => onSelectPlan('premium')}>
          <Text>select-premium</Text>
        </Pressable>
        <Pressable onPress={() => onSelectBillingCycle('monthly')}>
          <Text>select-monthly</Text>
        </Pressable>
      </View>
    ),
  };
});

jest.mock('./components/AssistedTab', () => {
  const { Text } = require('react-native');
  return { AssistedTab: () => <Text>assisted-tab</Text> };
});

jest.mock('./components/MembershipCta', () => {
  const { Pressable, Text } = require('react-native');
  return {
    MembershipCta: ({ onCreateOrder }: { onCreateOrder: () => void }) => (
      <Pressable onPress={onCreateOrder}>
        <Text>membership-cta</Text>
      </Pressable>
    ),
  };
});

jest.mock('./components/PaymentOptionSheet', () => {
  const { Pressable, Text, View } = require('react-native');
  return {
    PaymentOptionSheet: ({
      visible,
      onContinue,
      onClose,
    }: {
      visible: boolean;
      onContinue: (gateway: 'razorpay') => void;
      onClose: () => void;
    }) =>
      visible ? (
        <View>
          <Pressable onPress={() => onContinue('razorpay')}>
            <Text>continue-payment</Text>
          </Pressable>
          <Pressable onPress={onClose}>
            <Text>close-payment</Text>
          </Pressable>
        </View>
      ) : null,
  };
});

import MembershipScreen from './Membership.screen';

describe('MembershipScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHandleCreateOrder.mockResolvedValue(true);
  });

  it('switches tabs, starts checkout, and creates boost orders', async () => {
    const { getByLabelText, getByText } = await render(<MembershipScreen />);

    expect(getByText('self:INR 899')).toBeTruthy();

    await fireEvent.press(getByText('select-premium'));
    await fireEvent.press(getByText('select-monthly'));
    await fireEvent.press(getByText('membership.tab_assisted'));
    expect(getByText('assisted-tab')).toBeTruthy();

    await fireEvent.press(getByLabelText('membership.boost.buy'));
    expect(mockHandleCreateBoostOrder).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'boost-1', price: 'INR 149' })
    );

    await fireEvent.press(getByText('membership-cta'));
    await fireEvent.press(getByText('continue-payment'));

    expect(mockSetSelectedPlan).toHaveBeenCalledWith('premium');
    expect(mockSetSelectedBillingCycle).toHaveBeenCalledWith('monthly');
    expect(mockHandleCreateOrder).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'premium', price: 'INR 899' }),
      'razorpay'
    );
    expect(mockShowUpgradePrompt).not.toHaveBeenCalled();
  });
});
