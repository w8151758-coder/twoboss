"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { translations, Locale, TranslationKeys } from "./translations"

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TranslationKeys
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const STORAGE_KEY = "admin-locale"

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // 从 localStorage 读取语言设置
    const savedLocale = localStorage.getItem(STORAGE_KEY) as Locale
    if (savedLocale && (savedLocale === "zh" || savedLocale === "en")) {
      setLocaleState(savedLocale)
    }
    setMounted(true)
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem(STORAGE_KEY, newLocale)
  }

  const t = translations[locale]

  // 防止服务端渲染时的不匹配
  if (!mounted) {
    return (
      <I18nContext.Provider value={{ locale: "zh", setLocale, t: translations.zh }}>
        {children}
      </I18nContext.Provider>
    )
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}
