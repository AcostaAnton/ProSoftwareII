import { Button } from '../../ui/Button'
import { filePickLabelStyle } from './styles'

export function EntryPhotoPanel({
  photoPreview,
  onExpandPhoto,
  onOpenCamera,
  onFileChange,
}: {
  photoPreview: string | null
  onExpandPhoto: () => void
  onOpenCamera: () => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div>
      <label style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>
        Fotografía de Ingreso
      </label>
      {photoPreview ? (
        <div
          onClick={onExpandPhoto}
          style={{
            marginTop: '10px',
            marginBottom: '10px',
            textAlign: 'center',
            cursor: 'zoom-in',
            position: 'relative',
          }}
        >
          <img
            src={photoPreview}
            alt="Vista previa"
            style={{
              width: '100%',
              maxHeight: '180px',
              borderRadius: '12px',
              border: '2px solid #334155',
              objectFit: 'cover',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '10px',
            }}
          >
            🔍 Ampliar
          </div>
        </div>
      ) : (
        <div
          style={{
            height: '150px',
            border: '2px dashed #334155',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569',
            marginTop: '10px',
          }}
        >
          Sin foto adjunta
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        <Button
          type="button"
          variant="accent"
          size="sm"
          onClick={onOpenCamera}
          style={{ flex: 1, borderRadius: 8 }}
        >
          📷 Cámara
        </Button>
        <label
          htmlFor="file-upload"
          style={{ ...filePickLabelStyle, flex: 1, textAlign: 'center', padding: '8px', fontSize: '12px' }}
        >
          📂 Archivo
        </label>
        <input id="file-upload" type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />
      </div>
    </div>
  )
}

