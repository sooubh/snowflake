'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function Shell({ children, onSearchClick }: { children: React.ReactNode; onSearchClick?: () => void }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // If on login page, don't show shell layout
  if (pathname === '/') {
    return <main className="min-h-screen bg-[#05050A] text-white">{children}</main>;
  }

  const handleMenuClick = () => {
      // Check if mobile (using css logic, or simple window check if needed, but here we can just set both)
      // Actually simpler: 
      // On mobile, TopBar is visible, Sidebar is hidden. Click -> Open Sidebar (isSidebarOpen=true).
      // On desktop, TopBar is visible, Sidebar is always visible. Click -> Toggle Collapse (isCollapsed=!isCollapsed).
      
      // We can check window width or use a media query hook, but for simplicity let's rely on the fact that
      // on mobile the sidebar is `fixed` and hidden via translate.
      // On desktop it's `relative`.
      
      if (window.innerWidth < 768) {
          setIsSidebarOpen(true);
      } else {
          setIsCollapsed(!isCollapsed);
      }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0f0f12]">
      {/* Sidebar - Desktop */}
      <div 
        className={`hidden md:block shadow-xl transition-all duration-300 ease-in-out bg-white dark:bg-[#1f1e0b] ${
            isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <Sidebar isCollapsed={isCollapsed} />
      </div>

       {/* Sidebar - Mobile Wrapper */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-[#1f1e0b] shadow-xl transition-transform duration-300 ease-in-out md:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onMenuClick={handleMenuClick} onSearchClick={onSearchClick} />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
