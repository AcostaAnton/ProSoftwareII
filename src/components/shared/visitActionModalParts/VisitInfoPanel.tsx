import type { Visit } from '../../../types'

export function VisitInfoPanel({ visit }: { visit: Visit }) {
  return (
    <>
      <div>
        <label style={{ color: 'var(--muted)', fontSize: '12px', textTransform: 'uppercase' }}>Visitante</label>
        <p style={{ margin: '4px 0', fontSize: '18px', fontWeight: 'bold' }}>{visit.visitor_name}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={{ color: 'var(--muted)', fontSize: '11px', textTransform: 'uppercase' }}>Asunto</label>
          <p style={{ margin: '2px 0', fontSize: '14px' }}>{visit.visit_purpose || 'No especificado'}</p>
        </div>
        <div>
          <label style={{ color: 'var(--muted)', fontSize: '11px', textTransform: 'uppercase' }}>Fecha/Hora</label>
          <p style={{ margin: '2px 0', fontSize: '14px' }}>
            {visit.visit_date}
            <br />
            {visit.visit_time}
          </p>
        </div>
      </div>
    </>
  )
}

