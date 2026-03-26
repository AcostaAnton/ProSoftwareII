export function ErrorBanner({ error }: { error: string }) {
  return (
    <div
      style={{
        color: '#ef4444',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: '14px',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        padding: '8px',
        borderRadius: '6px',
      }}
    >
      {error}
    </div>
  )
}

