// Página de Login — estructura base (luego conectar formulario y auth)

import { Link } from 'react-router-dom'

export default function LoginPage() {
  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>Iniciar sesión</h1>
        <p style={styles.subtitle}>ESTAMOS EN CONSTRUCCION</p>

        

      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f172a',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    padding: 32,
    background: '#1e293b',
    borderRadius: 12,
    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
  },
  title: {
    margin: 0,
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#f1f5f9',
  },
  subtitle: {
    margin: '8px 0 24px',
    fontSize: 14,
    color: '#94a3b8',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 500,
    color: '#cbd5e1',
  },
  input: {
    padding: '10px 14px',
    fontSize: 16,
    color: '#f1f5f9',
    background: '#334155',
    border: '1px solid #475569',
    borderRadius: 8,
    outline: 'none',
  },
  button: {
    marginTop: 8,
    padding: '12px 20px',
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    background: '#0ea5e9',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
  footer: {
    margin: '24px 0 0',
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  link: {
    color: '#38bdf8',
    fontWeight: 500,
  },
}
