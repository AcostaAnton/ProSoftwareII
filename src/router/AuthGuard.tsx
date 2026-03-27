
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const FORCE_CHANGE_PASSWORD_PATH = '/account/cambiar-contrasena'

const DEV_SKIP_AUTH =
  import.meta.env.DEV && typeof window !== 'undefined' && window.location.search.includes('skipAuth=1')

export default function AuthGuard() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (DEV_SKIP_AUTH) return <Outlet />

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: '3px solid var(--surface2)',
              borderTop: '3px solid var(--accent-cyan)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Cargando...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (user.mustChangePassword === true && location.pathname !== FORCE_CHANGE_PASSWORD_PATH) {
    return <Navigate to={FORCE_CHANGE_PASSWORD_PATH} replace />
  }

  return <Outlet />
}

