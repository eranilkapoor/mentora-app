import { renderHook, waitFor } from '@testing-library/react-native';
import type {
  ActiveSubscription,
  MembershipPlan,
} from '@matchmate/api-contract';
import { useMembershipData } from './useMembershipData';

let mockPlans: MembershipPlan[] = [];
let mockActiveSubscription: ActiveSubscription | null = null;
let mockIsFetchingPlans = false;

jest.mock('@/store/services/membershipApi.service', () => ({
  useGetMembershipPlansQuery: () => ({
    data: mockPlans,
    isFetching: mockIsFetchingPlans,
  }),
  useGetActiveSubscriptionQuery: () => ({
    data: mockActiveSubscription,
  }),
}));

const plan = (
  id: string,
  overrides: Partial<MembershipPlan> = {}
): MembershipPlan => ({
  _id: id,
  name: id.toUpperCase().replace(/-/g, '_'),
  slug: id,
  tier: 'gold',
  planType: 'self_service',
  billingCycle: 'quarterly',
  price: 1000,
  currency: 'INR',
  durationDays: 90,
  trialDays: 0,
  autoRenewDefault: true,
  features: [],
  ...overrides,
});

describe('useMembershipData', () => {
  beforeEach(() => {
    mockIsFetchingPlans = false;
    mockActiveSubscription = null;
    mockPlans = [
      plan('silver-monthly', {
        tier: 'silver',
        billingCycle: 'monthly',
        price: 399,
      }),
      plan('gold-monthly', {
        tier: 'gold',
        billingCycle: 'monthly',
        price: 699,
        isPopular: true,
      }),
      plan('platinum-monthly', {
        tier: 'platinum',
        billingCycle: 'monthly',
        price: 999,
      }),
      plan('silver-quarterly', {
        tier: 'silver',
        billingCycle: 'quarterly',
        price: 999,
      }),
      plan('gold-quarterly', {
        tier: 'gold',
        billingCycle: 'quarterly',
        price: 1899,
        isPopular: true,
      }),
      plan('platinum-quarterly', {
        tier: 'platinum',
        billingCycle: 'quarterly',
        price: 2499,
        features: [
          {
            value: true,
            featureId: {
              key: 'profile_boost',
              name: 'Profile boost',
            },
          },
        ],
      }),
      plan('assisted-premium', {
        tier: 'premium',
        planType: 'assisted',
        billingCycle: 'custom',
        price: 0,
        durationDays: 0,
        isCustom: true,
        autoRenewDefault: false,
      }),
      plan('boost-pack', {
        tier: 'basic',
        planType: 'profile_boost',
        billingCycle: 'monthly',
        price: 199,
      }),
    ];
  });

  it('selects quarterly self-service plans and the recommended default', async () => {
    const { result } = await renderHook(() => useMembershipData('self'));

    await waitFor(() => {
      expect(result.current.displayPlans.map((item) => item.id)).toEqual([
        'silver-quarterly',
        'gold-quarterly',
        'platinum-quarterly',
      ]);
    });

    expect(result.current.billingCycles).toEqual(['monthly', 'quarterly']);
    expect(result.current.selectedBillingCycle).toBe('quarterly');
    expect(result.current.selectedPlan).toBe('gold-quarterly');
    expect(result.current.selectedIndex).toBe(1);
    expect(result.current.featureRows.length).toBeGreaterThan(0);
    expect(result.current.boostPlan?._id).toBe('boost-pack');
    expect(result.current.canUseProfileBoost).toBe(false);
    expect(result.current.isFetchingPlans).toBe(false);
  });

  it('syncs selected cycle and current state from an active paid subscription', async () => {
    const activePlan = mockPlans.find(
      (item) => item._id === 'platinum-monthly'
    );
    mockActiveSubscription = {
      _id: 'sub-1',
      planId: activePlan!,
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-02-01T00:00:00.000Z',
      status: 'active',
    };

    const { result } = await renderHook(() => useMembershipData('self'));

    await waitFor(() => {
      expect(result.current.selectedBillingCycle).toBe('monthly');
    });

    expect(result.current.selectedPlan).toBe('platinum-monthly');
    expect(result.current.selectedPlanItem?.purchaseState).toBe('current');
    expect(result.current.activePlanName).toBe('Platinum Monthly');
  });

  it('marks upgrades, downgrades, and boost access around current plan', async () => {
    const activePlan = mockPlans.find(
      (item) => item._id === 'platinum-quarterly'
    );
    mockActiveSubscription = {
      _id: 'sub-2',
      planId: activePlan!,
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-04-01T00:00:00.000Z',
      status: 'active',
    };

    const { result } = await renderHook(() => useMembershipData('self'));

    await waitFor(() => {
      expect(result.current.selectedPlan).toBe('platinum-quarterly');
    });

    expect(result.current.canUseProfileBoost).toBe(true);
    expect(
      result.current.displayPlans.find((item) => item.id === 'gold-quarterly')
        ?.purchaseState
    ).toBe('downgrade');
    expect(
      result.current.displayPlans.find(
        (item) => item.id === 'platinum-quarterly'
      )?.purchaseState
    ).toBe('current');
  });

  it('selects assisted defaults on assisted tab', async () => {
    mockIsFetchingPlans = true;
    const { result } = await renderHook(() => useMembershipData('assisted'));

    await waitFor(() => {
      expect(result.current.displayPlans.map((item) => item.id)).toEqual([
        'assisted-premium',
      ]);
    });

    expect(result.current.selectedPlan).toBe('assisted-premium');
    expect(result.current.selectedPlanItem?.isCustom).toBe(true);
    expect(result.current.isFetchingPlans).toBe(true);
  });
});
