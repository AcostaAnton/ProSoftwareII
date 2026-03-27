import { useLocation } from 'react-router-dom'
import useResponsive from '../../hooks/useResponsive'
import { Button } from '../ui/Button'
import { ThemeToggle } from '../ui/ThemeToggle'
import { NAV_ITEMS } from './navItems'
import { cn } from '../../lib/cn'

function getNavTitle(pathname: string): string {
  if (
    pathname.startsWith('/visits/') &&
    pathname !== '/visits/new' &&
    pathname !== '/visits/list' &&
    pathname !== '/visits/my-visits'
  ) {
    return 'Detalle de visita'
  }
  const sorted = [...NAV_ITEMS].sort((a, b) => b.path.length - a.path.length)
  const item = sorted.find((n) => pathname === n.path || pathname.startsWith(`${n.path}/`))
  return item?.label ?? 'PasaYa'
}

interface TopBarProps {
  toggleSidebar: () => void
}

export default function TopBar({ toggleSidebar }: TopBarProps) {
  const isMobile = useResponsive()
  const location = useLocation()
  const title = getNavTitle(location.pathname)

  return (
    <header className="sticky top-0 z-50 flex h-[60px] shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-4 md:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={toggleSidebar}
          style={{
            fontSize: 18,
            padding: '6px 10px',
            flexShrink: 0,
            minWidth: 44,
            color: 'var(--muted)',
          }}
          aria-label="Abrir o cerrar menú"
        >
          ☰
        </Button>
        <div
          className={cn('min-w-0 flex-1', isMobile ? 'pr-11 text-center' : 'text-left')}
        >
          <div className="font-syne text-[15px] font-bold text-[var(--text)] md:text-base">
            {title}
          </div>
          <div className="text-xs text-[var(--muted)]">Inicio / {title}</div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <ThemeToggle />
      </div>
    </header>
  )
}
