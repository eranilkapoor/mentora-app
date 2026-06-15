import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCreateMembershipOrderMutation,
  useStartFreeTrialMutation,
} from '@/store/services/membershipApi.service';
import { showError, showSuccess } from '@/core/utils/toast';
import type { PaymentGateway } from '@matchmate/api-contract';
import {
  getStoreBillingProvider,
  isNativeStoreBillingPlatform,
  isStoreBillingEnabled,
} from '@/core/utils/billingConfig';
import { DisplayPlan } from '../Membership.types';

export function useMembershipActions() {
  const { t } = useTranslation();
  const [createOrder, { isLoading: isCreatingOrder }] =
    useCreateMembershipOrderMutation();
  const [startTrial, { isLoading: isStartingTrial }] =
    useStartFreeTrialMutation();

  const handleCreateOrder = useCallback(
    async (
      selectedPlanItem: DisplayPlan | null,
      gateway: PaymentGateway = getStoreBillingProvider()
    ): Promise<void> => {
      if (!selectedPlanItem?.source?._id) {
        showError({
          title: t('membership.plans_unavailable_title'),
          message: t('membership.plans_unavailable_message'),
        });
        return;
      }

      if (isNativeStoreBillingPlatform() && !isStoreBillingEnabled()) {
        showError({
          title: t('membership.store_billing_unavailable_title'),
          message: t('membership.store_billing_unavailable_message'),
        });
        return;
      }

      try {
        const order = await createOrder({
          planId: selectedPlanItem.source._id,
          currency: selectedPlanItem.source.currency,
          gateway,
          idempotencyKey: `${selectedPlanItem.source._id}-${Date.now()}`,
          description: `${selectedPlanItem.name} membership`,
        }).unwrap();

        showSuccess({
          title: t('membership.order_created_title'),
          message: t('membership.order_created_message', {
            orderId: order.orderId,
            currency: order.currency,
            amount: order.netAmount,
            gateway: order.gateway,
          }),
        });
      } catch {
        showError({
          title: t('membership.payment_failed_title'),
          message: t('membership.payment_failed_message'),
        });
      }
    },
    [createOrder, t]
  );

  const handleCreateBoostOrder = useCallback(
    async (selectedPlanItem: DisplayPlan | null): Promise<void> => {
      if (!selectedPlanItem?.source?._id) {
        showError({
          title: t('membership.plans_unavailable_title'),
          message: t('membership.plans_unavailable_message'),
        });
        return;
      }

      try {
        const order = await createOrder({
          planId: selectedPlanItem.source._id,
          currency: selectedPlanItem.source.currency,
          purpose: 'profile_boost',
          idempotencyKey: `boost-${selectedPlanItem.source._id}-${Date.now()}`,
          description: t('membership.boost.title'),
          metadata: {
            durationHours: 24,
            multiplier: 1.25,
          },
        }).unwrap();

        showSuccess({
          title: t('membership.order_created_title'),
          message: t('membership.order_created_message', {
            orderId: order.orderId,
            currency: order.currency,
            amount: order.netAmount,
          }),
        });
      } catch {
        showError({
          title: t('membership.payment_failed_title'),
          message: t('membership.payment_failed_message'),
        });
      }
    },
    [createOrder, t]
  );

  const handleStartTrial = useCallback(
    async (selectedPlanItem: DisplayPlan | null): Promise<void> => {
      if (
        !selectedPlanItem?.source?._id ||
        !selectedPlanItem.source.trialDays
      ) {
        showError({
          title: t('membership.plans_unavailable_title'),
          message: t('membership.plans_unavailable_message'),
        });
        return;
      }

      try {
        await startTrial({
          planId: selectedPlanItem.source._id,
          trialDays: selectedPlanItem.source.trialDays,
        }).unwrap();

        showSuccess({
          title: t('membership.trial_started_title'),
          message: t('membership.trial_started_message', {
            days: selectedPlanItem.source.trialDays,
            name: selectedPlanItem.name,
          }),
        });
      } catch {
        showError({
          title: t('membership.trial_failed_title'),
          message: t('membership.trial_failed_message'),
        });
      }
    },
    [startTrial, t]
  );

  return {
    handleCreateOrder,
    handleCreateBoostOrder,
    handleStartTrial,
    isCreatingOrder: isCreatingOrder || isStartingTrial,
  };
}
