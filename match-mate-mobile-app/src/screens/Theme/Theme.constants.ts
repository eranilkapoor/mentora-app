import { ThemeOption } from './Theme.types';

export const getThemeOptions = (t: any): ThemeOption[] => [
  {
    code: 'light',
    label: t('light'),
    description: t('light_description', 'Clean white background'),
    icon: 'sun',
  },
  {
    code: 'dark',
    label: t('dark'),
    description: t('dark_description', 'Easy on the eyes at night'),
    icon: 'moon',
  },
  {
    code: 'system',
    label: t('system'),
    description: t('system_description', 'Follows your device settings'),
    icon: 'smartphone',
  },
];
