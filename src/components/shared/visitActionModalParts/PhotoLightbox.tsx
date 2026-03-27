export function PhotoLightbox({
  photoUrl,
  photoNotes,
  onClose,
}: {
  photoUrl: string
  photoNotes: string
  onClose: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Cerrar foto expandida"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px',
        cursor: 'zoom-out',
        width: '100%',
        border: 'none',
        margin: 0,
        textAlign: 'inherit',
      }}
    >
      <img
        src={photoUrl}
        alt="Foto expandida"
        style={{
          maxWidth: '95%',
          maxHeight: '75vh',
          borderRadius: '12px',
          boxShadow: '0 0 30px rgba(0,0,0,0.5)',
          objectFit: 'contain',
        }}
      />
      {photoNotes && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: 'var(--surface2)',
            borderRadius: '10px',
            maxWidth: '90%',
            border: '1px solid #334155',
          }}
        >
          <p
            style={{
              color: 'var(--muted)',
              fontSize: '11px',
              textTransform: 'uppercase',
              marginBottom: '5px',
              letterSpacing: '0.5px',
            }}
          >
            Comentario de la foto
          </p>
          <p style={{ color: 'white', margin: 0, fontSize: '16px' }}>{photoNotes}</p>
        </div>
      )}
      <p style={{ color: 'var(--muted)', marginTop: '15px', fontSize: '14px' }}>
        Toca en cualquier lugar para cerrar
      </p>
    </button>
  )
}

