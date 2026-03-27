import { useMemo, useState } from 'react'
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

type TableFilter = 'all' | 'pending' | 'approved' | 'completed'

type RecentVisitsTableProps = {
  title: string
  visits: RecentVisit[]
  onViewQr?: (visitId: string) => void
}

function statusBadgeClass(status: VisitStatus): string {
  switch (status) {
    case 'pending':
      return 'visit-badge visit-badge--pending'
    case 'approved':
      return 'visit-badge visit-badge--approved'
    case 'completed':
      return 'visit-badge visit-badge--completed'
    case 'rejected':
      return 'visit-badge visit-badge--rejected'
    case 'cancelled':
      return 'visit-badge visit-badge--cancelled'
    default:
      return 'visit-badge visit-badge--pending'
  }
}

function statusLabel(status: VisitStatus): string {
  switch (status) {
    case 'pending':
      return 'Pendiente'
    case 'approved':
      return 'Aprobada'
    case 'completed':
      return 'Completada'
    case 'rejected':
      return 'Rechazada'
    case 'cancelled':
      return 'Cancelada'
    default:
      return 'Pendiente'
  }
}

const FILTERS: { id: TableFilter; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'approved', label: 'Aprobadas' },
  { id: 'completed', label: 'Completadas' },
]

export default function RecentVisitsTable({
  title,
  visits,
  onViewQr,
}: RecentVisitsTableProps) {
  const [filter, setFilter] = useState<TableFilter>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return visits.filter((v) => {
      if (filter !== 'all' && v.status !== filter) return false
      if (!q) return true
      const blob = [
        v.visitorName,
        v.visitorPhone,
        v.residentName,
        v.unitLabel,
        statusLabel(v.status),
      ]
        .join(' ')
        .toLowerCase()
      return blob.includes(q)
    })
  }, [visits, filter, search])

  return (
    <section>
      <div className="recent-visits-section-header">
        <h2 className="recent-visits-section-title">{title}</h2>
        <div className="recent-visits-filters">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`recent-visits-filter-btn ${filter === f.id ? 'is-active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="recent-visits-table-wrap">
        <div className="recent-visits-search">
          <span style={{ color: 'var(--muted)', fontSize: 14 }} aria-hidden>
            🔍
          </span>
          <input
            className="recent-visits-search-input"
            type="search"
            placeholder="Filtrar por visitante, residente o estado…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="recent-visits-empty">
            {visits.length === 0
              ? 'No hay visitas recientes.'
              : 'Ninguna visita coincide con el filtro o la búsqueda.'}
          </div>
        ) : (
          <div className="recent-visits-table-scroll">
            <table className="recent-visits-table">
              <thead>
                <tr>
                  <th>Visitante</th>
                  <th>Residente</th>
                  <th>Fecha & Hora</th>
                  <th>Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((visit) => (
                  <tr key={visit.id}>
                    <td>
                      <p className="visitor-name">{visit.visitorName}</p>
                      <p className="visitor-meta">
                        {visit.visitorPhone ? `# ${visit.visitorPhone}` : 'Sin teléfono'}
                      </p>
                    </td>
                    <td>
                      <p className="resident-name">{visit.residentName}</p>
                      <p className="resident-unit">
                        {visit.unitLabel ? `Unidad ${visit.unitLabel}` : 'Sin unidad'}
                      </p>
                    </td>
                    <td>
                      <p className="visit-date-main">{visit.visitDate}</p>
                      <p className="visit-date-time">{visit.visitTime || '—'}</p>
                    </td>
                    <td>
                      <span className={statusBadgeClass(visit.status)}>{statusLabel(visit.status)}</span>
                    </td>
                    <td className="text-right">
                      {visit.showQrAction ? (
                        <button
                          type="button"
                          className="recent-visits-qr-link"
                          onClick={() => onViewQr?.(visit.id)}
                        >
                          Ver QR →
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
