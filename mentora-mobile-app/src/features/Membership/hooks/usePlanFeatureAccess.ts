import { useMemo } from 'react';
import {
  useGetActiveSubscriptionQuery,
  useGetMembershipPlansQuery,
} from '@/store/services/membershipApi.service';
import {
  isPlanFeatureEnabled,
  resolveMembershipPlan,
} from './planFeatureAccess.utils';

export function usePlanFeatureAccess(featureKey: string): {
  hasFeature: boolean;
  isLoading: boolean;
} {
  const { data: activeSubscription, isLoading: subscriptionLoading } =
    useGetActiveSubscriptionQuery();
  const { data: plans = [], isLoading: plansLoading } =
    useGetMembershipPlansQuery();

  const activePlan = useMemo(
    () => resolveMembershipPlan(activeSubscription?.planId, plans),
    [activeSubscription?.planId, plans]
  );

  const hasFeature = useMemo(
    () =>
      Boolean(
        activePlan?.features?.some(
          (item) =>
            item.featureId?.key === featureKey &&
            isPlanFeatureEnabled(item.value)
        )
      ),
    [activePlan?.features, featureKey]
  );

  return {
    hasFeature,
    isLoading: subscriptionLoading || plansLoading,
  };
}
