import { useEffect, useState, useMemo, type ReactNode } from "react"
import { getAllVisits } from '../../services/visits.service'
import { getProfilesByCommunity } from '../../services/users.service'
import type { Visit, Profile } from '../../types/index'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/ui/Button'
import { getVisitStatusLabel } from '../visits/visitStatus.helpers'
import {
  IconKpiVisits,
  IconKpiCompleted,
  IconKpiResidents,
  IconKpiGuards,
  type KpiAccent,
} from './AdminStatsIcons'
import './AdminStats.css'

type KpiItem = {
  label: string
  value: number
  icon: ReactNode
  accent: KpiAccent
}

function KpiGrid({ items }: { items: KpiItem[] }) {
  return (
    <div className="kpi-grid">
      {items.map((item, i) => (
        <div key={i} className={`kpi-card kpi-card--${item.accent}`}>
          <div className="kpi-content">
            <div className={`kpi-icon-wrap kpi-icon-wrap--${item.accent}`} aria-hidden>
              {item.icon}
            </div>
            <div className="kpi-text">
              <p className="kpi-value">{item.value}</p>
              <p className="kpi-label">{item.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function TopResidentsList({ residents }: { residents: { name: string, role: string, count: number }[] }) {
  return (
    <div className="list-card">
      <h3 className="section-title">Residentes con más Visitas</h3>
      {residents.length === 0 ? (
        <p className="empty-state">No hay datos en este periodo.</p>
      ) : (
        <div className="list-container">
          {residents.map((r, i) => (
            <div key={i} className="list-item">
              <div>
                <p className="list-item-name">{r.name}</p>
                <p className="list-item-sub">{r.role}</p>
              </div>
              <div className="list-badge">{r.count}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function compactIncidentWhen(v: Visit): string {
  const { visit_date: rawDate, visit_time: rawTime } = v
  const timePart = rawTime ? rawTime.slice(0, 5) : ''
  try {
    let d: Date
    if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      d = new Date(`${rawDate}T12:00:00`)
    } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(rawDate)) {
      const [a, b, c] = rawDate.split('/').map(Number)
      d = new Date(c, b - 1, a)
    } else {
      d = new Date(rawDate)
    }
    if (Number.isNaN(d.getTime())) {
      return timePart ? `${rawDate} · ${timePart}` : rawDate
    }
    const datePart = d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    return timePart ? `${datePart} · ${timePart}` : datePart
  } catch {
    return timePart ? `${rawDate} · ${timePart}` : rawDate
  }
}

function IncidentsLog({ visits }: { visits: Visit[] }) {
  const incidents = visits.filter(v => ['rejected', 'denied'].includes(v.status))

  return (
    <div className="incidents-section">
      <div className="incidents-header">
        <h3 className="section-title incidents-title-text">Registro de incidentes</h3>
        <p className="incidents-sub">Visitas rechazadas o denegadas</p>
      </div>
      {incidents.length === 0 ? (
        <p className="empty-state">No hay incidentes registrados en este periodo. ¡Buen trabajo!</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Visitante</th>
                <th>Motivo Visita</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {incidents.slice(0, 10).map(v => (
                <tr key={v.id}>
                  <td className="incidents-datetime">{compactIncidentWhen(v)}</td>
                  <td className="text-white">{v.visitor_name}</td>
                  <td className="incidents-purpose">{v.visit_purpose || '—'}</td>
                  <td>
                    <span className="status-rejected">{getVisitStatusLabel(v.status)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function AdminStats() {
  const { profile } = useAuth()
  
  const [startDate, setStartDate] = useState(() => {
    const date = new Date(); date.setDate(date.getDate() - 30); return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])

  const [visits, setVisits] = useState<Visit[]>([])
  const [profiles, setProfiles] = useState<Record<string, Profile>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const [visitsData, profilesData] = await Promise.all([
          getAllVisits(),
          profile?.community_id ? getProfilesByCommunity(profile.community_id) : Promise.resolve([])
        ])
        setVisits(visitsData || [])
        const pMap: Record<string, Profile> = {}; profilesData.forEach(p => pMap[p.id] = p);
        setProfiles(pMap)
      } catch (error) { console.error(error) } finally { setLoading(false) }
    }
    load()
  }, [profile?.community_id])

function parseDMY(dateStr: string) {
  const [day, month, year] = dateStr.split('/')
  return new Date(`${year}-${month}-${day}`)
}

  const filteredData = useMemo(() => {
    return visits.filter(v => {
      const visitDate = parseDMY(v.visit_date)
    const start = new Date(startDate)
    const end = new Date(endDate)

    return visitDate >= start && visitDate <= end
    })
  }, [visits, startDate, endDate])

  const stats = useMemo(() => {
    const total = filteredData.length
    const completed = filteredData.filter(v => v.status === 'completed').length
    const rejected = filteredData.filter(v => ['rejected', 'denied'].includes(v.status)).length
    const pending = filteredData.filter(v => v.status === 'pending').length
    
    const hours = new Array(24).fill(0)
    filteredData.forEach(v => {
      if (v.visit_time) {
        const h = parseInt(v.visit_time.split(':')[0])
        if (!isNaN(h)) hours[h]++
      }
    })
    const hoursChart = hours.map((val, h) => ({
      label: h % 3 === 0 ? `${h}h` : '', 
      value: val, 
      tooltip: `${h}:00 - ${val} visitas`
    }))

    const visitsPerResident: Record<string, number> = {}
    filteredData.forEach(v => {
      const key = v.resident_id || 'Desconocido'
      visitsPerResident[key] = (visitsPerResident[key] || 0) + 1
    })
    const topResidents = Object.entries(visitsPerResident)
      .map(([id, count]) => {
        const user = profiles[id]
        return { 
          name: user ? user.name : `Usuario ...${id.slice(0,4)}`, 
          count, 
          role: user?.role === 'admin' ? 'Admin' : 'Residente'
        }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return { total, completed, rejected, pending, hoursChart, topResidents }
  }, [filteredData, profiles])

  const descargarCSV = () => {
    const headers = ['ID,Visitante,Residente,Fecha,Hora,Estado,Motivo']
    const rows = filteredData.map(v => {
      const resident = profiles[v.resident_id]?.name || v.resident_id
      return `${v.id},"${v.visitor_name}","${resident}",${v.visit_date},${v.visit_time},${v.status},"${v.visit_purpose || ''}"`
    })
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n")
    const link = document.createElement("a")
    link.setAttribute("href", encodeURI(csvContent))
    link.setAttribute("download", `reporte_visitas_${startDate}_${endDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const activeResidents = useMemo(() => Object.values(profiles).filter(p => p.role === 'resident' && p.status === 'active').length, [profiles])
  const activeGuards = useMemo(() => Object.values(profiles).filter(p => (p.role as string) === 'guard' && p.status === 'active').length, [profiles])

  if (loading) {
    return <div style={{ padding: 20, color: 'var(--muted)' }}>Cargando estadísticas...</div>
  }

  const mainStats: KpiItem[] = [
    {
      label: 'Visitas totales',
      value: stats.total,
      icon: <IconKpiVisits />,
      accent: 'cyan',
    },
    {
      label: 'Accesos registrados',
      value: stats.completed,
      icon: <IconKpiCompleted />,
      accent: 'green',
    },
    {
      label: 'Residentes activos',
      value: activeResidents,
      icon: <IconKpiResidents />,
      accent: 'amber',
    },
    {
      label: 'Guardias activos',
      value: activeGuards,
      icon: <IconKpiGuards />,
      accent: 'violet',
    },
  ]

return (
  <main className="admin-stats-main">
    <div className="admin-stats-container admin-stats-minimal">
      <h2 className="admin-stats-title">
        Estadísticas
      </h2>
      <p className="admin-stats-subtitle">
        Resumen de actividad de la comunidad.
      </p>
      <div className="admin-stats-filters">
        <div className="filter-group">
          <label className="filter-label">Desde</label>
          <input 
            type="date" value={startDate} onChange={e => setStartDate(e.target.value)} 
            className="date-input"
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">Hasta</label>
          <input 
            type="date" value={endDate} onChange={e => setEndDate(e.target.value)} 
            className="date-input"
          />
        </div>
        <div className="export-actions">
          <Button
            variant="outline"
            size="sm"
            className="clear-button"
            onClick={() => {
              const today = new Date().toISOString().split('T')[0]
              const date = new Date()
              date.setDate(date.getDate() - 30)
              const defaultStart = date.toISOString().split('T')[0]
              setStartDate(defaultStart)
              setEndDate(today)
            }}
          >
            Limpiar filtros
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={descargarCSV}
            className="export-btn"
            style={{ boxShadow: 'none' }}
          >
            Exportar CSV
          </Button>
        </div>
        
      </div>

      <KpiGrid items={mainStats} />

      <div className="charts-grid">
        <TopResidentsList residents={stats.topResidents} />
        <IncidentsLog visits={filteredData} />
      </div>

    </div>
  </main>
  )
}
