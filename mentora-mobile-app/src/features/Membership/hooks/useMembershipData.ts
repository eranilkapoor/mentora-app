import { useEffect, useMemo, useRef, useState } from 'react';
import {
  useGetActiveSubscriptionQuery,
  useGetMembershipPlansQuery,
} from '@/store/services/membershipApi.service';
import {
  buildDisplayPlans,
  buildFeatureRows,
  formatMembershipPlanDisplayName,
  getAvailableBillingCycles,
  getPlanTierRank,
  selectSelfServicePlans,
} from '../Membership.utils';
import {
  isPlanFeatureEnabled,
  resolveMembershipPlan,
} from './planFeatureAccess.utils';
import {
  DisplayFeatureRow,
  DisplayPlan,
  MembershipBillingCycle,
  MembershipTab,
} from '../Membership.types';

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
  const activeCycleAppliedFor = useRef<string | null>(null);
  const activeSelfPlanAppliedFor = useRef<string | null>(null);

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
  const activePlan = useMemo(
    () => resolveMembershipPlan(activeSubscription?.planId, backendPlans),
    [activeSubscription?.planId, backendPlans]
  );
  const isActivePaidPlan = Boolean(activePlan && activePlan.tier !== 'free');
  const getPurchaseState = (
    plan: DisplayPlan
  ): DisplayPlan['purchaseState'] => {
    if (!plan.source) return 'new';
    if (!activePlan || activePlan.tier === 'free') return 'new';
    if (plan.source._id === activePlan._id) return 'current';

    const planType = plan.source.planType ?? 'self_service';
    const activePlanType = activePlan.planType ?? 'self_service';
    if (planType !== activePlanType) {
      if (activePlanType === 'self_service' && planType === 'assisted') {
        return 'upgrade';
      }

      return 'switch';
    }

    const planRank = getPlanTierRank(plan.source.tier);
    const activeRank = getPlanTierRank(activePlan.tier);
    if (planRank > activeRank) return 'upgrade';
    if (planRank < activeRank) return 'downgrade';

    return 'switch';
  };
  const displayPlans = useMemo(
    () =>
      (activeTab === 'assisted' ? assistedPlans : selfPlans).map((plan) => ({
        ...plan,
        purchaseState: getPurchaseState(plan),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activePlan, activeTab, assistedPlans, selfPlans]
  );
  const selectedPlan = selectedPlans[activeTab];

  useEffect(() => {
    const activePlanId = activePlan?._id;
    const activeCycle = activePlan?.billingCycle as
      MembershipBillingCycle | undefined;
    if (
      activePlanId &&
      isActivePaidPlan &&
      activeCycleAppliedFor.current !== activePlanId &&
      activePlan?.planType === 'self_service' &&
      activeCycle &&
      billingCycles.includes(activeCycle) &&
      selectedBillingCycle !== activeCycle
    ) {
      activeCycleAppliedFor.current = activePlanId;
      setSelectedBillingCycle(activeCycle);
      return;
    }

    if (
      activePlanId &&
      isActivePaidPlan &&
      activeCycleAppliedFor.current !== activePlanId
    ) {
      activeCycleAppliedFor.current = activePlanId;
    }

    const firstAvailableCycle = billingCycles[0];
    if (firstAvailableCycle && !billingCycles.includes(selectedBillingCycle)) {
      setSelectedBillingCycle(firstAvailableCycle);
    }
  }, [activePlan, billingCycles, isActivePaidPlan, selectedBillingCycle]);

  useEffect(() => {
    if (!selfPlans.length) return;
    const activePlanId =
      typeof activeSubscription?.planId === 'object'
        ? activeSubscription.planId._id
        : activeSubscription?.planId;
    const activePlanInCurrentCycle = selfPlans.find(
      (plan) => plan.id === activePlanId
    )?.id;

    if (
      activePlanId &&
      isActivePaidPlan &&
      activeSelfPlanAppliedFor.current === activePlanId
    ) {
      return;
    }

    if (activePlanId && isActivePaidPlan && !activePlanInCurrentCycle) {
      const activeCycle = activePlan?.billingCycle as
        MembershipBillingCycle | undefined;
      if (
        activePlan?.planType === 'self_service' &&
        activeCycle &&
        billingCycles.includes(activeCycle) &&
        selectedBillingCycle !== activeCycle
      ) {
        return;
      }
    }

    const previousTier = allSelfPlans.find(
      (plan) => plan.id === selectedPlans.self
    )?.tier;
    const defaultPlan =
      (isActivePaidPlan ? activePlanInCurrentCycle : undefined) ??
      selfPlans.find((plan) => plan.tier === previousTier)?.id ??
      selfPlans.find((plan) => plan.best)?.id ??
      selfPlans[0]?.id;

    if (defaultPlan && defaultPlan !== selectedPlans.self) {
      if (activePlanId && isActivePaidPlan) {
        activeSelfPlanAppliedFor.current = activePlanId;
      }
      setSelectedPlans((prev) => ({ ...prev, self: defaultPlan }));
      return;
    }

    if (activePlanId && isActivePaidPlan) {
      activeSelfPlanAppliedFor.current = activePlanId;
    }
  }, [
    activePlan,
    activeSubscription?.planId,
    allSelfPlans,
    billingCycles,
    isActivePaidPlan,
    selectedBillingCycle,
    selfPlans,
    selectedPlans.self,
  ]);

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
    displayPlans.find((p) => p.id === selectedPlan) ??
    displayPlans.find((p) => p.purchaseState === 'current') ??
    displayPlans[0] ??
    null;

  const selectedIndex = Math.max(
    0,
    displayPlans.findIndex((p) => p.id === selectedPlanItem?.id)
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
  const canUseProfileBoost = Boolean(
    activePlan?.features?.some(
      (item) =>
        item.featureId?.key === 'profile_boost' &&
        isPlanFeatureEnabled(item.value)
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
    selectedPlan: selectedPlanItem?.id ?? selectedPlan,
    setSelectedPlan,
    selectedPlanItem,
    boostPlan,
    canUseProfileBoost,
    selectedIndex,
    activePlanName,
    isFetchingPlans,
  };
}
