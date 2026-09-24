import { useTranslation } from 'react-i18next'
import { STATUS_ORDER } from '../utils/format'

export default function StatusTimeline({ status }) {
  const { t } = useTranslation()

  if (status === 'cancelled') {
    return (
      <div className="rounded-xl px-4 py-3 text-sm font-semibold text-var(--ink)">
        {t('status.cancelled')}
      </div>
    )
  }

  const currentIndex = STATUS_ORDER.indexOf(status)

  return (
    <ol className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {STATUS_ORDER.map((step, i) => {
        const done = i <= currentIndex
        return (
          <li key={step} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
                done ? 'bg-var(--accent) text-var(--accent-ink)' : 'bg-var(--border) text-var(--text-muted)'
              }`}
            >
              {done ? '\u2713' : i + 1}
            </span>
            <span
              className={`text-xs font-medium ${
                done ? 'text-var(--ink)' : 'text-var(--text-muted)'
              }`}
            >
              {t(`status.${step}`)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
