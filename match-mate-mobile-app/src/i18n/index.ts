import i18n, { Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en, hi } from './locales';
import { reportError } from '@/core/utils/errorReporter';

// Typed resources (better TS support)
const resources: Resource = {
  en: { translation: en },
  hi: { translation: hi },
};

// Default language (can be dynamic later)
const DEFAULT_LANGUAGE = 'en';

void i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: DEFAULT_LANGUAGE, // explicitly set language
    fallbackLng: 'en',

    // Debug only in dev
    debug: __DEV__,

    // Performance optimizations
    load: 'languageOnly', // avoids en-US vs en issues
    cleanCode: true,

    interpolation: {
      escapeValue: false, // React already escapes
    },

    // Return handling
    returnNull: false,
    returnEmptyString: false,

    // Better key handling
    keySeparator: '.', // supports nested keys like auth.login.title
    nsSeparator: ':',

    compatibilityJSON: 'v4',
  })
  .catch((err: unknown) => {
    reportError(err, {
      source: 'i18n.init',
    });
  });

export default i18n;
