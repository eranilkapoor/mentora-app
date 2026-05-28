import { useEffect, useMemo, useState } from 'react';
import {
  useGetActiveSubscriptionQuery,
  useGetMembershipPlansQuery,
} from '@/store/services/membershipApi.service';
import { buildDisplayPlans, formatPlanName } from '../Membership.utils';
import { DisplayPlan } from '../Membership.types';

export function useMembershipData() {
  const { data: backendPlans = [], isFetching: isFetchingPlans } =
    useGetMembershipPlansQuery();
  const { data: activeSubscription } = useGetActiveSubscriptionQuery();

  const [selectedPlan, setSelectedPlan] = useState('');

  const displayPlans = useMemo<DisplayPlan[]>(
    () => buildDisplayPlans(backendPlans),
    [backendPlans]
  );

  useEffect(() => {
    if (selectedPlan || displayPlans.length === 0) return;
    setSelectedPlan(
      displayPlans.find((p) => p.best)?.name ??
        displayPlans[0]?.name ??
        'Gold Monthly'
    );
  }, [displayPlans, selectedPlan]);

  const selectedPlanItem =
    displayPlans.find((p) => p.name === selectedPlan) ??
    displayPlans[0] ??
    null;

  const selectedIndex = Math.max(
    0,
    displayPlans.findIndex((p) => p.name === selectedPlan)
  );

  const activePlanName =
    typeof activeSubscription?.planId === 'object'
      ? formatPlanName(activeSubscription.planId.name)
      : undefined;

  return {
    displayPlans,
    selectedPlan,
    setSelectedPlan,
    selectedPlanItem,
    selectedIndex,
    activePlanName,
    isFetchingPlans,
  };
}
