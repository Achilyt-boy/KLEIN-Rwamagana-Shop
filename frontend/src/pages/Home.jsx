import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../api/client'
import ProductCard from '../components/ProductCard'
import Spinner from '../components/Spinner'

export default function Home() {
  const { t } = useTranslation()
  const [featured, setFeatured] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/products?limit=8&sort=newest'),
      api.get('/categories'),
    ])
      .then(([p, c]) => {
        setFeatured(p.data.products)
        setCategories(c.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <section className="hero">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="eyebrow">{t('home.catalogue')}</p>
          <h1 className="mt-2">{t('home.heroTitle')}</h1>
          <p className="mt-3">{t('home.heroSubtitle')}</p>
          <div className="mt-6">
            <Link to="/products" className="btn btn--primary">
              {t('home.shopNow')}
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="heading">{t('home.browseCategories')}</h2>
              <p className="subheading">{t('home.featuredSubtitle')}</p>
            </div>
            <Link to="/products" className="text-sm font-semibold text-var(--text-muted) hover:text-var(--text)">
              {t('home.viewAll')} →
            </Link>
          </div>

          {loading ? (
            <Spinner label={t('products.loading')} />
          ) : (
            <div className="card-stack mt-5">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-10">
          <div className="panel">
            <h2 className="heading">{t('home.shopByCategory')}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-var(--surface-hover)"
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="font-medium text-var(--text)">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
