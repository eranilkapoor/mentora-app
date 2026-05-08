db.plans.insertMany([
  // ==========================================
  // 🆓 FREE PLAN
  // ==========================================
  {
    name: 'FREE',
    tier: 'free',
    price: 0,
    durationDays: 3650,
    currency: 'INR',
    isPopular: false,
    sortOrder: 1,
    description:
      'Basic free membership with limited matchmaking access.',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // ==========================================
  // 🥇 GOLD MONTHLY
  // ==========================================
  {
    name: 'GOLD_MONTHLY',
    tier: 'gold',
    price: 999,
    durationDays: 30,
    currency: 'INR',
    isPopular: true,
    sortOrder: 2,
    description:
      'Gold monthly subscription with unlimited likes, chat, and advanced filters.',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // ==========================================
  // 🥇 GOLD QUARTERLY
  // ==========================================
  {
    name: 'GOLD_QUARTERLY',
    tier: 'gold',
    price: 2499,
    durationDays: 90,
    currency: 'INR',
    isPopular: false,
    sortOrder: 3,
    description:
      'Gold quarterly subscription with premium matchmaking benefits.',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // ==========================================
  // 🥇 GOLD YEARLY
  // ==========================================
  {
    name: 'GOLD_YEARLY',
    tier: 'gold',
    price: 7999,
    durationDays: 365,
    currency: 'INR',
    isPopular: false,
    sortOrder: 4,
    description:
      'Gold yearly subscription with maximum savings and premium access.',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // ==========================================
  // 💎 PLATINUM MONTHLY
  // ==========================================
  {
    name: 'PLATINUM_MONTHLY',
    tier: 'platinum',
    price: 2499,
    durationDays: 30,
    currency: 'INR',
    isPopular: false,
    sortOrder: 5,
    description:
      'Platinum monthly subscription with AI matchmaking and priority ranking.',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // ==========================================
  // 💎 PLATINUM QUARTERLY
  // ==========================================
  {
    name: 'PLATINUM_QUARTERLY',
    tier: 'platinum',
    price: 6499,
    durationDays: 90,
    currency: 'INR',
    isPopular: true,
    sortOrder: 6,
    description:
      'Platinum quarterly plan with concierge matchmaking and premium visibility.',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // ==========================================
  // 💎 PLATINUM YEARLY
  // ==========================================
  {
    name: 'PLATINUM_YEARLY',
    tier: 'platinum',
    price: 19999,
    durationDays: 365,
    currency: 'INR',
    isPopular: false,
    sortOrder: 7,
    description:
      'Ultimate yearly platinum experience with all premium features unlocked.',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);