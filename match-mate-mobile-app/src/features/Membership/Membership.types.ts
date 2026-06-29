import { BottomNavigationProp } from '@/navigation/types';
import { MembershipPlan } from '@/store/services/membershipApi.service';
import { ComponentProps } from 'react';
import Feather from 'react-native-vector-icons/Feather';

export interface MembershipScreenProps {
  navigation: BottomNavigationProp;
}

export type MembershipTab = 'self' | 'assisted' | 'enterprise';

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
  trialLabel?: string;
  renewalLabel?: string;
  tier?: string;
  isFree?: boolean;
  isCustom?: boolean;
  best?: boolean;
  description?: string;
  featureValues: Record<string, string>;
  source?: MembershipPlan;
}

export interface DisplayFeatureRow {
  key: string;
  label: string;
  values: string[];
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
  icon: ComponentProps<typeof Feather>['name'];
  labelKey: string;
}
