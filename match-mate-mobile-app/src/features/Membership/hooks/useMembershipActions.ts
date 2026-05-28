import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateMembershipOrderMutation } from '@/store/services/membershipApi.service';
import { showError, showSuccess } from '@/core/utils/toast';
import { DisplayPlan } from '../Membership.types';

export function useMembershipActions() {
  const { t } = useTranslation();
  const [createOrder, { isLoading: isCreatingOrder }] =
    useCreateMembershipOrderMutation();

  const handleCreateOrder = useCallback(
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
          idempotencyKey: `${selectedPlanItem.source._id}-${Date.now()}`,
          description: `${selectedPlanItem.name} membership`,
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

  return { handleCreateOrder, isCreatingOrder };
}
