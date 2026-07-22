export const SUPPORTED_LOCALES = ['en', 'hi'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'en';

export const FALLBACK_LOCALE: SupportedLocale = 'en';
