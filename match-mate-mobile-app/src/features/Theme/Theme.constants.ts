import { TFunction } from 'i18next';
import { ThemeOption } from './Theme.types';

export const getThemeOptions = (t: TFunction): ThemeOption[] => [
  {
    code: 'light',
    label: t('theme.light'),
    description: t('theme.light_description'),
    icon: 'sun',
  },
  {
    code: 'dark',
    label: t('theme.dark'),
    description: t('theme.dark_description'),
    icon: 'moon',
  },
  {
    code: 'system',
    label: t('theme.system'),
    description: t('theme.system_description'),
    icon: 'smartphone',
  },
];
