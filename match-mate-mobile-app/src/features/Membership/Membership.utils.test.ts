import type { MembershipPlan } from '@matchmate/api-contract';
import {
  buildDisplayPlans,
  formatMembershipPlanDisplayName,
  getPlanTypeForTab,
} from './Membership.utils';

const enterprisePlan: MembershipPlan = {
  _id: 'enterprise-plan',
  name: 'ENTERPRISE_CUSTOM',
  slug: 'enterprise-custom',
  tier: 'enterprise',
  planType: 'enterprise',
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

describe('enterprise membership presentation', () => {
  it('uses a dedicated plan type and enterprise name', () => {
    expect(getPlanTypeForTab('enterprise')).toBe('enterprise');
    expect(formatMembershipPlanDisplayName(enterprisePlan)).toBe('Enterprise');
  });

  it('renders quote-based terms without treating the plan as free', () => {
    expect(buildDisplayPlans([enterprisePlan], 'enterprise')).toEqual([
      expect.objectContaining({
        name: 'Enterprise',
        price: 'Custom pricing',
        durationLabel: 'Custom term',
        isCustom: true,
        isFree: false,
        featureValues: { enterprise_sso: 'custom' },
      }),
    ]);
  });
});

describe('membership recommendations', () => {
  it('renders only one recommendation when the API flags multiple plans', () => {
    const plans: MembershipPlan[] = [
      {
        ...enterprisePlan,
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
        ...enterprisePlan,
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

    expect(displayPlans.filter(({ best }) => best)).toHaveLength(1);
    expect(displayPlans.find(({ best }) => best)?.id).toBe(
      'platinum-quarterly'
    );
  });
});
