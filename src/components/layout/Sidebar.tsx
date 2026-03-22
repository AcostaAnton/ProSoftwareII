import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../types'

// ─── Nav config (solo ítems con rutas existentes; añadir scan/admin cuando existan rutas) ───

type NavItem = { id: string; label: string; icon: string; roles: UserRole[]; path: string }

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠', roles: ['resident', 'admin', 'security'], path: '/dashboard' },
  { id: 'new-visit', label: 'Nueva Visita', icon: '➕', roles: ['resident', 'admin'], path: '/visits/new' },
  { id: 'visit-list', label: 'Lista de Visitas', icon: '📋', roles: ['admin', 'security'], path: '/visits/list' },
  { id: 'admin-users', label: 'Usuarios', icon: '👥', roles: ['admin'], path: '/admin/users' },
  { id: 'admin-guards', label: 'Actividad Guardias', icon: '🔒', roles: ['admin'], path: '/admin/guards' },
]

function avatarStyle(size: number): React.CSSProperties {
  return {
    width: size,
    height: size,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #22d3ee 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 700,
    fontSize: Math.round(size * 0.35),
    flexShrink: 0,
  }
}

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return <div style={avatarStyle(size)}>{initials}</div>
}

export default function Sidebar() {
  const { user, profile, role, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const displayName = profile?.name ?? user?.email ?? 'Usuario'

  const all = role ? NAV_ITEMS.filter((n) => n.roles.includes(role)) : []
const sections =
    role === 'admin'
      ? [
          { title: 'General', ids: ['dashboard', 'new-visit', 'visit-list'] as const },
          { title: 'Administración', ids: ['admin-users', 'admin-guards'] as const },  // ← AGREGADO
        ]
      : [{ title: '', ids: all.map((n) => n.id) }]

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoWrapper}>
        <div style={styles.logoIcon}>P</div>
        <span style={styles.logoText}>PasaYa</span>
      </div>

      <nav style={styles.nav}>
        {sections.map((sec) => (
          <div key={sec.title || 'main'} style={styles.section}>
            {sec.title ? <p style={styles.sectionTitle}>{sec.title}</p> : null}
            {all
              .filter((n) => (sec.ids as string[]).includes(n.id))
              .map((n) => {
                const isActive = location.pathname === n.path || (n.path !== '/dashboard' && location.pathname.startsWith(n.path))
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => navigate(n.path)}
                    style={{
                      ...styles.navButton,
                      ...(isActive ? styles.navButtonActive : {}),
                    }}
                    onMouseOver={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                    }}
                    onMouseOut={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'none'
                    }}
                  >
                    {n.icon} {n.label}
                  </button>
                )
              })}
          </div>
        ))}
      </nav>

      <div style={{ flex: 1, minHeight: 0 }} />

      <div style={styles.userPanel}>
        <div style={styles.userInfo}>
          <Avatar name={displayName} size={32} />
          <div style={styles.userText}>
            <p style={styles.userName}>{displayName}</p>
            <p style={styles.userRole}>
              {role === 'admin' ? 'Admin' : role === 'security' ? 'Guardia' : 'Resident'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          style={styles.logoutButton}
          onMouseOver={(e) => (e.currentTarget.style.color = '#f87171')}
          onMouseOut={(e) => (e.currentTarget.style.color = '#64748b')}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}


// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  sidebar: {
    width: 220,
    height: '100vh',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    flexShrink: 0,
    background: '#0f172a',
    borderRight: '1px solid #1e293b',
    position: 'sticky' as const,
    top: 0,
  },

  logoWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '20px 16px',
    borderBottom: '1px solid #1e293b',
  },

  logoIcon: {
    width: 32,
    height: 32,
    background: '#22d3ee',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#0f172a',
    fontFamily: 'Syne, sans-serif',
    fontSize: 14,
    fontWeight: 900,
  },

  logoText: {
    color: '#fff',
    fontFamily: 'Syne, sans-serif',
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: '-0.02em',
  },

  nav: {
    flex: 1,
    padding: 12,
    overflowY: 'auto' as const,
  },

  section: {
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: '#475569',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    padding: '0 12px',
    margin: '0 0 4px',
  },

  navButton: {
    width: '100%',
    padding: '10px 12px',
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    textAlign: 'left' as const,
    cursor: 'pointer',
    borderRadius: 8,
    fontSize: 14,
    transition: 'color 0.15s, background 0.15s',
  },

  navButtonActive: {
    color: '#fff',
    background: 'rgba(34, 211, 238, 0.15)',
  },

  userPanel: {
    padding: 12,
    borderTop: '1px solid #1e293b',
  },

  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 12px',
    marginBottom: 4,
  },

  userName: {
    margin: 0,
    fontSize: 12,
    fontWeight: 600,
    color: '#fff',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },

  userRole: {
    margin: '2px 0 0',
    fontSize: 11,
    color: '#64748b',
    textTransform: 'capitalize' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },

  userText: {
    minWidth: 0,
    flex: 1,
  },

  logoutButton: {
    width: '100%',
    padding: '8px 12px',
    fontSize: 12,
    color: '#64748b',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left' as const,
    borderRadius: 8,
    transition: 'color 0.15s',
  },
}
