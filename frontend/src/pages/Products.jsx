import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../api/client'
import ProductCard from '../components/ProductCard'
import Spinner from '../components/Spinner'

export default function Products() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()

  const [categories, setCategories] = useState([])
  const [result, setResult] = useState({ key: null, products: [], meta: { page: 1, totalPages: 1, total: 0 }, error: '' })
  const [refresh, setRefresh] = useState(0)

  const [searchInput, setSearchInput] = useState(params.get('search') || '')
  const [minInput, setMinInput] = useState(params.get('minPrice') || '')
  const [maxInput, setMaxInput] = useState(params.get('maxPrice') || '')

  const search = params.get('search') || ''
  const category = params.get('category') || ''
  const minPrice = params.get('minPrice') || ''
  const maxPrice = params.get('maxPrice') || ''
  const sort = params.get('sort') || 'newest'
  const page = Number(params.get('page')) || 1

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {})
  }, [])

  const queryKey = JSON.stringify({ search, category, minPrice, maxPrice, sort, page, refresh })
  const loading = result.key !== queryKey
  const products = loading ? [] : result.products
  const meta = loading ? { page: 1, totalPages: 1, total: 0 } : result.meta
  const error = loading ? '' : result.error

  useEffect(() => {
    let cancelled = false
    api
      .get('/products', { params: { search, category, minPrice, maxPrice, sort, page, limit: 12 } })
      .then((res) => {
        if (cancelled) return
        setResult({
          key: queryKey,
          products: res.data.products,
          meta: { page: res.data.page, totalPages: res.data.totalPages, total: res.data.total },
          error: '',
        })
      })
      .catch((err) => {
        if (cancelled) return
        setResult({
          key: queryKey,
          products: [],
          meta: { page: 1, totalPages: 1, total: 0 },
          error: err?.response?.data?.message || t('common.error'),
        })
      })
    return () => {
      cancelled = true
    }
  }, [queryKey, search, category, minPrice, maxPrice, sort, page, t])

  function patchParams(changes) {
    const next = new URLSearchParams(params)
    Object.entries(changes).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) next.delete(key)
      else next.set(key, value)
    })
    if (!('page' in changes)) next.delete('page')
    setParams(next)
  }

  function submitSearch(e) {
    e.preventDefault()
    patchParams({ search: searchInput.trim() })
  }

  function submitPrices(e) {
    e.preventDefault()
    patchParams({ minPrice: minInput, maxPrice: maxInput })
  }

  const hasFilters = Boolean(search || category || minPrice || maxPrice)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="heading">{t('products.title')}</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <form onSubmit={submitPrices} className="rounded-2xl border border-solid border-var(--border) bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-var(--text)">{t('products.filters')}</h2>
              {hasFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setParams(new URLSearchParams())
                    setSearchInput('')
                    setMinInput('')
                    setMaxInput('')
                  }}
                  className="text-xs font-semibold text-var(--text-muted) hover:text-var(--text)"
                >
                  {t('products.clearFilters')}
                </button>
              )}
            </div>

            <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-var(--text-muted)">
              {t('products.category')}
            </h3>
            <div className="mt-2 space-y-1">
              <button
                type="button"
                onClick={() => patchParams({ category: '' })}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                  !category ? 'font-semibold text-var(--text)' : 'text-var(--text-muted) hover:text-var(--text)'
                }`}
              >
                {t('products.allCategories')}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => patchParams({ category: cat.slug })}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                    category === cat.slug
                      ? 'font-semibold text-var(--text)'
                      : 'text-var(--text-muted) hover:text-var(--text)'
                  }`}
                >
                  {cat.emoji} {cat.name}
                </button>
              ))}
            </div>

            <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-var(--text-muted)">
              {t('products.price')} RWF
            </h3>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                min="0"
                placeholder={t('products.minPrice')}
                value={minInput}
                onChange={(e) => setMinInput(e.target.value)}
                className="w-full rounded-lg border border-solid border-var(--border) px-3 py-2 text-sm transition focus:border-var(--accent) focus:outline-none focus:ring-2 focus:ring-var(--accent)/10"
              />
              <span className="text-var(--text-muted)">–</span>
              <input
                type="number"
                min="0"
                placeholder={t('products.maxPrice')}
                value={maxInput}
                onChange={(e) => setMaxInput(e.target.value)}
                className="w-full rounded-lg border border-solid border-var(--border) px-3 py-2 text-sm transition focus:border-var(--accent) focus:outline-none focus:ring-2 focus:ring-var(--accent)/10"
              />
            </div>
            <button
              type="submit"
              className="mt-3 w-full rounded-lg bg-var(--accent) px-4 py-2 text-sm font-semibold text-var(--accent-ink) transition hover:bg-#a6184f"
            >
              {t('products.search')}
            </button>
          </form>
        </aside>

        <section>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <form onSubmit={submitSearch} className="relative w-full sm:max-w-md">
              <input
                type="search"
                placeholder={t('products.searchPlaceholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-full border border-solid border-var(--border) py-2.5 pl-4 pr-24 text-sm shadow-sm transition focus:border-var(--accent) focus:outline-none focus:ring-2 focus:ring-var(--accent)/10"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-var(--ink) px-4 py-1.5 text-xs font-bold text-var(--accent-ink) transition hover:bg-#a6184f"
              >
                {t('products.search')}
              </button>
            </form>

            <div className="flex items-center gap-3">
              <span className="text-sm text-var(--text-muted)">
                {t('products.results', { count: meta.total })}
              </span>
              <select
                value={sort}
                onChange={(e) => patchParams({ sort: e.target.value })}
                className="rounded-lg border border-solid border-var(--border) px-3 py-2 text-sm font-medium text-var(--text) transition hover:border-var(--accent) focus:outline-none focus:ring-2 focus:ring-var(--accent)/10 cursor-pointer"
              >
                <option value="newest">{t('products.sortNewest')}</option>
                <option value="price_asc">{t('products.sortPriceAsc')}</option>
                <option value="price_desc">{t('products.sortPriceDesc')}</option>
              </select>
            </div>
          </div>

          {loading ? (
            <Spinner label={t('products.loading')} />
          ) : error ? (
            <div className="mt-8 rounded-2xl border border-solid border-var(--border) bg-white p-6 text-sm text-var(--text)">
              {error}
              <button onClick={() => setRefresh((n) => n + 1)} className="ml-3 font-semibold text-var(--text)">
                {t('common.retry')}
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-var(--border) bg-white p-10 text-center">
              <p className="text-4xl text-var(--text-muted)">&#128308;</p>
              <p className="mt-3 font-semibold text-var(--text)">{t('products.noResults')}</p>
              <p className="mt-1 text-sm text-var(--text-muted)">{t('products.noResultsHint')}</p>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {meta.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                disabled={meta.page <= 1}
                onClick={() => patchParams({ page: String(meta.page - 1) })}
                className="rounded-full border border-solid border-var(--border) px-4 py-2 text-sm font-semibold text-var(--text-muted) transition disabled:opacity-40 hover:bg-var(--surface-hover)"
              >
                ← {t('products.prev')}
              </button>
              <span className="text-sm text-var(--text-muted)">
                {t('products.page', { page: meta.page, pages: meta.totalPages })}
              </span>
              <button
                disabled={meta.page >= meta.totalPages}
                onClick={() => patchParams({ page: String(meta.page + 1) })}
                className="rounded-full border border-solid border-var(--border) px-4 py-2 text-sm font-semibold text-var(--text-muted) transition disabled:opacity-40 hover:bg-var(--surface-hover)"
              >
                {t('products.next')} →
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
