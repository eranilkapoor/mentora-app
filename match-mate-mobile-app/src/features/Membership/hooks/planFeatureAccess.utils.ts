import type { MembershipPlan } from '@/store/services/membershipApi.service';

export const isPlanFeatureEnabled = (value: unknown): boolean => {
  if (value === true) return true;
  if (typeof value === 'number') return value === -1 || value > 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return !['', '0', 'false', 'no', 'none'].includes(normalized);
  }

  return false;
};

export const resolveMembershipPlan = (
  plan: MembershipPlan | string | undefined,
  plans: MembershipPlan[]
): MembershipPlan | null => {
  if (!plan) return null;
  if (typeof plan !== 'string') return plan;

  return plans.find((item) => item._id === plan || item.slug === plan) ?? null;
};
