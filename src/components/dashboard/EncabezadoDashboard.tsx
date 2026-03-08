// ============================================================
// COMPONENTE: EncabezadoDashboard
// ------------------------------------------------------------
// Este componente muestra el encabezado superior del dashboard.
//
// Contiene:
// - Mensaje de bienvenida al usuario.
// - Información secundaria debajo del saludo.
//
// Ejemplo visual del demo:
// Bienvenido, Carlos
// Unidad A-204
//
// El texto secundario cambia según el rol del usuario:
// - Residente -> Unidad o casa dentro de la residencial.
// - Guardia/Admin -> Rol del usuario.
//
// Importante:
// Este componente NO consulta la base de datos.
// Solo recibe los datos desde el Dashboard principal.
//
// Datos esperados:
// - nombreUsuario
// - textoSecundario
//
// El Dashboard.tsx se encarga de obtener estos datos desde:
// - AuthContext
// - Supabase
// ============================================================

type PropiedadesEncabezadoDashboard = {
  nombreUsuario: string
  textoSecundario: string
}

export default function EncabezadoDashboard({
  nombreUsuario,
  textoSecundario,
}: PropiedadesEncabezadoDashboard) {
  const primerNombre = nombreUsuario.trim().split(' ')[0] || 'Usuario'

// Extraemos solo el primer nombre para el saludo.
// Ejemplo: "Carlos Mendoza" -> "Carlos"

  return (
    <div style={{ marginBottom: 24 }}>
      <h1
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 24,
          fontWeight: 800,
          color: '#ffffff',
          margin: 0,
          lineHeight: 1.2,
        }}
      >
        Bienvenido, {primerNombre}
      </h1>

      <p
        style={{
          color: '#94a3b8',
          fontSize: 13,
          marginTop: 8,
          marginBottom: 0,
        }}
      >
        {textoSecundario}
      </p>
    </div>
  )
}