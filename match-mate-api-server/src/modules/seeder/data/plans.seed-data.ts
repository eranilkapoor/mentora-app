import { BillingCycle, PlanTier, PlanType } from '@/common/enums';
import { Plan } from '@/modules/subscriptions/schemas/plan.schema';
import { StoreProductType } from '@/modules/subscriptions/enums/store-product-type.enum';

const recurringStoreProducts = (tier: string, cycle: string) => ({
  android: {
    productId: `matchmate_${tier}`,
    basePlanId: cycle,
    offerId: 'trial-7-days',
    productType: StoreProductType.SUBSCRIPTION,
  },
  ios: {
    productId: `matchmate_${tier}_${cycle.replace('-', '_')}`,
    subscriptionGroupId: 'matchmate_membership',
    productType: StoreProductType.SUBSCRIPTION,
  },
});

export const PLAN_SEEDS: Plan[] = [
  // ==========================================
  //  FREE PLAN
  // ==========================================
  {
    name: 'FREE',
    slug: 'free',
    tier: PlanTier.FREE,
    planType: PlanType.SELF_SERVICE,
    billingCycle: BillingCycle.YEARLY,
    price: 0,
    durationDays: 365,
    trialDays: 0,
    autoRenewDefault: true,
    isCustom: false,
    currency: 'INR',
    isPopular: false,
    sortOrder: 1,
    description: 'Basic free membership with limited matchmaking access.',
    isActive: true,
    version: 1,
  },

  // ==========================================
  //  SILVER MONTHLY
  // ==========================================
  {
    name: 'SILVER_MONTHLY',
    slug: 'silver-monthly',
    tier: PlanTier.SILVER,
    planType: PlanType.SELF_SERVICE,
    billingCycle: BillingCycle.MONTHLY,
    price: 699,
    durationDays: 30,
    trialDays: 7,
    autoRenewDefault: true,
    isCustom: false,
    currency: 'INR',
    isPopular: false,
    sortOrder: 2,
    description:
      'Silver monthly subscription with extended profile visibility and communication limits.',
    isActive: true,
    version: 1,
    storeProducts: recurringStoreProducts('silver', 'monthly'),
  },

  // ==========================================
  //  SILVER QUARTERLY
  // ==========================================
  {
    name: 'SILVER_QUARTERLY',
    slug: 'silver-quarterly',
    tier: PlanTier.SILVER,
    planType: PlanType.SELF_SERVICE,
    billingCycle: BillingCycle.QUARTERLY,
    price: 1799,
    durationDays: 90,
    trialDays: 7,
    autoRenewDefault: true,
    isCustom: false,
    currency: 'INR',
    isPopular: false,
    sortOrder: 3,
    description:
      'Silver quarterly subscription with balanced premium access and savings.',
    isActive: true,
    version: 1,
    storeProducts: recurringStoreProducts('silver', 'quarterly'),
  },

  // ==========================================
  //  SILVER YEARLY
  // ==========================================
  {
    name: 'SILVER_YEARLY',
    slug: 'silver-yearly',
    tier: PlanTier.SILVER,
    planType: PlanType.SELF_SERVICE,
    billingCycle: BillingCycle.YEARLY,
    price: 5999,
    durationDays: 365,
    trialDays: 7,
    autoRenewDefault: true,
    isCustom: false,
    currency: 'INR',
    isPopular: false,
    sortOrder: 4,
    description:
      'Silver yearly subscription with long-term value and core premium feature access.',
    isActive: true,
    version: 1,
    storeProducts: recurringStoreProducts('silver', 'yearly'),
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
    trialDays: 7,
    autoRenewDefault: true,
    isCustom: false,
    currency: 'INR',
    isPopular: false,
    sortOrder: 5,
    description:
      'Gold monthly subscription with unlimited interests, chat, and advanced filters.',
    isActive: true,
    version: 1,
    storeProducts: recurringStoreProducts('gold', 'monthly'),
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
    trialDays: 7,
    autoRenewDefault: true,
    isCustom: false,
    currency: 'INR',
    isPopular: false,
    sortOrder: 6,
    description:
      'Gold quarterly subscription with premium matchmaking benefits.',
    isActive: true,
    version: 1,
    storeProducts: recurringStoreProducts('gold', 'quarterly'),
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
    trialDays: 7,
    autoRenewDefault: true,
    isCustom: false,
    currency: 'INR',
    isPopular: false,
    sortOrder: 7,
    description:
      'Gold yearly subscription with maximum savings and premium access.',
    isActive: true,
    version: 1,
    storeProducts: recurringStoreProducts('gold', 'yearly'),
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
    trialDays: 7,
    autoRenewDefault: true,
    isCustom: false,
    currency: 'INR',
    isPopular: false,
    sortOrder: 8,
    description:
      'Platinum monthly subscription with AI matchmaking and priority ranking.',
    isActive: true,
    version: 1,
    storeProducts: recurringStoreProducts('platinum', 'monthly'),
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
    trialDays: 7,
    autoRenewDefault: true,
    isCustom: false,
    currency: 'INR',
    isPopular: true,
    sortOrder: 9,
    description:
      'Platinum quarterly plan with concierge matchmaking and premium visibility.',
    isActive: true,
    version: 1,
    storeProducts: recurringStoreProducts('platinum', 'quarterly'),
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
    trialDays: 7,
    autoRenewDefault: true,
    isCustom: false,
    currency: 'INR',
    isPopular: false,
    sortOrder: 10,
    description:
      'Ultimate yearly platinum experience with all premium features unlocked.',
    isActive: true,
    version: 1,
    storeProducts: recurringStoreProducts('platinum', 'yearly'),
  },
  // ==========================================
  //  ASSISTED HALF YEARLY
  // ==========================================
  {
    name: 'ASSISTED_HALF_YEARLY',
    slug: 'assisted-half-yearly',
    tier: PlanTier.PLATINUM,
    planType: PlanType.ASSISTED,
    billingCycle: BillingCycle.HALF_YEARLY,
    price: 26186,
    durationDays: 180,
    trialDays: 7,
    autoRenewDefault: true,
    isCustom: false,
    currency: 'INR',
    isPopular: true,
    sortOrder: 11,
    description:
      'Assisted matchmaking for 6 months with concierge profile curation.',
    isActive: true,
    version: 1,
    storeProducts: recurringStoreProducts('assisted', 'half-yearly'),
  },
  // ==========================================
  //  ASSISTED YEARLY
  // ==========================================
  {
    name: 'ASSISTED_YEARLY',
    slug: 'assisted-yearly',
    tier: PlanTier.PLATINUM,
    planType: PlanType.ASSISTED,
    billingCycle: BillingCycle.YEARLY,
    price: 42373,
    durationDays: 365,
    trialDays: 7,
    autoRenewDefault: true,
    isCustom: false,
    currency: 'INR',
    isPopular: false,
    sortOrder: 12,
    description:
      'Premium assisted matchmaking for 12 months with personal matchmaker.',
    isActive: true,
    version: 1,
    storeProducts: recurringStoreProducts('assisted', 'yearly'),
  },
  // ==========================================
  //  CUSTOM ASSISTED
  // ==========================================
  {
    name: 'ASSISTED_CUSTOM',
    slug: 'assisted-custom',
    tier: PlanTier.ENTERPRISE,
    planType: PlanType.ASSISTED,
    billingCycle: BillingCycle.CUSTOM,
    price: 0,
    durationDays: 0,
    trialDays: 0,
    autoRenewDefault: false,
    isCustom: true,
    currency: 'INR',
    isPopular: false,
    sortOrder: 13,
    description:
      'Bespoke assisted matchmaking with configurable service scope, governance, integrations, support, and commercial terms.',
    isActive: true,
    version: 1,
  },
  // ==========================================
  //  ONE-TIME BOOST
  // ==========================================
  {
    name: 'PROFILE_BOOST_24H',
    slug: 'profile-boost-24h',
    tier: PlanTier.GOLD,
    planType: PlanType.PROFILE_BOOST,
    billingCycle: BillingCycle.DAILY,
    price: 199,
    durationDays: 1,
    trialDays: 0,
    autoRenewDefault: false,
    isCustom: false,
    currency: 'INR',
    isPopular: false,
    sortOrder: 50,
    description:
      'One-time 24 hour visibility boost for priority discovery ranking.',
    isActive: true,
    version: 1,
    storeProducts: {
      android: {
        productId: 'matchmate_profile_boost_24h',
        productType: StoreProductType.CONSUMABLE,
      },
      ios: {
        productId: 'matchmate_profile_boost_24h',
        productType: StoreProductType.CONSUMABLE,
      },
    },
  },
];
