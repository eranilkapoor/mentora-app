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

@Injectable()
export class ModuleCoverageService {
  getModuleCoverage() {
    return EDUCATION_PLATFORM_MODULE_KEYS.map((moduleKey) => ({
      moduleKey,
      title: moduleTitles[moduleKey],
      status: 'mvp_foundation',
      storage: 'module_records',
    }));
  }
}
