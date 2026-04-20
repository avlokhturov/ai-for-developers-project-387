import { Outlet, Link } from 'react-router-dom'
import { useI18n } from '@/lib/i18n'
import LanguageSwitcher from './LanguageSwitcher'

export default function Layout() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold">
            {t.app.title}
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <nav>
              <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">
                {t.app.admin}
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
