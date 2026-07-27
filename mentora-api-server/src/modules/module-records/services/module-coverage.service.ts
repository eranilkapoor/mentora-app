import { Injectable } from '@nestjs/common';
import { EDUCATION_PLATFORM_MODULE_KEYS } from '@/common/constants/education-platform.constants';

const moduleTitles: Record<
  (typeof EDUCATION_PLATFORM_MODULE_KEYS)[number],
  string
> = {
  authentication: 'Authentication',
  user_management: 'User Management',
  organization_management: 'Organization Management',
  leads: 'Lead Management',
  lead_management: 'Lead Management',
  student_profile: 'Student Profile',
  applications: 'Application Management',
  application_management: 'Application Management',
  admissions: 'Admission Management',
  admission_management: 'Admission Management',
  campaigns: 'Campaigns',
  marketing_automation: 'Marketing Automation',
  communications: 'Communications',
  communication: 'Communication Module',
  call_center: 'Call Center',
  whatsapp_crm: 'WhatsApp CRM',
  whatsapp: 'WhatsApp',
  email_crm: 'Email CRM',
  email: 'Email',
  sms: 'SMS Module',
  mobile_crm: 'Mobile App CRM',
  mobile: 'Mobile App',
  calendar: 'Calendar',
  tasks: 'Tasks',
  task_management: 'Task Management',
  document_management: 'Document Management',
  payments: 'Payment Module',
  payment: 'Payment Module',
  finance: 'Finance Module',
  scholarship: 'Scholarship',
  interview: 'Interview Module',
  event_management: 'Event Management',
  field_force_automation: 'Field Force Automation',
  reports: 'Reports',
  dashboard_module: 'Dashboard Module',
  dashboard: 'Dashboard',
  analytics: 'Analytics',
  ai_features: 'AI Features',
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
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
    storage:
      'users,user_sessions,user_memberships,tenant_security_policies,integration_provider_configs',
    apiSurface: ['auth', 'contexts', 'security-policies', 'integrations'],
    productionBlockers: ['live_mfa_provider', 'live_sso_provider'],
  },
  user_management: {
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
    storage: 'users,roles,permissions,user_memberships,teams,departments',
    apiSurface: ['admin/rbac', 'contexts', 'tenant-users', 'teams'],
    productionBlockers: ['email_invites', 'bulk_user_import'],
  },
  organization_management: {
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
    storage: 'tenants,branches,lead_sources,lead_stages',
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
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
    storage: 'leads,lead_activities,lead_assignments',
    apiSurface: ['leads', 'leads/operations'],
    productionBlockers: ['advanced_import_mapping_ui', 'voice_note_storage'],
  },
  lead_management: {
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
    storage: 'leads,lead_activities,lead_assignments',
    apiSurface: ['leads', 'leads/operations'],
    productionBlockers: ['advanced_import_mapping_ui', 'voice_note_storage'],
  },
  student_profile: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage:
      'student_profiles,student_academic_records,parent_student_relationships',
    apiSurface: ['students', 'learning'],
    productionBlockers: ['crm_admission_conversion_timeline'],
  },
  applications: {
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
    storage: 'applications',
    apiSurface: [
      'applications',
      'applications/:id/review',
      'applications/:id/decision',
    ],
    productionBlockers: ['visual_form_builder', 'conditional_field_designer'],
  },
  admissions: {
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
    storage: 'admissions',
    apiSurface: ['admissions'],
    productionBlockers: ['live_erp_lms_adapter'],
  },
  admission_management: {
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
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
  marketing_automation: {
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
    storage: 'campaigns,workflow_rules,workflow_executions',
    apiSurface: ['campaigns', 'campaigns/:id/metrics', 'workflows'],
    productionBlockers: ['live_ad_provider_callbacks', 'landing_page_builder'],
  },
  call_center: {
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
    storage: 'call_center_calls',
    apiSurface: ['call-center'],
    productionBlockers: ['dialer_provider', 'recordings', 'queue_automation'],
  },
  whatsapp_crm: {
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
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
    storage: 'scholarship_applications',
    apiSurface: [
      'scholarships',
      'scholarships/:id/evaluate',
      'scholarships/:id/decision',
    ],
    productionBlockers: ['finance_plan_discount_sync'],
  },
  interview: {
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
    storage: 'interviews',
    apiSurface: ['interviews'],
    productionBlockers: [
      'panel_assignment',
      'evaluator_forms',
      'calendar_provider_sync',
    ],
  },
  event_management: {
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
  field_force_automation: {
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
  task_management: {
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
    storage: 'tasks',
    apiSurface: ['tasks', 'tasks/board', 'tasks/:id/workflow'],
    productionBlockers: ['calendar_reminder_provider'],
  },
  document_management: {
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
  dashboard_module: {
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
  ai_features: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'ai_tutor_sessions,ai_tutor_messages,ai_settings',
    apiSurface: ['ai tutor', 'learning'],
    productionBlockers: ['crm_ai_scoring', 'conversation_summaries'],
  },
  security: {
    backendStatus: 'workflow_ready',
    frontendStatus: 'workflow_ready',
    storage: 'audit_logs,user_sessions,tenant_security_policies,settings',
    apiSurface: ['admin/rbac', 'contexts', 'security-policies', 'settings'],
    productionBlockers: ['live_mfa_provider', 'live_sso_provider'],
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
