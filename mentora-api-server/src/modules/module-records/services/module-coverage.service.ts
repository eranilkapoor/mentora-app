import { Injectable } from '@nestjs/common';
import { EDUCATION_PLATFORM_MODULE_KEYS } from '@/common/constants/education-platform.constants';

const moduleTitles: Record<
  (typeof EDUCATION_PLATFORM_MODULE_KEYS)[number],
  string
> = {
  authentication: 'Authentication',
  users: 'Users',
  organizations: 'Organizations',
  leads: 'Leads',
  students: 'Students',
  applications: 'Applications',
  admissions: 'Admissions',
  campaigns: 'Campaigns',
  'marketing-automation': 'Marketing Automation',
  communications: 'Communications',
  'call-center': 'Call Center',
  whatsapp: 'WhatsApp',
  emails: 'Emails',
  sms: 'SMS',
  notifications: 'Notifications',
  'mobile-app': 'Mobile App',
  calendar: 'Calendar',
  tasks: 'Tasks',
  documents: 'Documents',
  payments: 'Payments',
  finance: 'Finance',
  scholarship: 'Scholarship',
  interview: 'Interviews',
  events: 'Events',
  'field-force': 'Field Force',
  reports: 'Reports',
  dashboard: 'Dashboard',
  analytics: 'Analytics',
  'ai-features': 'AI Features',
  integrations: 'Integrations',
  security: 'Security',
  tenants: 'Tenants',
  settings: 'Settings',
  learning: 'Learning Operations',
  automation: 'Automation',
};

type ModuleReadiness = {
  backendStatus:
    | 'product_ready'
    | 'workflow_ready'
    | 'mvp_foundation'
    | 'external_dependency';
  frontendStatus:
    | 'product_ready'
    | 'workflow_ready'
    | 'mvp_foundation'
    | 'backlog';
  storage: string;
  apiSurface: string[];
  productionBlockers: string[];
};

const defaultReadiness: ModuleReadiness = {
  backendStatus: 'mvp_foundation',
  frontendStatus: 'mvp_foundation',
  storage: 'module_records',
  apiSurface: ['module-records'],
  productionBlockers: ['module_specific_depth'],
};

const readinessByModule: Partial<
  Record<(typeof EDUCATION_PLATFORM_MODULE_KEYS)[number], ModuleReadiness>
> = {
  authentication: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage:
      'users,user_sessions,user_memberships,tenant_security_policies,integration_provider_configs',
    apiSurface: [
      'auth',
      'contexts',
      'settings/security',
      'security-policies',
      'integrations',
      'module-records/export',
    ],
    productionBlockers: ['live_mfa_provider', 'live_sso_provider'],
  },
  users: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'users,roles,permissions,user_memberships,teams,departments',
    apiSurface: [
      'admin/rbac',
      'contexts',
      'tenant-users',
      'tenant-users/create',
      'teams',
      'module-records/export',
    ],
    productionBlockers: ['email_invite_provider'],
  },
  organizations: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage:
      'tenants,branches,departments,teams,campuses,tenant_branding,channel_settings,lead_sources,lead_stages',
    apiSurface: [
      'tenants',
      'branches',
      'departments',
      'teams',
      'campuses',
      'tenant-branding',
      'channel-settings',
      'lead-sources',
      'lead-stages',
    ],
    productionBlockers: ['domain_dns_verification', 'payment_gateway_secrets'],
  },
  leads: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'leads,lead_activities,lead_assignments,lead_imports',
    apiSurface: [
      'leads',
      'leads/operations/duplicates',
      'leads/operations/import',
      'leads/operations/export',
      'leads/:id/score',
      'leads/:id/tags',
      'leads/:id/attachments',
    ],
    productionBlockers: [
      'ad_provider_callbacks',
      'voice_note_storage_provider',
    ],
  },
  students: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage:
      'student-profiles,student_academic_records,parent_student_relationships',
    apiSurface: ['students', 'learning'],
    productionBlockers: ['crm_admission_conversion_timeline'],
  },
  applications: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'applications,crm_documents,interviews,admin_audit_logs',
    apiSurface: [
      'applications',
      'applications/:id/review',
      'applications/:id/decision',
    ],
    productionBlockers: ['external_form_embed_provider'],
  },
  admissions: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'admissions',
    apiSurface: [
      'admissions',
      'admissions/:id/allocate',
      'admissions/:id/handoff',
    ],
    productionBlockers: ['live_erp_lms_adapter'],
  },
  campaigns: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'campaigns,workflow_rules,lead_sources,lead_stages',
    apiSurface: [
      'campaigns',
      'campaigns/:id/metrics',
      'workflows',
      'module-records/export',
    ],
    productionBlockers: [
      'live_ad_provider_callbacks',
      'external_landing_page_hosting',
    ],
  },
  'marketing-automation': {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'campaigns,workflow_rules,workflow_executions',
    apiSurface: [
      'campaigns',
      'campaigns/:id/metrics',
      'workflows',
      'module-records/export',
    ],
    productionBlockers: [
      'live_ad_provider_callbacks',
      'external_landing_page_hosting',
    ],
  },
  'call-center': {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'call-center_calls,communications,integration_provider_configs',
    apiSurface: [
      'call-center',
      'call-center/:id',
      'call-center/:id/complete',
      'integrations/providers',
    ],
    productionBlockers: ['live_dialer_provider', 'recording_storage_provider'],
  },
  whatsapp: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage:
      'whatsapp_conversations,communications,integration_provider_configs,workflow_rules',
    apiSurface: [
      'whatsapp',
      'whatsapp/:id',
      'whatsapp/:id/complete',
      'communications',
      'integrations/providers',
    ],
    productionBlockers: [
      'whatsapp_provider_approval',
      'template_approval',
      'delivery_callbacks',
    ],
  },
  communications: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage:
      'communications,notifications,notification_templates,notification_logs,channel_settings',
    apiSurface: [
      'communications',
      'notifications',
      'admin/notifications',
      'tenant channel-settings',
      'integrations/providers',
    ],
    productionBlockers: ['live_delivery_provider_callbacks'],
  },
  emails: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage:
      'communications,notification_templates,notification_logs,integration_provider_configs',
    apiSurface: [
      'communications',
      'notifications/templates',
      'admin/notifications',
      'integrations/providers',
    ],
    productionBlockers: [
      'live_email_provider_callbacks',
      'domain_reputation_warmup',
    ],
  },
  sms: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage:
      'communications,notification_templates,notification_logs,integration_provider_configs',
    apiSurface: [
      'communications',
      'notifications/templates',
      'admin/notifications',
      'integrations/providers',
    ],
    productionBlockers: [
      'live_sms_provider_callbacks',
      'dlt_template_approval',
    ],
  },
  notifications: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage:
      'notifications,notification_templates,notification_logs,notification_dlq,notification_settings',
    apiSurface: [
      'notifications',
      'admin/notifications',
      'admin/notifications/templates',
      'admin/notifications/analytics',
      'settings/notifications',
      'integrations/providers',
    ],
    productionBlockers: ['live_delivery_provider_callbacks'],
  },
  'mobile-app': {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'module_records,leads,tasks,communications,field_visits',
    apiSurface: [
      'module-records',
      'leads',
      'tasks',
      'communications',
      'field-force',
    ],
    productionBlockers: ['mobile_offline_sync_engine', 'app_store_release'],
  },
  calendar: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'learning_schedules,tasks,interviews,crm_events,module_records',
    apiSurface: [
      'learning/schedules',
      'tasks',
      'interviews',
      'events',
      'module-records',
      'integrations/providers',
    ],
    productionBlockers: ['live_calendar_provider_sync'],
  },
  finance: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'finance_ledger_entries,payments,payment_invoices',
    apiSurface: [
      'finance-ledgers',
      'finance-ledgers/:id/reconcile',
      'payments',
    ],
    productionBlockers: ['live_tax_engine', 'live_accounting_export'],
  },
  scholarship: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'scholarship_applications,finance_ledger_entries,admin_audit_logs',
    apiSurface: [
      'scholarships',
      'scholarships/:id/evaluate',
      'scholarships/:id/decision',
    ],
    productionBlockers: ['live_finance_plan_discount_sync'],
  },
  interview: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'interviews,applications,admissions,admin_audit_logs',
    apiSurface: ['interviews', 'interviews/:id', 'interviews/:id/complete'],
    productionBlockers: ['calendar_provider_sync'],
  },
  events: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'crm_events',
    apiSurface: ['events', 'events/:id', 'events/:id/complete'],
    productionBlockers: [
      'external_registration_form_hosting',
      'qr_hardware_scanner',
      'webinar_provider_sync',
    ],
  },
  'field-force': {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'field_visits,integration_provider_configs',
    apiSurface: [
      'field-force',
      'field-force/:id',
      'field-force/:id/complete',
      'integrations/providers',
    ],
    productionBlockers: ['live_geo_telemetry_provider', 'map_routing_provider'],
  },
  reports: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'report_definitions,report_export_jobs',
    apiSurface: ['reports'],
    productionBlockers: ['external_file_generation_worker'],
  },
  automation: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'workflow_rules,workflow_executions',
    apiSurface: [
      'workflows',
      'workflows/rules',
      'workflows/execute',
      'workflows/executions/:id/retry',
    ],
    productionBlockers: ['live_provider_actions'],
  },
  tasks: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'tasks',
    apiSurface: ['tasks', 'tasks/board', 'tasks/:id/workflow'],
    productionBlockers: ['calendar_reminder_provider'],
  },
  documents: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'crm_documents',
    apiSurface: ['documents', 'documents/:id/verify'],
    productionBlockers: ['live_ocr_provider'],
  },
  payments: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'payments,subscriptions,payment_invoices',
    apiSurface: ['payments', 'admin/payments'],
    productionBlockers: ['live_payment_gateway_settlement_callbacks'],
  },
  dashboard: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'dashboard aggregates,module_records',
    apiSurface: ['dashboard', 'dashboard/bootstrap', 'module-records'],
    productionBlockers: [],
  },
  analytics: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'analytics_events,analytics_daily_summaries,module_records',
    apiSurface: ['analytics', 'admin/analytics', 'dashboard', 'module-records'],
    productionBlockers: ['external_predictive_model_provider'],
  },
  'ai-features': {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'ai_tutor_sessions,ai_tutor_messages,ai_settings',
    apiSurface: ['ai tutor', 'learning'],
    productionBlockers: ['external_crm_ai_model_metering'],
  },
  security: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'audit_logs,user_sessions,tenant_security_policies,settings',
    apiSurface: [
      'admin/rbac',
      'admin/audit-logs',
      'contexts',
      'security-policies',
      'integrations',
      'reports',
      'settings/security',
    ],
    productionBlockers: [
      'live_mfa_provider',
      'live_sso_provider',
      'external_backup_evidence_provider',
    ],
  },
  integrations: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'integration_provider_configs',
    apiSurface: ['integrations/providers'],
    productionBlockers: [
      'provider_credentials',
      'vendor_approval',
      'live_callback_testing',
    ],
  },
};

@Injectable()
export class ModuleCoverageService {
  getModuleCoverage() {
    return EDUCATION_PLATFORM_MODULE_KEYS.map((moduleKey) => {
      const readiness = readinessByModule[moduleKey] ?? defaultReadiness;
      return {
        moduleKey,
        title: moduleTitles[moduleKey],
        status: readiness.backendStatus,
        ...readiness,
        productionReady:
          readiness.backendStatus === 'product_ready' &&
          readiness.frontendStatus === 'product_ready' &&
          readiness.productionBlockers.length === 0,
      };
    });
  }
}
