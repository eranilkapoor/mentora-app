import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import hi from './locales/hi.json';

const languageCode = Localization.getLocales()?.[0]?.languageCode ?? 'en';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
} as const;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: languageCode,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })
  .then(() => {
    console.warn(`i18n initialized with language: ${i18n.language}`);
  })
  .catch((err) => {
    console.error('Error initializing i18n:', err);
  });

export default i18n;
