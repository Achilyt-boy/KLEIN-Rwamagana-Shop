import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../context/cartContext'
import { formatPrice } from '../utils/format'

// Hook the accent colour onto the "Add" button so cards stay
// visually quiet and the whole page shares one colour.
export default function ProductCard({ product }) {
  const { t } = useTranslation()
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const outOfStock = product.stock <= 0

  function handleAdd(e) {
    e.preventDefault()
    if (outOfStock) return
    addItem(product, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <Link to={`/products/${product.id}`} className="card">
      <div className="card__image">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} />
        ) : (
          <span className="emoji">{product.categoryEmoji}</span>
        )}
        {outOfStock && (
          <span className="absolute left-2 top-2 rounded-full bg-var(--ink) px-2.5 py-1 text-[11px] font-semibold text-var(--accent-ink)">
            {t('products.outOfStock')}
          </span>
        )}
        {!outOfStock && product.stock <= 5 && (
          <span className="absolute left-2 top-2 rounded-full bg-var(--accent) px-2.5 py-1 text-[11px] font-semibold text-var(--accent-ink)">
            {t('products.lowStock', { count: product.stock })}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <span className="card__meta">{product.categoryName}</span>
        <h3 className="card__title">{product.name}</h3>
        <div className="card__meta">
          <span className="card__price">
            {formatPrice(product.price)} RWF
          </span>
        </div>
        <div className="card__actions">
          <span className="btn btn--ghost">+ {t('products.addToCart')}</span>
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className="btn btn--primary"
          >
            {outOfStock
              ? t('products.outOfStock')
              : added
                ? t('products.added')
                : t('products.addToCart')}
          </button>
        </div>
      </div>
    </Link>
  )
}
