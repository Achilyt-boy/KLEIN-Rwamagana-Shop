import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/authContext'
import { useCart } from '../context/cartContext'
import LanguageSwitcher from './LanguageSwitcher'

export default function Navbar() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const { count } = useCart()
  const [open, setOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-var(--ink) font-semibold' : 'text-var(--text-muted) hover:text-var(--ink)'
    }`

  return (
    <header className="sticky top-0 z-40 border-b border-solid border-var(--border) bg-white/90">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0" onClick={() => setOpen(false)}>
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-var(--ink) text-sm font-extrabold text-var(--accent-ink)">
            K
          </span>
          <span className="text-base font-extrabold tracking-tight text-var(--ink)">KLEIN</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <NavLink to="/" className={linkClass} end>{t('nav.home')}</NavLink>
          <NavLink to="/products" className={linkClass}>{t('nav.shop')}</NavLink>
          {user && <NavLink to="/orders" className={linkClass}>{t('nav.orders')}</NavLink>}
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          <Link
            to="/cart"
            className="relative rounded-full border border-solid border-var(--border) p-2 text-var(--text-muted) transition hover:border-var(--accent) hover:bg-var(--bg)"
            aria-label={t('nav.cart')}
          >
            <span className="text-sm">&#128722;</span>
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-var(--ink) px-1 text-[11px] font-bold text-var(--accent-ink)">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden max-w-32 truncate text-sm text-var(--text-muted) lg:block">
                Hi, {user.name || user.fullName}
              </span>
              <button
                onClick={logout}
                className="rounded-full bg-var(--ink) px-4 py-2 text-sm font-semibold text-var(--accent-ink) transition hover:bg-var(--accent)"
              >
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-full border border-solid border-var(--border) px-4 py-2 text-sm font-semibold text-var(--text) transition hover:bg-var(--bg)"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-var(--ink) px-4 py-2 text-sm font-semibold text-var(--accent-ink) transition hover:bg-var(--accent)"
              >
                {t('nav.register')}
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <Link
            to="/cart"
            className="relative rounded-full border border-solid border-var(--border) p-2 text-var(--text-muted) transition hover:border-var(--accent) hover:bg-var(--bg)"
            aria-label={t('nav.cart')}
          >
            <span className="text-sm">&#128722;</span>
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-var(--ink) px-1 text-[11px] font-bold text-var(--accent-ink)">
                {count}
              </span>
            )}
          </Link>
          <button
            className="rounded-lg border border-solid border-var(--border) px-3 py-2 text-sm font-semibold text-var(--text) transition hover:bg-var(--bg)"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            &#9776;
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-solid border-var(--border) bg-white px-4 py-3 space-y-2 md:hidden" onClick={() => setOpen(false)}>
          <Link to="/" className="block py-2 text-sm font-medium text-var(--ink)">{t('nav.home')}</Link>
          <Link to="/products" className="block py-2 text-sm font-medium text-var(--ink)">{t('nav.shop')}</Link>
          {user && <Link to="/orders" className="block py-2 text-sm font-medium text-var(--ink)">{t('nav.orders')}</Link>}
          {user ? (
            <button onClick={logout} className="block w-full rounded-lg bg-var(--ink) px-4 py-2.5 text-sm font-semibold text-var(--accent-ink)">
              {t('nav.logout')}
            </button>
          ) : (
            <div className="flex gap-2 pt-1">
              <Link to="/login" className="flex-1 rounded-lg border border-solid border-var(--border) px-4 py-2.5 text-center text-sm font-semibold text-var(--text)">
                {t('nav.login')}
              </Link>
              <Link to="/register" className="flex-1 rounded-lg bg-var(--ink) px-4 py-2.5 text-center text-sm font-semibold text-var(--accent-ink)">
                {t('nav.register')}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
