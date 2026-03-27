export function ModalOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      {children}
    </div>
  )
}

export function ModalCard({
  maxWidth,
  children,
}: {
  maxWidth: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        backgroundColor: 'var(--surface2)',
        width: '100%',
        maxWidth,
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid #334155',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
        maxHeight: '95vh',
        overflowY: 'auto',
      }}
    >
      {children}
    </div>
  )
}

