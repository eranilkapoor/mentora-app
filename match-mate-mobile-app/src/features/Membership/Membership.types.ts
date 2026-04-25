import { BottomNavigationProp } from '@/navigation/types';

export interface MembershipScreenProps {
  navigation: BottomNavigationProp;
}

export interface Plan {
  name: string;
  price: string;
  contacts: number;
  superInterest: number;
  best?: boolean;
}

export interface FeatureRowProps {
  label: string;
  values: string[];
  selectedIndex: number;
  isLast?: boolean;
}

export interface DurationPlan {
  months: number;
  price: string;
  oldPrice: string;
  perMonth: string;
}

export interface PlanCardProps {
  plan: DurationPlan;
  active: boolean;
  onPress: () => void;
}
