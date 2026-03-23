// ============================================================
// COMPONENTE: TarjetaEstadistica
// ------------------------------------------------------------
// Representa una tarjeta individual de estadísticas del dashboard.
//
// Se utiliza dentro del PanelEstadisticasDashboard para mostrar
// métricas rápidas del sistema.
//
// Ejemplos del demo:
// - Total de visitas
// - Visitas pendientes
// - Visitas usadas
// - Visitas expiradas
//
// Cada tarjeta contiene:
// - Línea de color superior (identificación visual)
// - Número principal
// - Título descriptivo
//
// Este componente es reutilizable y NO contiene lógica de negocio.
// Solo muestra la información que recibe por props.
//
// Los datos reales serán calculados en Dashboard.tsx
// usando información obtenida desde Supabase.
// ============================================================

type PropiedadesTarjetaEstadistica = {
  titulo: string
  valor: number
  colorLinea: string
}

export default function TarjetaEstadistica({
  titulo,
  valor,
  colorLinea,
}: PropiedadesTarjetaEstadistica) {
  return (
    <div
      style={{
        background: '#1f2937',
        borderRadius: 14,
        padding: 20,
        width: '100%',
        minWidth: 0,
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Línea de color */}
      <div
        style={{
          width: 40,
          height: 3,
          background: colorLinea,
          marginBottom: 12,
          borderRadius: 2,
        }}
      />

      {/* Número */}
      <p
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: '#ffffff',
          margin: 0,
        }}
      >
        {valor}
      </p>

      {/* Título */}
      <p
        style={{
          fontSize: 13,
          color: '#9ca3af',
          marginTop: 6,
        }}
      >
        {titulo}
      </p>
    </div>
  )
}