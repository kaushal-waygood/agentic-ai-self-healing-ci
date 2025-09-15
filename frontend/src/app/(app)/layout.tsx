'use client';

import React, { useState, createContext, useContext, useEffect } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebarContent } from '@/components/layout/app-sidebar-content';
import DashboardFooter from '@/components/layout/DashboardFooter';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SessionChecker } from '@/utils/SessionChecker';

// --- Create a Context to manage sidebar state ---
const SidebarContext = createContext({
  isOpen: true,
  isPinned: true,
  toggle: () => {},
  setPinned: (pinned: boolean) => {},
});

// --- Create a hook to easily access the context ---
export const useSidebar = () => useContext(SidebarContext);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [isPinned, setPinned] = useState(true);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  // Handle hover effect for unpinned sidebar
  const handleMouseEnter = () => {
    if (!isPinned) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      setIsOpen(false);
    }
  };

  // When unpinning, the sidebar should collapse
  const handleSetPinned = (pinned: boolean) => {
    setPinned(pinned);
    if (!pinned) {
      setIsOpen(false);
    }
  };

  return (
    <SidebarContext.Provider
      value={{ isOpen, isPinned, toggle, setPinned: handleSetPinned }}
    >
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-gray-950">
        <aside
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`transition-all duration-300 ease-in-out border-r bg-white dark:bg-gray-900 ${
            isOpen ? 'w-fit' : 'w-20'
          }`}
        >
          <AppSidebarContent />
        </aside>

        <div className="flex flex-1 flex-col w-full">
          <header className="sticky top-0 z-40 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur">
            <AppHeader />
          </header>

          <ScrollArea className="flex-1">
            <main className="p-4 sm:p-6 lg:p-8">
              <SessionChecker>{children}</SessionChecker>
            </main>
          </ScrollArea>

          <DashboardFooter />
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
