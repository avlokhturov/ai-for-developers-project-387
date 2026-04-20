import { useI18n } from '@/lib/i18n'
import { Locale } from '@/lib/i18n/translations'

const flags: Record<Locale, { emoji: string; label: string }> = {
  en: { emoji: '🇬🇧', label: 'English' },
  ru: { emoji: '🇷🇺', label: 'Русский' },
}

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()

  const next: Locale = locale === 'en' ? 'ru' : 'en'

  return (
    <button
      onClick={() => setLocale(next)}
      className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-accent transition-colors text-lg"
      title={flags[next].label}
      aria-label={`Switch to ${flags[next].label}`}
    >
      <span>{flags[locale].emoji}</span>
    </button>
  )
}
