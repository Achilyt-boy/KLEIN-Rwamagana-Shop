import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api, { errorMessage } from '../api/client'
import { useAuth } from '../context/authContext'
import { useCart } from '../context/cartContext'
import { formatPrice } from '../utils/format'

export default function Checkout() {
  const { t } = useTranslation()
  const { user, booting } = useAuth()
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: user?.name || user?.fullName || '',
    phone: '',
    address: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const field =
    'mt-1.5 w-full rounded-xl border border-solid border-var(--border) px-4 py-2.5 text-sm transition focus:border-var(--accent) focus:outline-none focus:ring-2 focus:ring-var(--accent)/10'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.name || !form.phone || !form.address) {
      setError(t('auth.required'))
      return
    }

    setBusy(true)
    try {
      await api.post('/orders', {
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        shipping: { name: form.name, phone: form.phone, address: form.address },
      })
      clearCart()
      navigate(`/orders/${res.data.orderId}`, { replace: true })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  if (!booting && !user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-4xl text-var(--text-muted)">&#128274;</p>
        <p className="mt-4 font-semibold text-var(--ink)">{t('checkout.mustLogin')}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/login" className="rounded-full bg-var(--ink) px-6 py-3 text-sm font-bold text-var(--accent-ink) transition hover:bg-var(--accent)">
            {t('nav.login')}
          </Link>
          <Link to="/register" className="rounded-full border border-solid border-var(--border) px-6 py-3 text-sm font-semibold text-var(--text) transition hover:bg-var(--bg)">
            {t('nav.register')}
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-4xl text-var(--text-muted)">&#128722;</p>
        <p className="mt-4 font-semibold text-var(--ink)">{t('cart.empty')}</p>
        <Link
          to="/products"
          className="mt-6 inline-block rounded-full bg-var(--ink) px-6 py-3 text-sm font-bold text-var(--accent-ink) transition hover:bg-var(--accent)"
        >
          {t('cart.startShopping')}
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-var(--ink)">{t('checkout.title')}</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-solid border-var(--border) bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-var(--text-muted)">
            {t('checkout.delivery')}
          </h2>

          {error && (
            <div className="mb-4 rounded-xl px-4 py-3 text-sm text-var(--ink)">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-var(--ink)">
                {t('checkout.fullName')}
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={field}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-var(--ink)">
                {t('checkout.phone')}
              </label>
              <input
                type="tel"
                placeholder="078X XXX XXX"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={field}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-var(--ink)">
                {t('checkout.address')}
              </label>
              <textarea
                rows={3}
                placeholder={t('checkout.addressPlaceholder')}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className={`${field} resize-y`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded-full bg-var(--ink) px-4 py-3.5 text-sm font-bold text-var(--accent-ink) transition hover:bg-var(--accent) disabled:opacity-60"
          >
            {busy ? t('checkout.placing') : t('checkout.placeOrder')}
          </button>
        </form>

        <aside className="rounded-2xl border border-solid border-var(--border) bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-var(--text-muted)">
            {t('checkout.summary')}
          </h2>
          <ul className="mt-4 space-y-2">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex justify-between text-sm text-var(--text)">
                <span>
                  {product.name} <span className="text-var(--text-muted)">× {quantity}</span>
                </span>
                <span className="font-semibold text-var(--ink)">
                  {formatPrice(product.price * quantity)} RWF
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-solid border-var(--border) pt-4 text-sm text-var(--text)">
            <span className="font-medium text-var(--ink)">{t('cart.total')}</span>
            <span className="text-lg font-extrabold text-var(--ink)">{formatPrice(subtotal)} RWF</span>
          </div>

          <Link
            to="/checkout"
            className="mt-5 block rounded-full bg-var(--ink) px-4 py-3 text-center text-sm font-bold text-var(--accent-ink) transition hover:bg-var(--accent)"
          >
            {t('cart.proceedCheckout')}
          </Link>
          <Link
            to="/products"
            className="mt-3 block rounded-full border border-solid border-var(--border) px-4 py-3 text-center text-sm font-semibold text-var(--text) transition hover:bg-var(--bg)"
          >
            {t('cart.continueShopping')}
          </Link>
        </aside>
      </div>
    </div>
  )
}
