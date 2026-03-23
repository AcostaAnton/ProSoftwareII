import { useEffect, useState, useMemo } from "react"
import { getAllVisits } from '../../services/visits.service'
import { getProfilesByCommunity } from '../../services/users.service'
import type { Visit, Profile } from '../../types/index'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/ui/Button'

// --- Componentes Visuales ---

function StatCard({ label, value, subtext, color }: { label: string, value: string | number, subtext?: string, color: string }) {
  return (
    <div style={{ background: "#1e293b", border: `1px solid ${color}40`, borderRadius: "16px", padding: "20px" }}>
      <p style={{ color: "#94a3b8", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
        {label}
      </p>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <span style={{ fontSize: "32px", fontWeight: 800, color: "white", lineHeight: 1 }}>{value}</span>
        {subtext && <span style={{ fontSize: "13px", color: color }}>{subtext}</span>}
      </div>
    </div>
  )
}

function BarChart({ data, height = 150 }: { data: { label: string, value: number, tooltip: string }[], height?: number }) {
  const max = Math.max(...data.map(d => d.value)) || 1
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height, paddingTop: 20 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" } as any}>
          <div 
            title={d.tooltip}
            style={{ 
              width: "80%", 
              height: `${(d.value / max) * 100}%`, 
              backgroundColor: d.value > 0 ? "#22d3ee" : "#334155",
              opacity: d.value > 0 ? 1 : 0.3,
              borderRadius: "4px 4px 0 0",
              transition: "height 0.3s ease",
              minHeight: 4
            }} 
          />
          <span style={{ fontSize: "10px", color: "#64748b", marginTop: "6px" }}>
            {d.label}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function AdminStats() {
  const { profile } = useAuth()
  
  // Filtros de fecha (por defecto últimos 30 días)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])

  const [visitas, setVisitas] = useState<Visit[]>([])
  const [perfiles, setPerfiles] = useState<Record<string, Profile>>({})
  const [cargando, setCargando] = useState(true)

  // Carga de datos inicial
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

  // --- Lógica de Negocio ---

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
    
    // Horas Pico
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

    // Top Residentes
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

  // --- Exportar CSV ---
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
<<<<<<< Updated upstream
  ConseguirVisitas()
}, [])
const Colores = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#a855f7"]
const Agrupacion = groupVisitsByResident(Visitas)
const Ordenacion = [...Agrupacion].sort((a, b) => b.count - a.count)
const TopResidentes = Ordenacion.slice(0, 5)
const VisitasTop1 = TopResidentes[0]?.count || 1
if (Cargando) {
return (
  <div style={{ paddingTop: 8 }}>
    <p style={{ color: "#94a3b8", fontSize: 14 }}>
      Cargando estadísticas...
    </p>
  </div>
)}
  const EstadisticasPrincipales = [
  { label: "Visitas totales", value: VisitasTotales, icon: "📋", border: "#164e63" },
  { label: "Accesos registrados", value: VisitasCompletadas, icon: "✅", border: "#14532d" },
  { label: "Residentes activos", value: ResidentesActivos, icon: "🏠", border: "#593d0b" },
  { label: "Guardias activos", value: GuardiasActivos, icon: "🔒", border: "#594e10" }
]
return (
  <main>
    <div style={{ maxWidth: "900px" }}>
      <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "22px", fontWeight: 800, color: "white", marginTop: "6px", marginBottom: "4px" }}>
        Estadísticas
      </h2>
      <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "24px" }}>
        Resumen de actividad de la comunidad.
      </p>
      <div className="admin-stats-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "24px" }}>
        {EstadisticasPrincipales.map((item, i) => (
          <div key={i} style={{ background: "#1E293B", border: `2px solid ${item.border}`, borderRadius: "16px", padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ fontSize: "40px" }}>{item.icon}</div>
            <p style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "28px",
              fontWeight: 900,
              color: "white",
              margin: 0
            }}>
            {item.value}
            </p>
            <p style={{
              fontSize: "15px",
              color: "#94a3b8",
              margin: 5
            }}>
            {item.label}
            </p>
=======

  if (cargando) return <div style={{ padding: 40, color: '#94a3b8' }}>Cargando inteligencia de negocio...</div>

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Header y Filtros */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
        <div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "24px", fontWeight: 800, color: "white", marginBottom: "4px" }}>
            Analítica e Informes
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>
            Métricas de seguridad y control de acceso.
          </p>
        </div>
        
        <div style={{ background: '#1e293b', padding: 16, borderRadius: 12, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'end', border: '1px solid #334155' }}>
          <div style={{ flex: 1, minWidth: 150 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>Desde</label>
            <input 
              type="date" value={startDate} onChange={e => setStartDate(e.target.value)} 
              style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: 'white', padding: '8px', borderRadius: 6 }} 
            />
>>>>>>> Stashed changes
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>Hasta</label>
            <input 
              type="date" value={endDate} onChange={e => setEndDate(e.target.value)} 
              style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: 'white', padding: '8px', borderRadius: 6 }} 
            />
          </div>
          <Button variant="primary" size="sm" onClick={descargarCSV} style={{ height: 38 }}>
            📥 Exportar CSV
          </Button>
        </div>
      </div>
<<<<<<< Updated upstream
      <div className="admin-stats-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <div style={{ background: "#1E293B", borderRadius: "16px", padding: "16px" }}>
          <div className="card">
            <h3 style={{ fontFamily: "Syne, sans-serif", color: "white", marginTop: "1px", marginBottom: "20px", fontSize: "17px" }}>
              Visitas por estado
            </h3>
            {Estado.map((item) => {
              const Porcentaje = Total > 0 ? Math.round((item.value / Total) * 100) : 0
              const Diseño = DiseñoEstado[item.label]
              return (
                <BarraEstados
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  percent={Porcentaje}
                  color={Diseño.color}
                  bg={Diseño.bg}
                  textColor={Diseño.textColor}
                />
              )
            })}
          </div>
=======

      {/* Tarjetas KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <StatCard label="Total Visitas" value={stats.total} color="#3b82f6" />
        <StatCard label="Exitosas" value={stats.completadas} subtext="Entradas" color="#22c55e" />
        <StatCard label="Rechazadas" value={stats.rechazadas} subtext="Incidentes" color="#ef4444" />
        <StatCard label="Pendientes" value={stats.pendientes} color="#f59e0b" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
        
        {/* Gráfico de Horas Pico */}
        <div style={{ background: "#0f172a", borderRadius: "16px", padding: "24px", border: "1px solid #1e293b" }}>
          <h3 style={{ color: "white", fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>Horas Pico de Ingreso</h3>
          <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "20px" }}>Distribución de visitas por hora del día</p>
          <BarChart data={stats.horasChart} />
>>>>>>> Stashed changes
        </div>

        {/* Top Residentes */}
        <div style={{ background: "#0f172a", borderRadius: "16px", padding: "24px", border: "1px solid #1e293b" }}>
          <h3 style={{ color: "white", fontSize: "16px", fontWeight: 700, marginBottom: "20px" }}>Residentes con más Visitas</h3>
          {stats.topResidentes.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: "13px" }}>No hay datos en este periodo.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {stats.topResidentes.map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: '1px solid #1e293b' }}>
                  <div>
                    <p style={{ color: "white", fontSize: "14px", margin: 0 }}>{r.name}</p>
                    <p style={{ color: "#64748b", fontSize: "12px", margin: 0 }}>{r.role}</p>
                  </div>
                  <div style={{ background: "#1e293b", padding: "4px 10px", borderRadius: "20px", color: "#22d3ee", fontWeight: 700, fontSize: "13px" }}>
                    {r.count}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Tabla de Incidentes Recientes (Rechazadas) */}
      <div style={{ marginTop: 24, background: "#0f172a", borderRadius: "16px", padding: "24px", border: "1px solid #1e293b" }}>
        <h3 style={{ color: "#ef4444", fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>⚠️ Registro de Incidentes (Visitas Rechazadas/Denegadas)</h3>
        {datosFiltrados.filter(v => ['rejected', 'denied'].includes(v.status)).length === 0 ? (
          <p style={{ color: "#64748b", fontSize: "13px" }}>No hay incidentes registrados en este periodo. ¡Buen trabajo!</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#94a3b8' }}>Fecha</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#94a3b8' }}>Visitante</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#94a3b8' }}>Motivo Visita</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#94a3b8' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {datosFiltrados.filter(v => ['rejected', 'denied'].includes(v.status)).slice(0, 10).map(v => (
                  <tr key={v.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '12px', color: 'white' }}>{v.visit_date} {v.visit_time}</td>
                    <td style={{ padding: '12px', color: 'white' }}>{v.visitor_name}</td>
                    <td style={{ padding: '12px', color: '#cbd5e1' }}>{v.visit_purpose}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: '#450a0a', color: '#fca5a5', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
                        {v.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
