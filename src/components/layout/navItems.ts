import type { UserRole } from '../../types'

export type NavItem = { id: string; label: string; icon: string; roles: UserRole[]; path: string }

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞', roles: ['resident', 'admin', 'security'], path: '/dashboard' },
  { id: 'new-visit', label: 'Nueva Visita', icon: '＋', roles: ['resident', 'admin'], path: '/visits/new' },
  { id: 'my-visits', label: 'Mis Visitas', icon: '≡', roles: ['resident'], path: '/visits/my-visits' },
  { id: 'visit-list', label: 'Lista de Visitas', icon: '≡', roles: ['admin', 'security'], path: '/visits/list' },
  { id: 'scan', label: 'Escanear QR', icon: '⊡', roles: ['admin', 'security'], path: '/scan' },
  { id: 'admin-users', label: 'Usuarios', icon: '👥', roles: ['admin'], path: '/admin/users' },
  { id: 'admin-guards', label: 'Actividad Guardias', icon: '🔒', roles: ['admin'], path: '/admin/guards' },
  { id: 'admin-stats', label: 'Estadísticas', icon: '📊', roles: ['admin'], path: '/admin/stats' },
]
