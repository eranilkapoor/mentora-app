import { BillingCycle, PlanTier } from 'src/common/enums';
import { Plan } from 'src/modules/subscription/schemas/plan.schema';

export const PLAN_SEEDS: Plan[] = [
  // ==========================================
  // 🆓 FREE PLAN
  // ==========================================
  {
    name: 'FREE',
    slug: 'free',
    tier: PlanTier.FREE,
    billingCycle: BillingCycle.MONTHLY,
    price: 0,
    durationDays: 3650,
    currency: 'INR',
    isPopular: false,
    sortOrder: 1,
    description: 'Basic free membership with limited matchmaking access.',
    isActive: true,
    version: 1,
  },

  // ==========================================
  // 🥇 GOLD MONTHLY
  // ==========================================
  {
    name: 'GOLD_MONTHLY',
    slug: 'gold-monthly',
    tier: PlanTier.GOLD,
    billingCycle: BillingCycle.MONTHLY,
    price: 999,
    durationDays: 30,
    currency: 'INR',
    isPopular: true,
    sortOrder: 2,
    description:
      'Gold monthly subscription with unlimited likes, chat, and advanced filters.',
    isActive: true,
    version: 1,
  },

  // ==========================================
  // 🥇 GOLD QUARTERLY
  // ==========================================
  {
    name: 'GOLD_QUARTERLY',
    slug: 'gold-quarterly',
    tier: PlanTier.GOLD,
    billingCycle: BillingCycle.QUARTERLY,
    price: 2499,
    durationDays: 90,
    currency: 'INR',
    isPopular: false,
    sortOrder: 3,
    description:
      'Gold quarterly subscription with premium matchmaking benefits.',
    isActive: true,
    version: 1,
  },

  // ==========================================
  // 🥇 GOLD YEARLY
  // ==========================================
  {
    name: 'GOLD_YEARLY',
    slug: 'gold-yearly',
    tier: PlanTier.GOLD,
    billingCycle: BillingCycle.YEARLY,
    price: 7999,
    durationDays: 365,
    currency: 'INR',
    isPopular: false,
    sortOrder: 4,
    description:
      'Gold yearly subscription with maximum savings and premium access.',
    isActive: true,
    version: 1,
  },

  // ==========================================
  // 💎 PLATINUM MONTHLY
  // ==========================================
  {
    name: 'PLATINUM_MONTHLY',
    slug: 'platinum-monthly',
    tier: PlanTier.PLATINUM,
    billingCycle: BillingCycle.MONTHLY,
    price: 2499,
    durationDays: 30,
    currency: 'INR',
    isPopular: false,
    sortOrder: 5,
    description:
      'Platinum monthly subscription with AI matchmaking and priority ranking.',
    isActive: true,
    version: 1,
  },

  // ==========================================
  // 💎 PLATINUM QUARTERLY
  // ==========================================
  {
    name: 'PLATINUM_QUARTERLY',
    slug: 'platinum-quarterly',
    tier: PlanTier.PLATINUM,
    billingCycle: BillingCycle.QUARTERLY,
    price: 6499,
    durationDays: 90,
    currency: 'INR',
    isPopular: true,
    sortOrder: 6,
    description:
      'Platinum quarterly plan with concierge matchmaking and premium visibility.',
    isActive: true,
    version: 1,
  },

  // ==========================================
  // 💎 PLATINUM YEARLY
  // ==========================================
  {
    name: 'PLATINUM_YEARLY',
    slug: 'platinum-yearly',
    tier: PlanTier.PLATINUM,
    billingCycle: BillingCycle.YEARLY,
    price: 19999,
    durationDays: 365,
    currency: 'INR',
    isPopular: false,
    sortOrder: 7,
    description:
      'Ultimate yearly platinum experience with all premium features unlocked.',
    isActive: true,
    version: 1,
  },
];
