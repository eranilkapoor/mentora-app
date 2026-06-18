import { useMemo } from 'react';
import {
  useGetActiveSubscriptionQuery,
  useGetMembershipPlansQuery,
} from '@/store/services/membershipApi.service';
import type { MembershipPlan } from '@/store/services/membershipApi.service';

const isFeatureEnabled = (value: unknown): boolean => {
  if (value === true) return true;
  if (typeof value === 'number') return value === -1 || value > 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return !['', '0', 'false', 'no', 'none'].includes(normalized);
  }

  return false;
};

const resolvePlan = (
  plan: MembershipPlan | string | undefined,
  plans: MembershipPlan[]
): MembershipPlan | null => {
  if (!plan) return null;
  if (typeof plan !== 'string') return plan;

  return plans.find((item) => item._id === plan || item.slug === plan) ?? null;
};

export function usePlanFeatureAccess(featureKey: string): {
  hasFeature: boolean;
  isLoading: boolean;
} {
  const { data: activeSubscription, isLoading: subscriptionLoading } =
    useGetActiveSubscriptionQuery();
  const { data: plans = [], isLoading: plansLoading } =
    useGetMembershipPlansQuery();

  const activePlan = useMemo(
    () => resolvePlan(activeSubscription?.planId, plans),
    [activeSubscription?.planId, plans]
  );

  const hasFeature = useMemo(
    () =>
      Boolean(
        activePlan?.features?.some(
          (item) =>
            item.featureId?.key === featureKey && isFeatureEnabled(item.value)
        )
      ),
    [activePlan?.features, featureKey]
  );

  return {
    hasFeature,
    isLoading: subscriptionLoading || plansLoading,
  };
}
