import type { MembershipPlan } from '@matchmate/api-contract';
import {
  isPlanFeatureEnabled,
  resolveMembershipPlan,
} from './planFeatureAccess.utils';

const plan = (overrides: Partial<MembershipPlan> = {}): MembershipPlan => ({
  _id: 'plan-id',
  name: 'Gold Monthly',
  slug: 'gold-monthly',
  tier: 'gold',
  billingCycle: 'monthly',
  price: 999,
  durationDays: 30,
  currency: 'INR',
  ...overrides,
});

describe('plan feature access utilities', () => {
  it.each([true, 1, -1, 'true', 'premium', 'unlimited'])(
    'treats %p as enabled',
    (value) => {
      expect(isPlanFeatureEnabled(value)).toBe(true);
    }
  );

  it.each([false, 0, '', 'false', 'no', 'none', null, undefined])(
    'treats %p as disabled',
    (value) => {
      expect(isPlanFeatureEnabled(value)).toBe(false);
    }
  );

  it('resolves active plans by id or slug', () => {
    const plans = [plan()];

    expect(resolveMembershipPlan('plan-id', plans)).toBe(plans[0]);
    expect(resolveMembershipPlan('gold-monthly', plans)).toBe(plans[0]);
    expect(resolveMembershipPlan('missing', plans)).toBeNull();
  });
});
