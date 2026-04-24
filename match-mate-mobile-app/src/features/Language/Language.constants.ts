import { TFunction } from 'i18next';
import { LanguageOption } from './Language.types';

export const getLanguageOptions = (t: TFunction): LanguageOption[] => [
  {
    code: 'en',
    label: t('language.english'),
    nativeName: 'English',
    icon: '🇬🇧',
  },
  {
    code: 'hi',
    label: t('language.hindi'),
    nativeName: 'हिन्दी',
    icon: '🇮🇳',
  },
];
