import { Injectable } from '@nestjs/common';
import { EDUCATION_PLATFORM_MODULE_KEYS } from '@/common/constants/education-platform.constants';

const moduleTitles: Record<
  (typeof EDUCATION_PLATFORM_MODULE_KEYS)[number],
  string
> = {
  'platform-foundation': 'Platform Foundation',
  authentication: 'Authentication',
  users: 'Users',
  organizations: 'Organizations',
  branches: 'Branches',
  departments: 'Departments',
  teams: 'Teams',
  billing: 'Billing',
  branding: 'Branding',
  'global-settings': 'Global Settings',
  'audit-logs': 'Audit Logs',
  leads: 'Leads',
  contacts: 'Contacts',
  'lead-sources': 'Lead Sources',
  'lead-stages': 'Lead Stages',
  activities: 'Activities',
  notes: 'Notes',
  'follow-ups': 'Follow-ups',
  meetings: 'Meetings',
  assignments: 'Assignments',
  tags: 'Tags',
  'custom-fields': 'Custom Fields',
  'imports-exports': 'Imports And Exports',
  students: 'Students',
  'academic-sessions': 'Academic Sessions',
  programs: 'Programs',
  courses: 'Courses',
  specializations: 'Specializations',
  applications: 'Applications',
  admissions: 'Admissions',
  enrollment: 'Enrollment',
  fees: 'Fees',
  campaigns: 'Campaigns',
  'marketing-automation': 'Marketing Automation',
  'landing-pages': 'Landing Pages',
  'lead-scoring': 'Lead Scoring',
  'marketing-attribution': 'Marketing Attribution',
  telephony: 'Telephony',
  chatbots: 'Chatbots',
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
  support: 'Support',
  reports: 'Reports',
  dashboard: 'Dashboard',
  analytics: 'Analytics',
  'ai-features': 'AI Features',
  integrations: 'Integrations',
  security: 'Security',
  settings: 'Settings',
  learning: 'Learning Operations',
  automation: 'Automation',
};

type ModuleReadiness = {
  layer?:
    | 'platform_foundation'
    | 'identity_organization'
    | 'generic_crm'
    | 'education_specific'
    | 'growth_automation';
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
  layer: 'generic_crm',
  backendStatus: 'mvp_foundation',
  frontendStatus: 'mvp_foundation',
  storage: 'module_records',
  apiSurface: ['admin/module-records'],
  productionBlockers: ['module_specific_depth'],
};

const readinessByModule: Partial<
  Record<(typeof EDUCATION_PLATFORM_MODULE_KEYS)[number], ModuleReadiness>
> = {
  'platform-foundation': {
    layer: 'platform_foundation',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage:
      'organizations,plans,subscriptions,payments,features,organization_branding,settings,admin_audit_logs',
    apiSurface: [
      'admin/organizations',
      'subscriptions',
      'payments',
      'feature-flags',
      'admin/organization-branding',
      'settings',
      'admin/audit-logs',
    ],
    productionBlockers: ['live_payment_provider', 'live_domain_dns_validation'],
  },
  authentication: {
    layer: 'identity_organization',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage:
      'users,user_sessions,user_memberships,organization_security_policies,integration_provider_configs',
    apiSurface: [
      'admin/auth',
      'admin/me/contexts',
      'settings/security',
      'admin/security-policies',
      'admin/integrations',
      'admin/module-records/export',
    ],
    productionBlockers: ['live_mfa_provider', 'live_sso_provider'],
  },
  users: {
    layer: 'identity_organization',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage:
      'users,roles,permissions,user_memberships,branches,teams,departments',
    apiSurface: [
      'admin/rbac',
      'admin/me/contexts',
      'admin/organization-users',
      'admin/organization-users/create',
      'admin/identity/hierarchy',
      'admin/teams',
      'admin/module-records/export',
    ],
    productionBlockers: ['email_invite_provider'],
  },
  organizations: {
    layer: 'identity_organization',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage:
      'organizations,branches,departments,teams,organization_branding,channel_settings,lead_sources,lead_stages',
    apiSurface: [
      'admin/organizations',
      'admin/branches',
      'admin/departments',
      'admin/teams',
      'admin/organization-branding',
      'admin/channel-settings',
      'admin/lead-sources',
      'admin/lead-stages',
    ],
    productionBlockers: [],
  },
  branches: {
    layer: 'identity_organization',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'branches,organizations',
    apiSurface: ['admin/branches', 'admin/identity/hierarchy'],
    productionBlockers: [],
  },
  departments: {
    layer: 'identity_organization',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'departments,branches,organizations',
    apiSurface: ['admin/departments', 'admin/identity/hierarchy'],
    productionBlockers: [],
  },
  teams: {
    layer: 'identity_organization',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'teams,departments,branches,organizations',
    apiSurface: ['admin/teams', 'admin/identity/hierarchy'],
    productionBlockers: [],
  },
  billing: {
    layer: 'platform_foundation',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'payments,subscriptions,payment_invoices,plans',
    apiSurface: ['payments', 'admin/payments', 'subscriptions'],
    productionBlockers: ['live_payment_gateway_settlement_callbacks'],
  },
  branding: {
    layer: 'platform_foundation',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'organization_branding,organizations',
    apiSurface: ['organization-branding'],
    productionBlockers: ['cdn_asset_validation'],
  },
  'global-settings': {
    layer: 'platform_foundation',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'settings,security_settings,localization_settings',
    apiSurface: ['settings', 'security-policies'],
    productionBlockers: [],
  },
  'audit-logs': {
    layer: 'platform_foundation',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'admin_audit_logs,activity_logs',
    apiSurface: ['admin/audit-logs', 'module-records/export'],
    productionBlockers: ['external_backup_evidence_provider'],
  },
  leads: {
    layer: 'generic_crm',
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
  contacts: {
    layer: 'generic_crm',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'module_records',
    apiSurface: ['contacts', 'contacts/operations/export'],
    productionBlockers: [],
  },
  'lead-sources': {
    layer: 'generic_crm',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'lead_sources',
    apiSurface: ['lead-sources'],
    productionBlockers: [],
  },
  'lead-stages': {
    layer: 'generic_crm',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'lead_stages',
    apiSurface: ['lead-stages'],
    productionBlockers: [],
  },
  activities: {
    layer: 'generic_crm',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'activities',
    apiSurface: ['activities', 'activities/operations/export'],
    productionBlockers: [],
  },
  notes: {
    layer: 'generic_crm',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'module_records,lead_activities,applications',
    apiSurface: ['notes', 'notes/operations/export', 'leads/:id/activities'],
    productionBlockers: [],
  },
  'follow-ups': {
    layer: 'generic_crm',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'follow_ups',
    apiSurface: ['follow-ups', 'follow-ups/operations/export'],
    productionBlockers: [],
  },
  meetings: {
    layer: 'generic_crm',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'meetings,integration_provider_configs',
    apiSurface: ['meetings', 'meetings/operations/export'],
    productionBlockers: [],
  },
  assignments: {
    layer: 'generic_crm',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'lead_assignments,tasks,user_memberships,teams',
    apiSurface: ['leads/:id/assign', 'tasks', 'identity/hierarchy'],
    productionBlockers: [],
  },
  tags: {
    layer: 'generic_crm',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'tags,leads.tags',
    apiSurface: ['tags', 'tags/operations/export', 'leads/:id/tags'],
    productionBlockers: [],
  },
  'custom-fields': {
    layer: 'generic_crm',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'module_records.payload,leads.customFields',
    apiSurface: ['custom-fields', 'custom-fields/operations/export', 'leads'],
    productionBlockers: [],
  },
  'imports-exports': {
    layer: 'generic_crm',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage:
      'import_export_jobs,report_export_jobs,integration_provider_configs',
    apiSurface: [
      'imports-exports',
      'imports-exports/operations/export',
      'leads/operations/import',
      'leads/operations/export',
      'reports/export-jobs',
    ],
    productionBlockers: [],
  },
  students: {
    layer: 'education_specific',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage:
      'students,student_profiles,student_academic_records,parent_student_relationships',
    apiSurface: ['admin/students', 'students', 'learning'],
    productionBlockers: [],
  },
  'academic-sessions': {
    layer: 'education_specific',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage:
      'academic_sessions,learning_schedules,classrooms,tutor_availability',
    apiSurface: ['academic-sessions', 'academic-sessions/operations/export'],
    productionBlockers: [],
  },
  programs: {
    layer: 'education_specific',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'programs',
    apiSurface: ['admin/programs', 'admin/programs/operations/export'],
    productionBlockers: [],
  },
  courses: {
    layer: 'education_specific',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'course_offerings,subjects,topics,curriculums,study_plans',
    apiSurface: ['courses', 'courses/operations/export'],
    productionBlockers: [],
  },
  specializations: {
    layer: 'education_specific',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'specializations,streams,courses,study_plans',
    apiSurface: ['specializations', 'specializations/operations/export'],
    productionBlockers: [],
  },
  applications: {
    layer: 'education_specific',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'applications,documents,interviews,admin_audit_logs',
    apiSurface: [
      'applications',
      'applications/:id/review',
      'applications/:id/decision',
    ],
    productionBlockers: ['external_form_embed_provider'],
  },
  admissions: {
    layer: 'education_specific',
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
  enrollment: {
    layer: 'education_specific',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage:
      'enrollments,admissions,student_subject_enrollments,learning_entitlements',
    apiSurface: ['enrollment', 'enrollment/operations/export'],
    productionBlockers: [],
  },
  fees: {
    layer: 'education_specific',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'fee_records,payments,finance_ledger_entries,payment_invoices',
    apiSurface: ['fees', 'fees/operations/export', 'finance-ledgers'],
    productionBlockers: [],
  },
  campaigns: {
    layer: 'growth_automation',
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
    layer: 'growth_automation',
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
  'landing-pages': {
    layer: 'growth_automation',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'campaigns,lead_sources,module_records',
    apiSurface: ['campaigns', 'leads/capture', 'admin/module-records'],
    productionBlockers: ['external_landing_page_hosting'],
  },
  'lead-scoring': {
    layer: 'growth_automation',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'leads,lead_activities',
    apiSurface: ['leads/:id/score'],
    productionBlockers: ['predictive_scoring_model_provider'],
  },
  'marketing-attribution': {
    layer: 'growth_automation',
    backendStatus: 'product_ready',
    frontendStatus: 'workflow_ready',
    storage: 'campaigns,lead_sources,analytics_events',
    apiSurface: ['campaigns/:id/metrics', 'analytics'],
    productionBlockers: ['ad_provider_callback_ingestion'],
  },
  telephony: {
    layer: 'growth_automation',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'call-center_calls,communications,integration_provider_configs',
    apiSurface: ['call-center', 'integrations/providers'],
    productionBlockers: ['live_dialer_provider'],
  },
  chatbots: {
    layer: 'growth_automation',
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'workflow_rules,whatsapp_conversations,ai_tutor_sessions',
    apiSurface: ['workflows', 'whatsapp', 'learning/ai-tutor'],
    productionBlockers: ['external_bot_model_provider'],
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
      'organization channel-settings',
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
    storage: 'learning_schedules,tasks,interviews,events,module_records',
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
    storage: 'events',
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
    storage: 'documents',
    apiSurface: ['documents', 'documents/:id/verify'],
    productionBlockers: ['live_ocr_provider'],
  },
  support: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'support_tickets,notifications',
    apiSurface: [
      'support/tickets',
      'admin/support/tickets',
      'admin/support/tickets/operations/export',
      'admin/support/tickets/operations/bulk-status',
    ],
    productionBlockers: ['live_support_sla_notification_provider'],
  },
  settings: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage:
      'account_settings,privacy_settings,notification_settings,communication_settings,security_settings,localization_settings,accessibility_settings,media_settings,ai_settings,user_consents,channel_settings',
    apiSurface: ['settings', 'admin/channel-settings', 'admin/module-records'],
    productionBlockers: [],
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
    productionBlockers: ['external_ai_model_metering'],
  },
  security: {
    backendStatus: 'product_ready',
    frontendStatus: 'product_ready',
    storage: 'audit_logs,user_sessions,organization_security_policies,settings',
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
      const productionReady =
        readiness.backendStatus === 'product_ready' &&
        readiness.frontendStatus === 'product_ready' &&
        readiness.productionBlockers.length === 0;
      return {
        layer: readiness.layer ?? this.getFallbackLayer(moduleKey),
        moduleKey,
        title: moduleTitles[moduleKey],
        status: productionReady ? 'product_ready' : 'workflow_ready',
        ...readiness,
        productionReady,
      };
    });
  }

  private getFallbackLayer(
    moduleKey: (typeof EDUCATION_PLATFORM_MODULE_KEYS)[number],
  ) {
    if (
      ['payments', 'settings', 'security', 'integrations'].includes(moduleKey)
    ) {
      return 'platform_foundation';
    }
    if (['authentication', 'users', 'organizations'].includes(moduleKey)) {
      return 'identity_organization';
    }
    if (
      ['leads', 'communications', 'calendar', 'tasks', 'documents'].includes(
        moduleKey,
      )
    ) {
      return 'generic_crm';
    }
    if (
      [
        'students',
        'applications',
        'admissions',
        'scholarship',
        'interview',
        'learning',
      ].includes(moduleKey)
    ) {
      return 'education_specific';
    }
    return 'growth_automation';
  }
}
