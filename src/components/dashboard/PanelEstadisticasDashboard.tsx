// ============================================================
// COMPONENTE: PanelEstadisticasDashboard
// ------------------------------------------------------------
// Este componente agrupa todas las tarjetas de estadísticas
// que aparecen en la parte superior del dashboard.
//
// Ejemplo visual del demo:
//
// [ Total ] [ Pendientes ] [ Usadas ] [ Expiradas ]
//
// Función:
// Recibe un arreglo de estadísticas y renderiza una tarjeta
// por cada elemento usando el componente TarjetaEstadistica.
//
// Importante:
// Este componente NO calcula los datos.
// Solo recibe las estadísticas ya preparadas.
//
// La lógica para calcular estas estadísticas deberá
// implementarse en Dashboard.tsx usando datos de Supabase.
// ============================================================

import TarjetaEstadistica from './TarjetaEstadistica'

type EstadisticaDashboard = {
  titulo: string
  valor: number
  colorLinea: string
}

type PropiedadesPanelEstadisticasDashboard = {
  estadisticas: EstadisticaDashboard[]
}

export default function PanelEstadisticasDashboard({
  estadisticas,
}: PropiedadesPanelEstadisticasDashboard) {
  return (
    <div
      className="dashboard-stats-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 16,
        marginBottom: 28,
      }}
    >
      {estadisticas.map((estadistica) => (
        <TarjetaEstadistica
          key={estadistica.titulo}
          titulo={estadistica.titulo}
          valor={estadistica.valor}
          colorLinea={estadistica.colorLinea}
        />
      ))}
    </div>
  )
}