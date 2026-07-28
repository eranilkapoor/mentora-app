import { Injectable } from '@nestjs/common';
import { EDUCATION_PLATFORM_MODULE_KEYS } from '@/common/constants/education-platform.constants';

const moduleTitles: Record<
  (typeof EDUCATION_PLATFORM_MODULE_KEYS)[number],
  string
> = {
  authentication: 'Authentication',
  'user-management': 'User Management',
  'organization-management': 'Organization Management',
  leads: 'Lead Management',
  'lead-management': 'Lead Management',
  'student-profile': 'Student Profile',
  applications: 'Application Management',
  'application-management': 'Application Management',
  admissions: 'Admission Management',
  'admission-management': 'Admission Management',
  campaigns: 'Campaigns',
  'marketing-automation': 'Marketing Automation',
  communications: 'Communications',
  communication: 'Communication Module',
  'call-center': 'Call Center',
  'whatsapp-crm': 'WhatsApp CRM',
  whatsapp: 'WhatsApp',
  'email-crm': 'Email CRM',
  email: 'Email',
  sms: 'SMS Module',
  'mobile-crm': 'Mobile App CRM',
  mobile: 'Mobile App',
  calendar: 'Calendar',
  tasks: 'Tasks',
  'task-management': 'Task Management',
  'document-management': 'Document Management',
  payments: 'Payment Module',
  payment: 'Payment Module',
  finance: 'Finance Module',
  scholarship: 'Scholarship',
  interview: 'Interview Module',
  'event-management': 'Event Management',
  'field-force-automation': 'Field Force Automation',
  reports: 'Reports',
  'dashboard-module': 'Dashboard Module',
  dashboard: 'Dashboard',
  analytics: 'Analytics',
  'ai-features': 'AI Features',
  integrations: 'Integrations',
  security: 'Security',
  tenants: 'Tenants And Users',
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
  'user-management': {
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
  'organization-management': {
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
  'lead-management': {
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
  'student-profile': {
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
  'admission-management': {
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
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
    storage: 'campaigns',
    apiSurface: ['campaigns', 'campaigns/:id/metrics'],
    productionBlockers: ['live_ad_provider_callbacks', 'landing_page_builder'],
  },
  'marketing-automation': {
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
    storage: 'campaigns,workflow_rules,workflow_executions',
    apiSurface: ['campaigns', 'campaigns/:id/metrics', 'workflows'],
    productionBlockers: ['live_ad_provider_callbacks', 'landing_page_builder'],
  },
  'call-center': {
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
    storage: 'call-center_calls',
    apiSurface: ['call-center'],
    productionBlockers: ['dialer_provider', 'recordings', 'queue_automation'],
  },
  'whatsapp-crm': {
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
    storage: 'whatsapp_conversations',
    apiSurface: ['whatsapp'],
    productionBlockers: [
      'whatsapp_provider',
      'template_approval',
      'delivery_callbacks',
    ],
  },
  whatsapp: {
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
    storage: 'whatsapp_conversations',
    apiSurface: ['whatsapp'],
    productionBlockers: [
      'whatsapp_provider',
      'template_approval',
      'delivery_callbacks',
    ],
  },
  finance: {
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
    storage: 'finance_ledger_entries,payments,payment_invoices',
    apiSurface: [
      'finance-ledgers',
      'finance-ledgers/:id/reconcile',
      'payments',
    ],
    productionBlockers: ['tax_engine', 'live_accounting_export'],
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
  'event-management': {
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
    storage: 'crm_events',
    apiSurface: ['events'],
    productionBlockers: [
      'registration_forms',
      'qr_attendance',
      'webinar_provider_sync',
    ],
  },
  'field-force-automation': {
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
    storage: 'field_visits',
    apiSurface: ['field-force'],
    productionBlockers: [
      'geo_tracking',
      'route_planning',
      'mileage_attendance',
    ],
  },
  reports: {
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
    storage: 'report_definitions,report_export_jobs',
    apiSurface: ['reports'],
    productionBlockers: [
      'async_export_worker',
      'xlsx_pdf_generation',
      'designer',
    ],
  },
  automation: {
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
    storage: 'workflow_rules,workflow_executions',
    apiSurface: ['workflows', 'workflows/executions/:id/retry'],
    productionBlockers: ['visual_builder', 'live_provider_actions'],
  },
  tasks: {
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
    storage: 'tasks',
    apiSurface: ['tasks', 'tasks/board', 'tasks/:id/workflow'],
    productionBlockers: ['calendar_reminder_provider'],
  },
  'task-management': {
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
    storage: 'tasks',
    apiSurface: ['tasks', 'tasks/board', 'tasks/:id/workflow'],
    productionBlockers: ['calendar_reminder_provider'],
  },
  'document-management': {
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
    storage: 'crm_documents',
    apiSurface: ['documents', 'documents/:id/verify'],
    productionBlockers: ['live_ocr_provider'],
  },
  payments: {
    backendStatus: 'product_ready',
    frontendStatus: 'workflow_ready',
    storage: 'payments,subscriptions,payment_invoices',
    apiSurface: ['payments', 'admin/payments'],
    productionBlockers: ['crm_fee_plan_mapping', 'settlement_reconciliation'],
  },
  payment: {
    backendStatus: 'product_ready',
    frontendStatus: 'workflow_ready',
    storage: 'payments,subscriptions,payment_invoices',
    apiSurface: ['payments', 'admin/payments'],
    productionBlockers: ['crm_fee_plan_mapping', 'settlement_reconciliation'],
  },
  dashboard: {
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
    storage: 'dashboard aggregates',
    apiSurface: ['dashboard'],
    productionBlockers: ['role_specific_dashboards'],
  },
  'dashboard-module': {
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
    storage: 'dashboard aggregates',
    apiSurface: ['dashboard'],
    productionBlockers: ['role_specific_dashboards'],
  },
  analytics: {
    backendStatus: 'mvp_foundation',
    frontendStatus: 'mvp_foundation',
    storage: 'analytics_events,analytics_daily_summaries',
    apiSurface: ['analytics', 'admin/analytics'],
    productionBlockers: ['crm_funnels', 'roi_attribution', 'forecasting'],
  },
  'ai-features': {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'ai_tutor_sessions,ai_tutor_messages,ai_settings',
    apiSurface: ['ai tutor', 'learning'],
    productionBlockers: ['crm_ai_scoring', 'conversation_summaries'],
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
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
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
