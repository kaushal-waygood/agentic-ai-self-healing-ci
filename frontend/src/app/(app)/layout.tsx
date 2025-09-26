'use client';

import React, {
  useState,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { usePathname } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebarContent } from '@/components/layout/app-sidebar-content';
import DashboardFooter from '@/components/layout/DashboardFooter';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SessionChecker } from '@/utils/SessionChecker';
import { Footer } from '@/components/layout/footer';

// 1. Define the shape of the context data for TypeScript
interface SidebarContextType {
  isOpen: boolean;
  isPinned: boolean;
  toggle: () => void;
  setPinned: (pinned: boolean) => void;
}

// 2. Create the context with a default value.
// This is used if a component tries to access the context without a Provider above it.
const SidebarContext = createContext<SidebarContextType>({
  isOpen: true,
  isPinned: true,
  toggle: () => {},
  setPinned: () => {},
});

// 3. Create a custom hook for cleaner access to the context in child components
export const useSidebar = () => useContext(SidebarContext);

// 4. The main layout component
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // --- HOOKS ---
  // All hooks are called unconditionally at the top level of the component.
  // This is the most important rule to follow to prevent the "fewer hooks" error.
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isPinned, setPinned] = useState(true);

  // --- DERIVED STATE ---
  // Simple variables are derived from hook results after all hooks have been called.
  const isDashboardPage = pathname.startsWith('/dashboard');

  // --- EVENT HANDLERS ---
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
    // If the sidebar is unpinned, it should close.
    if (!pinned) {
      setIsOpen(false);
    } else {
      // If it's pinned, it should be open.
      setIsOpen(true);
    }
  };

  // OPTIMIZATION: Memoize the context value to prevent consumers from
  // re-rendering unnecessarily when the layout component itself re-renders.
  const contextValue = useMemo(
    () => ({
      isOpen,
      isPinned,
      toggle,
      setPinned: handleSetPinned,
    }),
    [isOpen, isPinned],
  );

  // --- RENDER ---
  return (
    <SidebarContext.Provider value={contextValue}>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-gray-950">
        {/* Conditional rendering logic is safe to use here, inside the JSX */}
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
