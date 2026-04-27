// Supported locales for storefront
export const locales = ['zh', 'en', 'es', 'ar', 'ru', 'ja', 'fr', 'pl'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'zh'

// RTL languages
export const rtlLocales: Locale[] = ['ar']

// Language display names
export const localeNames: Record<Locale, string> = {
  zh: '中文',
  en: 'English',
  es: 'Español',
  ar: 'العربية',
  ru: 'Русский',
  ja: '日本語',
  fr: 'Français',
  pl: 'Polski',
}

// Language flags (emoji)
export const localeFlags: Record<Locale, string> = {
  zh: '🇨🇳',
  en: '🇺🇸',
  es: '🇪🇸',
  ar: '🇸🇦',
  ru: '🇷🇺',
  ja: '🇯🇵',
  fr: '🇫🇷',
  pl: '🇵🇱',
}

// Country code to locale mapping
export const countryToLocale: Record<string, Locale> = {
  // Chinese speaking
  CN: 'zh',
  TW: 'zh',
  HK: 'zh',
  MO: 'zh',
  SG: 'zh',
  
  // English speaking
  US: 'en',
  GB: 'en',
  AU: 'en',
  CA: 'en',
  NZ: 'en',
  IE: 'en',
  ZA: 'en',
  IN: 'en',
  PH: 'en',
  
  // Spanish speaking
  ES: 'es',
  MX: 'es',
  AR: 'es',
  CO: 'es',
  PE: 'es',
  CL: 'es',
  VE: 'es',
  EC: 'es',
  GT: 'es',
  CU: 'es',
  
  // Arabic speaking
  SA: 'ar',
  AE: 'ar',
  EG: 'ar',
  IQ: 'ar',
  MA: 'ar',
  DZ: 'ar',
  SD: 'ar',
  JO: 'ar',
  SY: 'ar',
  YE: 'ar',
  TN: 'ar',
  LY: 'ar',
  LB: 'ar',
  KW: 'ar',
  OM: 'ar',
  QA: 'ar',
  BH: 'ar',
  
  // Russian speaking
  RU: 'ru',
  BY: 'ru',
  KZ: 'ru',
  KG: 'ru',
  
  // Japanese speaking
  JP: 'ja',
  
  // French speaking
  FR: 'fr',
  BE: 'fr',
  CH: 'fr',
  LU: 'fr',
  MC: 'fr',
  SN: 'fr',
  CI: 'fr',
  CM: 'fr',
  
  // Polish speaking
  PL: 'pl',
}

// Cookie name for storing locale preference
export const LOCALE_COOKIE = 'NEXT_LOCALE'

// Check if locale is RTL
export function isRTL(locale: Locale): boolean {
  return rtlLocales.includes(locale)
}

// Get direction for locale
export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr'
}
