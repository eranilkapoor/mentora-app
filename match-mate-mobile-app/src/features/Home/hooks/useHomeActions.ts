import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { showError, showSuccess } from '@/core/utils/toast';
import { useCreateDirectRoomMutation } from '@/store/services/chatApi.service';
import {
  useRemoveShortlistedProfileMutation,
  useSendInterestMutation,
  useShortlistProfileMutation,
  useWithdrawInterestMutation,
} from '@/store/services/matchApi.service';
import { HomeMatchProfile } from '../Home.types';
import { FALLBACK_PROFILE_PHOTO } from '@/core/constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '@/navigation/types';
import { isPlanAccessError } from '@/core/utils/apiMessage';
import { useUpgradePrompt } from '@/features/Membership/hooks/useUpgradePrompt';

export function useHomeActions(
  navigation: NativeStackNavigationProp<HomeStackParamList, 'HomeScreen'>
) {
  const { t } = useTranslation();
  const showUpgradePrompt = useUpgradePrompt();

  const [sendInterest] = useSendInterestMutation();
  const [withdrawInterest] = useWithdrawInterestMutation();
  const [shortlistProfile] = useShortlistProfileMutation();
  const [removeShortlistedProfile] = useRemoveShortlistedProfileMutation();
  const [createDirectRoom] = useCreateDirectRoomMutation();

  const handlePrimaryAction = useCallback(
    async (item: HomeMatchProfile): Promise<void> => {
      if (item.isMatched) {
        try {
          await createDirectRoom({ targetUserId: item.userId }).unwrap();
          navigation.navigate('ChatDetails', {
            userId: item.userId,
            partnerName: item.name,
            partnerPhoto: item.photos[0] ?? (FALLBACK_PROFILE_PHOTO as string),
          });
        } catch (error) {
          if (isPlanAccessError(error)) {
            showUpgradePrompt(t('home.action_chat'));
            return;
          }

          Alert.alert(
            t('home.chat_unavailable_title'),
            t('home.chat_unavailable_message')
          );
        }
        return;
      }

      if (item.isInterestPending && item.interestId) {
        try {
          await withdrawInterest({ interestId: item.interestId }).unwrap();
          showSuccess({
            title: t('home.withdraw_success_title', {
              defaultValue: 'Interest Withdrawn',
            }),
            message: t('home.withdraw_success_message', {
              defaultValue: 'Your interest request has been withdrawn.',
            }),
          });
        } catch {
          showError({
            title: t('home.withdraw_failed_title'),
            message: t('home.withdraw_failed_message'),
          });
        }
        return;
      }

      try {
        await sendInterest({ receiverId: item.userId }).unwrap();
        showSuccess({
          title: t('home.interest_sent_title'),
          message: t('home.interest_sent_message', { name: item.name }),
        });
      } catch {
        showError({
          title: t('home.interest_failed_title'),
          message: t('home.interest_failed_message'),
        });
      }
    },
    [
      createDirectRoom,
      navigation,
      sendInterest,
      showUpgradePrompt,
      withdrawInterest,
      t,
    ]
  );

  const handleShortlist = useCallback(
    async (item: HomeMatchProfile): Promise<void> => {
      try {
        if (item.isShortlisted) {
          await removeShortlistedProfile({ userId: item.userId }).unwrap();
          showSuccess({
            title: t('home.shortlist_removed_title', {
              defaultValue: 'Removed from Shortlist',
            }),
            message: t('home.shortlist_removed_message', {
              name: item.name,
              defaultValue: `${item.name} was removed from your shortlist.`,
            }),
          });
          return;
        }
        await shortlistProfile({ userId: item.userId }).unwrap();
        showSuccess({
          title: t('home.shortlist_added_title', {
            defaultValue: 'Shortlisted',
          }),
          message: t('home.shortlist_added_message', {
            name: item.name,
            defaultValue: `${item.name} was added to your shortlist.`,
          }),
        });
      } catch {
        showError({
          title: t('home.shortlist_failed_title'),
          message: t('home.shortlist_failed_message'),
        });
      }
    },
    [removeShortlistedProfile, shortlistProfile, t]
  );

  const handleRefresh = useCallback(
    async (
      page: number,
      refetch: () => void,
      refetchMatches: () => void,
      refetchShortlisted: () => void,
      refetchSentInterests: () => void,
      setRefreshing: (v: boolean) => void,
      setPage: (v: number) => void
    ): Promise<void> => {
      setRefreshing(true);
      setPage(1);
      await Promise.all([
        page === 1 ? refetch() : Promise.resolve(),
        refetchMatches(),
        refetchShortlisted(),
        refetchSentInterests(),
      ]);
      setRefreshing(false);
    },
    []
  );

  return { handlePrimaryAction, handleShortlist, handleRefresh };
}
