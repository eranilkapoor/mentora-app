import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en, hi } from './locales';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
} as const;

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
  })
  .then(() => {
    console.info(`i18n initialized with language: ${i18n.language}`);
  })
  .catch((err) => {
    console.error('Error initializing i18n:', err);
  });

export default i18n;
