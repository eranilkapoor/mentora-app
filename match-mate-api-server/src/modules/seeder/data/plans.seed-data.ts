import { BillingCycle, PlanTier, PlanType } from '@/common/enums';
import { Plan } from '@/modules/subscriptions/schemas/plan.schema';

export const PLAN_SEEDS: Plan[] = [
  // ==========================================
  //  FREE PLAN
  // ==========================================
  {
    name: 'FREE',
    slug: 'free',
    tier: PlanTier.FREE,
    planType: PlanType.SELF_SERVICE,
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
  //  GOLD MONTHLY
  // ==========================================
  {
    name: 'GOLD_MONTHLY',
    slug: 'gold-monthly',
    tier: PlanTier.GOLD,
    planType: PlanType.SELF_SERVICE,
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
  //  GOLD QUARTERLY
  // ==========================================
  {
    name: 'GOLD_QUARTERLY',
    slug: 'gold-quarterly',
    tier: PlanTier.GOLD,
    planType: PlanType.SELF_SERVICE,
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
  //  GOLD YEARLY
  // ==========================================
  {
    name: 'GOLD_YEARLY',
    slug: 'gold-yearly',
    tier: PlanTier.GOLD,
    planType: PlanType.SELF_SERVICE,
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
  //  PLATINUM MONTHLY
  // ==========================================
  {
    name: 'PLATINUM_MONTHLY',
    slug: 'platinum-monthly',
    tier: PlanTier.PLATINUM,
    planType: PlanType.SELF_SERVICE,
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
  //  PLATINUM QUARTERLY
  // ==========================================
  {
    name: 'PLATINUM_QUARTERLY',
    slug: 'platinum-quarterly',
    tier: PlanTier.PLATINUM,
    planType: PlanType.SELF_SERVICE,
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
  //  PLATINUM YEARLY
  // ==========================================
  {
    name: 'PLATINUM_YEARLY',
    slug: 'platinum-yearly',
    tier: PlanTier.PLATINUM,
    planType: PlanType.SELF_SERVICE,
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
  {
    name: 'ASSISTED_QUARTERLY',
    slug: 'assisted-quarterly',
    tier: PlanTier.PLATINUM,
    planType: PlanType.ASSISTED,
    billingCycle: BillingCycle.QUARTERLY,
    price: 16585,
    durationDays: 90,
    currency: 'INR',
    isPopular: false,
    sortOrder: 8,
    description:
      'Assisted matchmaking for 3 months with relationship manager support.',
    isActive: true,
    version: 1,
  },
  {
    name: 'ASSISTED_HALF_YEARLY',
    slug: 'assisted-half-yearly',
    tier: PlanTier.PLATINUM,
    planType: PlanType.ASSISTED,
    billingCycle: BillingCycle.HALF_YEARLY,
    price: 26186,
    durationDays: 180,
    currency: 'INR',
    isPopular: true,
    sortOrder: 9,
    description:
      'Assisted matchmaking for 6 months with concierge profile curation.',
    isActive: true,
    version: 1,
  },
  {
    name: 'ASSISTED_YEARLY',
    slug: 'assisted-yearly',
    tier: PlanTier.PLATINUM,
    planType: PlanType.ASSISTED,
    billingCycle: BillingCycle.YEARLY,
    price: 42373,
    durationDays: 365,
    currency: 'INR',
    isPopular: false,
    sortOrder: 10,
    description:
      'Premium assisted matchmaking for 12 months with personal matchmaker.',
    isActive: true,
    version: 1,
  },
  {
    name: 'PROFILE_BOOST_24H',
    slug: 'profile-boost-24h',
    tier: PlanTier.GOLD,
    planType: PlanType.PROFILE_BOOST,
    billingCycle: BillingCycle.MONTHLY,
    price: 199,
    durationDays: 1,
    currency: 'INR',
    isPopular: false,
    sortOrder: 50,
    description:
      'One-time 24 hour visibility boost for priority discovery ranking.',
    isActive: true,
    version: 1,
  },
];
