// ============================================================
// PÁGINA: Dashboard
// ------------------------------------------------------------
// Esta página renderiza la pantalla principal después del login.
// Toda la lógica de datos está centralizada en useDashboard.
// ============================================================

import EncabezadoDashboard from '../../components/dashboard/EncabezadoDashboard'
import PanelEstadisticasDashboard from '../../components/dashboard/PanelEstadisticasDashboard'
import TablaVisitasRecientes from '../../components/dashboard/TablaVisitasRecientes'
import { useDashboard } from '../../hooks/useDashboard'

export default function Dashboard() {
  const {
    cargando,
    error,
    nombreUsuario,
    textoSecundario,
    mostrarBotonNuevaVisita,
    estadisticas,
    visitasRecientes,
  } = useDashboard()

  if (cargando) {
    return (
      <div style={{ paddingTop: 8 }}>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Cargando dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ paddingTop: 8 }}>
        <p style={{ color: '#f87171', fontSize: 14 }}>
          Error al cargar el dashboard: {error}
        </p>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: 8 }}>
      <EncabezadoDashboard
        nombreUsuario={nombreUsuario}
        textoSecundario={textoSecundario}
      />

      <PanelEstadisticasDashboard estadisticas={estadisticas} />

      <TablaVisitasRecientes
        titulo="Visitas recientes"
        visitas={visitasRecientes}
        mostrarBotonNuevaVisita={mostrarBotonNuevaVisita}
      />
    </div>
  )
}
