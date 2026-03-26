export function FormHeader({ title }: { title: string }) {
  return (
    <>
      <h2 style={{ color: '#10b981', marginTop: 0 }}>{title}</h2>
      <hr style={{ borderColor: '#334155', margin: '20px 0' }} />
    </>
  )
}

