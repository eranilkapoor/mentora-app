import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const linkingConfig: LinkingOptions<RootStackParamList> = {
  prefixes: ['myapp://', 'https://myapp.com'],
  config: {
    initialRouteName: 'Auth',
    screens: {
      // Add your deep link screen mappings here
    },
  },
};
