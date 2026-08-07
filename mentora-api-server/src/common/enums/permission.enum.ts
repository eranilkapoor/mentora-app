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

  STUDENT_VIEW = 'student:view',
  STUDENT_CREATE = 'student:create',
  STUDENT_UPDATE = 'student:update',
  STUDENT_DELETE = 'student:delete',

  PARENT_VIEW = 'parent:view',
  PARENT_CREATE = 'parent:create',
  PARENT_UPDATE = 'parent:update',
  PARENT_MANAGE_CHILDREN = 'parent:manage_children',

  ACADEMIC_RECORD_VIEW = 'academic_record:view',
  ACADEMIC_RECORD_MANAGE = 'academic_record:manage',
  SUBJECT_VIEW = 'subject:view',
  SUBJECT_MANAGE = 'subject:manage',
  SCHEDULE_VIEW = 'schedule:view',
  SCHEDULE_MANAGE = 'schedule:manage',
  AI_TUTOR_VIEW = 'ai_tutor:view',
  AI_TUTOR_USE = 'ai_tutor:use',
  AI_TUTOR_MODERATE = 'ai_tutor:moderate',
  LEARNING_ENTITLEMENT_VIEW = 'learning_entitlement:view',
  LEARNING_ENTITLEMENT_MANAGE = 'learning_entitlement:manage',
  PARENTAL_CONTROL_VIEW = 'parental_control:view',
  PARENTAL_CONTROL_MANAGE = 'parental_control:manage',

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

  // =========================
  //  EDUCATION CRM
  // =========================
  ORGANIZATION_VIEW = 'organization:view',
  ORGANIZATION_MANAGE = 'organization:manage',
  LEAD_VIEW = 'lead:view',
  LEAD_CREATE = 'lead:create',
  LEAD_UPDATE = 'lead:update',
  LEAD_ASSIGN = 'lead:assign',
  LEAD_IMPORT = 'lead:import',
  LEAD_EXPORT = 'lead:export',
  LEAD_MERGE = 'lead:merge',
  APPLICATION_VIEW = 'application:view',
  APPLICATION_MANAGE = 'application:manage',
  TASK_VIEW = 'task:view',
  TASK_MANAGE = 'task:manage',
  CAMPAIGN_VIEW = 'campaign:view',
  CAMPAIGN_MANAGE = 'campaign:manage',
  COMMUNICATION_VIEW = 'communication:view',
  COMMUNICATION_MANAGE = 'communication:manage',
  MODULE_RECORD_VIEW = 'module_record:view',
  MODULE_RECORD_MANAGE = 'module_record:manage',
  REPORT_EXPORT = 'report:export',
  DOCUMENT_VIEW = 'document:view',
  DOCUMENT_MANAGE = 'document:manage',
  WORKFLOW_MANAGE = 'workflow:manage',
  PROGRAM_VIEW = 'program:view',
  PROGRAM_MANAGE = 'program:manage',
}
