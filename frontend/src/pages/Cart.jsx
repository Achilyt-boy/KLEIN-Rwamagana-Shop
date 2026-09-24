import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../context/cartContext'
import { formatPrice } from '../utils/format'

export default function Cart() {
  const { t } = useTranslation()
  const { items, updateQuantity, removeItem, subtotal } = useCart()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-5xl text-var(--text-muted)">&#128722;</p>
        <h1 className="mt-4 text-2xl font-extrabold text-var(--ink)">{t('cart.empty')}</h1>
        <p className="mt-2 text-sm text-var(--text-muted)">{t('cart.emptyHint')}</p>
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
      <h1 className="text-2xl font-extrabold tracking-tight text-var(--ink)">{t('cart.title')}</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-3">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex items-center gap-4 rounded-2xl border border-solid border-var(--border) bg-white p-4"
            >
              <Link
                to={`/products/${product.id}`}
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-2xl"
              >
                {product.image_url ? (
                  <img src={product.image_url} alt="" className="h-full w-full rounded-xl object-cover" />
                ) : (
                  product.categoryEmoji
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <Link to={`/products/${product.id}`} className="font-semibold text-var(--ink) hover:underline">
                  {product.name}
                </Link>
                <p className="text-sm text-var(--text-muted)">
                  {formatPrice(product.price)} RWF × {quantity} ={' '}
                  <strong className="text-var(--ink)">{formatPrice(product.price * quantity)} RWF</strong>
                </p>
              </div>

              <div className="flex items-center rounded-full border border-solid border-var(--border) bg-white">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="px-3 py-1.5 font-bold text-var(--text-muted) transition hover:text-var(--ink)"
                  aria-label="decrease"
                >−</button>
                <span className="w-7 text-center text-sm font-bold text-var(--ink)">{quantity}</span>
                <button
                  onClick={() => updateQuantity(product.id, Math.min(product.stock, quantity + 1))}
                  className="px-3 py-1.5 font-bold text-var(--text-muted) transition hover:text-var(--ink)"
                  aria-label="increase"
                >+</button>
              </div>

              <button
                onClick={() => removeItem(product.id)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-var(--text-muted) transition hover:text-var(--ink) hover:bg-var(--bg)"
              >
                {t('cart.remove')}
              </button>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-solid border-var(--border) bg-white p-5">
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
