import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="footer__legal">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="footer__grid mt-6">
          <div className="footer__col">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-var(--ink) text-sm font-extrabold text-var(--accent-ink)">K</span>
              <span className="font-extrabold tracking-tight text-var(--ink)">KLEIN</span>
            </div>
            <p className="text-sm text-var(--text-muted) mt-3">{t('footer.tagline')}</p>
          </div>

          <div className="footer__col">
            <h4 className="text-sm font-semibold text-var(--ink)">{t('footer.shop')}</h4>
            <ul className="mt-3 space-y-2 text-sm text-var(--text-muted)">
              <li><Link to="/products">{t('products.title')}</Link></li>
              <li><Link to="/cart">{t('cart.title')}</Link></li>
              <li><Link to="/orders">{t('orders.title')}</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4 className="text-sm font-semibold text-var(--ink)">{t('footer.contact')}</h4>
            <ul className="mt-3 space-y-2 text-sm text-var(--text-muted)">
              <li>Rwamagana, Rwanda</li>
              <li>hello@klein.rw</li>
              <li>+250 780 000 000</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-solid border-var(--border) py-4 text-xs text-var(--text-muted)">
          {t('footer.rights', { year })}
        </div>
      </div>
    </footer>
  )
}
