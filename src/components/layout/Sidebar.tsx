import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Avatar } from '../ui/Avatar'
import type { UserRole } from '../../types'
import { useCountUp } from '../../hooks/useCountUp'
import useResponsive from '../../hooks/useResponsive'
import { cn } from '../../lib/cn'
import { guardsService } from '../../services/guards.service'
import { getVisitsPaginated } from '../../services/visits.service'
import { getProfilesByCommunity } from '../../services/users.service'
import { NAV_ITEMS } from './navItems'

const ROLE_LABEL_SIDEBAR: Record<UserRole, string> = {
  admin: 'admin',
  resident: 'residente',
  security: 'guardia',
}

function sidebarRoleLabel(role: UserRole | null | undefined): string {
  if (role == null) return 'Usuario'
  return ROLE_LABEL_SIDEBAR[role]
}

function isNavItemActive(pathname: string, itemPath: string): boolean {
  if (pathname === itemPath) return true
  if (itemPath === '/dashboard') return false
  return pathname.startsWith(itemPath)
}

type AdminNavCounts = {
  users: number | null
  guards: number | null
  visits: number | null
}

function adminNavCountForId(id: string, counts: AdminNavCounts): number | null {
  if (id === 'admin-users') return counts.users
  if (id === 'admin-guards') return counts.guards
  if (id === 'admin-stats') return counts.visits
  return null
}

function SidebarNavCount({ value, isActive }: { value: number; isActive: boolean }) {
  const display = useCountUp(value)
  return (
    <span className={cn('sidebar-nav-count', isActive && 'sidebar-nav-count--active')}>{display}</span>
  )
}

interface SidebarProps {
  isOpen: boolean
  toggle: () => void
}

export default function Sidebar({ isOpen, toggle }: SidebarProps) {
  const { user, profile, role, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const displayName = profile?.name ?? user?.email ?? 'Usuario'
  const isMobile = useResponsive()

  const [adminCounts, setAdminCounts] = useState<AdminNavCounts>({
    users: null,
    guards: null,
    visits: null,
  })

  useEffect(() => {
    if (role !== 'admin' || !profile?.community_id) {
      setAdminCounts({ users: null, guards: null, visits: null })
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const [profiles, guardStats, paginated] = await Promise.all([
          getProfilesByCommunity(profile.community_id),
          guardsService.getStats(),
          getVisitsPaginated(1, 1, {}),
        ])
        if (cancelled) return
        setAdminCounts({
          users: profiles.length,
          guards: guardStats.total_guards,
          visits: paginated.count,
        })
      } catch {
        if (!cancelled) {
          setAdminCounts({ users: 0, guards: 0, visits: 0 })
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [role, profile?.community_id])

  const all = role ? NAV_ITEMS.filter((n) => n.roles.includes(role)) : []
  const sections =
    role === 'admin'
      ? [
          { title: 'General', ids: ['dashboard', 'new-visit', 'visit-list', 'scan'] as const },
          { title: 'Administración', ids: ['admin-users', 'admin-guards', 'admin-stats'] as const },
        ]
      : [{ title: '', ids: all.map((n) => n.id) }]

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const left = isOpen ? 'left-0' : isMobile ? '-left-full' : '-left-[240px]'

  /* Mismo escalonado que .dashboard-stats-grid .dashboard-kpi-card: 0.05s, 0.1s, 0.15s… */
  let navAnimIndex = 0
  const nextNavDelay = () => `${(++navAnimIndex) * 0.05}s`

  return (
    <>
      {isMobile && isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[999] cursor-pointer border-0 bg-black/60 backdrop-blur-[2px] font-inherit"
          aria-label="Cerrar menú de navegación"
          onClick={toggle}
        />
      )}
      <aside
        className={cn(
          'fixed top-0 z-[1000] flex h-screen w-[var(--sidebar-w)] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-[left] duration-300 ease-in-out md:shadow-none',
          left,
          isMobile && 'shadow-[4px_0_24px_rgba(0,0,0,0.5)]',
        )}
      >
        <div className="animate-[fadeUp_0.4s_ease_both] mb-2 flex items-center gap-2.5 border-b border-[var(--border)] px-5 pb-5 pt-6">
          <div className="font-syne flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-violet)] text-sm font-extrabold tracking-tight text-white">
            PY
          </div>
          <span className="font-syne bg-gradient-to-r from-[var(--text)] to-[var(--muted)] bg-clip-text text-lg font-extrabold tracking-tight text-transparent">
            PasaYa
          </span>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-3">
          {sections.map((sec) => (
            <div key={sec.title || 'main'} className="py-3 pb-1">
              {sec.title ? (
                <p
                  className="sidebar-nav-animate sidebar-section-title mb-2 px-2 uppercase"
                  style={{ animationDelay: nextNavDelay() }}
                >
                  {sec.title}
                </p>
              ) : null}
              {all
                .filter((n) => (sec.ids as string[]).includes(n.id))
                .map((n) => {
                  const isActive = isNavItemActive(location.pathname, n.path)
                  const count = adminNavCountForId(n.id, adminCounts)
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        navigate(n.path)
                        if (isMobile) toggle()
                      }}
                      style={{ animationDelay: nextNavDelay() }}
                      className={cn(
                        'sidebar-nav-animate mb-0.5 flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] border border-transparent px-3 py-2 text-left text-[13.5px] transition-all duration-150 ease-out',
                        isActive
                          ? 'border-[rgba(0,229,200,0.15)] bg-gradient-to-br from-[rgba(0,229,200,0.12)] to-[rgba(139,92,246,0.08)] font-medium text-[var(--accent-cyan)]'
                          : 'font-normal text-[var(--muted)] hover:bg-[var(--surface2)] hover:text-[var(--text)]',
                      )}
                    >
                      <span className="w-[18px] shrink-0 text-center text-[15px]" aria-hidden>
                        {n.icon}
                      </span>
                      <span className="min-w-0 flex-1">{n.label}</span>
                      {count !== null ? (
                        <SidebarNavCount value={count} isActive={isActive} />
                      ) : null}
                    </button>
                  )
                })}
            </div>
          ))}
        </nav>

        <div className="min-h-0 shrink-0" />

        <div className="mt-auto border-t border-[var(--border)] px-3 pb-4 pt-4">
          <div className="mb-1 flex cursor-default items-center gap-2.5 rounded-xl bg-[var(--surface2)] p-2.5 transition-colors hover:bg-[var(--surface3)]">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <Avatar name={displayName} size={34} />
              <div className="min-w-0 flex-1">
                <p className="m-0 truncate text-[13px] font-medium text-[var(--text)]">{displayName}</p>
                <p className="mt-0.5 flex items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-normal lowercase text-[var(--accent-cyan)]">
                  <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[var(--accent-cyan)]" aria-hidden />
                  {sidebarRoleLabel(role)}
                </p>
              </div>
            </div>
            <span className="shrink-0 text-sm text-[var(--muted)]" aria-hidden>
              ⋯
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2.5 w-full cursor-pointer border-0 bg-transparent p-1 text-center text-[11px] text-[var(--muted)] transition-colors hover:text-[var(--accent-rose)]"
          >
            ← Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
