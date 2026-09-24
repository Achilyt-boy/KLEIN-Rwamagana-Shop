import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../api/client'
import Spinner from '../components/Spinner'
import { useCart } from '../context/cartContext'
import { formatPrice } from '../utils/format'
import { getProductImage } from '../utils/productImages'

export default function ProductDetail() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { addItem } = useCart()

  const [data, setData] = useState({ id: null, product: null, error: false })
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    let cancelled = false
    api
      .get(`/products/${id}`)
      .then((res) => {
        if (cancelled) return
        setData({ id, product: res.data, error: false })
        setQty(1)
      })
      .catch(() => {
        if (cancelled) return
        setData({ id, product: null, error: true })
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const loading = data.id !== id && !data.error
  const product = data.id === id ? data.product : null

  if (loading) return <Spinner />
  if (!product) {
    return (
      <div className="empty-state">
        <div className="emoji">&#129300;</div>
        <h1 className="text-2xl font-extrabold text-var(--ink)">{t('product.notFound')}</h1>
        <div className="mt-6">
          <Link to="/products" className="btn btn--ink">
            ← {t('product.back')}
          </Link>
        </div>
      </div>
    )
  }

  const outOfStock = product.stock <= 0
  const image = getProductImage(product)

  function handleAdd() {
    addItem(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link to="/products" className="text-sm font-semibold text-var(--text-muted) hover:text-var(--ink)">
        ← {t('product.back')}
      </Link>

      <div className="mt-6 grid gap-8 sm:grid-cols-2">
        <div className="flex h-72 items-center justify-center rounded-2xl border border-solid border-var(--border) bg-var(--bg)">
          {image ? (
            <img src={image} alt={product.name} className="h-full w-full object-cover rounded-2xl" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          ) : (
            <span className="text-6xl">{product.categoryEmoji}</span>
          )}
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wide text-var(--text-muted)">
            {product.categoryName}
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-var(--ink)">{product.name}</h1>

          <p className="mt-3 text-sm text-var(--text-muted)">
            {product.stock > 5
              ? t('product.inStock')
              : product.stock > 0
                ? t('products.lowStock', { count: product.stock })
                : t('products.outOfStock')}
            <span className="mx-1">·</span>
            ID: {product.id}
          </p>

          <p className="mt-4 text-4xl font-extrabold text-var(--ink)">
            {formatPrice(product.price)}
            <span className="ml-1 text-base font-bold text-var(--text-muted)">RWF</span>
          </p>

          <h2 className="mt-6 text-sm font-bold uppercase tracking-wide text-var(--text-muted)">
            {t('product.description')}
          </h2>
          <p className="mt-2 leading-relaxed text-var(--text)">{product.description}</p>

          <div className="mt-7 flex items-center gap-4">
            <div className="flex items-center rounded-full border border-solid border-var(--border) bg-white">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-4 py-2.5 text-lg font-bold text-var(--text-muted) transition hover:text-var(--ink)"
                aria-label="decrease"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-bold text-var(--ink)">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                className="px-4 py-2.5 text-lg font-bold text-var(--text-muted) transition hover:text-var(--ink)"
                aria-label="increase"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAdd}
              disabled={outOfStock}
              className={`flex-1 rounded-full px-6 py-3 text-sm font-bold transition ${
                outOfStock
                  ? 'cursor-not-allowed border border-solid border-var(--border) text-var(--text-muted)'
                  : added
                    ? 'bg-var(--accent) text-var(--accent-ink)'
                    : 'bg-var(--ink) text-var(--accent-ink) hover:bg-var(--accent)'
              }`}
            >
              {outOfStock
                ? t('products.outOfStock')
                : added
                  ? t('products.added')
                  : t('products.addToCart')}
            </button>
          </div>

          {added && (
            <Link to="/cart" className="mt-3 text-sm font-semibold text-var(--accent)">
              {t('cart.title')} →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
