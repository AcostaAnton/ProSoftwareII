export function EntryNotesPanel({
  photoNotes,
  entryNotes,
  onChangePhotoNotes,
  onChangeEntryNotes,
}: {
  photoNotes: string
  entryNotes: string
  onChangePhotoNotes: (value: string) => void
  onChangeEntryNotes: (value: string) => void
}) {
  return (
    <>
      <div>
        <label style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>
          Notas de la Fotografía
        </label>
        <textarea
          value={photoNotes}
          onChange={(e) => onChangePhotoNotes(e.target.value)}
          placeholder="Descripción de la foto (placa, estado...)"
          style={{
            width: '100%',
            padding: '10px',
            marginTop: '5px',
            borderRadius: '8px',
            backgroundColor: '#0f172a',
            color: 'white',
            border: '1px solid #334155',
            minHeight: '70px',
            fontSize: '14px',
          }}
        />
      </div>
      <div>
        <label style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Notas de Entrada</label>
        <textarea
          value={entryNotes}
          onChange={(e) => onChangeEntryNotes(e.target.value)}
          placeholder="Observaciones generales o motivo de rechazo..."
          style={{
            width: '100%',
            padding: '10px',
            marginTop: '5px',
            borderRadius: '8px',
            backgroundColor: '#0f172a',
            color: 'white',
            border: '1px solid #334155',
            minHeight: '70px',
            fontSize: '14px',
          }}
        />
      </div>
    </>
  )
}

