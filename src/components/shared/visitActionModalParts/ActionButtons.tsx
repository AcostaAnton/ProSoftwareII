import { Button } from '../../ui/Button'

export function ActionButtons({
  isEntry,
  isExit,
  loading,
  onClose,
  onDeny,
  onAllow,
  onExit,
}: {
  isEntry: boolean
  isExit: boolean
  loading: boolean
  onClose: () => void
  onDeny: () => void
  onAllow: () => void
  onExit: () => void
}) {
  return (
    <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '10px' }}>
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={onClose}
        style={{ flex: 1, borderRadius: 8, borderColor: '#334155', color: 'white' }}
      >
        Cancelar
      </Button>

      {isEntry ? (
        <>
          <Button
            type="button"
            variant="danger"
            size="lg"
            onClick={onDeny}
            disabled={loading}
            style={{ flex: 1, borderRadius: 8, background: '#7f1d1d', border: '1px solid #991b1b' }}
          >
            {loading ? '...' : 'Denegar'}
          </Button>
          <Button
            type="button"
            variant="success"
            size="lg"
            onClick={onAllow}
            disabled={loading}
            style={{ flex: 2, borderRadius: 8, background: '#10b981' }}
          >
            {loading ? '...' : 'Permitir'}
          </Button>
        </>
      ) : (
        <Button
          type="button"
          variant="success"
          size="lg"
          onClick={onExit}
          disabled={loading || !isExit}
          style={{ flex: 2, borderRadius: 8, background: '#10b981' }}
        >
          {loading ? '...' : isExit ? 'Registrar Salida' : 'Acción'}
        </Button>
      )}
    </div>
  )
}

