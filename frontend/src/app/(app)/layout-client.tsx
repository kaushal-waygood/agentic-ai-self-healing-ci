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
import FeedbackPopup from '@/components/ui/feedbackPopup';

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
  const [isOpen, setIsOpen] = useState(true);
  const [isPinned, setPinned] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= 1024);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }, [pathname]);
  useEffect(() => {
    if (window.innerWidth < 1024 && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // --- START: MODIFIED LOGIC ---
  // This will be true for any path starting with /dashboard
  const isDashboardPage = pathname.startsWith('/dashboard');
  // This will be true only for the specific onboarding page
  const isOnboardingPage = pathname === '/dashboard/onboarding-tour';
  // This new constant controls UI visibility
  const showDashboardUI = isDashboardPage && !isOnboardingPage;
  // --- END: MODIFIED LOGIC ---
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-state');

    // Only apply saved state if found — otherwise stay open
    if (saved) {
      const parsed = JSON.parse(saved);

      if (typeof parsed.isOpen === 'boolean') {
        setIsOpen(parsed.isOpen);
      }

      if (typeof parsed.isPinned === 'boolean') {
        setPinned(parsed.isPinned);
      }
    }
  }, []);
  useEffect(() => {
    localStorage.setItem(
      'sidebar-state',
      JSON.stringify({
        isOpen,
        isPinned,
      }),
    );
  }, [isOpen, isPinned]);

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

  const toggle = () => setIsOpen(!isOpen);

  // const handleMouseEnter = () => {
  //   if (!isPinned) setIsOpen(true);
  // };

  // const handleMouseLeave = () => {
  //   if (!isPinned) setIsOpen(false);
  // };

  // const handleMouseEnter = () => {
  //   if (!isPinned && window.innerWidth >= 1024) {
  //     setIsOpen(true);
  //   }
  // };

  // const handleMouseLeave = () => {
  //   if (!isPinned && window.innerWidth >= 1024) {
  //     setIsOpen(false);
  //   }
  // };
  // const handleMouseEnter = () => {
  //   if (window.innerWidth >= 1024 && !isPinned) {
  //     setIsHovered(true);
  //   }
  // };

  // const handleMouseLeave = () => {
  //   if (window.innerWidth >= 1024 && !isPinned) {
  //     setIsHovered(false);
  //   }
  // };

  const handleMouseEnter = () => {
    if (isDesktop && !isPinned) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (isDesktop && !isPinned) {
      setIsHovered(false);
    }
  };

  const handleSetPinned = (pinned: boolean) => {
    setPinned(pinned);
    setIsOpen(true);
  };
  const sidebarVisible = isDesktop ? isPinned || isHovered : isOpen;

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
        {/* <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-gray-950">
          {showDashboardUI && (
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
            {showDashboardUI && (
              <header className="sticky top-0 z-40 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <AppHeader setIsSearchOpen={setIsSearchOpen} />
              </header>
            )}

            <ScrollArea className="flex-1">
              <main>{children}</main>
              {!isDashboardPage && <Footer />}
            </ScrollArea>

            {showDashboardUI && <DashboardFooter />}
          </div>
        </div> */}

        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-gray-950">
          {/* SIDEBAR */}
          {/* {showDashboardUI && (
            <aside
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className={`transition-all duration-300 ease-in-out shrink-0 border-r bg-white dark:bg-gray-900 
        ${isOpen ? 'w-64' : 'w-20'}
      `}
            >
              <AppSidebarContent isCollapsed={!isOpen} />
            </aside>
          )} */}
          {showDashboardUI && (
            <>
              {/* MOBILE OVERLAY */}
              {!isDesktop && (
                <div
                  className={`fixed inset-0 z-40 bg-black/40 transition-opacity
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
                  onClick={() => setIsOpen(false)}
                />
              )}

              {/* SIDEBAR */}
              <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={`
        fixed inset-y-0 left-0 z-50
        bg-white dark:bg-gray-900 border-r
        transition-all duration-300 ease-in-out
        ${sidebarVisible ? 'w-64' : 'w-20'}
        ${!isDesktop && (isOpen ? 'translate-x-0' : '-translate-x-full')}
        lg:relative lg:translate-x-0
        shrink-0
      `}
              >
                <AppSidebarContent isCollapsed={!sidebarVisible} />
              </div>
            </>
          )}

          {/* MAIN CONTENT AREA */}
          <div className="flex flex-1 flex-col w-full min-w-0">
            {/* HEADER */}
            {showDashboardUI && (
              <header className="sticky top-0 z-40 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <AppHeader
                  setIsSearchOpen={setIsSearchOpen}
                  onMenuClick={toggle}
                  isSidebarOpen={isOpen}
                />
              </header>
            )}

            {/* SCROLL WRAPPER */}
            <ScrollArea className="flex-1 min-w-0 overflow-x-hidden">
              <main className="min-w-0 overflow-x-hidden">{children}</main>

              {!isDashboardPage && <Footer />}
            </ScrollArea>

            {/* FOOTER */}
            {showDashboardUI && <DashboardFooter />}
          </div>
        </div>
        {/* feedback popup in 1 second delay */}
        <FeedbackPopup delay={1000} />
      </SidebarContext.Provider>
    </ProtectedRoute>
  );
}
