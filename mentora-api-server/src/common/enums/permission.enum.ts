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
  CRM_ORGANIZATION_VIEW = 'crm_organization:view',
  CRM_ORGANIZATION_MANAGE = 'crm_organization:manage',
  CRM_LEAD_VIEW = 'crm_lead:view',
  CRM_LEAD_CREATE = 'crm_lead:create',
  CRM_LEAD_UPDATE = 'crm_lead:update',
  CRM_LEAD_ASSIGN = 'crm_lead:assign',
  CRM_LEAD_IMPORT = 'crm_lead:import',
  CRM_LEAD_EXPORT = 'crm_lead:export',
  CRM_LEAD_MERGE = 'crm_lead:merge',
  CRM_APPLICATION_VIEW = 'crm_application:view',
  CRM_APPLICATION_MANAGE = 'crm_application:manage',
  CRM_TASK_VIEW = 'crm_task:view',
  CRM_TASK_MANAGE = 'crm_task:manage',
  CRM_CAMPAIGN_VIEW = 'crm_campaign:view',
  CRM_CAMPAIGN_MANAGE = 'crm_campaign:manage',
  CRM_COMMUNICATION_VIEW = 'crm_communication:view',
  CRM_COMMUNICATION_MANAGE = 'crm_communication:manage',
  CRM_MODULE_RECORD_VIEW = 'crm_module_record:view',
  CRM_MODULE_RECORD_MANAGE = 'crm_module_record:manage',
  CRM_REPORT_VIEW = 'crm_report:view',
  CRM_REPORT_EXPORT = 'crm_report:export',
  CRM_DOCUMENT_VIEW = 'crm_document:view',
  CRM_DOCUMENT_MANAGE = 'crm_document:manage',
  CRM_WORKFLOW_MANAGE = 'crm_workflow:manage',
}
