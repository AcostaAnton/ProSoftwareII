import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import useResponsive from '../../hooks/useResponsive'
import { cn } from '../../lib/cn'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function MainLayout() {
  const isMobile = useResponsive()
  const [isSidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768,
  )

  const toggleSidebar = () => setSidebarOpen((o) => !o)

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-[var(--bg)]">
      <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />
      <main
        className={cn(
          'main-layout-main flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto transition-[margin] duration-300 ease-in-out',
          !isMobile && isSidebarOpen && 'md:ml-[240px]',
          !isMobile && !isSidebarOpen && 'md:ml-0',
        )}
      >
        <TopBar toggleSidebar={toggleSidebar} />
        <div className="main-content-wrap box-border w-full max-w-none px-3 py-4 md:px-8 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
