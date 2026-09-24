import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/authContext'
import { errorMessage } from '../api/client'

export default function Login() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const from = location.state?.from || '/'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError(t('auth.required'))
      return
    }
    setBusy(true)
    try {
      await login(form.email, form.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:py-20">
      <div className="rounded-2xl border border-solid border-var(--border) bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 rounded-full border border-solid border-var(--accent) p-1">
          <span className="block rounded-full bg-var(--accent) px-4 py-1.5 text-xs font-semibold text-var(--accent-ink)">
            {t('auth.loginTitle')}
          </span>
        </div>

        {error && (
          <div className="mb-4 rounded-xl px-4 py-3 text-sm text-var(--ink)">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-var(--ink)">
              {t('auth.email')}
            </label>
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-solid border-var(--border) px-4 py-2.5 text-sm transition focus:border-var(--accent) focus:outline-none focus:ring-2 focus:ring-var(--accent)/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-var(--ink)">
              {t('auth.password')}
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full rounded-xl border border-solid border-var(--border) px-4 py-2.5 text-sm transition focus:border-var(--accent) focus:outline-none focus:ring-2 focus:ring-var(--accent)/10"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-var(--ink) px-4 py-3 text-sm font-bold text-var(--accent-ink) transition hover:bg-var(--accent) disabled:opacity-60"
          >
            {busy ? t('auth.loggingIn') : t('auth.loginButton')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-var(--text-muted)">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="font-semibold text-var(--ink)">
            {t('nav.register')}
          </Link>
        </p>
      </div>
    </div>
  )
}
