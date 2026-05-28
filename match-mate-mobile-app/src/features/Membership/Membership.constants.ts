import {
  DurationPlan,
  Plan,
  FeatureItem,
  BenefitItem,
  StatItem,
  TrustBadge,
} from './Membership.types';

export const PLANS: Plan[] = [
  { name: 'Pro Lite', price: '₹1,999', contacts: 0, superInterest: 0 },
  { name: 'Pro', price: '₹3,999', contacts: 25, superInterest: 0 },
  {
    name: 'Pro Max',
    price: '₹6,999',
    contacts: 50,
    superInterest: 50,
    best: true,
  },
];

// Feature label keys are i18n — values are data (checkmarks / counts)
export const FEATURES: FeatureItem[] = [
  { labelKey: 'membership.feature_calls_chat', values: ['✓', '✓', '✓'] },
  { labelKey: 'membership.feature_engage_plus', values: ['✓', '✓', '✓'] },
  { labelKey: 'membership.feature_advanced_search', values: ['✓', '✓', '✓'] },
  { labelKey: 'membership.feature_contacts', values: ['0', '25', '50'] },
  { labelKey: 'membership.feature_super_interest', values: ['0', '0', '50'] },
];

export const DURATION_PLANS: DurationPlan[] = [
  { months: 3, price: '₹16,585', oldPrice: '₹33,169', perMonth: '₹5,528/mo' },
  {
    months: 6,
    price: '₹26,186',
    oldPrice: '₹52,372',
    perMonth: '₹4,364/mo',
    popular: true,
  },
  { months: 12, price: '₹42,373', oldPrice: '₹84,745', perMonth: '₹3,531/mo' },
];

export const BENEFITS: BenefitItem[] = [
  { icon: '⭐', textKey: 'membership.benefit_pro_max' },
  { icon: '👩‍💼', textKey: 'membership.benefit_relationship_manager' },
];

export const POINTS_KEYS: string[] = [
  'membership.point_profile',
  'membership.point_matches',
  'membership.point_info',
  'membership.point_faster',
  'membership.point_meetings',
];

export const HERO_STATS: StatItem[] = [
  {
    valueKey: 'membership.stat_members_value',
    labelKey: 'membership.stat_members_label',
  },
  {
    valueKey: 'membership.stat_faster_value',
    labelKey: 'membership.stat_faster_label',
  },
  {
    valueKey: 'membership.stat_success_value',
    labelKey: 'membership.stat_success_label',
  },
];

export const SELF_TRUST_BADGES: TrustBadge[] = [
  { icon: '🔒', labelKey: 'membership.trust_secure' },
  { icon: '✅', labelKey: 'membership.trust_verified' },
  { icon: '💬', labelKey: 'membership.trust_support' },
];

export const ASSISTED_TRUST_BADGES: TrustBadge[] = [
  { icon: '🔒', labelKey: 'membership.trust_secure' },
  { icon: '✅', labelKey: 'membership.trust_verified' },
  { icon: '🏆', labelKey: 'membership.trust_members' },
];
