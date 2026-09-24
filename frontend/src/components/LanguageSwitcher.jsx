import { useTranslation } from 'react-i18next'

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'rw', label: 'Kinyarwanda' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0]

  return (
    <div className="relative">
      <select
        aria-label="Language"
        value={current}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="appearance-none rounded-full border border-solid border-var(--border) bg-white py-1.5 pl-3 pr-8 text-sm font-medium text-var(--text) transition hover:border-var(--accent) focus:outline-none focus:ring-2 focus:ring-var(--accent)/30 cursor-pointer"
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-var(--text-muted)">
        ▾
      </span>
    </div>
  )
}
