import { Injectable } from '@nestjs/common';
import { EDUCATION_PLATFORM_MODULE_KEYS } from '@/common/constants/education-platform.constants';

const moduleTitles: Record<
  (typeof EDUCATION_PLATFORM_MODULE_KEYS)[number],
  string
> = {
  authentication: 'Authentication',
  user_management: 'User Management',
  organization_management: 'Organization Management',
  lead_management: 'Lead Management',
  application_management: 'Application Management',
  admission_management: 'Admission Management',
  marketing_automation: 'Marketing Automation',
  communication: 'Communication Module',
  call_center: 'Call Center',
  whatsapp: 'WhatsApp',
  email: 'Email',
  sms: 'SMS Module',
  mobile: 'Mobile App',
  calendar: 'Calendar',
  task_management: 'Task Management',
  document_management: 'Document Management',
  payment: 'Payment Module',
  finance: 'Finance Module',
  scholarship: 'Scholarship',
  interview: 'Interview Module',
  event_management: 'Event Management',
  field_force_automation: 'Field Force Automation',
  reports: 'Reports',
  dashboard: 'Dashboard',
  analytics: 'Analytics',
  ai_features: 'AI Features',
  integrations: 'Integrations',
  security: 'Security',
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
