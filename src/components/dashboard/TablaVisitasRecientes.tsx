import { Button } from '../ui/Button'


export type EstadoVisualVisita =
  | 'pendiente'
  | 'aprobada'
  | 'completada'
  | 'rechazada'
  | 'cancelada'

export type VisitaReciente = {
  id: string
  nombreVisitante: string
  telefonoVisitante: string
  nombreResidente: string
  unidadResidencia: string
  fechaVisita: string
  horaVisita: string
  estado: EstadoVisualVisita
  mostrarAccionQr?: boolean
}

type PropiedadesTablaVisitasRecientes = {
  titulo: string
  visitas: VisitaReciente[]
  mostrarBotonNuevaVisita?: boolean
  textoBotonNuevaVisita?: string
  onNuevaVisita?: () => void
  onVerQR?: (visitaId: string) => void
}

function obtenerEstiloEstado(estado: EstadoVisualVisita) {
  switch (estado) {
    case 'pendiente':
      return {
        fondo: '#fef3c7',
        colorTexto: '#92400e',
        colorPunto: '#f59e0b',
        etiqueta: 'Pendiente',
      }
    case 'aprobada':
      return {
        fondo: '#dbeafe',
        colorTexto: '#1d4ed8',
        colorPunto: '#3b82f6',
        etiqueta: 'Aprobada',
      }
    case 'completada':
      return {
        fondo: '#d1fae5',
        colorTexto: '#065f46',
        colorPunto: '#10b981',
        etiqueta: 'Completada',
      }
    case 'rechazada':
      return {
        fondo: '#fee2e2',
        colorTexto: '#991b1b',
        colorPunto: '#ef4444',
        etiqueta: 'Rechazada',
      }
    case 'cancelada':
      return {
        fondo: '#fce7f3',
        colorTexto: '#9d174d',
        colorPunto: '#ec4899',
        etiqueta: 'Cancelada',
      }
    default:
      return {
        fondo: '#fef3c7',
        colorTexto: '#92400e',
        colorPunto: '#f59e0b',
        etiqueta: 'Pendiente',
      }
  }
}

// Componente visual que muestra el estado de la visita
function InsigniaEstadoVisita({ estado }: { estado: EstadoVisualVisita }) {
  const estilo = obtenerEstiloEstado(estado)

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 12px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        background: estilo.fondo,
        color: estilo.colorTexto,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: estilo.colorPunto,
          display: 'inline-block',
        }}
      />
      {estilo.etiqueta}
    </span>
  )
}

export default function TablaVisitasRecientes({
  titulo,
  visitas,
  mostrarBotonNuevaVisita = false,
  textoBotonNuevaVisita = '+ Nueva visita',
  onNuevaVisita,
  onVerQR,
}: PropiedadesTablaVisitasRecientes) {
  return (
    <section>
      {/* Encabezado de la sección */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 20,
            fontWeight: 700,
            color: '#ffffff',
            margin: 0,
          }}
        >
          {titulo}
        </h2>

        {/* Botón visible para residente y admin */}
        {mostrarBotonNuevaVisita && (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onNuevaVisita}
            style={{ borderRadius: 16, padding: '14px 28px', fontSize: 14 }}
          >
            {textoBotonNuevaVisita}
          </Button>
        )}
      </div>

      {/* Tabla principal */}
      <div
        style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: 24,
          overflow: 'hidden',
        }}
      >
        {visitas.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              color: '#64748b',
              fontSize: 14,
            }}
          >
            No hay visitas recientes.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['VISITANTE', 'RESIDENTE', 'FECHA', 'ESTADO', ''].map((columna) => (
                  <th
                    key={columna}
                    style={{
                      textAlign: 'left',
                      padding: '14px 22px',
                      fontSize: 12,
                      color: '#64748b',
                      fontWeight: 600,
                      borderBottom: '1px solid #1e293b',
                    }}
                  >
                    {columna}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {visitas.map((visita) => (
                <tr key={visita.id}>
                  <td
                    style={{
                      padding: '16px 22px',
                      borderBottom: '1px solid #1e293b',
                      fontSize: 14,
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: 0,
                          color: '#ffffff',
                          fontWeight: 600,
                        }}
                      >
                        {visita.nombreVisitante}
                      </p>
                      <p
                        style={{
                          margin: '6px 0 0 0',
                          color: '#64748b',
                          fontSize: 12,
                        }}
                      >
                        {visita.telefonoVisitante || 'Sin teléfono'}
                      </p>
                    </div>
                  </td>

                  <td
                    style={{
                      padding: '16px 22px',
                      borderBottom: '1px solid #1e293b',
                      fontSize: 14,
                      color: '#94a3b8',
                    }}
                  >
                    <div>
                      <p style={{ margin: 0 }}>{visita.nombreResidente}</p>
                      <p
                        style={{
                          margin: '6px 0 0 0',
                          color: '#475569',
                          fontSize: 12,
                        }}
                      >
                        {visita.unidadResidencia || 'Sin unidad'}
                      </p>
                    </div>
                  </td>

                  <td
                    style={{
                      padding: '16px 22px',
                      borderBottom: '1px solid #1e293b',
                      fontSize: 14,
                      color: '#94a3b8',
                    }}
                  >
                    <div>
                      <p style={{ margin: 0 }}>{visita.fechaVisita}</p>
                      <p style={{ margin: '6px 0 0 0' }}>{visita.horaVisita}</p>
                    </div>
                  </td>

                  <td
                    style={{
                      padding: '16px 22px',
                      borderBottom: '1px solid #1e293b',
                    }}
                  >
                    <InsigniaEstadoVisita estado={visita.estado} />
                  </td>

                  <td
                    style={{
                      padding: '16px 22px',
                      borderBottom: '1px solid #1e293b',
                    }}
                  >
                    {visita.mostrarAccionQr ? (
                      <Button type="button" variant="link" size="sm" onClick={() => onVerQR?.(visita.id)}>
                        Ver QR →
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}