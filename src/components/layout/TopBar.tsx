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
    <div style={{ background: '#0f172a', color: 'white', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b' }}>
      <Button type="button" variant="ghost" size="lg" onClick={toggleSidebar} style={{ fontSize: 24, padding: '4px 8px' }} aria-label="Abrir menú">
        ☰
      </Button>
      <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left', marginLeft: isMobile ? '-24px' : '0' }}>{title}</div>
    </div>
  );
};

export default TopBar;
