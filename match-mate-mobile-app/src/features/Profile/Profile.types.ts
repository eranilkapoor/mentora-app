import { AppNavigationProp } from '@/navigation/types';

export interface ProfileScreenProps {
  navigation: AppNavigationProp;
}

export interface SectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

export interface RowProps {
  label: string;
  value?: string | string[] | null;
}
