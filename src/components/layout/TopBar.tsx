import React from 'react';
import { useLocation } from 'react-router-dom';
import useResponsive from '../../hooks/useResponsive';

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
      <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}>
        ☰
      </button>
      <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left', marginLeft: isMobile ? '-24px' : '0' }}>{title}</div>
    </div>
  );
};

export default TopBar;
