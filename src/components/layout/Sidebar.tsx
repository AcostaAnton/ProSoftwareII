import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'


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

// ─── Components ───────────────────────────────────────────────────────────────

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div style={avatarStyle(size)}>
      {initials}
    </div>
  )
}

export default function Sidebar() {
  const { user, profile, role, logout } = useAuth()
  const navigate = useNavigate()
  const displayName = profile?.name ?? user?.email ?? 'Usuario'

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <aside style={styles.sidebar}>

      {/* Logo PasaYa */}
      <div style={styles.logoWrapper}>
        <div style={styles.logoIcon}>P</div>
        <span style={styles.logoText}>PasaYa</span>
      </div>

      <div style={styles.spacer} />

      {/* Usuario + Cerrar sesión */}
      <div style={styles.userPanel}>
        <div style={styles.userInfo}>
      {/* Navegación */}
      <nav style={{ padding: '16px' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ marginBottom: 8 }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'none',
                border: 'none',
                color: '#fff',
                textAlign: 'left',
                cursor: 'pointer',
                borderRadius: 4,
                fontSize: 14,
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
            >
              Dashboard
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate('/visits/new')}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'none',
                border: 'none',
                color: '#fff',
                textAlign: 'left',
                cursor: 'pointer',
                borderRadius: 4,
                fontSize: 14,
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
            >
              Nueva Visita
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate('/visits/list')}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'none',
                border: 'none',
                color: '#fff',
                textAlign: 'left',
                cursor: 'pointer',
                borderRadius: 4,
                fontSize: 14,
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
            >
              Lista de Visitas
            </button>
          </li>
        </ul>
      </nav>

      {/* Espacio flexible para que el bloque de abajo quede al fondo */}
      <div style={{ flex: 1, minHeight: 0 }} />

      {/* Abajo: usuario + Cerrar sesión */}
      <div
        style={{
          marginTop: 'auto',
          padding: 16,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: '#1A2130',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 14,
          }}
        >
          <Avatar name={displayName} size={40} />
          <div style={styles.userText}>
            <p style={styles.userName}>{displayName}</p>
            <p style={styles.userRole}>
              {role === 'admin' ? 'Admin' : role === 'security' ? 'Guardia' : 'Resident'}
            </p>
          </div>
        </div>
        <button type="button" onClick={handleLogout} style={styles.logoutButton}>
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
    background: '#1A2130',
    borderRight: '1px solid rgba(255,255,255,0.06)',
  },

  logoWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '20px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },

  logoIcon: {
    width: 32,
    height: 32,
    background: '#22d3ee',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
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

  spacer: {
    flex: 1,
    minHeight: 0,
  },

  userPanel: {
    marginTop: 'auto',
    padding: 16,
    borderTop: '1px solid rgba(255,255,255,0.08)',
    background: '#1A2130',
  },

  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },

  userName: {
    margin: 0,
    fontSize: 14,
    fontWeight: 700,
    color: '#fff',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },

  userRole: {
    margin: '2px 0 0',
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },

  userText: {
    minWidth: 0,
    flex: 1,
  },

  logoutButton: {
    display: 'block',
    width: '100%',
    padding: '8px 0',
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left' as const,
  },
}
