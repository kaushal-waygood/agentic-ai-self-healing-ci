'use client';

import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
} from 'react';
import { usePathname } from 'next/navigation';
import { AppHeader, CommandPalette } from '@/components/layout/app-header';
import { AppSidebarContent } from '@/components/layout/app-sidebar-content';
import DashboardFooter from '@/components/layout/DashboardFooter';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Footer } from '@/components/layout/footer';
import ProtectedRoute from '@/components/protected/ProtectedRoute';
import LogRocket from 'logrocket';

// 1. Define and Create Context
interface SidebarContextType {
  isOpen: boolean;
  isPinned: boolean;
  toggle: () => void;
  setPinned: (pinned: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  isPinned: false,
  toggle: () => {},
  setPinned: () => {},
});

// 2. Create a custom hook for the context
export const useSidebar = () => useContext(SidebarContext);

// 3. The Client-Side Layout Component
export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setPinned] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isDashboardPage = pathname.startsWith('/dashboard');

  const toggle = () => setIsOpen(!isOpen);

  const handleMouseEnter = () => {
    if (!isPinned) setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (!isPinned) setIsOpen(false);
  };

  const handleSetPinned = (pinned: boolean) => {
    setPinned(pinned);
    setIsOpen(true);
  };

  const contextValue = useMemo(
    () => ({
      isOpen,
      isPinned,
      toggle,
      setPinned: handleSetPinned,
    }),
    [isOpen, isPinned],
  );

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_LOGROCKET_ID) {
      LogRocket.init(process.env.NEXT_PUBLIC_LOGROCKET_ID);
    }
  }, []);

  return (
    <ProtectedRoute>
      <SidebarContext.Provider value={contextValue}>
        {isSearchOpen && <CommandPalette setIsSearchOpen={setIsSearchOpen} />}
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-gray-950">
          {isDashboardPage && (
            <aside
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className={`transition-all duration-300 ease-in-out flex-shrink-0 border-r bg-white dark:bg-gray-900 ${
                isOpen ? 'w-64' : 'w-20'
              }`}
            >
              <AppSidebarContent isCollapsed={!isOpen} />
            </aside>
          )}

          <div className="flex flex-1 flex-col w-full">
            {isDashboardPage && (
              <header className="sticky top-0 z-40 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <AppHeader setIsSearchOpen={setIsSearchOpen} />
              </header>
            )}

            <ScrollArea className="flex-1">
              <main>{children}</main>
              {!isDashboardPage && <Footer />}
            </ScrollArea>

            {isDashboardPage && <DashboardFooter />}
          </div>
        </div>
      </SidebarContext.Provider>
    </ProtectedRoute>
  );
}
