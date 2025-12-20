'use client';

import React, { useState, createContext, useContext } from 'react';
import { AppSidebarContent } from '@/components/dashboard/layout/sidebar';

// 1. Define Context Types
interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  isPinned: boolean;
  setPinned: (pinned: boolean) => void;
}

// 2. Create Context
const SidebarContext = createContext<SidebarContextType>({
  isOpen: true,
  toggle: () => {},
  isPinned: false,
  setPinned: () => {},
});

// 3. Export Hook (Crucial: AppSidebarContent imports this)
export const useSidebar = () => useContext(SidebarContext);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // State
  const [isOpen, setIsOpen] = useState(true);
  const [isPinned, setPinned] = useState(false);

  // Handlers
  const toggle = () => setIsOpen(!isOpen);

  // Mouse handlers for hover effect (only when not pinned)
  const handleMouseEnter = () => !isPinned && setIsOpen(true);
  const handleMouseLeave = () => !isPinned && setIsOpen(false);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, isPinned, setPinned }}>
      {/* Main Flex Container */}
      <div className="flex h-screen w-full overflow-hidden bg-slate-50">
        {/* Sidebar Section */}
        <aside
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`relative z-20 h-full flex-shrink-0 border-r bg-white transition-all duration-300 ease-in-out ${
            isOpen ? 'w-64' : 'w-20'
          }`}
        >
          <AppSidebarContent isCollapsed={!isOpen} />
        </aside>

        {/* Page Content Section */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Optional: <Header /> goes here */}

          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
