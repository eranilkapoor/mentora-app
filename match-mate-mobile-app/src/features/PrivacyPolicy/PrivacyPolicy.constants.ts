import { SectionItem } from './PrivacyPolicy.types';

export const POLICY_SECTIONS: SectionItem[] = [
  {
    heading: 'privacy_policy.sections.collect.heading',
    subSections: [
      {
        title: 'privacy_policy.sections.collect.personal.title',
        bullets: [
          'privacy_policy.sections.collect.personal.full_name',
          'privacy_policy.sections.collect.personal.gender',
          'privacy_policy.sections.collect.personal.date_of_birth',
          'privacy_policy.sections.collect.personal.marital_status',
          'privacy_policy.sections.collect.personal.phone_number',
          'privacy_policy.sections.collect.personal.email_address',
          'privacy_policy.sections.collect.personal.city_country',
          'privacy_policy.sections.collect.personal.profile_photos',
          'privacy_policy.sections.collect.personal.education_occupation',
          'privacy_policy.sections.collect.personal.partner_preferences',
        ],
      },
      {
        title: 'privacy_policy.sections.collect.auth.title',
        bullets: [
          'privacy_policy.sections.collect.auth.email_password',
          'privacy_policy.sections.collect.auth.phone_otp',
          'privacy_policy.sections.collect.auth.social_login',
        ],
      },
      {
        title: 'privacy_policy.sections.collect.usage.title',
        bullets: [
          'privacy_policy.sections.collect.usage.device_type',
          'privacy_policy.sections.collect.usage.ip_address',
          'privacy_policy.sections.collect.usage.app_interactions',
          'privacy_policy.sections.collect.usage.crash_logs',
          'privacy_policy.sections.collect.usage.cookies',
        ],
      },
      {
        title: 'privacy_policy.sections.collect.activity.title',
        bullets: [
          'privacy_policy.sections.collect.activity.profile_views',
          'privacy_policy.sections.collect.activity.matches',
          'privacy_policy.sections.collect.activity.chat_messages',
          'privacy_policy.sections.collect.activity.verification_documents',
        ],
      },
    ],
  },
  {
    heading: 'privacy_policy.sections.use.heading',
    bullets: [
      'privacy_policy.sections.use.account',
      'privacy_policy.sections.use.matching',
      'privacy_policy.sections.use.chat',
      'privacy_policy.sections.use.experience',
      'privacy_policy.sections.use.fraud',
      'privacy_policy.sections.use.support',
      'privacy_policy.sections.use.notifications',
    ],
  },
  {
    heading: 'privacy_policy.sections.sharing.heading',
    bullets: [
      'privacy_policy.sections.sharing.providers',
      'privacy_policy.sections.sharing.authorities',
      'privacy_policy.sections.sharing.users',
    ],
  },
  {
    heading: 'privacy_policy.sections.security.heading',
    paragraph: 'privacy_policy.sections.security.paragraph',
  },
  {
    heading: 'privacy_policy.sections.rights.heading',
    bullets: [
      'privacy_policy.sections.rights.access',
      'privacy_policy.sections.rights.delete',
      'privacy_policy.sections.rights.visibility',
      'privacy_policy.sections.rights.consent',
    ],
  },
  {
    heading: 'privacy_policy.sections.contact.heading',
    paragraph: 'privacy_policy.sections.contact.paragraph',
  },
];
