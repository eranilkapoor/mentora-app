import { MembershipPlan } from '@/store/services/membershipApi.service';
import {
  DisplayFeatureRow,
  DisplayPlan,
  MembershipBillingCycle,
  MembershipTab,
} from './Membership.types';

export const MEMBERSHIP_BILLING_CYCLE_ORDER: MembershipBillingCycle[] = [
  'monthly',
  'quarterly',
  'half_yearly',
  'yearly',
];

const SELF_SERVICE_TIERS = ['silver', 'gold', 'platinum'];
const PLAN_TIER_RANK: Record<string, number> = {
  free: 0,
  silver: 1,
  gold: 2,
  platinum: 3,
};

export const formatPlanName = (name: string): string =>
  name
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

const isObjectIdLike = (value: string): boolean => /^[a-f\d]{24}$/i.test(value);

export const formatPlanCycleLabel = (
  billingCycle?: string,
  durationDays?: number
): string => {
  const normalizedCycle = billingCycle?.trim().toLowerCase();

  switch (normalizedCycle) {
    case 'monthly':
      return 'Monthly';
    case 'quarterly':
      return '3 Months';
    case 'half_yearly':
    case 'half-yearly':
      return '6 Months';
    case 'yearly':
    case 'annual':
      return 'Yearly';
    case 'custom':
      return 'Custom term';
    default:
      break;
  }

  if (typeof durationDays === 'number') {
    if (durationDays >= 365) return 'Yearly';
    if (durationDays >= 180) return '6 Months';
    if (durationDays >= 90) return '3 Months';
    if (durationDays >= 30) return 'Monthly';
  }

  return billingCycle ? formatPlanName(billingCycle) : '';
};

export const formatMembershipPlanDisplayName = (
  planOrName:
    | Pick<
        MembershipPlan,
        | 'name'
        | 'slug'
        | 'tier'
        | 'planType'
        | 'billingCycle'
        | 'durationDays'
        | 'isCustom'
      >
    | string,
  fallback = 'Membership plan'
): string => {
  if (typeof planOrName === 'string') {
    const value = planOrName.trim();
    if (!value || isObjectIdLike(value)) return fallback;
    const normalizedValue = value.toLowerCase().replace(/-/g, '_');

    if (normalizedValue.startsWith('assisted_custom')) {
      return 'Custom Assisted Matchmaking';
    }

    if (normalizedValue.startsWith('assisted')) {
      const assistedCycle = normalizedValue.includes('half_yearly')
        ? '6 Months'
        : normalizedValue.includes('quarterly')
          ? '3 Months'
          : normalizedValue.includes('yearly')
            ? 'Yearly'
            : '';

      return ['Assisted Matchmaking', assistedCycle].filter(Boolean).join(' ');
    }

    return formatPlanName(value);
  }

  const cycleLabel = formatPlanCycleLabel(
    planOrName.billingCycle,
    planOrName.durationDays
  );

  if (planOrName.planType === 'assisted') {
    if (planOrName.isCustom) return 'Custom Assisted Matchmaking';
    return ['Assisted Matchmaking', cycleLabel].filter(Boolean).join(' ');
  }

  const tierLabel =
    planOrName.tier && planOrName.tier !== 'free'
      ? formatPlanName(planOrName.tier)
      : null;

  if (tierLabel && cycleLabel) {
    return `${tierLabel} ${cycleLabel}`;
  }

  return formatPlanName(planOrName.name ?? planOrName.slug ?? fallback);
};

export const formatPlanPrice = (plan: MembershipPlan): string =>
  plan.isCustom
    ? 'Custom pricing'
    : plan.price <= 0
      ? 'Free'
      : new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: plan.currency || 'INR',
          maximumFractionDigits: 0,
        }).format(plan.price);

export const getDurationLabel = (
  durationDays: number,
  isCustom = false
): string => {
  if (isCustom) return 'Custom term';
  if (durationDays >= 365) return '/ year';
  if (durationDays >= 180) return '/ 6 months';
  if (durationDays >= 90) return '/ 3 months';
  if (durationDays >= 30) return '/ month';
  return `/${durationDays} days`;
};

export const getPlanTypeForTab = (
  tab: MembershipTab
): MembershipPlan['planType'] =>
  tab === 'assisted' ? 'assisted' : 'self_service';

export const getPlanTierRank = (tier?: string): number =>
  tier ? (PLAN_TIER_RANK[tier] ?? 0) : 0;

const formatFeatureValue = (key: string, value: unknown): string => {
  if (value === false || value === 0 || value === null || value === undefined) {
    return '0';
  }
  if (value === -1) return 'Unlimited';

  if (typeof value !== 'number') return String(value);

  switch (key) {
    case 'upload_photos':
    case 'multiple_profile_photos':
      return `${value} photos`;
    case 'upload_videos':
      return `${value} video`;
    case 'send_interest':
      return `${value}/day`;
    case 'send_interest_monthly_limit':
      return `${value}/month`;
    case 'message_limit':
      return `${value} messages`;
    case 'view_contact':
    case 'contact_view_limit':
      return `${value}/month`;
    case 'daily_profile_views':
      return `${value}/day`;
    case 'profile_boost':
      return `${value} boosts`;
    default:
      return value === 1 ? 'Yes' : String(value);
  }
};

const normalizeUnlimitedFeatureValues = (
  featureValues: Record<string, string>
): Record<string, string> => {
  if (featureValues.unlimited_profile_views === 'Unlimited') {
    featureValues.daily_profile_views = 'Unlimited';
    featureValues.profile_views = 'Unlimited';
  }

  return featureValues;
};

const getFeatureLabel = (key: string, name?: string): string =>
  name?.trim() ?? formatPlanName(key);

const SELF_SERVICE_FEATURE_PRIORITY = [
  'upload_photos',
  'upload_videos',
  'send_interest',
  'send_interest_monthly_limit',
  'message_limit',
  'contact_view_limit',
  'who_viewed_me',
  'daily_profile_views',
  'profile_views',
  'profile_boost',
  'auto_renewal',
  'support_tickets',
];

const ASSISTED_FEATURE_PRIORITY = [
  'relationship_manager',
  'dedicated_relationship_manager',
  'concierge_matchmaking',
  'personal_matchmaker',
  'premium_badge',
  'priority_support',
  'advanced_matching',
  'ai_recommendations',
  'weekly_reports',
  'contact_view_limit',
  'match_success_rate',
  'support_tickets',
];

const CUSTOM_ASSISTED_FEATURE_PRIORITY = [
  'enterprise_sso',
  'admin_dashboard',
  'api_access',
  'custom_branding',
  'bulk_seat_management',
  'sla_support',
  'data_residency',
  'dedicated_account_manager',
  'privacy_controls',
  'fraud_detection',
  'support_tickets',
];

export const buildDisplayPlans = (
  backendPlans: MembershipPlan[],
  tab: MembershipTab
): DisplayPlan[] => {
  const planType = getPlanTypeForTab(tab);
  const sortedPlans = backendPlans
    .filter(
      (plan) =>
        (plan.planType ?? 'self_service') === planType &&
        plan.planType !== 'profile_boost' &&
        (tab !== 'self' || plan.price > 0)
    )
    .sort(
      (a, b) =>
        (a.sortOrder ?? 999) - (b.sortOrder ?? 999) ||
        a.price - b.price ||
        a.durationDays - b.durationDays
    );
  const recommendedPlan = [...sortedPlans]
    .reverse()
    .find((plan) => plan.isPopular);

  return sortedPlans.map((plan) => ({
    id: plan._id,
    name: formatMembershipPlanDisplayName(plan),
    price: formatPlanPrice(plan),
    durationLabel: getDurationLabel(plan.durationDays, plan.isCustom),
    trialLabel:
      (plan.trialDays ?? 0) > 0 ? `${plan.trialDays} days trial` : undefined,
    renewalLabel: plan.autoRenewDefault
      ? 'Auto-renewal enabled'
      : 'Manual renewal',
    tier: plan.tier,
    isFree: !plan.isCustom && plan.price <= 0,
    isCustom: Boolean(plan.isCustom),
    best: plan === recommendedPlan,
    ...(plan.description ? { description: plan.description } : {}),
    featureValues: normalizeUnlimitedFeatureValues(
      plan.features?.reduce<Record<string, string>>((acc, item) => {
        const key = item.featureId?.key;
        if (!key) return acc;
        acc[key] = formatFeatureValue(key, item.value);
        return acc;
      }, {}) ?? {}
    ),
    source: plan,
  }));
};

export const getAvailableBillingCycles = (
  plans: DisplayPlan[]
): MembershipBillingCycle[] =>
  MEMBERSHIP_BILLING_CYCLE_ORDER.filter((cycle) =>
    plans.some((plan) => plan.source?.billingCycle === cycle)
  );

export const selectSelfServicePlans = (
  plans: DisplayPlan[],
  cycle: MembershipBillingCycle
): DisplayPlan[] =>
  SELF_SERVICE_TIERS.map((tier) =>
    plans.find(
      (plan) => plan.tier === tier && plan.source?.billingCycle === cycle
    )
  ).filter((plan): plan is DisplayPlan => Boolean(plan));

export const buildFeatureRows = (
  plans: DisplayPlan[],
  maxRows = 12,
  tab: MembershipTab = 'self',
  customSelected = false
): DisplayFeatureRow[] => {
  const features = new Map<string, string>();

  plans.forEach((plan) => {
    plan.source?.features?.forEach((item) => {
      const key = item.featureId?.key;
      if (!key) return;
      features.set(key, getFeatureLabel(key, item.featureId?.name));
    });
  });

  const priority =
    tab === 'assisted'
      ? ASSISTED_FEATURE_PRIORITY
      : SELF_SERVICE_FEATURE_PRIORITY;

  const effectivePriority = customSelected
    ? [...CUSTOM_ASSISTED_FEATURE_PRIORITY, ...priority]
    : priority;

  return Array.from(features.entries())
    .sort(([a], [b]) => {
      const aIndex = effectivePriority.indexOf(a);
      const bIndex = effectivePriority.indexOf(b);

      if (aIndex !== -1 || bIndex !== -1) {
        return (
          (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) -
          (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex)
        );
      }

      return getFeatureLabel(a).localeCompare(getFeatureLabel(b));
    })
    .slice(0, maxRows)
    .map(([key, label]) => ({
      key,
      label,
      values: plans.map((plan) => plan.featureValues[key] ?? '0'),
    }));
};
