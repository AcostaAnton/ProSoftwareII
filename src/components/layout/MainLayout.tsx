// src/components/layout/MainLayout.tsx
// Layout como la demo: sidebar fijo + main. Las rutas hijas se renderizan con Outlet.

import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function MainLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020617' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        <div style={{ padding: 24, maxWidth: 900 }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
