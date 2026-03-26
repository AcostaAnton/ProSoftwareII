
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types/index'

interface ProtectedRouteProps {
    children: React.ReactNode
    allowedRoles?: UserRole[]
}

const DEV_SKIP_AUTH = import.meta.env.DEV && typeof window !== 'undefined' && window.location.search.includes('skipAuth=1')

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, role, isLoading } = useAuth()

    if (DEV_SKIP_AUTH) return <>{children}</>

    if (isLoading) {
        return (
          <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#020617',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 40, height: 40,
                border: '3px solid #1e293b',
                borderTop: '3px solid #22d3ee',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 16px',
              }} />
              <p style={{ color: '#64748b', fontSize: 13 }}>Cargando...</p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )
    }
    if (!user) return <Navigate to="/login" replace />

    if (allowedRoles && (!role || !allowedRoles.includes(role))) {
        return <Navigate to="/dashboard" replace />
    }
    return <>{children}</>
}
