import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../api/client'
import Spinner from '../components/Spinner'
import StatusTimeline from '../components/StatusTimeline'
import { formatDate, formatPrice } from '../utils/format'

export default function Orders() {
  const { t, i18n } = useTranslation()
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/orders')
      .then((res) => setOrders(res.data))
      .catch((err) => setError(err?.response?.data?.message || t('common.error')))
  }, [t])

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-var(--ink)">{error}</div>
    )
  }
  if (!orders) return <Spinner label={t('orders.loading')} />

  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <div className="emoji">&#128190;</div>
        <h1 className="text-2xl font-extrabold text-var(--ink)">{t('orders.empty')}</h1>
        <div className="mt-6">
          <Link to="/products" className="btn btn--ink">
            {t('cart.startShopping')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="heading">{t('orders.history')}</h1>

      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-2xl border border-solid border-var(--border) bg-white p-5 transition hover:shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-var(--ink)">{t('orders.number', { id: order.id })}</p>
                <p className="text-xs text-var(--text-muted)">
                  {t('orders.placed', { date: formatDate(order.created_at, i18n.language) })}
                  {' · '}
                  {t('orders.items', { count: order.items.length })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusTimeline status={order.status} />
                <span className="font-extrabold text-var(--ink)">{formatPrice(order.total)} RWF</span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-solid border-var(--border) pt-3">
              <p className="truncate text-sm text-var(--text-muted)">
                {order.items.map((i) => `${i.product_name} × ${i.quantity}`).join(', ')}
              </p>
              <Link
                to={`/orders/${order.id}`}
                className="btn btn--ink"
              >
                {t('orders.view')} →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
