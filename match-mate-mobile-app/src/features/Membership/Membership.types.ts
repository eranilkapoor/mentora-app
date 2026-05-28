import { BottomNavigationProp } from '@/navigation/types';
import { MembershipPlan } from '@/store/services/membershipApi.service';

export interface MembershipScreenProps {
  navigation: BottomNavigationProp;
}

export type MembershipTab = 'self' | 'assisted';

export interface Plan {
  name: string;
  price: string;
  contacts: number;
  superInterest: number;
  best?: boolean;
}

export interface FeatureItem {
  labelKey: string;
  values: string[];
}

export interface FeatureRowProps {
  labelKey: string;
  values: string[];
  selectedIndex: number;
  isLast?: boolean;
}

export interface DurationPlan {
  months: number;
  price: string;
  oldPrice: string;
  perMonth: string;
  popular?: boolean;
}

export interface PlanCardProps {
  plan: DurationPlan;
  active: boolean;
  onPress: () => void;
}

export interface DisplayPlan {
  id?: string;
  name: string;
  price: string;
  durationLabel: string;
  best?: boolean;
  source?: MembershipPlan;
}

export interface StatItem {
  valueKey: string;
  labelKey: string;
}

export interface BenefitItem {
  icon: string;
  textKey: string;
}

export interface TrustBadge {
  icon: string;
  labelKey: string;
}
