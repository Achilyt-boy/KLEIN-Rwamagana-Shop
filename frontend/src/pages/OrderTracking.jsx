import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api, { errorMessage } from '../api/client'
import Spinner from '../components/Spinner'
import StatusTimeline from '../components/StatusTimeline'
import { formatDate, formatPrice } from '../utils/format'

const POLL_MS = 5000

export default function OrderTracking() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [updatedAt, setUpdatedAt] = useState(null)
  const timerRef = useRef(null)

  const fetchOrder = useCallback(() => {
    return api
      .get(`/orders/${id}`)
      .then((res) => {
        setOrder(res.data)
        setUpdatedAt(new Date())
        setError('')
      })
      .catch((err) => setError(errorMessage(err)))
  }, [id])

  useEffect(() => {
    fetchOrder()
    timerRef.current = setInterval(fetchOrder, POLL_MS)
    return () => clearInterval(timerRef.current)
  }, [fetchOrder])

  if (error && !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm font-medium text-var(--ink)">{error}</p>
        <Link to="/orders" className="mt-4 inline-block text-sm font-semibold text-var(--ink)">
          ← {t('orders.title')}
        </Link>
      </div>
    )
  }
  if (!order) return <Spinner />

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link to="/orders" className="text-sm font-semibold text-var(--text-muted) hover:text-var(--ink)">
        ← {t('orders.history')}
      </Link>

      <div className="mt-5 rounded-2xl border border-solid border-var(--border) bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold text-var(--ink)">
              {t('tracking.title', { id: order.id })}
            </h1>
            <StatusTimeline status={order.status} />
          </div>
          <div className="flex items-center gap-2 text-xs text-var(--text-muted)">
            <span className="relative flex h-2 w-2">
              <span className="inline-flex h-full w-full rounded-full bg-var(--accent)" />
            </span>
            {t('tracking.updated', { time: updatedAt ? formatDate(updatedAt, i18n.language) : '—' })}
          </div>
        </div>

        <p className="mt-1 text-xs text-var(--text-muted)">{t('tracking.autoRefresh')}</p>

        <div className="mt-6">
          <StatusTimeline status={order.status} />
        </div>

        {error && (
          <p className="mt-4 rounded-xl px-4 py-2 text-sm text-var(--ink)">{error}</p>
        )}
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-solid border-var(--border) bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-var(--text-muted)">
            {t('tracking.orderItems')}
          </h2>
          <ul className="mt-4 space-y-3">
            {order.items.map((item, idx) => (
              <li key={idx} className="flex justify-between text-sm text-var(--text)">
                <span>
                  {item.product_name} <span className="text-var(--text-muted)">× {item.quantity}</span>
                </span>
                <span className="shrink-0 font-semibold text-var(--ink)">
                  {formatPrice(item.unitPrice * item.quantity)} RWF
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-solid border-var(--border) pt-4 text-sm text-var(--text)">
            <span className="font-medium text-var(--ink)">{t('tracking.subtotal')}</span>
            <span className="text-lg font-extrabold text-var(--ink)">{formatPrice(order.total)} RWF</span>
          </div>
        </div>

        <div className="rounded-2xl border border-solid border-var(--border) bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-var(--text-muted)">
            {t('tracking.shippingTo')}
          </h2>
          <div className="mt-4 space-y-2 text-sm text-var(--text)">
            <p className="font-semibold text-var(--ink)">{order.shipping_name}</p>
            <p>{order.shipping_phone}</p>
            <p>{order.shipping_address}</p>
          </div>
          <p className="mt-4 text-xs text-var(--text-muted)">
            {t('orders.placed', { date: formatDate(order.created_at, i18n.language) })}
          </p>
        </div>
      </div>
    </div>
  )
}
