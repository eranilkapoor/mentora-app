// Format for the permissions : <resource>:<action>
export enum Permission {
  // =========================
  //  ADMIN / SYSTEM
  // =========================
  ADMIN_MANAGE = 'admin:manage',
  SYSTEM_CONFIG = 'system:config',
  DASHBOARD_VIEW = 'dashboard:view',

  // =========================
  //  USER MANAGEMENT
  // =========================
  USER_VIEW = 'user:view',
  USER_CREATE = 'user:create',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_BLOCK = 'user:block',
  USER_UNBLOCK = 'user:unblock',
  USER_IMPERSONATE = 'user:impersonate',

  // =========================
  //  PROFILE MANAGEMENT
  // =========================
  PROFILE_VIEW = 'profile:view',
  PROFILE_UPDATE = 'profile:update',
  PROFILE_DELETE = 'profile:delete',
  PROFILE_VERIFY = 'profile:verify',
  PROFILE_REJECT = 'profile:reject',

  // =========================
  //  MEDIA (IMAGES/VIDEOS)
  // =========================
  MEDIA_VIEW = 'media:view',
  MEDIA_DELETE = 'media:delete',
  MEDIA_APPROVE = 'media:approve',
  MEDIA_REJECT = 'media:reject',

  // =========================
  //  CHAT / COMMUNICATION
  // =========================
  CHAT_VIEW = 'chat:view',
  CHAT_DELETE = 'chat:delete',
  CHAT_BLOCK = 'chat:block',
  CHAT_MODERATE = 'chat:moderate',

  // =========================
  //  INTERACTIONS
  // =========================
  INTEREST_VIEW = 'interest:view',
  INTEREST_MANAGE = 'interest:manage',

  MATCH_VIEW = 'match:view',
  MATCH_DELETE = 'match:delete',

  SHORTLIST_VIEW = 'shortlist:view',
  SHORTLIST_DELETE = 'shortlist:delete',

  // =========================
  //  REPORT / MODERATION
  // =========================
  REPORT_VIEW = 'report:view',
  REPORT_RESOLVE = 'report:resolve',
  REPORT_DELETE = 'report:delete',

  BLOCK_VIEW = 'block:view',
  BLOCK_MANAGE = 'block:manage',

  // =========================
  //  SUBSCRIPTION / PLANS
  // =========================
  PLAN_CREATE = 'plan:create',
  PLAN_UPDATE = 'plan:update',
  PLAN_DELETE = 'plan:delete',
  PLAN_VIEW = 'plan:view',

  FEATURE_CREATE = 'feature:create',
  FEATURE_UPDATE = 'feature:update',
  FEATURE_DELETE = 'feature:delete',

  SUBSCRIPTION_VIEW = 'subscription:view',
  SUBSCRIPTION_MANAGE = 'subscription:manage',

  PAYMENT_VIEW = 'payment:view',
  PAYMENT_REFUND = 'payment:refund',

  // =========================
  //  ANALYTICS
  // =========================
  ANALYTICS_VIEW = 'analytics:view',

  // =========================
  //  NOTIFICATIONS
  // =========================
  NOTIFICATION_SEND = 'notification:send',
  NOTIFICATION_MANAGE = 'notification:manage',

  // =========================
  //  REFERRAL / REWARDS
  // =========================
  REFERRAL_VIEW = 'referral:view',
  REFERRAL_MANAGE = 'referral:manage',

  // =========================
  //  ACTIVITY LOGS
  // =========================
  ACTIVITY_VIEW = 'activity:view',
}
