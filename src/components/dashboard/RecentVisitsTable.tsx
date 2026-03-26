import { Button } from '../ui/Button'
import type { VisitStatus } from '../../types'

export type RecentVisit = {
  id: string
  visitorName: string
  visitorPhone: string
  residentName: string
  unitLabel: string
  visitDate: string
  visitTime: string
  status: VisitStatus
  showQrAction?: boolean
}

type RecentVisitsTableProps = {
  title: string
  visits: RecentVisit[]
  showNewVisitButton?: boolean
  newVisitButtonText?: string
  onNewVisit?: () => void
  onViewQr?: (visitId: string) => void
}

function getVisitStatusStyle(status: VisitStatus) {
  switch (status) {
    case 'pending':
      return {
        background: '#fef3c7',
        textColor: '#92400e',
        dotColor: '#f59e0b',
        label: 'Pendiente',
      }
    case 'approved':
      return {
        background: '#dbeafe',
        textColor: '#1d4ed8',
        dotColor: '#3b82f6',
        label: 'Aprobada',
      }
    case 'completed':
      return {
        background: '#d1fae5',
        textColor: '#065f46',
        dotColor: '#10b981',
        label: 'Completada',
      }
    case 'rejected':
      return {
        background: '#fee2e2',
        textColor: '#991b1b',
        dotColor: '#ef4444',
        label: 'Rechazada',
      }
    case 'cancelled':
      return {
        background: '#fce7f3',
        textColor: '#9d174d',
        dotColor: '#ec4899',
        label: 'Cancelada',
      }
    default:
      return {
        background: '#fef3c7',
        textColor: '#92400e',
        dotColor: '#f59e0b',
        label: 'Pendiente',
      }
  }
}

function VisitStatusBadge({ status }: { status: VisitStatus }) {
  const style = getVisitStatusStyle(status)

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
        background: style.background,
        color: style.textColor,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: style.dotColor,
          display: 'inline-block',
        }}
      />
      {style.label}
    </span>
  )
}

export default function RecentVisitsTable({
  title,
  visits,
  showNewVisitButton = false,
  newVisitButtonText = '+ Nueva visita',
  onNewVisit,
  onViewQr,
}: RecentVisitsTableProps) {
  return (
    <section>
      <div
        className="dashboard-section-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
          gap: 12,
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
          {title}
        </h2>

        {showNewVisitButton && (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onNewVisit}
            className="dashboard-nueva-visita-btn"
            style={{ borderRadius: 16, padding: '14px 28px', fontSize: 14 }}
          >
            {newVisitButtonText}
          </Button>
        )}
      </div>

      <div
        className="dashboard-table-scroll"
        style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: 24,
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {visits.length === 0 ? (
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
          <table className="dashboard-visits-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['VISITANTE', 'RESIDENTE', 'FECHA', 'ESTADO', ''].map((columnHeader) => (
                  <th
                    key={columnHeader}
                    style={{
                      textAlign: 'left',
                      padding: '14px 22px',
                      fontSize: 12,
                      color: '#64748b',
                      fontWeight: 600,
                      borderBottom: '1px solid #1e293b',
                    }}
                  >
                    {columnHeader}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {visits.map((visit) => (
                <tr key={visit.id}>
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
                        {visit.visitorName}
                      </p>
                      <p
                        style={{
                          margin: '6px 0 0 0',
                          color: '#64748b',
                          fontSize: 12,
                        }}
                      >
                        {visit.visitorPhone || 'Sin teléfono'}
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
                      <p style={{ margin: 0 }}>{visit.residentName}</p>
                      <p
                        style={{
                          margin: '6px 0 0 0',
                          color: '#475569',
                          fontSize: 12,
                        }}
                      >
                        {visit.unitLabel || 'Sin unidad'}
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
                      <p style={{ margin: 0 }}>{visit.visitDate}</p>
                      <p style={{ margin: '6px 0 0 0' }}>{visit.visitTime}</p>
                    </div>
                  </td>

                  <td
                    style={{
                      padding: '16px 22px',
                      borderBottom: '1px solid #1e293b',
                    }}
                  >
                    <VisitStatusBadge status={visit.status} />
                  </td>

                  <td
                    style={{
                      padding: '16px 22px',
                      borderBottom: '1px solid #1e293b',
                    }}
                  >
                    {visit.showQrAction ? (
                      <Button type="button" variant="link" size="sm" onClick={() => onViewQr?.(visit.id)}>
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
