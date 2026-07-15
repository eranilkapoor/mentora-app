import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { showError, showSuccess } from '@/core/utils/toast';
import { showConfirm } from '@/core/utils/confirm';
import { useCreateDirectRoomMutation } from '@/store/services/chatApi.service';
import {
  useRemoveShortlistedProfileMutation,
  useDismissCuratedMatchMutation,
  useRespondToInterestMutation,
  useSendInterestMutation,
  useShortlistProfileMutation,
  useWithdrawInterestMutation,
} from '@/store/services/matchApi.service';
import { MatchItem, MatchListScreenProps } from '../MatchList.types';
import { FALLBACK_PROFILE_PHOTO } from '@/core/constants';
import { isPlanAccessError } from '@/core/utils/apiMessage';
import { useUpgradePrompt } from '@/features/Membership/hooks/useUpgradePrompt';

export function useMatchListActions(
  navigation: MatchListScreenProps['navigation'],
  options?: {
    onInterestAccepted?: (item: MatchItem) => void;
  }
) {
  const { t } = useTranslation();
  const showUpgradePrompt = useUpgradePrompt();
  const [sendInterest] = useSendInterestMutation();
  const [withdrawInterest] = useWithdrawInterestMutation();
  const [shortlistProfile] = useShortlistProfileMutation();
  const [removeShortlistedProfile] = useRemoveShortlistedProfileMutation();
  const [respondToInterest] = useRespondToInterestMutation();
  const [createDirectRoom] = useCreateDirectRoomMutation();
  const [dismissCuratedMatch] = useDismissCuratedMatchMutation();

  const handleOpenChat = useCallback(
    async (item: MatchItem): Promise<void> => {
      try {
        await createDirectRoom({ targetUserId: item.id }).unwrap();
        navigation.navigate('ChatDetails', {
          userId: item.id,
          partnerName: item.name,
          partnerPhoto: item.avatarUrl ?? (FALLBACK_PROFILE_PHOTO as string),
        });
      } catch (error) {
        if (isPlanAccessError(error)) {
          showUpgradePrompt(t('matches.action_chat'));
          return;
        }

        Alert.alert(
          t('matches.chat_unavailable_title'),
          t('matches.chat_unavailable_message')
        );
      }
    },
    [createDirectRoom, navigation, showUpgradePrompt, t]
  );

  const handlePrimaryAction = useCallback(
    async (item: MatchItem): Promise<void> => {
      // Accept a received interest request
      if (item.requestStatus && item.interestId) {
        showConfirm({
          title: t('matches.accept_confirm_title'),
          message: t('matches.accept_confirm_message', { name: item.name }),
          confirmText: t('matches.accept_confirm_action'),
          cancelText: t('common.cancel'),
          onConfirm: async () => {
            try {
              await respondToInterest({
                interestId: item.interestId as string,
                action: 'ACCEPT',
              }).unwrap();
              options?.onInterestAccepted?.(item);
            } catch {
              Alert.alert(
                t('matches.action_failed_title'),
                t('matches.try_again_message')
              );
            }
          },
        });
        return;
      }

      // Open chat for mutual match
      if (item.isMatched) {
        await handleOpenChat(item);
        return;
      }

      // Withdraw pending interest
      if (item.isInterestPending && item.interestId) {
        try {
          await withdrawInterest({ interestId: item.interestId }).unwrap();
          showSuccess({
            title: t('matches.withdraw_success_title', {
              defaultValue: 'Interest Withdrawn',
            }),
            message: t('matches.withdraw_success_message', {
              defaultValue: 'Your interest request has been withdrawn.',
            }),
          });
        } catch {
          showError({
            title: t('matches.withdraw_failed_title'),
            message: t('matches.try_again_message'),
          });
        }
        return;
      }

      // Send interest
      try {
        await sendInterest({ receiverId: item.id }).unwrap();
        showSuccess({
          title: t('matches.interest_sent_title'),
          message: t('matches.interest_sent_message', { name: item.name }),
        });
      } catch {
        showError({
          title: t('matches.interest_failed_title'),
          message: t('matches.try_again_message'),
        });
      }
    },
    [
      handleOpenChat,
      options,
      respondToInterest,
      sendInterest,
      withdrawInterest,
      t,
    ]
  );

  const handleShortlist = useCallback(
    async (item: MatchItem): Promise<void> => {
      try {
        if (item.isShortlisted) {
          await removeShortlistedProfile({ userId: item.id }).unwrap();
          showSuccess({
            title: t('matches.shortlist_removed_title', {
              defaultValue: 'Removed from Shortlist',
            }),
            message: t('matches.shortlist_removed_message', {
              name: item.name,
              defaultValue: `${item.name} was removed from your shortlist.`,
            }),
          });
          return;
        }
        await shortlistProfile({ userId: item.id }).unwrap();
        showSuccess({
          title: t('matches.shortlist_added_title', {
            defaultValue: 'Shortlisted',
          }),
          message: t('matches.shortlist_added_message', {
            name: item.name,
            defaultValue: `${item.name} was added to your shortlist.`,
          }),
        });
      } catch {
        showError({
          title: t('matches.shortlist_failed_title'),
          message: t('matches.try_again_message'),
        });
      }
    },
    [removeShortlistedProfile, shortlistProfile, t]
  );

  const handleRejectRequest = useCallback(
    async (item: MatchItem): Promise<void> => {
      if (!item.requestStatus || !item.interestId) {
        return;
      }

      showConfirm({
        title: t('matches.reject_confirm_title'),
        message: t('matches.reject_confirm_message', { name: item.name }),
        confirmText: t('matches.reject_confirm_action'),
        cancelText: t('common.cancel'),
        destructive: true,
        onConfirm: async () => {
          try {
            await respondToInterest({
              interestId: item.interestId as string,
              action: 'REJECT',
            }).unwrap();
            showSuccess({
              title: t('matches.rejected_title'),
              message: t('matches.rejected_message', { name: item.name }),
            });
          } catch {
            Alert.alert(
              t('matches.action_failed_title'),
              t('matches.try_again_message')
            );
          }
        },
      });
    },
    [respondToInterest, t]
  );

  const handleDismissCurated = useCallback(
    async (item: MatchItem): Promise<void> => {
      if (!item.curationId) {
        return;
      }

      try {
        await dismissCuratedMatch({ curatedMatchId: item.curationId }).unwrap();
      } catch {
        Alert.alert(
          t('matches.action_failed_title'),
          t('matches.try_again_message')
        );
      }
    },
    [dismissCuratedMatch, t]
  );

  return {
    handlePrimaryAction,
    handleOpenChat,
    handleRejectRequest,
    handleDismissCurated,
    handleShortlist,
  };
}
