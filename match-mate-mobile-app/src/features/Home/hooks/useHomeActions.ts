import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCreateDirectRoomMutation } from '@/store/services/chatApi.service';
import {
  useRemoveShortlistedProfileMutation,
  useSendInterestMutation,
  useShortlistProfileMutation,
  useWithdrawInterestMutation,
} from '@/store/services/matchApi.service';
import { HomeMatchProfile } from '../Home.types';
import { FALLBACK_PHOTO } from '../Home.constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '@/navigation/types';

export function useHomeActions(
  navigation: NativeStackNavigationProp<HomeStackParamList, 'HomeScreen'>
) {
  const { t } = useTranslation();

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
            partnerPhoto: item.photos[0] ?? (FALLBACK_PHOTO as string),
          });
        } catch {
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
        } catch {
          Alert.alert(
            t('home.withdraw_failed_title'),
            t('home.withdraw_failed_message')
          );
        }
        return;
      }

      try {
        await sendInterest({ receiverId: item.userId }).unwrap();
        Alert.alert(
          t('home.interest_sent_title'),
          t('home.interest_sent_message', { name: item.name })
        );
      } catch {
        Alert.alert(
          t('home.interest_failed_title'),
          t('home.interest_failed_message')
        );
      }
    },
    [createDirectRoom, navigation, sendInterest, withdrawInterest, t]
  );

  const handleShortlist = useCallback(
    async (item: HomeMatchProfile): Promise<void> => {
      try {
        if (item.isShortlisted) {
          await removeShortlistedProfile({ userId: item.userId }).unwrap();
          return;
        }
        await shortlistProfile({ userId: item.userId }).unwrap();
      } catch {
        Alert.alert(
          t('home.shortlist_failed_title'),
          t('home.shortlist_failed_message')
        );
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
