
import { useState, type CSSProperties, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginWithEmail } from '../../services/auth.service'
import { Button } from '../../components/ui/Button'
import { ThemeToggle } from '../../components/ui/ThemeToggle'

const LOGIN_TIMEOUT_MS = 12_000

function withTimeout<T>(promise: Promise<T>, ms: number, timeoutCode: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(timeoutCode)), ms)
  })
  return Promise.race([
    promise.finally(() => {
      if (timeoutId !== undefined) clearTimeout(timeoutId)
    }),
    timeoutPromise,
  ])
}

function errorMessageFromUnknown(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err && typeof (err as Error).message === 'string') {
    return (err as Error).message
  }
  return ''
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const trimEmail = email.trim()
    if (!trimEmail || !password) {
      setError('Ingresa correo y contraseña.')
      return
    }
    setLoading(true)
    try {
      await withTimeout(loginWithEmail({ email: trimEmail, password }), LOGIN_TIMEOUT_MS, 'TIMEOUT')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = errorMessageFromUnknown(err)
      if (msg === 'TIMEOUT') {
        setError(
          'La conexión tardó demasiado. Revisa tu internet y que .env.local tenga VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY correctos.',
        )
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
      <div style={styles.themeToggleWrap}>
        <ThemeToggle />
      </div>
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.logoBox}>
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#08130f"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 style={styles.title}>PasaYa</h1>
          <p style={styles.subtitle}>Control de acceso inteligente</p>
        </div>

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
            <Button type="submit" variant="primary" size="md" fullWidth disabled={loading} style={styles.btnPrimary}>
              {loading ? 'Verificando...' : 'Iniciar sesión'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--login-page-bg)',
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  themeToggleWrap: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  orb1: {
    position: 'absolute',
    top: '25%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 400,
    height: 400,
    background: 'var(--login-orb1)',
    borderRadius: '50%',
    filter: 'blur(60px)',
  },
  orb2: {
    position: 'absolute',
    bottom: '25%',
    left: '33%',
    width: 300,
    height: 300,
    background: 'var(--login-orb2)',
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
    background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))',
    borderRadius: 16,
    marginBottom: 16,
    boxShadow: '0 10px 30px rgba(0, 229, 200, 0.25)',
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 32,
    fontWeight: 800,
    color: 'var(--text)',
    margin: 0,
  },
  subtitle: {
    color: 'var(--muted)',
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border-bright)',
    borderRadius: 20,
    padding: 24,
    boxShadow: 'var(--login-card-shadow)',
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
    color: 'var(--muted)',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    background: 'var(--surface2)',
    border: '1px solid var(--border-bright)',
    borderRadius: 12,
    padding: '11px 16px',
    color: 'var(--text)',
    fontSize: 13,
    outline: 'none',
    transition: 'border .15s',
    boxSizing: 'border-box',
  },
  error: {
    color: 'var(--accent-rose)',
    fontSize: 12,
    marginBottom: 10,
  },
  btnPrimary: {
    width: '100%',
    border: 'none',
    borderRadius: 12,
    padding: '12px 20px',
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    transition: 'background .15s',
    fontFamily: "'DM Sans', sans-serif",
  },
}

