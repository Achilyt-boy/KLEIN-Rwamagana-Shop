// Small formatting helpers shared by every page so prices and dates
// look the same everywhere — and so switching language also switches
// the number/date format.

export function formatPrice(value) {
  const amount = Number(value) || 0
  return new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(amount)
}

export function formatDate(value, lng = 'en') {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const locale = lng === 'rw' ? 'rw-RW' : lng === 'fr' ? 'fr-FR' : 'en-GB'
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// Colour + label chip for each order status — all neutral in one accent.
export const STATUS_STYLES = {
  pending:     'bg-var(--border) text-var(--text)',
  processing:  'bg-var(--border) text-var(--text)',
  shipped:     'bg-var(--border) text-var(--text)',
  delivered:   'bg-var(--border) text-var(--text)',
  cancelled:   'bg-var(--ink) text-var(--accent-ink)',
}

export const STATUS_ORDER = ['pending', 'processing', 'shipped', 'delivered']

// Deprecated: product cards no longer use per-category colour tiles.
export function tileClass(slug) {
  return 'bg-transparent'
}
