type DashboardHeaderProps = {
  userName: string
  secondaryText: string
}

export default function DashboardHeader({
  userName,
  secondaryText,
}: DashboardHeaderProps) {
  const firstName = userName.trim().split(' ')[0] || 'Usuario'

  return (
    <div className="encabezado-dashboard" style={{ marginBottom: 24 }}>
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
        Bienvenido, {firstName}
      </h1>

      <p
        style={{
          color: '#94a3b8',
          fontSize: 13,
          marginTop: 8,
          marginBottom: 0,
        }}
      >
        {secondaryText}
      </p>
    </div>
  )
}
