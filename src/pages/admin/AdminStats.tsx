import { useEffect, useState, useMemo } from "react"
import { getAllVisits } from '../../services/visits.service'
import { getProfilesByCommunity } from '../../services/users.service'
import type { Visit, Profile } from '../../types/index'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/ui/Button'
import './AdminStats.css'

function BarChart({ data, height = 150 }: { data: { label: string, value: number, tooltip: string }[], height?: number }) {
  const max = Math.max(...data.map(d => d.value)) || 1
  return (
    <div className="chart-container" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="bar-column">
          <div 
            title={d.tooltip}
            className="bar-fill"
            style={{ 
              height: `${(d.value / max) * 100}%`, 
              backgroundColor: d.value > 0 ? "#22d3ee" : "#334155",
              opacity: d.value > 0 ? 1 : 0.3
            }} 
          />
          <span className="bar-label">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  )
}

function KpiGrid({ items }: { items: { label: string, value: number, icon: string, border: string }[] }) {
  return (
    <div className="kpi-grid">
      {items.map((item, i) => (
        <div key={i} className="kpi-card" style={{ borderColor: item.border }}>
          <div className="kpi-content">
            <div className="kpi-icon">{item.icon}</div>
            <div>
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

function IncidentsLog({ visits }: { visits: Visit[] }) {
  const incidents = visits.filter(v => ['rejected', 'denied'].includes(v.status))

  return (
    <div className="incidents-section">
      <h3 className="section-title incidents-title">⚠️ Registro de Incidentes (Visitas Rechazadas/Denegadas)</h3>
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
                  <td className="text-white">{v.visit_date} {v.visit_time}</td>
                  <td className="text-white">{v.visitor_name}</td>
                  <td className="text-gray">{v.visit_purpose}</td>
                  <td>
                    <span className="status-rejected">{v.status.toUpperCase()}</span>
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
  
  const [startDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])

  const [visitas, setVisitas] = useState<Visit[]>([])
  const [perfiles, setPerfiles] = useState<Record<string, Profile>>({})
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setCargando(true)
        const [visitasData, perfilesData] = await Promise.all([
          getAllVisits(),
          profile?.community_id ? getProfilesByCommunity(profile.community_id) : Promise.resolve([])
        ])
        setVisitas(visitasData || [])
        const pMap: Record<string, Profile> = {}; perfilesData.forEach(p => pMap[p.id] = p);
        setPerfiles(pMap)
      } catch (e) { console.error(e) } finally { setCargando(false) }
    }
    load()
  }, [profile?.community_id])

  const datosFiltrados = useMemo(() => {
    return visitas.filter(v => {
      const fecha = v.visit_date
      return fecha >= startDate && fecha <= endDate
    })
  }, [visitas, startDate, endDate])

  const stats = useMemo(() => {
    const total = datosFiltrados.length
    const completadas = datosFiltrados.filter(v => v.status === 'completed').length
    const rechazadas = datosFiltrados.filter(v => ['rejected', 'denied'].includes(v.status)).length
    const pendientes = datosFiltrados.filter(v => v.status === 'pending').length
    
    const horas = new Array(24).fill(0)
    datosFiltrados.forEach(v => {
      if (v.visit_time) {
        const h = parseInt(v.visit_time.split(':')[0])
        if (!isNaN(h)) horas[h]++
      }
    })
    const horasChart = horas.map((val, h) => ({
      label: h % 3 === 0 ? `${h}h` : '', 
      value: val, 
      tooltip: `${h}:00 - ${val} visitas`
    }))

    const visitasPorResidente: Record<string, number> = {}
    datosFiltrados.forEach(v => {
      const key = v.resident_id || 'Desconocido'
      visitasPorResidente[key] = (visitasPorResidente[key] || 0) + 1
    })
    const topResidentes = Object.entries(visitasPorResidente)
      .map(([id, count]) => {
        const user = perfiles[id]
        return { 
          name: user ? user.name : `Usuario ...${id.slice(0,4)}`, 
          count, 
          role: user?.role === 'admin' ? 'Admin' : 'Residente'
        }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return { total, completadas, rechazadas, pendientes, horasChart, topResidentes }
  }, [datosFiltrados, perfiles])

  const descargarCSV = () => {
    const headers = ['ID,Visitante,Residente,Fecha,Hora,Estado,Motivo']
    const rows = datosFiltrados.map(v => {
      const residente = perfiles[v.resident_id]?.name || v.resident_id
      return `${v.id},"${v.visitor_name}","${residente}",${v.visit_date},${v.visit_time},${v.status},"${v.visit_purpose || ''}"`
    })
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n")
    const link = document.createElement("a")
    link.setAttribute("href", encodeURI(csvContent))
    link.setAttribute("download", `reporte_visitas_${startDate}_${endDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const ResidentesActivos = useMemo(() => Object.values(perfiles).filter(p => p.role === 'resident' && p.status === 'active').length, [perfiles])
  const GuardiasActivos = useMemo(() => Object.values(perfiles).filter(p => (p.role as string) === 'guard' && p.status === 'active').length, [perfiles])

  if (cargando) {
    return <div style={{ padding: 20, color: '#94a3b8' }}>Cargando estadísticas...</div>
  }

  const EstadisticasPrincipales = [
    { label: "Visitas totales", value: stats.total, icon: "📋", border: "#164e63" },
    { label: "Accesos registrados", value: stats.completadas, icon: "✅", border: "#14532d" },
    { label: "Residentes activos", value: ResidentesActivos, icon: "🏠", border: "#593d0b" },
    { label: "Guardias activos", value: GuardiasActivos, icon: "🔒", border: "#594e10" }
  ]

return (
  <main>
    <div className="admin-stats-container">
      <h2 className="admin-stats-title">
        Estadísticas
      </h2>
      <p className="admin-stats-subtitle">
        Resumen de actividad de la comunidad.
      </p>
      <div className="admin-stats-filters">
        <div className="filter-group">
          <label className="filter-label">Hasta</label>
          <input 
            type="date" value={endDate} onChange={e => setEndDate(e.target.value)} 
            className="date-input"
          />
        </div>
        <div className="export-actions">
          <Button variant="primary" size="sm" onClick={descargarCSV} className="export-btn">
            📥 Exportar CSV
          </Button>
        </div>
      </div>

      <KpiGrid items={EstadisticasPrincipales} />

      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Actividad por Hora</h3>
          <BarChart data={stats.horasChart} />
        </div>

        <TopResidentsList residents={stats.topResidentes} />
      </div>

      <IncidentsLog visits={datosFiltrados} />
    </div>
  </main>
  )
}
