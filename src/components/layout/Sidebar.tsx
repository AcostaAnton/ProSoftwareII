// src/components/layout/Sidebar.tsx
// Por ahora solo: parte de arriba (logo PasaYa) y parte de abajo (usuario + Cerrar sesión)

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(180deg, #67b8e3 0%, #1e3a5f 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 700,
        fontSize: Math.round(size * 0.35),
        flexShrink: 0,
      }}
    >
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
    <aside
      style={{
        width: 220,
        height: '100vh',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        background: '#1A2130',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Arriba: logo PasaYa */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
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
          }}
        >
          P
        </div>
        <span
          style={{
            color: '#fff',
            fontFamily: 'Syne, sans-serif',
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: '-0.02em',
          }}
        >
          PasaYa
        </span>
      </div>

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
          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 700,
                color: '#fff',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {displayName}
            </p>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: 12,
                color: 'rgba(255,255,255,0.55)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {role === 'admin' ? 'Admin' : role === 'security' ? 'Guardia' : 'Resident'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            display: 'block',
            width: '100%',
            padding: '8px 0',
            fontSize: 12,
            color: 'rgba(255,255,255,0.55)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
