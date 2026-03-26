import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import type { UserRole } from '../../types';
import useResponsive from '../../hooks/useResponsive';
import './Sidebar.css';

type NavItem = { id: string; label: string; icon: string; roles: UserRole[]; path: string };

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠', roles: ['resident', 'admin', 'security'], path: '/dashboard' },
  { id: 'new-visit', label: 'Nueva Visita', icon: '➕', roles: ['resident', 'admin'], path: '/visits/new' },
  { id: 'my-visits', label: 'Mis Visitas', icon: '🏘️', roles: ['resident'], path: '/visits/my-visits' },
  { id: 'visit-list', label: 'Lista de Visitas', icon: '📋', roles: ['admin', 'security'], path: '/visits/list' },
  { id: 'scan', label: 'Escanear QR', icon: '📷', roles: ['admin', 'security'], path: '/scan' },
  { id: 'admin-users', label: 'Usuarios', icon: '👥', roles: ['admin'], path: '/admin/users' },
  { id: 'admin-guards', label: 'Actividad Guardias', icon: '🔒', roles: ['admin'], path: '/admin/guards' },
  { id: 'admin-stats', label: 'Estadísticas', icon: '📊', roles: ['admin'], path: '/admin/stats' },
];

const ROLE_LABEL_SIDEBAR: Record<UserRole, string> = {
  admin: 'Admin',
  resident: 'Resident',
  security: 'Guardia',
}

function sidebarRoleLabel(role: UserRole | null | undefined): string {
  if (role == null) return 'Usuario';
  return ROLE_LABEL_SIDEBAR[role];
}

function isNavItemActive(pathname: string, itemPath: string): boolean {
  if (pathname === itemPath) return true;
  if (itemPath === '/dashboard') return false;
  return pathname.startsWith(itemPath);
}

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

export default function Sidebar({ isOpen, toggle }: SidebarProps) {
  const { user, profile, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const displayName = profile?.name ?? user?.email ?? 'Usuario';
  const isMobile = useResponsive();

  const all = role ? NAV_ITEMS.filter((n) => n.roles.includes(role)) : []
  const sections =
    role === 'admin'
      ? [
        { title: 'General', ids: ['dashboard', 'new-visit', 'visit-list', 'scan'] as const },
        { title: 'Administración', ids: ['admin-users', 'admin-guards', 'admin-stats'] as const },
      ]
      : [{ title: '', ids: all.map((n) => n.id) }];

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const sidebarStyle = {
    position: 'fixed' as const,
    left: isOpen ? 0 : (isMobile ? '-100%' : '-220px'),
    transition: 'left 0.3s ease-in-out',
    zIndex: 1000,
  };

  return (
    <>
      {isMobile && isOpen && (
        <button
          type="button"
          className="backdrop"
          aria-label="Cerrar menú de navegación"
          onClick={toggle}
        />
      )}
      <aside className="sidebar" style={sidebarStyle}>
        <div className="logo-wrapper">
          <div className="logo-icon">P</div>
          <span className="logo-text">PasaYa</span>
        </div>

        <nav className="nav">
          {sections.map((sec) => (
            <div key={sec.title || 'main'} className="section">
              {sec.title ? <p className="section-title">{sec.title}</p> : null}
              {all
                .filter((n) => (sec.ids as string[]).includes(n.id))
                .map((n) => {
                  const isActive = isNavItemActive(location.pathname, n.path);
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        navigate(n.path);
                        if (isMobile) toggle();
                      }}
                      className={`nav-button ${isActive ? 'nav-button-active' : ''}`}
                    >
                      {n.icon} {n.label}
                    </button>
                  );
                })}
            </div>
          ))}
        </nav>

        <div style={{ flex: 0, minHeight: 0 }} />

        <div className="user-panel">
          <div className="user-info">
            <Avatar name={displayName} size={32} />
            <div className="user-text">
              <p className="user-name">{displayName}</p>
              <p className="user-role">{sidebarRoleLabel(role)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="logout-button"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}


