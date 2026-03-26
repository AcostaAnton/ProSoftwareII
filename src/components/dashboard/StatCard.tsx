type StatCardProps = {
  title: string
  value: number
  accentColor: string
}

export default function StatCard({
  title,
  value,
  accentColor,
}: StatCardProps) {
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
      <div
        style={{
          width: 40,
          height: 3,
          background: accentColor,
          marginBottom: 12,
          borderRadius: 2,
        }}
      />

      <p
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: '#ffffff',
          margin: 0,
        }}
      >
        {value}
      </p>

      <p
        style={{
          fontSize: 13,
          color: '#9ca3af',
          marginTop: 6,
        }}
      >
        {title}
      </p>
    </div>
  )
}
