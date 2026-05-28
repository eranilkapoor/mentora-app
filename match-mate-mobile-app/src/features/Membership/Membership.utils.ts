import { MembershipPlan } from '@/store/services/membershipApi.service';
import { DisplayPlan } from './Membership.types';
import { PLANS } from './Membership.constants';

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
  if (durationDays >= 90) return '/ 3 months';
  if (durationDays >= 30) return '/ month';
  return `/${durationDays} days`;
};

export const buildDisplayPlans = (
  backendPlans: MembershipPlan[]
): DisplayPlan[] => {
  const paidPlans = backendPlans
    .filter((plan) => plan.price > 0)
    .slice(0, 3)
    .map((plan) => ({
      id: plan._id,
      name: formatPlanName(plan.name),
      price: formatPlanPrice(plan),
      durationLabel: getDurationLabel(plan.durationDays),
      best: Boolean(plan.isPopular),
      source: plan,
    }));

  if (paidPlans.length > 0) return paidPlans;

  return PLANS.map((plan) => ({
    name: plan.name,
    price: plan.price,
    durationLabel: '/ 3 months',
    best: Boolean(plan.best),
  }));
};
