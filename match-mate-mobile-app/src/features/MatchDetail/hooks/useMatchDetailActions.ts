import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MatchesStackParamList } from '@/navigation/types';
import {
  useGetMatchProfileQuery,
  useSendInterestMutation,
  useWithdrawInterestMutation,
} from '@/store/services/matchApi.service';
import { useCreateDirectRoomMutation } from '@/store/services/chatApi.service';
import {
  useBlockUserMutation,
  useReportUserMutation,
} from '@/store/services/privacySettings.service';
import { showConfirm } from '@/core/utils/confirm';
import { showError, showSuccess } from '@/core/utils/toast';
import { FALLBACK_PHOTO } from '../MatchDetail.constants';

export function useMatchDetailActions(
  userId: string,
  name: string,
  photos: string[],
  navigation: NativeStackNavigationProp<MatchesStackParamList, 'MatchDetails'>
) {
  const { t } = useTranslation();
  const { refetch } = useGetMatchProfileQuery(userId);
  const [optimisticPendingInterest, setOptimisticPendingInterest] =
    useState(false);

  const [sendInterest, { isLoading: isSendingInterest }] =
    useSendInterestMutation();
  const [withdrawInterest, { isLoading: isWithdrawingInterest }] =
    useWithdrawInterestMutation();
  const [createDirectRoom, { isLoading: isOpeningChat }] =
    useCreateDirectRoomMutation();
  const [blockUser, { isLoading: isBlocking }] = useBlockUserMutation();
  const [reportUser, { isLoading: isReporting }] = useReportUserMutation();

  const resetOptimistic = useCallback(() => {
    setOptimisticPendingInterest(false);
  }, []);

  // ─── Interest ──────────────────────────────────────────────────────────

  const handleSendInterest = useCallback(async (): Promise<void> => {
    try {
      await sendInterest({ receiverId: userId }).unwrap();
      setOptimisticPendingInterest(true);
      showSuccess({
        title: t('match_detail.interest_sent_title'),
        message: t('match_detail.interest_sent_message', { name }),
      });
      await refetch();
    } catch {
      showError({
        title: t('match_detail.interest_failed_title'),
        message: t('common.try_again'),
      });
    }
  }, [sendInterest, userId, name, refetch, t]);

  const handleWithdrawInterest = useCallback(
    async (interestId?: string): Promise<void> => {
      if (!interestId) return;
      try {
        await withdrawInterest({ interestId }).unwrap();
        setOptimisticPendingInterest(false);
        showSuccess({
          title: t('match_detail.withdraw_title'),
          message: t('match_detail.withdraw_message'),
        });
        await refetch();
      } catch {
        showError({
          title: t('match_detail.withdraw_failed_title'),
          message: t('common.try_again'),
        });
      }
    },
    [withdrawInterest, refetch, t]
  );

  // ─── Chat ──────────────────────────────────────────────────────────────

  const handleOpenChat = useCallback(async (): Promise<void> => {
    try {
      await createDirectRoom({ targetUserId: userId }).unwrap();
      navigation.navigate('ChatDetails', {
        userId,
        partnerName: name,
        partnerPhoto: photos[0] ?? (FALLBACK_PHOTO as string),
      });
    } catch {
      showError({
        title: t('match_detail.chat_unavailable_title'),
        message: t('common.try_again'),
      });
    }
  }, [createDirectRoom, userId, name, photos, navigation, t]);

  // ─── Report ────────────────────────────────────────────────────────────

  const handleReport = useCallback((): void => {
    showConfirm({
      title: t('match_detail.report_title'),
      message: t('match_detail.report_message', { name }),
      confirmText: t('match_detail.report_confirm'),
      destructive: true,
      onConfirm: () => {
        void reportUser({
          targetUserId: userId,
          reason: 'Reported from match details',
        })
          .unwrap()
          .then(() =>
            showSuccess({
              title: t('match_detail.report_success_title'),
              message: t('match_detail.report_success_message'),
            })
          )
          .catch(() =>
            showError({
              title: t('match_detail.report_failed_title'),
              message: t('common.try_again'),
            })
          );
      },
    });
  }, [reportUser, userId, name, t]);

  // ─── Block ─────────────────────────────────────────────────────────────

  const handleBlock = useCallback((): void => {
    showConfirm({
      title: t('match_detail.block_title'),
      message: t('match_detail.block_message', { name }),
      confirmText: t('match_detail.block_confirm'),
      destructive: true,
      onConfirm: () => {
        void blockUser({ targetUserId: userId })
          .unwrap()
          .then(() => {
            showSuccess({
              title: t('match_detail.block_success_title'),
              message: t('match_detail.block_success_message', { name }),
            });
            navigation.goBack();
          })
          .catch(() =>
            showError({
              title: t('match_detail.block_failed_title'),
              message: t('common.try_again'),
            })
          );
      },
    });
  }, [blockUser, userId, name, navigation, t]);

  return {
    optimisticPendingInterest,
    resetOptimistic,
    handleSendInterest,
    handleWithdrawInterest,
    handleOpenChat,
    handleReport,
    handleBlock,
    isSendingInterest,
    isWithdrawingInterest,
    isOpeningChat,
    isBlocking,
    isReporting,
  };
}
