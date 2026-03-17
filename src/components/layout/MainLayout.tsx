import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useState } from 'react';

export default function MainLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020617' }}>
      <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0, marginLeft: isSidebarOpen ? 220 : 0, transition: 'margin-left 0.3s ease-in-out' }}>
        <TopBar toggleSidebar={toggleSidebar} />
        <div style={{ padding: 24, maxWidth: 900 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}