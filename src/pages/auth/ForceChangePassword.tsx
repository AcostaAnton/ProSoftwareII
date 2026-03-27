
import { useEffect, useState, type CSSProperties, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'

const MIN_LEN = 8

export default function ForceChangePasswordPage() {
  const navigate = useNavigate()
  const { user, syncAuthFromSession } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && user.mustChangePassword !== true) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    if (password.length < MIN_LEN) {
      setError(`La contraseña debe tener al menos ${MIN_LEN} caracteres.`)
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setLoading(true)
    try {
      const { error: upErr } = await supabase.auth.updateUser({
        password,
        data: { must_change_password: false },
      })
      if (upErr) throw upErr
      await syncAuthFromSession()
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as Error).message) : ''
      setError(msg || 'No se pudo actualizar la contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.logoBox}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#08130f" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 style={styles.title}>Nueva contraseña</h1>
          <p style={styles.subtitle}>
            Tu cuenta fue creada con una contraseña temporal. Elige una contraseña nueva para continuar.
          </p>
        </div>
        <div style={styles.card}>
          <form style={styles.form} onSubmit={handleSubmit}>
            {error ? <div style={styles.error}>{error}</div> : null}
            <div style={styles.field}>
              <label style={styles.label} htmlFor="new-password">
                Contraseña nueva
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="confirm-password">
                Confirmar contraseña
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(ev) => setConfirm(ev.target.value)}
                style={styles.input}
              />
            </div>
            <Button type="submit" variant="primary" fullWidth disabled={loading} style={styles.btnPrimary}>
              {loading ? 'Guardando…' : 'Guardar y continuar'}
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
    background: 'var(--bg)',
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
    background: 'rgba(0, 229, 200, 0.08)',
    borderRadius: '50%',
    filter: 'blur(60px)',
  },
  orb2: {
    position: 'absolute',
    bottom: '25%',
    left: '33%',
    width: 300,
    height: 300,
    background: 'rgba(139, 92, 246, 0.08)',
    borderRadius: '50%',
    filter: 'blur(60px)',
  },
  container: {
    width: '100%',
    maxWidth: 400,
    position: 'relative',
  },
  header: {
    textAlign: 'center',
    marginBottom: 28,
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
    fontSize: 28,
    fontWeight: 800,
    color: 'var(--text)',
    margin: 0,
  },
  subtitle: {
    color: 'var(--muted)',
    fontSize: 14,
    marginTop: 10,
    lineHeight: 1.5,
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border-bright)',
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
    marginTop: 8,
    border: 'none',
    borderRadius: 12,
    padding: '12px 20px',
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
}

