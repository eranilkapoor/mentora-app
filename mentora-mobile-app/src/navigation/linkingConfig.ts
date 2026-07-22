import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const linkingConfig: LinkingOptions<RootStackParamList> = {
  prefixes: [
    'mentora://',
    'https://mentora.webnza.com',
    'https://www.mentora.webnza.com',
  ],
  config: {
    initialRouteName: 'Auth',
    screens: {
      Auth: {
        screens: {
          Welcome: 'welcome',
          Login: 'login',
          Register: 'register',
          PrivacyPolicy: 'privacy-policy',
          TermsConditions: 'terms-conditions',
          ForgotPassword: 'forgot-password',
          ResetPassword: {
            path: 'reset-password',
            parse: {
              code: (code: string) => decodeURIComponent(code),
            },
          },
          MagicLogin: {
            path: 'magic-login',
            parse: {
              token: (token: string) => decodeURIComponent(token),
            },
          },
        },
      },
      App: {
        screens: {
          Tabs: {
            screens: {
              Home: 'home',
              Matches: 'matches',
              Chats: 'chats',
              Membership: 'membership',
              Profile: 'profile',
            },
          },
          Settings: {
            path: 'settings',
            screens: {
              SettingsScreen: '',
              EditProfile: 'edit-profile',
              EditPreference: 'edit-preference',
              ChangePassword: 'change-password',
              NotificationSettings: 'notifications',
              AccountSettings: 'account',
              PrivacySettings: 'privacy',
              CommunicationSettings: 'communication',
              SecuritySettings: 'security',
              AccessibilitySettings: 'accessibility',
              AiSettings: 'ai',
              MediaSettings: 'media',
              LocalizationSettings: 'localization',
              SubscriptionBilling: 'subscription-billing',
              ReferRewards: 'refer-rewards',
              BlockedUsers: 'blocked-users',
              AccountDeletion: 'account-deletion',
              HelpSupport: 'help-support',
              Faqs: 'faqs',
              CommunityGuidelines: 'community-guidelines',
              PrivacyPolicy: 'privacy-policy',
              TermsConditions: 'terms-conditions',
              SupportTickets: 'support-tickets',
              SupportTicketDetail: 'support-tickets/:ticketId',
            },
          },
        },
      },
    },
  },
};
