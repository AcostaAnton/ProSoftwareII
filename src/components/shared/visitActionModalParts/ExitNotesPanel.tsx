export function ExitNotesPanel({
  exitNotes,
  onChangeExitNotes,
}: {
  exitNotes: string
  onChangeExitNotes: (value: string) => void
}) {
  return (
    <div>
      <label style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Notas de Salida</label>
      <textarea
        value={exitNotes}
        onChange={(e) => onChangeExitNotes(e.target.value)}
        placeholder="Comentarios sobre la salida..."
        style={{
          width: '100%',
          padding: '10px',
          marginTop: '5px',
          borderRadius: '8px',
          backgroundColor: '#0f172a',
          color: 'white',
          border: '1px solid #334155',
          minHeight: '120px',
          fontSize: '14px',
        }}
      />
    </div>
  )
}

