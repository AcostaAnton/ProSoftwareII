export function SuccessView({ rejected }: { rejected: boolean }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{rejected ? '⛔' : '✅'}</div>
      <h2 style={{ color: rejected ? '#ef4444' : '#10b981', margin: 0, fontSize: '24px' }}>
        {rejected ? 'Acceso Denegado' : '¡Registrado!'}
      </h2>
      <p style={{ color: 'var(--muted)', marginTop: '8px' }}>La operación se guardó correctamente.</p>
    </div>
  )
}

