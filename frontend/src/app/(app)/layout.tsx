'use client';

import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
} from 'react';
import { usePathname } from 'next/navigation';
// MODIFIED: Import both AppHeader and CommandPalette
import { AppHeader, CommandPalette } from '@/components/layout/app-header';
import { AppSidebarContent } from '@/components/layout/app-sidebar-content';
import DashboardFooter from '@/components/layout/DashboardFooter';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Footer } from '@/components/layout/footer';
import ProtectedRoute from '@/components/protected/ProtectedRoute';

// 1. Define the shape of the context data for TypeScript
interface SidebarContextType {
  isOpen: boolean;
  isPinned: boolean;
  toggle: () => void;
  setPinned: (pinned: boolean) => void;
}

// 2. Create the context with a default value.
const SidebarContext = createContext<SidebarContextType>({
  isOpen: true,
  isPinned: true,
  toggle: () => {},
  setPinned: () => {},
});

// 3. Create a custom hook for cleaner access to the context.
export const useSidebar = () => useContext(SidebarContext);

// 4. The main layout component
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isPinned, setPinned] = useState(true);
  // ADDED: State for the search palette is now managed here
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // ADDED: Keyboard listener for opening/closing the palette
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
    } else {
      setIsOpen(true);
    }
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

  console.log(
    'process.envs',
    process.env.NEXT_PUBLIC_NODE_ENV,
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  );

  return (
    <ProtectedRoute>
      <SidebarContext.Provider value={contextValue}>
        {/* ADDED: Conditionally render the CommandPalette here, outside the main layout div */}
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
                {/* MODIFIED: Pass the state setter down to the header */}
                <AppHeader setIsSearchOpen={setIsSearchOpen} />
              </header>
            )}

            <ScrollArea className="flex-1">
              <main className="p-4 sm:p-6 lg:p-8">{children}</main>
              {!isDashboardPage && <Footer />}
            </ScrollArea>

            {isDashboardPage && <DashboardFooter />}
          </div>
        </div>
      </SidebarContext.Provider>
    </ProtectedRoute>
  );
}
