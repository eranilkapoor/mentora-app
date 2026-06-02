import { MembershipPlan } from '@/store/services/membershipApi.service';
import {
  DisplayFeatureRow,
  DisplayPlan,
  MembershipTab,
} from './Membership.types';

export const formatPlanName = (name: string): string =>
  name
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

export const formatPlanPrice = (plan: MembershipPlan): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: plan.currency || 'INR',
    maximumFractionDigits: 0,
  }).format(plan.price);

export const getDurationLabel = (durationDays: number): string => {
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

const formatFeatureValue = (value: unknown): string => {
  if (value === true || value === 1) return '✓';
  if (value === false || value === 0 || value === null || value === undefined) {
    return '0';
  }
  if (value === -1) return 'Unlimited';
  return String(value);
};

const getFeatureLabel = (key: string, name?: string): string =>
  name?.trim() ?? formatPlanName(key);

export const buildDisplayPlans = (
  backendPlans: MembershipPlan[],
  tab: MembershipTab
): DisplayPlan[] => {
  const planType = getPlanTypeForTab(tab);

  return backendPlans
    .filter(
      (plan) => plan.price > 0 && (plan.planType ?? 'self_service') === planType
    )
    .map((plan) => ({
      id: plan._id,
      name: formatPlanName(plan.name),
      price: formatPlanPrice(plan),
      durationLabel: getDurationLabel(plan.durationDays),
      best: Boolean(plan.isPopular),
      ...(plan.description ? { description: plan.description } : {}),
      featureValues:
        plan.features?.reduce<Record<string, string>>((acc, item) => {
          const key = item.featureId?.key;
          if (!key) return acc;
          acc[key] = formatFeatureValue(item.value);
          return acc;
        }, {}) ?? {},
      source: plan,
    }));
};

export const buildFeatureRows = (
  plans: DisplayPlan[],
  maxRows = 8
): DisplayFeatureRow[] => {
  const features = new Map<string, string>();

  plans.forEach((plan) => {
    plan.source?.features?.forEach((item) => {
      const key = item.featureId?.key;
      if (!key) return;
      features.set(key, getFeatureLabel(key, item.featureId?.name));
    });
  });

  return Array.from(features.entries())
    .slice(0, maxRows)
    .map(([key, label]) => ({
      key,
      label,
      values: plans.map((plan) => plan.featureValues[key] ?? '0'),
    }));
};
