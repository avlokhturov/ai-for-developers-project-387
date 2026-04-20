import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Locale, translations, TranslationKey } from './translations'

interface I18nContextValue {
  locale: Locale
  t: TranslationKey
  setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

const STORAGE_KEY = 'calendar-booking-locale'

function getInitialLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'ru') return saved
  } catch {
    // localStorage unavailable
  }
  const browserLang = navigator.language.slice(0, 2)
  return browserLang === 'ru' ? 'ru' : 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    try {
      localStorage.setItem(STORAGE_KEY, newLocale)
    } catch {
      // localStorage unavailable
    }
  }, [])

  const value: I18nContextValue = {
    locale,
    t: translations[locale],
    setLocale,
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
