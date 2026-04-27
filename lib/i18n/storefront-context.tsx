"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { type Locale, defaultLocale, locales, LOCALE_COOKIE, isRTL } from "./config"
import zh from "./locales/zh"
import en from "./locales/en"
import es from "./locales/es"
import ar from "./locales/ar"
import ru from "./locales/ru"
import ja from "./locales/ja"
import fr from "./locales/fr"
import pl from "./locales/pl"

// All storefront translations
const storefrontTranslations = {
  zh,
  en,
  es,
  ar,
  ru,
  ja,
  fr,
  pl,
} as const

export type StorefrontTranslations = typeof zh

interface StorefrontI18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: StorefrontTranslations
  isRTL: boolean
}

const StorefrontI18nContext = createContext<StorefrontI18nContextType | undefined>(undefined)

interface StorefrontI18nProviderProps {
  children: ReactNode
  initialLocale?: Locale
}

export function StorefrontI18nProvider({ children, initialLocale }: StorefrontI18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || defaultLocale)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Read locale from cookie on mount (client-side)
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(LOCALE_COOKIE + '='))
      ?.split('=')[1] as Locale | undefined
    
    if (cookieValue && locales.includes(cookieValue)) {
      setLocaleState(cookieValue)
    } else if (initialLocale) {
      setLocaleState(initialLocale)
    }
    setMounted(true)
  }, [initialLocale])

  const setLocale = useCallback((newLocale: Locale) => {
    if (!locales.includes(newLocale)) return
    
    setLocaleState(newLocale)
    // Set cookie for 1 year
    document.cookie = `${LOCALE_COOKIE}=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
    
    // Reload page to apply RTL changes if switching to/from Arabic
    const currentIsRTL = isRTL(locale)
    const newIsRTL = isRTL(newLocale)
    if (currentIsRTL !== newIsRTL) {
      window.location.reload()
    }
  }, [locale])

  const t = storefrontTranslations[locale] || storefrontTranslations[defaultLocale]
  const rtl = isRTL(locale)

  // Prevent hydration mismatch
  if (!mounted) {
    const initialT = storefrontTranslations[initialLocale || defaultLocale]
    return (
      <StorefrontI18nContext.Provider value={{ 
        locale: initialLocale || defaultLocale, 
        setLocale, 
        t: initialT,
        isRTL: isRTL(initialLocale || defaultLocale)
      }}>
        {children}
      </StorefrontI18nContext.Provider>
    )
  }

  return (
    <StorefrontI18nContext.Provider value={{ locale, setLocale, t, isRTL: rtl }}>
      {children}
    </StorefrontI18nContext.Provider>
  )
}

export function useStorefrontI18n() {
  const context = useContext(StorefrontI18nContext)
  if (context === undefined) {
    throw new Error("useStorefrontI18n must be used within a StorefrontI18nProvider")
  }
  return context
}

// Helper function to get translation value with interpolation
export function interpolate(
  text: string,
  params?: Record<string, string | number>
): string {
  if (!params) return text
  
  let result = text
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value))
  })
  return result
}
