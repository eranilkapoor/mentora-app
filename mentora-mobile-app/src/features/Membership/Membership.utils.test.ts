import type { MembershipPlan } from '@mentora/api-contract';
import {
  buildDisplayPlans,
  formatMembershipPlanDisplayName,
  getAvailableBillingCycles,
  getPlanTypeForTab,
  selectSelfServicePlans,
} from './Membership.utils';

const customAssistedPlan: MembershipPlan = {
  _id: 'assisted-custom',
  name: 'ASSISTED_CUSTOM',
  slug: 'assisted-custom',
  tier: 'enterprise',
  planType: 'assisted',
  billingCycle: 'custom',
  price: 0,
  durationDays: 0,
  trialDays: 0,
  autoRenewDefault: false,
  isCustom: true,
  currency: 'INR',
  features: [
    {
      value: 'custom',
      featureId: { key: 'enterprise_sso', name: 'Enterprise SSO' },
    },
  ],
};

describe('custom assisted membership presentation', () => {
  it('uses the assisted plan group and a clear custom name', () => {
    expect(getPlanTypeForTab('assisted')).toBe('assisted');
    expect(formatMembershipPlanDisplayName(customAssistedPlan)).toBe(
      'Custom Assisted Matchmaking'
    );
  });

  it('renders custom terms inside the assisted plan collection', () => {
    expect(buildDisplayPlans([customAssistedPlan], 'assisted')).toEqual([
      expect.objectContaining({
        name: 'Custom Assisted Matchmaking',
        price: 'Custom pricing',
        durationLabel: 'Custom term',
        isCustom: true,
        isFree: false,
        featureValues: { enterprise_sso: 'custom' },
      }),
    ]);
  });
});

describe('self-service membership choices', () => {
  it('excludes Free and keeps one recommendation when API flags multiple plans', () => {
    const plans: MembershipPlan[] = [
      {
        ...customAssistedPlan,
        _id: 'free',
        name: 'FREE',
        slug: 'free',
        tier: 'free',
        planType: 'self_service',
        billingCycle: 'yearly',
        durationDays: 365,
        price: 0,
        isCustom: false,
      },
      {
        ...customAssistedPlan,
        _id: 'gold-monthly',
        name: 'GOLD_MONTHLY',
        slug: 'gold-monthly',
        tier: 'gold',
        planType: 'self_service',
        billingCycle: 'monthly',
        durationDays: 30,
        price: 999,
        isCustom: false,
        isPopular: true,
        sortOrder: 5,
      },
      {
        ...customAssistedPlan,
        _id: 'platinum-quarterly',
        name: 'PLATINUM_QUARTERLY',
        slug: 'platinum-quarterly',
        tier: 'platinum',
        planType: 'self_service',
        billingCycle: 'quarterly',
        durationDays: 90,
        price: 6499,
        isCustom: false,
        isPopular: true,
        sortOrder: 9,
      },
    ];

    const displayPlans = buildDisplayPlans(plans, 'self');

    expect(displayPlans.some(({ isFree }) => isFree)).toBe(false);
    expect(displayPlans.filter(({ best }) => best)).toHaveLength(1);
    expect(displayPlans.find(({ best }) => best)?.id).toBe(
      'platinum-quarterly'
    );
  });

  it('returns exactly Silver, Gold, and Platinum for the selected cycle', () => {
    const tierPlan = (
      tier: 'silver' | 'gold' | 'platinum',
      cycle: 'monthly' | 'quarterly'
    ): MembershipPlan => ({
      ...customAssistedPlan,
      _id: `${tier}-${cycle}`,
      name: `${tier}_${cycle}`.toUpperCase(),
      slug: `${tier}-${cycle}`,
      tier,
      planType: 'self_service',
      billingCycle: cycle,
      durationDays: cycle === 'monthly' ? 30 : 90,
      price: 100,
      isCustom: false,
    });
    const displayPlans = buildDisplayPlans(
      [
        tierPlan('silver', 'monthly'),
        tierPlan('gold', 'monthly'),
        tierPlan('platinum', 'monthly'),
        tierPlan('silver', 'quarterly'),
        tierPlan('gold', 'quarterly'),
        tierPlan('platinum', 'quarterly'),
      ],
      'self'
    );

    expect(getAvailableBillingCycles(displayPlans)).toEqual([
      'monthly',
      'quarterly',
    ]);
    expect(
      selectSelfServicePlans(displayPlans, 'quarterly').map(({ tier }) => tier)
    ).toEqual(['silver', 'gold', 'platinum']);
  });

  it('shows unlimited daily profile views when the API returns unlimited profile views', () => {
    const plan: MembershipPlan = {
      ...customAssistedPlan,
      _id: 'platinum-yearly',
      name: 'PLATINUM_YEARLY',
      slug: 'platinum-yearly',
      tier: 'platinum',
      planType: 'self_service',
      billingCycle: 'yearly',
      durationDays: 365,
      price: 14999,
      isCustom: false,
      features: [
        {
          value: -1,
          featureId: {
            key: 'unlimited_profile_views',
            name: 'Unlimited profile views',
          },
        },
      ],
    };

    const displayPlan = buildDisplayPlans([plan], 'self')[0];

    if (!displayPlan) throw new Error('Expected plan to be displayed');
    expect(displayPlan.featureValues.daily_profile_views).toBe('Unlimited');
    expect(displayPlan.featureValues.profile_views).toBe('Unlimited');
  });
});
