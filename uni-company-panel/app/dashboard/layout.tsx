'use client';

import React, { useState, createContext, useContext, useEffect } from 'react';
import { AppSidebarContent } from '@/components/dashboard/layout/sidebar';
import { AppHeader } from '@/components/dashboard/layout/app-header';
import { Topbar } from '@/components/dashboard/Topbar';
import { useMultiCompanyStore } from '@/store/multi-company.store';

/* -------------------------------------------------------------------------- */
/*                                SIDEBAR CONTEXT                             */
/* -------------------------------------------------------------------------- */

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  isPinned: boolean;
  setPinned: (pinned: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: true,
  toggle: () => {},
  isPinned: false,
  setPinned: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

/* -------------------------------------------------------------------------- */
/*                               DASHBOARD LAYOUT                              */
/* -------------------------------------------------------------------------- */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [isPinned, setPinned] = useState(true);

  const toggle = () => setIsOpen((v) => !v);

  const handleMouseEnter = () => !isPinned && setIsOpen(true);
  const handleMouseLeave = () => !isPinned && setIsOpen(false);

  const { companies, currentCompany, getCompanies } = useMultiCompanyStore();

  useEffect(() => {
    getCompanies();
  }, []);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, isPinned, setPinned }}>
      <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
        {/* SIDEBAR */}
        <aside
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`relative z-30 h-full flex-shrink-0 border-r bg-white transition-all duration-300 ${
            isOpen ? 'w-64' : 'w-20'
          }`}
        >
          <AppSidebarContent isCollapsed={!isOpen} />
        </aside>

        {/* MAIN AREA */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar
            companies={companies}
            currentCompany={currentCompany}
            onMenuClick={toggle}
            isSidebarOpen={isOpen}
          />
          {/* HEADER */}
          {/* <AppHeader onMenuClick={toggle} isSidebarOpen={isOpen} /> */}

          {/* PAGE CONTENT */}
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
