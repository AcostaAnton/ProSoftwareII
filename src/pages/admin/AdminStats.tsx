//http://localhost:5173/adminstats?skipAuth=1

import { getAllVisits } from '../../services/visits.service'
const totalVisits = (await getAllVisits()).length

export default function PaginaEstadisticas() {
  return (
      <main>
        <div style={{ maxWidth: "900px" }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "22px", fontWeight: 800, color: "white", marginTop: "6px", marginBottom: "4px" }}>Estadísticas</h2>
        <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "24px" }}>Resumen de actividad de la comunidad.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "24px" }}>
          {[
            { l: "Total visitas", v: totalVisits, icon: "📋", b: "#164e63" },
            { l: "Accesos registrados", v: 7, icon: "✅", b: "#14532d" },
            { l: "Residentes activos", v: 4, icon: "🏠", b: "#1e1b4b" },
            { l: "Guardias activos", v: 5, icon: "🔒", b: "#451a03" }
          ].map((k, i) => (
        <div key={i} style={{ background: "#0f172a", border: `1px solid ${k.b}`, borderRadius: "16px", padding: "20px" }}>
        <div style={{ fontSize: "24px", marginBottom: "8px" }}>{k.icon}</div>
        <p style={{ fontFamily: "Syne, sans-serif", fontSize: "28px", fontWeight: 900, color: "white" }}>{k.v}</p>
        <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>{k.l}</p></div>))}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <div className="card">
        <h3 style={{ fontFamily: "Syne, sans-serif", color: "white", marginBottom: "16px", fontSize: "15px" }}>Visitas por estado</h3></div>
        <div className="card">
        <h3 style={{ fontFamily: "Syne, sans-serif", color: "white", marginBottom: "16px", fontSize: "15px" }}>Motivos frecuentes</h3></div></div>
        <div className="card"><h3 style={{ fontFamily: "Syne, sans-serif", color: "white", marginBottom: "16px", fontSize: "15px" }}>Visitas por residente</h3></div></div>
      </main>
  );
}
