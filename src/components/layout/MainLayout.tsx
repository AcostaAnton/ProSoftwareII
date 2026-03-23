import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useState } from 'react';
import useResponsive from '../../hooks/useResponsive';

const SIDEBAR_WIDTH = 220;

export default function MainLayout() {
  const isMobile = useResponsive();
  const [isSidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768,
  );

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const mainMarginLeft = isMobile ? 0 : isSidebarOpen ? SIDEBAR_WIDTH : 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020617' }}>
      <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />
      <main
        className="main-layout-main"
        style={{
          flex: 1,
          overflowY: 'auto',
          minWidth: 0,
          marginLeft: mainMarginLeft,
          transition: 'margin-left 0.3s ease-in-out',
          width: '100%',
        }}
      >
        <TopBar toggleSidebar={toggleSidebar} />
        <div className="main-content-wrap">
          <Outlet />
        </div>
      </main>
    </div>
  );
}