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