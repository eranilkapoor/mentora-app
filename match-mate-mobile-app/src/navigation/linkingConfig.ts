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
          Login: 'login',
          Register: 'register',
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
    },
  },
};
