import { Caste } from '@/core/types';
import { MatchesStackParamList } from '@/navigation/types';
import { MatchTab } from '@/store/services/matchApi.service';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type TabKey = MatchTab | 'matched' | 'requests' | 'shortlisted';
export type AgeRangeKey = 'any' | '18-25' | '26-32' | '33-40';
export type CasteFilterKey = 'any' | Caste;

export interface MatchItem {
  id: string;
  name: string;
  age: number;
  height: string;
  religion: string;
  caste: string;
  education: string;
  profession: string;
  location: string;
  avatarUrl: string;
  isOnline: boolean;
  isNew: boolean;
  isMatched: boolean;
  isShortlisted: boolean;
  isInterestPending: boolean;
  interestId?: string;
  requestStatus?: string;
}

export interface TabConfig {
  key: TabKey;
  labelKey: string;
  icon: string;
  count: number;
}

export interface FilterState {
  cityFilter: string;
  ageFilter: AgeRangeKey;
  casteFilter: CasteFilterKey;
  verifiedOnly: boolean;
}

export interface MatchListScreenProps {
  navigation: NativeStackNavigationProp<MatchesStackParamList, 'MatchList'>;
}
