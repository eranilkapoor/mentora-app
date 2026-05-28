import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MatchesStackParamList } from '@/navigation/types';

export interface MatchDetailScreenProps {
  navigation: NativeStackNavigationProp<MatchesStackParamList, 'MatchDetails'>;
  route: RouteProp<MatchesStackParamList, 'MatchDetails'>;
}

export interface SectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

export interface RowProps {
  label: string;
  value?: string | number | null;
  icon?: string;
  isLast?: boolean;
}

export interface ChipItem {
  icon: string;
  label: string;
}

export interface PrimaryAction {
  icon: string;
  labelKey: string;
  disabled: boolean;
  onPress: () => void;
}
