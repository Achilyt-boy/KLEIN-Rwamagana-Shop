import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/authContext'
import { errorMessage } from '../api/client'

export default function Register() {
  const { t } = useTranslation()
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.fullName || !form.email || !form.password) {
      setError(t('auth.required'))
      return
    }
    setBusy(true)
    try {
      await register(form.fullName, form.email, form.password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const field =
    'mt-1.5 w-full rounded-xl border border-solid border-var(--border) px-4 py-2.5 text-sm transition focus:border-var(--accent) focus:outline-none focus:ring-2 focus:ring-var(--accent)/10'

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:py-20">
      <div className="rounded-2xl border border-solid border-var(--border) bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 rounded-full border border-solid border-var(--accent) p-1">
          <span className="block rounded-full bg-var(--accent) px-4 py-1.5 text-xs font-semibold text-var(--accent-ink)">
            {t('auth.registerTitle')}
          </span>
        </div>

        {error && (
          <div className="mb-4 rounded-xl px-4 py-3 text-sm text-var(--ink)">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-var(--ink)">{t('auth.fullName')}</label>
            <input
              type="text"
              autoComplete="name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Ishimwe Vanella"
              className={field}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-var(--ink)">{t('auth.email')}</label>
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className={field}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-var(--ink)">{t('auth.password')}</label>
            <input
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="min. 6 characters"
              className={field}
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-var(--ink) px-4 py-3 text-sm font-bold text-var(--accent-ink) transition hover:bg-var(--accent) disabled:opacity-60"
          >
            {busy ? t('auth.registering') : t('auth.registerButton')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-var(--text-muted)">
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="font-semibold text-var(--ink)">
            {t('nav.login')}
          </Link>
        </p>
      </div>
    </div>
  )
}
