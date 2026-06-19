import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const linkingConfig: LinkingOptions<RootStackParamList> = {
  prefixes: [
    'matchmate://',
    'https://matchmate.webnza.com',
    'https://www.matchmate.webnza.com',
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
              token: (token: string) => decodeURIComponent(token),
              accessToken: (token: string) => decodeURIComponent(token),
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
          Settings: {
            path: 'settings',
            screens: {
              SettingsScreen: '',
              AccountSettings: 'account',
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
