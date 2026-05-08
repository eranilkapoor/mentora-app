db.features.insertMany([
  // ==========================================
  // 🔐 AUTH & ACCOUNT
  // ==========================================
  {
    key: 'email_registration',
    name: 'Email Registration',
    category: 'Authentication & Account',
    description: 'Allow users to register using email',
    type: 'boolean',
    defaultValue: true,
    metadata: {},
    isActive: true,
  },
  {
    key: 'phone_registration',
    name: 'Phone Registration',
    category: 'Authentication & Account',
    description: 'Allow users to register using phone number',
    type: 'boolean',
    defaultValue: true,
    metadata: {},
    isActive: true,
  },
  {
    key: 'social_login_google',
    name: 'Google Login',
    category: 'Authentication & Account',
    description: 'Login with Google account',
    type: 'boolean',
    defaultValue: false,
    metadata: {},
    isActive: true,
  },
  {
    key: 'social_login_apple',
    name: 'Apple Login',
    category: 'Authentication & Account',
    description: 'Login with Apple account',
    type: 'boolean',
    defaultValue: false,
    metadata: {},
    isActive: true,
  },
  {
    key: 'social_login_facebook',
    name: 'Facebook Login',
    category: 'Authentication & Account',
    description: 'Login with Facebook account',
    type: 'boolean',
    defaultValue: false,
    metadata: {},
    isActive: true,
  },
  {
    key: 'email_verification',
    name: 'Email Verification',
    category: 'Authentication & Account',
    description: 'Verify email address using OTP or link',
    type: 'boolean',
    defaultValue: true,
    metadata: {},
    isActive: true,
  },
  {
    key: 'phone_verification',
    name: 'Phone Verification',
    category: 'Authentication & Account',
    description: 'Verify mobile number using OTP',
    type: 'boolean',
    defaultValue: true,
    metadata: {},
    isActive: true,
  },
  {
    key: 'otp_login',
    name: 'OTP Login',
    category: 'Authentication & Account',
    description: 'Allow login using OTP',
    type: 'boolean',
    defaultValue: true,
    metadata: {},
    isActive: true,
  },
  {
    key: 'two_factor_auth',
    name: 'Two Factor Authentication',
    category: 'Authentication & Account',
    description: 'Additional security layer for login',
    type: 'boolean',
    defaultValue: false,
    metadata: {},
    isActive: true,
  },

  // ==========================================
  // 👤 PROFILE
  // ==========================================
  {
    key: 'create_profile',
    name: 'Create Profile',
    category: 'Profile',
    description: 'Allow users to create profile',
    type: 'boolean',
    defaultValue: true,
    metadata: {},
    isActive: true,
  },
  {
    key: 'edit_profile',
    name: 'Edit Profile',
    category: 'Profile',
    description: 'Allow users to edit profile',
    type: 'boolean',
    defaultValue: true,
    metadata: {},
    isActive: true,
  },
  {
    key: 'delete_profile',
    name: 'Delete Profile',
    category: 'Profile',
    description: 'Allow users to delete profile',
    type: 'boolean',
    defaultValue: false,
    metadata: {},
    isActive: true,
  },
  {
    key: 'profile_boost',
    name: 'Profile Boost',
    category: 'Profile',
    description: 'Boost profile visibility',
    type: 'quota',
    defaultValue: false,
    metadata: {
      limit: 5,
    },
    isActive: true,
  },
  {
    key: 'multiple_profile_photos',
    name: 'Multiple Profile Photos',
    category: 'Profile',
    description: 'Upload multiple profile images',
    type: 'limit',
    defaultValue: true,
    metadata: {
      limit: 10,
    },
    isActive: true,
  },
  {
    key: 'video_profile',
    name: 'Video Profile',
    category: 'Profile',
    description: 'Upload profile introduction video',
    type: 'boolean',
    defaultValue: false,
    metadata: {},
    isActive: true,
  },

  // ==========================================
  // ❤️ ENGAGEMENT
  // ==========================================
  {
    key: 'daily_likes',
    name: 'Daily Likes',
    category: 'Engagement',
    description: 'Number of likes per day',
    type: 'limit',
    defaultValue: true,
    metadata: {
      limit: 25,
    },
    isActive: true,
  },
  {
    key: 'daily_super_likes',
    name: 'Daily Super Likes',
    category: 'Engagement',
    description: 'Number of super likes per day',
    type: 'limit',
    defaultValue: false,
    metadata: {
      limit: 5,
    },
    isActive: true,
  },
  {
    key: 'unlimited_likes',
    name: 'Unlimited Likes',
    category: 'Engagement',
    description: 'Unlimited profile likes',
    type: 'boolean',
    defaultValue: false,
    metadata: {},
    isActive: true,
  },
  {
    key: 'send_interest',
    name: 'Send Interest',
    category: 'Engagement',
    description: 'Send matrimonial interest requests',
    type: 'boolean',
    defaultValue: true,
    metadata: {},
    isActive: true,
  },
  {
    key: 'favorite_profiles',
    name: 'Favorite Profiles',
    category: 'Engagement',
    description: 'Add profiles to favorites',
    type: 'limit',
    defaultValue: true,
    metadata: {
      limit: 100,
    },
    isActive: true,
  },

  // ==========================================
  // 💬 CHAT & COMMUNICATION
  // ==========================================
  {
    key: 'chat_access',
    name: 'Chat Access',
    category: 'Chat & Communication',
    description: 'Enable messaging/chat feature',
    type: 'boolean',
    defaultValue: true,
    metadata: {},
    isActive: true,
  },
  {
    key: 'unlimited_chat',
    name: 'Unlimited Chat',
    category: 'Chat & Communication',
    description: 'Unlimited messages',
    type: 'boolean',
    defaultValue: false,
    metadata: {},
    isActive: true,
  },
  {
    key: 'voice_call',
    name: 'Voice Call',
    category: 'Chat & Communication',
    description: 'Voice calling feature',
    type: 'boolean',
    defaultValue: false,
    metadata: {},
    isActive: true,
  },
  {
    key: 'video_call',
    name: 'Video Call',
    category: 'Chat & Communication',
    description: 'Video calling feature',
    type: 'boolean',
    defaultValue: false,
    metadata: {},
    isActive: true,
  },
  {
    key: 'read_receipts',
    name: 'Read Receipts',
    category: 'Chat & Communication',
    description: 'See message read status',
    type: 'boolean',
    defaultValue: false,
    metadata: {},
    isActive: true,
  },

  // ==========================================
  // 🔍 SEARCH & DISCOVERY
  // ==========================================
  {
    key: 'basic_search',
    name: 'Basic Search',
    category: 'Search & Discovery',
    description: 'Basic profile search',
    type: 'boolean',
    defaultValue: true,
    metadata: {},
    isActive: true,
  },
  {
    key: 'advanced_search',
    name: 'Advanced Search',
    category: 'Search & Discovery',
    description: 'Advanced profile search',
    type: 'boolean',
    defaultValue: false,
    metadata: {},
    isActive: true,
  },
  {
    key: 'advanced_filters',
    name: 'Advanced Filters',
    category: 'Search & Discovery',
    description: 'Advanced matchmaking filters',
    type: 'boolean',
    defaultValue: false,
    metadata: {},
    isActive: true,
  },
  {
    key: 'unlimited_search',
    name: 'Unlimited Search',
    category: 'Search & Discovery',
    description: 'Unlimited searches',
    type: 'boolean',
    defaultValue: false,
    metadata: {},
    isActive: true,
  },
  {
    key: 'who_viewed_me',
    name: 'Who Viewed Me',
    category: 'Search & Discovery',
    description: 'View profile visitors',
    type: 'boolean',
    defaultValue: false,
    metadata: {},
    isActive: true,
  },

  // ==========================================
  // 🧠 MATCHMAKING & AI
  // ==========================================
  {
    key: 'smart_matches',
    name: 'Smart Matches',
    category: 'Matchmaking & AI',
    description: 'AI-based smart recommendations',
    type: 'boolean',
    defaultValue: true,
    metadata: {},
    isActive: true,
  },
  {
    key: 'compatibility_score',
    name: 'Compatibility Score',
    category: 'Matchmaking & AI',
    description: 'Compatibility percentage score',
    type: 'boolean',
    defaultValue: true,
    metadata: {},
    isActive: true,
  },
  {
    key: 'ai_recommendations',
    name: 'AI Recommendations',
    category: 'Matchmaking & AI',
    description: 'AI generated profile recommendations',
    type: 'boolean',
    defaultValue: false,
    metadata: {},
    isActive: true,
  },

  // ==========================================
  // 🕉️ MATRIMONY SPECIFIC
  // ==========================================
  {
    key: 'kundli_matching',
    name: 'Kundli Matching',
    category: 'Matrimony Specific',
    description: 'Astrology based kundli matching',
    type: 'boolean',
    defaultValue: false,
    metadata: {},
    isActive: true,
  },
  {
    key: 'religion_preferences',
    name: 'Religion Preferences',
    category: 'Matrimony Specific',
    description: 'Filter matches by religion',
    type: 'boolean',
    defaultValue: true,
    metadata: {},
    isActive: true,
  },
  {
    key: 'caste_preferences',
    name: 'Caste Preferences',
    category: 'Matrimony Specific',
    description: 'Filter matches by caste',
    type: 'boolean',
    defaultValue: true,
    metadata: {},
    isActive: true,
  },

  // ==========================================
  // 👨‍👩‍👧 FAMILY FEATURES
  // ==========================================
  {
    key: 'family_managed_profile',
    name: 'Family Managed Profile',
    category: 'Family Features',
    description: 'Parents or family can manage account',
    type: 'boolean',
    defaultValue: true,
    metadata: {},
    isActive: true,
  },
  {
    key: 'guardian_access',
    name: 'Guardian Access',
    category: 'Family Features',
    description: 'Provide guardian access',
    type: 'boolean',
    defaultValue: false,
    metadata: {},
    isActive: true,
  },

  // ==========================================
  // 🔔 NOTIFICATIONS
  // ==========================================
  {
    key: 'push_notifications',
    name: 'Push Notifications',
    category: 'Notifications',
    description: 'Mobile push notifications',
    type: 'boolean',
    defaultValue: true,
    metadata: {},
    isActive: true,
  },
  {
    key: 'email_notifications',
    name: 'Email Notifications',
    category: 'Notifications',
    description: 'Email notifications',
    type: 'boolean',
    defaultValue: true,
    metadata: {},
    isActive: true,
  },

  // ==========================================
  // ⭐ PREMIUM EXPERIENCE
  // ==========================================
  {
    key: 'ad_free_experience',
    name: 'Ad Free Experience',
    category: 'Premium Experience',
    description: 'Remove ads from app',
    type: 'boolean',
    defaultValue: false,
    metadata: {},
    isActive: true,
  },
  {
    key: 'priority_support',
    name: 'Priority Support',
    category: 'Premium Experience',
    description: 'Premium customer support',
    type: 'boolean',
    defaultValue: false,
    metadata: {},
    isActive: true,
  },
  {
    key: 'vip_badge',
    name: 'VIP Badge',
    category: 'Premium Experience',
    description: 'VIP profile badge',
    type: 'boolean',
    defaultValue: false,
    metadata: {},
    isActive: true,
  },

  // ==========================================
  // 🚀 BOOST / MONETIZATION
  // ==========================================
  {
    key: 'daily_boosts',
    name: 'Daily Boosts',
    category: 'Boost / Monetization',
    description: 'Daily profile boosts',
    type: 'limit',
    defaultValue: false,
    metadata: {
      limit: 1,
    },
    isActive: true,
  },
  {
    key: 'weekly_boosts',
    name: 'Weekly Boosts',
    category: 'Boost / Monetization',
    description: 'Weekly profile boosts',
    type: 'limit',
    defaultValue: false,
    metadata: {
      limit: 5,
    },
    isActive: true,
  },

  // ==========================================
  // 💳 PAYMENTS & SUBSCRIPTIONS
  // ==========================================
  {
    key: 'monthly_subscription',
    name: 'Monthly Subscription',
    category: 'Payments & Subscriptions',
    description: 'Monthly premium plan',
    type: 'duration',
    defaultValue: false,
    metadata: {
      limit: 30,
    },
    isActive: true,
  },
  {
    key: 'yearly_subscription',
    name: 'Yearly Subscription',
    category: 'Payments & Subscriptions',
    description: 'Yearly premium plan',
    type: 'duration',
    defaultValue: false,
    metadata: {
      limit: 365,
    },
    isActive: true,
  },
  {
    key: 'wallet_system',
    name: 'Wallet System',
    category: 'Payments & Subscriptions',
    description: 'In-app wallet support',
    type: 'boolean',
    defaultValue: false,
    metadata: {},
    isActive: true,
  },

  // ==========================================
  // 🛡️ SAFETY & TRUST
  // ==========================================
  {
    key: 'report_user',
    name: 'Report User',
    category: 'Safety & Trust',
    description: 'Report abusive profiles',
    type: 'boolean',
    defaultValue: true,
    metadata: {},
    isActive: true,
  },
  {
    key: 'block_users',
    name: 'Block Users',
    category: 'Safety & Trust',
    description: 'Block unwanted users',
    type: 'boolean',
    defaultValue: true,
    metadata: {},
    isActive: true,
  },
  {
    key: 'fraud_detection',
    name: 'Fraud Detection',
    category: 'Safety & Trust',
    description: 'Detect fake/scam accounts',
    type: 'boolean',
    defaultValue: true,
    metadata: {},
    isActive: true,
  },

  // ==========================================
  // 📈 LIMIT BASED FEATURES
  // ==========================================
  {
    key: 'message_limit',
    name: 'Message Limit',
    category: 'Limit Based Features',
    description: 'Maximum messages allowed',
    type: 'limit',
    defaultValue: true,
    metadata: {
      limit: 50,
    },
    isActive: true,
  },
  {
    key: 'shortlist_limit',
    name: 'Shortlist Limit',
    category: 'Limit Based Features',
    description: 'Maximum shortlisted profiles',
    type: 'limit',
    defaultValue: true,
    metadata: {
      limit: 100,
    },
    isActive: true,
  },

  // ==========================================
  // 🎮 GAMIFICATION
  // ==========================================
  {
    key: 'daily_login_rewards',
    name: 'Daily Login Rewards',
    category: 'Engagement & Gamification',
    description: 'Reward users for daily login',
    type: 'boolean',
    defaultValue: false,
    metadata: {},
    isActive: true,
  },
  {
    key: 'streak_rewards',
    name: 'Streak Rewards',
    category: 'Engagement & Gamification',
    description: 'Rewards for login streaks',
    type: 'boolean',
    defaultValue: false,
    metadata: {},
    isActive: true,
  },

  // ==========================================
  // 🧾 SUPPORT
  // ==========================================
  {
    key: 'customer_support_chat',
    name: 'Customer Support Chat',
    category: 'Support & Miscellaneous',
    description: 'Live support chat',
    type: 'boolean',
    defaultValue: true,
    metadata: {},
    isActive: true,
  },
  {
    key: 'support_tickets',
    name: 'Support Tickets',
    category: 'Support & Miscellaneous',
    description: 'Raise support tickets',
    type: 'boolean',
    defaultValue: true,
    metadata: {},
    isActive: true,
  },
]);