import type { MembershipPlan } from '@/store/services/membershipApi.service';

const getPlanIdentifier = (plan: MembershipPlan): string | undefined =>
  plan._id ?? plan.slug;

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
  const planId = typeof plan === 'string' ? plan : getPlanIdentifier(plan);
  const matchedPlan =
    plans.find((item) => item._id === planId || item.slug === planId) ?? null;

  if (matchedPlan) return matchedPlan;
  if (typeof plan !== 'string') return plan;

  return null;
};
