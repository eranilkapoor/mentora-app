import { useEffect, useMemo, useState } from 'react';
import {
  useGetActiveSubscriptionQuery,
  useGetMembershipPlansQuery,
} from '@/store/services/membershipApi.service';
import {
  buildDisplayPlans,
  buildFeatureRows,
  formatMembershipPlanDisplayName,
  getAvailableBillingCycles,
  selectSelfServicePlans,
} from '../Membership.utils';
import {
  DisplayFeatureRow,
  DisplayPlan,
  MembershipBillingCycle,
  MembershipTab,
} from '../Membership.types';

const isFeatureEnabled = (value: unknown): boolean => {
  if (value === true) return true;
  if (typeof value === 'number') return value > 0 || value === -1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return !['', '0', 'false', 'no', 'none'].includes(normalized);
  }

  return false;
};

export function useMembershipData(activeTab: MembershipTab) {
  const { data: backendPlans = [], isFetching: isFetchingPlans } =
    useGetMembershipPlansQuery();
  const { data: activeSubscription } = useGetActiveSubscriptionQuery();

  const [selectedPlans, setSelectedPlans] = useState<
    Record<MembershipTab, string>
  >({
    self: '',
    assisted: '',
  });
  const [selectedBillingCycle, setSelectedBillingCycle] =
    useState<MembershipBillingCycle>('quarterly');

  const allSelfPlans = useMemo<DisplayPlan[]>(
    () => buildDisplayPlans(backendPlans, 'self'),
    [backendPlans]
  );
  const billingCycles = useMemo(
    () => getAvailableBillingCycles(allSelfPlans),
    [allSelfPlans]
  );
  const selfPlans = useMemo<DisplayPlan[]>(
    () => selectSelfServicePlans(allSelfPlans, selectedBillingCycle),
    [allSelfPlans, selectedBillingCycle]
  );
  const assistedPlans = useMemo<DisplayPlan[]>(
    () => buildDisplayPlans(backendPlans, 'assisted'),
    [backendPlans]
  );
  const displayPlans = activeTab === 'assisted' ? assistedPlans : selfPlans;
  const selectedPlan = selectedPlans[activeTab];

  useEffect(() => {
    const firstAvailableCycle = billingCycles[0];
    if (firstAvailableCycle && !billingCycles.includes(selectedBillingCycle)) {
      setSelectedBillingCycle(firstAvailableCycle);
    }
  }, [billingCycles, selectedBillingCycle]);

  useEffect(() => {
    if (!selfPlans.length) return;

    const activePlanId =
      typeof activeSubscription?.planId === 'object'
        ? activeSubscription.planId._id
        : activeSubscription?.planId;

    const previousTier = allSelfPlans.find(
      (plan) => plan.id === selectedPlans.self
    )?.tier;
    const defaultPlan =
      selfPlans.find((plan) => plan.id === activePlanId)?.id ??
      selfPlans.find((plan) => plan.tier === previousTier)?.id ??
      selfPlans.find((plan) => plan.best)?.id ??
      selfPlans[0]?.id;

    if (defaultPlan && defaultPlan !== selectedPlans.self) {
      setSelectedPlans((prev) => ({ ...prev, self: defaultPlan }));
    }
  }, [activeSubscription?.planId, allSelfPlans, selfPlans, selectedPlans.self]);

  useEffect(() => {
    if (selectedPlans.assisted || !assistedPlans.length) {
      return;
    }

    const activePlanId =
      typeof activeSubscription?.planId === 'object'
        ? activeSubscription.planId._id
        : activeSubscription?.planId;

    const defaultPlan =
      assistedPlans.find((plan) => plan.id === activePlanId)?.id ??
      assistedPlans.find((plan) => plan.best)?.id ??
      assistedPlans[0]?.id;

    if (defaultPlan) {
      setSelectedPlans((prev) => ({ ...prev, assisted: defaultPlan }));
    }
  }, [activeSubscription?.planId, assistedPlans, selectedPlans.assisted]);

  const setSelectedPlan = (planId: string) => {
    setSelectedPlans((prev) => ({ ...prev, [activeTab]: planId }));
  };

  const selectedPlanItem =
    displayPlans.find((p) => p.id === selectedPlan) ?? displayPlans[0] ?? null;

  const selectedIndex = Math.max(
    0,
    displayPlans.findIndex((p) => p.id === selectedPlan)
  );
  const featureRows = useMemo<DisplayFeatureRow[]>(
    () =>
      buildFeatureRows(
        displayPlans,
        12,
        activeTab,
        Boolean(selectedPlanItem?.isCustom)
      ),
    [activeTab, displayPlans, selectedPlanItem?.isCustom]
  );

  const activePlanName =
    typeof activeSubscription?.planId === 'object'
      ? formatMembershipPlanDisplayName(activeSubscription.planId)
      : undefined;
  const boostPlan = backendPlans.find(
    (plan) => plan.planType === 'profile_boost'
  );
  const activePlan =
    typeof activeSubscription?.planId === 'object'
      ? activeSubscription.planId
      : null;
  const canUseProfileBoost = Boolean(
    activePlan?.features?.some(
      (item) =>
        item.featureId?.key === 'profile_boost' && isFeatureEnabled(item.value)
    )
  );

  return {
    displayPlans,
    selfPlans,
    assistedPlans,
    billingCycles,
    selectedBillingCycle,
    setSelectedBillingCycle,
    featureRows,
    selectedPlan,
    setSelectedPlan,
    selectedPlanItem,
    boostPlan,
    canUseProfileBoost,
    selectedIndex,
    activePlanName,
    isFetchingPlans,
  };
}
