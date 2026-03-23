import React from 'react';
import { useLocation } from 'react-router-dom';
import useResponsive from '../../hooks/useResponsive';
import { Button } from '../ui/Button';

import { NAV_ITEMS } from './Sidebar';

const getTitleForPath = (path: string) => {
  const item = NAV_ITEMS.find((navItem) => navItem.path === path);
  return item ? item.label : 'Dashboard';
};

interface TopBarProps {
  toggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ toggleSidebar }) => {
  const isMobile = useResponsive();
  const location = useLocation();
  const title = getTitleForPath(location.pathname);

  return (
    <header
      className="app-topbar"
      style={{
        background: '#0f172a',
        color: 'white',
        minHeight: 52,
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        borderBottom: '1px solid #1e293b',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <Button
        type="button"
        variant="ghost"
        size="lg"
        onClick={toggleSidebar}
        style={{ fontSize: 22, padding: '6px 10px', flexShrink: 0, minWidth: 44 }}
        aria-label="Abrir o cerrar menú"
      >
        ☰
      </Button>
      <div
        style={{
          flex: 1,
          textAlign: isMobile ? 'center' : 'left',
          fontFamily: "'Syne', sans-serif",
          fontWeight: 700,
          fontSize: isMobile ? 17 : 18,
          paddingRight: isMobile ? 44 : 0,
        }}
      >
        {title}
      </div>
    </header>
  );
};

export default TopBar;
