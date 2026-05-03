import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '@/navigation/types';

export type SettingsNavigationProp = NativeStackNavigationProp<
  SettingsStackParamList,
  'SettingsScreen'
>;

export interface SettingsScreenProps {
  navigation: SettingsNavigationProp;
}

export interface SettingRowProps {
  icon: string;
  label: string;
  subLabel?: string;
  badge?: string;
  onPress: () => void;
  isLast?: boolean;
  isDanger?: boolean;
}

export interface SettingToggleProps {
  icon: string;
  label: string;
  subLabel?: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  isLast?: boolean;
}

export interface SectionProps {
  icon: string;
  title: string;
  children: React.ReactNode;
}
