import { SectionItem } from "./PrivacyPolicy.types";

export const POLICY_SECTIONS: SectionItem[] = [
  {
    heading: '1. Information We Collect',
    subSections: [
      {
        title: '1.1 Personal Information',
        bullets: [
          'Full Name',
          'Gender',
          'Date of Birth',
          'Marital Status',
          'Phone Number',
          'Email Address',
          'City / Country',
          'Profile Photos',
          'Education & Occupation',
          'Partner Preferences',
        ],
      },
      {
        title: '1.2 Login & Authentication',
        bullets: [
          'Email + Password',
          'Phone Number + OTP',
          'Social Login (Google, Facebook, Apple)',
        ],
      },
      {
        title: '1.3 Usage & Device Information',
        bullets: [
          'Device type',
          'IP address',
          'App interactions',
          'Crash logs',
          'Cookies (on web)',
        ],
      },
      {
        title: '1.4 App Activity',
        bullets: [
          'Profile views',
          'Matches, likes, shortlist',
          'Chat messages (encrypted)',
          'Verification documents',
        ],
      },
    ],
  },
  {
    heading: '2. How We Use Your Information',
    bullets: [
      'Create/manage your account',
      'Match you with other users',
      'Provide chat features',
      'Improve user experience',
      'Prevent fraud',
      'Provide support',
      'Send important notifications',
    ],
  },
  {
    heading: '3. Sharing Your Information',
    bullets: [
      'Service providers',
      'Legal authorities',
      'Other users (limited profile info)',
    ],
  },
  {
    heading: '4. Security',
    paragraph:
      'We use encryption, secure servers, access control, and regular security audits to protect your data.',
  },
  {
    heading: '5. Your Rights',
    bullets: [
      'Access or edit your info',
      'Delete your account',
      'Update visibility settings',
      'Withdraw consent',
    ],
  },
  {
    heading: '6. Contact Us',
    paragraph:
      'Company: Webnza! Infotech / MatchMate\nEmail: support@webnza.com\nWebsite: www.webnza.com\nAddress: New Delhi',
  },
];