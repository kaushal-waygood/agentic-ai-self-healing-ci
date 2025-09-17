'use client';

import React, { useState, createContext, useContext, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebarContent } from '@/components/layout/app-sidebar-content';
import DashboardFooter from '@/components/layout/DashboardFooter';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SessionChecker } from '@/utils/SessionChecker';
import { Footer } from '@/components/layout/footer';

const SidebarContext = createContext({
  isOpen: false,
  isPinned: false,
  toggle: () => {},
  setPinned: (pinned: boolean) => {},
});

export const useSidebar = () => useContext(SidebarContext);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboardPage = pathname.startsWith('/dashboard');

  const [isOpen, setIsOpen] = useState(true);
  const [isPinned, setPinned] = useState(true);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

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
        {isDashboardPage && (
          <aside
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            // MODIFIED: The width now correctly depends on the 'isOpen' state
            className={`transition-all duration-300 ease-in-out border-r bg-white dark:bg-gray-900 ${
              isOpen ? 'w-64' : 'w-20'
            }`}
          >
            <AppSidebarContent isCollapsed={!isOpen} />
          </aside>
        )}

        <div className="flex flex-1 flex-col w-full">
          {isDashboardPage && (
            <header className="sticky top-0 z-40 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur">
              <AppHeader />
            </header>
          )}

          <ScrollArea className="flex-1">
            <main className="p-4 sm:p-6 lg:p-8">
              <SessionChecker>{children}</SessionChecker>
            </main>
            {!isDashboardPage && <Footer />}
          </ScrollArea>

          {isDashboardPage && <DashboardFooter />}
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
