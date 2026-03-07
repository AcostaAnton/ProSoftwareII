// Página de Login — validación: ingresar correo/contraseña, redirigir a dashboard con sidebar + "En construcción"

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginWithEmail } from '../../services/auth.service'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const trimEmail = email.trim()
    if (!trimEmail || !password) {
      setError('Ingresa correo y contraseña.')
      return
    }
    setLoading(true)
    const TIMEOUT_MS = 12000 // 12 segundos
    const loginPromise = LoginWithEmail({ email: trimEmail, password })
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), TIMEOUT_MS)
    )
    try {
      await Promise.race([loginPromise, timeoutPromise])
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err?.message ?? ''
      if (msg === 'TIMEOUT') {
        setError('La conexión tardó demasiado. Revisa tu internet y que .env.local tenga VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY correctos.')
      } else if (msg.includes('Invalid login') || msg.includes('invalid') || msg.includes('credentials')) {
        setError('Credenciales incorrectas. Revisa correo y contraseña.')
      } else if (msg.includes('Email not confirmed')) {
        setError('Confirma tu correo antes de iniciar sesión.')
      } else {
        setError(msg || 'Error al iniciar sesión. Revisa tu conexión.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page" style={styles.wrapper}>
      {/* Blur orbs como en la demo */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <div style={styles.container}>
        {/* Logo y título */}
        <div style={styles.header}>
          <div style={styles.logoBox}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 style={styles.title}>PasaYa</h1>
          <p style={styles.subtitle}>Control de acceso inteligente</p>
        </div>

        {/* Card del formulario */}
        <div style={styles.card}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Correo</label>
              <input
                type="email"
                style={styles.input}
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Contraseña</label>
              <input
                type="password"
                style={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            {error && <div style={styles.error}>{error}</div>}
            <button type="submit" style={styles.btnPrimary} disabled={loading}>
              {loading ? 'Verificando...' : 'Iniciar sesión'}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#020617',
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  orb1: {
    position: 'absolute',
    top: '25%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 400,
    height: 400,
    background: 'rgba(6,182,212,.08)',
    borderRadius: '50%',
    filter: 'blur(60px)',
  },
  orb2: {
    position: 'absolute',
    bottom: '25%',
    left: '33%',
    width: 300,
    height: 300,
    background: 'rgba(99,102,241,.08)',
    borderRadius: '50%',
    filter: 'blur(60px)',
  },
  container: {
    width: '100%',
    maxWidth: 360,
    position: 'relative',
  },
  header: {
    textAlign: 'center',
    marginBottom: 32,
  },
  logoBox: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
    background: '#22d3ee',
    borderRadius: 16,
    marginBottom: 16,
    boxShadow: '0 10px 30px rgba(34,211,238,.3)',
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 32,
    fontWeight: 800,
    color: 'white',
    margin: 0,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: 20,
    padding: 24,
    boxShadow: '0 25px 50px rgba(0,0,0,.5)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 500,
    color: '#94a3b8',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 12,
    padding: '11px 16px',
    color: 'white',
    fontSize: 13,
    outline: 'none',
    transition: 'border .15s',
    boxSizing: 'border-box',
  },
  error: {
    color: '#f87171',
    fontSize: 12,
    marginBottom: 10,
  },
  btnPrimary: {
    width: '100%',
    background: '#22d3ee',
    border: 'none',
    borderRadius: 12,
    padding: '12px 20px',
    color: '#0f172a',
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    transition: 'background .15s',
    fontFamily: "'DM Sans', sans-serif",
  },
  demoSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTop: '1px solid #1e293b',
  },
  demoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
    fontWeight: 500,
  },
  demoBtn: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(30,41,59,.6)',
    border: 'none',
    borderRadius: 10,
    padding: '8px 12px',
    marginBottom: 6,
    transition: 'background .15s',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  demoName: {
    fontSize: 13,
    color: '#cbd5e1',
    fontWeight: 500,
  },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 500,
  },
}
