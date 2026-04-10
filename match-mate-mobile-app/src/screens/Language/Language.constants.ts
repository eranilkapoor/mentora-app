import { LanguageOption } from './Language.types';

export const getLanguageOptions = (t: any): LanguageOption[] => [
  {
    code: 'en',
    label: t('english'),
    nativeName: 'English',
    icon: '🇬🇧',
  },
  {
    code: 'hi',
    label: t('hindi'),
    nativeName: 'हिन्दी',
    icon: '🇮🇳',
  },
];