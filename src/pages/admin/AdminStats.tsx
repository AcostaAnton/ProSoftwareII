import { useEffect, useState } from "react"
import { getAllVisits } from '../../services/visits.service'
import { getVisitsByStatus } from '../../services/visits.service'
import { getProfilesByStatus } from '../../services/users.service'
import { groupVisitsByResident } from '../../services/visits.service'
import type { Visit } from '../../types/index'
const [
  Todas,
  Pendientes,
  Aprobadas,
  Completadas,
  Rechazadas,
  Canceladas,
  Residentes,
  Guardias
] = await Promise.all([
  getAllVisits(),
  getVisitsByStatus('pending'),
  getVisitsByStatus('approved'),
  getVisitsByStatus('completed'),
  getVisitsByStatus('rejected'),
  getVisitsByStatus('cancelled'),
  getProfilesByStatus('active', 'resident'),
  getProfilesByStatus('active', 'security')
])
const VisitasTotales = Todas.length
const VisitasPendientes = Pendientes.length
const VisitasAprobadas = Aprobadas.length
const VisitasCompletadas = Completadas.length
const VisitasRechazadas = Rechazadas.length
const VisitasCanceladas = Canceladas.length
const ResidentesActivos = Residentes.length
const GuardiasActivos = Guardias.length
type StatusLabel =
  | "Pendiente"
  | "Aprobado"
  | "Completado"
  | "Rechazado"
  | "Cancelado"
type StatusItem = {
  label: StatusLabel
  value: number
}
const Estado: StatusItem[] = [
  { label: "Pendiente", value: VisitasPendientes },
  { label: "Aprobado", value: VisitasAprobadas },
  { label: "Completado", value: VisitasCompletadas },
  { label: "Rechazado", value: VisitasRechazadas },
  { label: "Cancelado", value: VisitasCanceladas }
]
type StatusConfig = {
  color: string
  bg: string
  textColor: string
}
type StatusConfigMap = Record<StatusItem["label"], StatusConfig>
const DiseñoEstado: StatusConfigMap = {
  Pendiente: { color: "#f59e0b", bg: "#fef3c7", textColor: "#92400e" },
  Aprobado: { color: "#2297c5", bg: "#dcf0fc", textColor: "#164565" },
  Completado: { color: "#22c55e", bg: "#dcfce7", textColor: "#166534" },
  Rechazado: { color: "#ef4444", bg: "#fee2e2", textColor: "#991b1b" },
  Cancelado: { color: "#6a6a6a", bg: "#ebebeb", textColor: "#303030" }
}
const Total = Estado.reduce((sum, item) => sum + item.value, 0)
const Estilos = {
  container: { marginBottom: "12px" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: "8px" },
  badge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 8px",
    borderRadius: "20px",
    fontSize: "14px"
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    display: "inline-block"
  },
  value: { color: "white", fontWeight: 700, fontSize: "13px" },
  percent: { color: "#64748b", fontWeight: 400, fontSize: "11px" },
  barBg: { height: "6px", background: "#415068", borderRadius: "3px", overflow: "hidden" },
  bar: { height: "100%", borderRadius: "3px" }
}
type StatusBarProps = {
  label: string
  value: number
  percent: number
  color: string
  bg: string
  textColor: string
}
function BarraEstados({ label, value, percent, color, bg, textColor }: StatusBarProps) {
  return (
    <div style={Estilos.container}>
      <div style={Estilos.header}>
        <span
          className="badge"
          style={{ ...Estilos.badge, background: bg, color: textColor }}
        >
          <span style={{ ...Estilos.dot, background: color }}></span>
          {label}
        </span>
        <span style={Estilos.value}>
          {value}{" "}
          <span style={Estilos.percent}>({percent}%)</span>
        </span>
      </div>
      <div style={Estilos.barBg}>
        <div
          style={{
            ...Estilos.bar,
            width: `${percent}%`,
            background: color
          }}
        ></div>
      </div>
    </div>
  )
}
export default function PaginaEstadisticas() {
const [Visitas, ObtencionVisitas] = useState<Visit[]>([])
const [Cargando, ProcesoCarga] = useState(true)
useEffect(() => {
  async function ConseguirVisitas() {
    try {
      ProcesoCarga(true)
      const Data = await getAllVisits()
      ObtencionVisitas(Data)
    } catch (Error) {
      console.error(Error)
    } finally {
      ProcesoCarga(false)
    }
  }
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
          </div>
          </div>
        ))}
      </div>
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
        </div>
        <div style={{ background: "#1E293B", borderRadius: "16px", padding: "20px" }}>
          <div className="card">
            <h3 style={{ fontFamily: "Syne, sans-serif", color: "white", marginTop: "1px", marginBottom: "20px", fontSize: "17px" }}>
              Visitas por residente
            </h3>
            {TopResidentes.map((item, i) => {
              const Porcentaje = Math.round((item.count / VisitasTop1) * 100)
              return (
                <BarraEstados
                  key={item.residentId}
                  label={item.name}
                  value={item.count}
                  percent={Porcentaje}
                  color={Colores[i % Colores.length]}
                  bg="#1e293b"
                  textColor="#cbd5e1"
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  </main>
)}
