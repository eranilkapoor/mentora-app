import { MatchProfile } from '@/core/types';
import { HomeStackParamList } from '@/navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export interface HomeMatchProfile extends MatchProfile {
  isMatched: boolean;
  isShortlisted: boolean;
  isInterestPending: boolean;
  shouldBlurPhotos: boolean;
  interestId?: string;
}

export interface HomeScreenProps {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'HomeScreen'>;
}
