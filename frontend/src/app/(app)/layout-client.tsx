'use client';

import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
  useRef,
} from 'react';
import { usePathname } from 'next/navigation';
import { AppHeader, CommandPalette } from '@/components/layout/app-header';
import { AppSidebarContent } from '@/components/layout/app-sidebar-content';
import DashboardFooter from '@/components/layout/DashboardFooter';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Footer } from '@/components/layout/footer';
import { useSelector } from 'react-redux';
import ProtectedRoute from '@/components/protected/ProtectedRoute';
import FeedbackPopup from '@/components/ui/feedbackPopup';
import { FeedbackProvider } from '@/components/Feedback-context/feedbackContext';
import logRocketAnalytics from '@/components/logrocket/logrocket';
import { RootState } from '@/redux/rootReducer';
import FeedbackButton from '@/components/Feedback-context/FeedbackButton';
import ImprovementPopup from '@/components/dashboard-popup/ImprovementPopup';
import { useDailyStreak } from '@/hooks/credits/useStreakCredit';
import StreakPopup from '@/components/dashboard-popup/StreakPopup';

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

export const useSidebar = () => useContext(SidebarContext);

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
  const [showImprovementPopup, setShowImprovementPopup] = useState(false);
  const [hasUserEngaged, setHasUserEngaged] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const [lastDismissedPath, setLastDismissedPath] = useState<string | null>(
    null,
  );
  const [lastDismissedTime, setLastDismissedTime] = useState<number>(0);
  const popupShownForPathRef = useRef<Set<string>>(new Set());

  const { user } = useSelector((state: RootState) => state.auth);
  const [globalLastDismissTime, setGlobalLastDismissTime] = useState<number>(0);
  const { streak, claiming, claim } = useDailyStreak();
  const [showStreakPopup, setShowStreakPopup] = useState(false);

  useEffect(() => {
    if (!streak?.canClaimToday) {
      setShowStreakPopup(false);
      return;
    }

    const hasShownStreak = sessionStorage.getItem('streak_popup_shown');
    if (hasShownStreak) return;

    const timer = setTimeout(() => {
      setShowStreakPopup(true);
      sessionStorage.setItem('streak_popup_shown', 'true');
    }, 120000);

    return () => clearTimeout(timer);
  }, [streak?.canClaimToday]);
  const handleCloseStreakPopup = () => {
    setShowStreakPopup(false);
    sessionStorage.setItem('streak_popup_shown', 'true');
  };

  useEffect(() => {
    const hasShownImprovement = sessionStorage.getItem(
      'improvement_popup_shown',
    );

    const isPermanentlyCompleted =
      popupShownForPathRef.current.has('/dashboard/*') &&
      pathname.startsWith('/dashboard');

    if (hasShownImprovement || isPermanentlyCompleted) {
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (!hasShownImprovement && !isPermanentlyCompleted) {
      timerRef.current = setTimeout(() => {
        setShowImprovementPopup(true);
        sessionStorage.setItem('improvement_popup_shown', 'true');
      }, 30000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [pathname]);

  useEffect(() => {
    const hasShownImprovement = sessionStorage.getItem(
      'improvement_popup_shown',
    );

    if (!hasShownImprovement) return;

    if (
      popupShownForPathRef.current.has('/dashboard/*') &&
      pathname.startsWith('/dashboard')
    ) {
      return;
    }

    const timer = setTimeout(() => {
      setShowImprovementPopup(true);
    }, 120000);

    return () => clearTimeout(timer);
  }, [pathname]);

  const handleDismissPopup = () => {
    setShowImprovementPopup(false);
    setLastDismissedPath(pathname);
    setLastDismissedTime(Date.now());
    setGlobalLastDismissTime(Date.now());
  };

  const handleYesInteraction = () => {
    setShowImprovementPopup(false);
    popupShownForPathRef.current.add('/dashboard/*');
    localStorage.setItem(
      'feedback_completed',
      JSON.stringify({
        completed: ['/dashboard/*'],
        expiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
      }),
    );
    sessionStorage.setItem('improvement_popup_shown', 'true');
  };

  useEffect(() => {
    const feedbackData = localStorage.getItem('feedback_completed');
    if (feedbackData) {
      const { completed, expiry } = JSON.parse(feedbackData);
      if (Date.now() < expiry) {
        completed.forEach((path: string) =>
          popupShownForPathRef.current.add(path),
        );
      } else {
        localStorage.removeItem('feedback_completed');
      }
    }
  }, []);

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
  const isDashboardPage = pathname.startsWith('/dashboard');
  const isOnboardingPage = pathname === '/dashboard/onboarding-tour';
  const showDashboardUI = isDashboardPage && !isOnboardingPage;

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-state');

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
    if (!user) return;

    logRocketAnalytics.identify({
      id: user.id || user._id,
      email: user.email,
      name: user.fullName,
    });
  }, [user]);

  useEffect(() => {
    const handleUserActivity = () => {
      setHasUserEngaged(true);
    };

    window.addEventListener('click', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    return () => {
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
    };
  }, []);

  return (
    <ProtectedRoute>
      <FeedbackProvider>
        <SidebarContext.Provider value={contextValue}>
          {isSearchOpen && <CommandPalette setIsSearchOpen={setIsSearchOpen} />}

          <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-gray-950">
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
              <FeedbackButton />
              {/* FOOTER */}
              {showDashboardUI && <DashboardFooter />}
            </div>
          </div>
          <StreakPopup
            isOpen={showStreakPopup}
            onClose={handleCloseStreakPopup}
          />
          {/* feedback popup in 1 second delay */}
          {showImprovementPopup && (
            <ImprovementPopup
              onClose={handleDismissPopup}
              onYes={handleYesInteraction}
            />
          )}

          <FeedbackPopup delay={50000} enableAutoOpen={true} />
        </SidebarContext.Provider>
      </FeedbackProvider>
    </ProtectedRoute>
  );
}
