import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCreateDirectRoomMutation } from '@/store/services/chatApi.service';
import {
  useRemoveShortlistedProfileMutation,
  useRespondToInterestMutation,
  useSendInterestMutation,
  useShortlistProfileMutation,
  useWithdrawInterestMutation,
} from '@/store/services/matchApi.service';
import { MatchItem, MatchListScreenProps } from '../MatchList.types';
import { FALLBACK_PHOTO } from '../MatchList.constants';

export function useMatchListActions(
  navigation: MatchListScreenProps['navigation']
) {
  const { t } = useTranslation();
  const [sendInterest] = useSendInterestMutation();
  const [withdrawInterest] = useWithdrawInterestMutation();
  const [shortlistProfile] = useShortlistProfileMutation();
  const [removeShortlistedProfile] = useRemoveShortlistedProfileMutation();
  const [respondToInterest] = useRespondToInterestMutation();
  const [createDirectRoom] = useCreateDirectRoomMutation();

  const handlePrimaryAction = useCallback(
    async (item: MatchItem): Promise<void> => {
      // Accept a received interest request
      if (item.requestStatus && item.interestId) {
        try {
          await respondToInterest({
            interestId: item.interestId,
            action: 'ACCEPT',
          }).unwrap();
          Alert.alert(
            t('matches.interest_accepted_title'),
            t('matches.interest_accepted_message', { name: item.name })
          );
        } catch {
          Alert.alert(
            t('matches.action_failed_title'),
            t('matches.try_again_message')
          );
        }
        return;
      }

      // Open chat for mutual match
      if (item.isMatched) {
        try {
          await createDirectRoom({ targetUserId: item.id }).unwrap();
          navigation.navigate('ChatDetails', {
            userId: item.id,
            partnerName: item.name,
            partnerPhoto: item.avatarUrl ?? (FALLBACK_PHOTO as string),
          });
        } catch {
          Alert.alert(
            t('matches.chat_unavailable_title'),
            t('matches.chat_unavailable_message')
          );
        }
        return;
      }

      // Withdraw pending interest
      if (item.isInterestPending && item.interestId) {
        try {
          await withdrawInterest({ interestId: item.interestId }).unwrap();
        } catch {
          Alert.alert(
            t('matches.withdraw_failed_title'),
            t('matches.try_again_message')
          );
        }
        return;
      }

      // Send interest
      try {
        await sendInterest({ receiverId: item.id }).unwrap();
        Alert.alert(
          t('matches.interest_sent_title'),
          t('matches.interest_sent_message', { name: item.name })
        );
      } catch {
        Alert.alert(
          t('matches.interest_failed_title'),
          t('matches.try_again_message')
        );
      }
    },
    [
      createDirectRoom,
      navigation,
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
          return;
        }
        await shortlistProfile({ userId: item.id }).unwrap();
      } catch {
        Alert.alert(
          t('matches.shortlist_failed_title'),
          t('matches.try_again_message')
        );
      }
    },
    [removeShortlistedProfile, shortlistProfile, t]
  );

  const handleRejectRequest = useCallback(
    async (item: MatchItem): Promise<void> => {
      if (!item.requestStatus || !item.interestId) {
        return;
      }

      try {
        await respondToInterest({
          interestId: item.interestId,
          action: 'REJECT',
        }).unwrap();
        Alert.alert(t('matches.rejected'));
      } catch {
        Alert.alert(
          t('matches.action_failed_title'),
          t('matches.try_again_message')
        );
      }
    },
    [respondToInterest, t]
  );

  return { handlePrimaryAction, handleRejectRequest, handleShortlist };
}
