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
import { useDispatch, useSelector } from 'react-redux';
// import ProtectedRoute from '@/components/protected/ProtectedRoute';
// import FeedbackPopup from '@/components/ui/feedbackPopup';
import { FeedbackProvider } from '@/components/Feedback-context/feedbackContext';
import logRocketAnalytics from '@/components/logrocket/logrocket';
import { RootState } from '@/redux/rootReducer';
import FeedbackButton from '@/components/Feedback-context/FeedbackButton';
import ImprovementPopup from '@/components/dashboard-popup/ImprovementPopup';
import { useDailyStreak } from '@/hooks/credits/useStreakCredit';
import StreakPopup from '@/components/dashboard-popup/StreakPopup';
import {
  fetchDailyStreakRequest,
  getTotalCreditRequest,
} from '@/redux/reducers/creditReducer';
import {
  IMPROVEMENT_POPUP_EVENT_NAME,
  dismissImprovementPopup,
  getImprovementPopupEventAttemptId,
  getImprovementPopupDelayMs,
  getImprovementPopupSessionAttemptKey,
  markImprovementPopupPending,
  markImprovementPopupSubmitted,
  readImprovementPopupState,
} from '@/lib/improvement-popup';
import type { PendingImprovementEvent } from '@/lib/improvement-popup';

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

function getStreakPopupStorageKey() {
  const formattedDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  return `streak_popup_shown_${formattedDate}`;
}

const IMPROVEMENT_SAFE_ROUTE_PREFIXES = [
  '/dashboard/search-jobs',
  '/dashboard/my-docs',
  '/dashboard/applications',
  '/dashboard/notifications',
  '/dashboard/credits',
];

const ACTIVE_IDLE_WINDOW_MS = 15_000;

function isImprovementSafeRoute(pathname: string) {
  if (pathname === '/dashboard') return true;

  return IMPROVEMENT_SAFE_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function hasBlockingModal() {
  if (typeof document === 'undefined') return false;

  if (document.querySelector('[role="dialog"], [aria-modal="true"]')) {
    return true;
  }

  const overlayCandidates = document.querySelectorAll<HTMLElement>(
    '[class*="fixed"][class*="inset-0"], [data-state="open"]',
  );

  return Array.from(overlayCandidates).some((element) => {
    const style = window.getComputedStyle(element);
    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.pointerEvents === 'none' ||
      style.position !== 'fixed'
    ) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    const coversViewport =
      rect.width >= window.innerWidth - 8 &&
      rect.height >= window.innerHeight - 8;

    if (!coversViewport) return false;

    return (
      style.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
      style.backdropFilter !== 'none'
    );
  });
}

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboardPage = pathname.startsWith('/dashboard');
  const isOnboardingPage = pathname === '/dashboard/onboarding-tour';
  const showDashboardUI = isDashboardPage && !isOnboardingPage;
  const isStreakPopupRoute = pathname === '/dashboard';
  const [isOpen, setIsOpen] = useState(true);
  const [isPinned, setPinned] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showImprovementPopup, setShowImprovementPopup] = useState(false);
  const improvementTimerRef = useRef<NodeJS.Timeout>();
  const streakPopupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const streakPopupWatcherRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const lastUserActivityRef = useRef(Date.now());

  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  // const [globalLastDismissTime, setGlobalLastDismissTime] =
  //   useState<number>(0);
  const improvementUserId = user?._id || user?.id || null;
  const [pendingImprovementEvent, setPendingImprovementEvent] =
    useState<PendingImprovementEvent | null>(null);
  const [submittedUntil, setSubmittedUntil] = useState<number | null>(null);
  // const { streak, claiming, claim } = useDailyStreak();
  const { streak } = useDailyStreak();

  // Single fetch for streak + total credit (avoids 3x duplication from useDailyStreak in header/popup)
  useEffect(() => {
    if (user?._id) {
      dispatch(fetchDailyStreakRequest());
      dispatch(getTotalCreditRequest());
    }
  }, [dispatch, user?._id]);
  const [showStreakPopup, setShowStreakPopup] = useState(false);

  useEffect(() => {
    const clearStreakPopupTimer = () => {
      if (streakPopupTimerRef.current) {
        clearTimeout(streakPopupTimerRef.current);
        streakPopupTimerRef.current = null;
      }
    };

    const clearStreakPopupWatcher = () => {
      if (streakPopupWatcherRef.current) {
        clearInterval(streakPopupWatcherRef.current);
        streakPopupWatcherRef.current = null;
      }
    };

    clearStreakPopupTimer();
    clearStreakPopupWatcher();

    if (!isStreakPopupRoute || !streak?.canClaimToday) {
      setShowStreakPopup(false);
      return;
    }

    const streakPopupStorageKey = getStreakPopupStorageKey();

    const syncStreakPopupSchedule = () => {
      const hasShownStreak = sessionStorage.getItem(streakPopupStorageKey);
      const isBlocked =
        showImprovementPopup || isSearchOpen || hasBlockingModal();

      if (hasShownStreak || showStreakPopup) {
        clearStreakPopupTimer();
        clearStreakPopupWatcher();
        return;
      }

      if (isBlocked) {
        clearStreakPopupTimer();
        return;
      }

      if (streakPopupTimerRef.current) return;

      streakPopupTimerRef.current = setTimeout(() => {
        streakPopupTimerRef.current = null;

        if (
          sessionStorage.getItem(streakPopupStorageKey) ||
          showImprovementPopup ||
          isSearchOpen ||
          hasBlockingModal()
        ) {
          return;
        }

        setShowStreakPopup(true);
        sessionStorage.setItem(streakPopupStorageKey, 'true');
      }, 5000);
    };

    syncStreakPopupSchedule();
    streakPopupWatcherRef.current = setInterval(syncStreakPopupSchedule, 250);

    return () => {
      clearStreakPopupTimer();
      clearStreakPopupWatcher();
    };
  }, [
    isStreakPopupRoute,
    streak?.canClaimToday,
    showImprovementPopup,
    isSearchOpen,
    showStreakPopup,
  ]);

  useEffect(() => {
    if (!improvementUserId) {
      setPendingImprovementEvent(null);
      setSubmittedUntil(null);
      return;
    }

    const nextState = readImprovementPopupState(improvementUserId);
    setPendingImprovementEvent(nextState.pendingEvent);
    setSubmittedUntil(nextState.submittedUntil);
  }, [improvementUserId]);

  useEffect(() => {
    if (!improvementUserId) return;

    const handleImprovementEvent = (event: Event) => {
      const detail = (
        event as CustomEvent<{ type?: PendingImprovementEvent['type'] }>
      ).detail;

      if (!detail?.type) return;

      const nextState = markImprovementPopupPending(
        improvementUserId,
        detail.type,
      );
      setPendingImprovementEvent(nextState.pendingEvent);
      setSubmittedUntil(nextState.submittedUntil);
    };

    window.addEventListener(
      IMPROVEMENT_POPUP_EVENT_NAME,
      handleImprovementEvent as EventListener,
    );

    return () => {
      window.removeEventListener(
        IMPROVEMENT_POPUP_EVENT_NAME,
        handleImprovementEvent as EventListener,
      );
    };
  }, [improvementUserId]);

  useEffect(() => {
    const recordActivity = () => {
      lastUserActivityRef.current = Date.now();
    };

    recordActivity();
    window.addEventListener('click', recordActivity);
    window.addEventListener('scroll', recordActivity);
    window.addEventListener('keydown', recordActivity);
    window.addEventListener('mousemove', recordActivity);
    window.addEventListener('touchstart', recordActivity);
    document.addEventListener('visibilitychange', recordActivity);

    return () => {
      window.removeEventListener('click', recordActivity);
      window.removeEventListener('scroll', recordActivity);
      window.removeEventListener('keydown', recordActivity);
      window.removeEventListener('mousemove', recordActivity);
      window.removeEventListener('touchstart', recordActivity);
      document.removeEventListener('visibilitychange', recordActivity);
    };
  }, []);

  useEffect(() => {
    if (improvementTimerRef.current) {
      clearInterval(improvementTimerRef.current);
    }

    if (!improvementUserId || !pendingImprovementEvent) return;
    if (submittedUntil && submittedUntil > Date.now()) return;
    if (!isImprovementSafeRoute(pathname) || showImprovementPopup) return;
    if (showStreakPopup || isSearchOpen) return;

    const sessionAttemptKey =
      getImprovementPopupSessionAttemptKey(improvementUserId);
    const currentAttemptId = getImprovementPopupEventAttemptId(
      pendingImprovementEvent,
    );
    const attemptedEventId = sessionStorage.getItem(sessionAttemptKey);
    if (attemptedEventId === currentAttemptId) return;

    let remainingMs = getImprovementPopupDelayMs(pendingImprovementEvent.type);

    improvementTimerRef.current = setInterval(() => {
      const isVisible = document.visibilityState === 'visible';
      const isUserActive =
        Date.now() - lastUserActivityRef.current <= ACTIVE_IDLE_WINDOW_MS;
      const onSafeRoute = isImprovementSafeRoute(window.location.pathname);

      if (
        !isVisible ||
        !isUserActive ||
        !onSafeRoute ||
        showStreakPopup ||
        isSearchOpen ||
        hasBlockingModal()
      ) {
        return;
      }

      remainingMs -= 1000;

      if (remainingMs > 0) return;

      sessionStorage.setItem(sessionAttemptKey, currentAttemptId);
      sessionStorage.removeItem('improvement_popup_shown');
      setShowImprovementPopup(true);

      if (improvementTimerRef.current) {
        clearInterval(improvementTimerRef.current);
      }
    }, 1000);

    return () => {
      if (improvementTimerRef.current) {
        clearInterval(improvementTimerRef.current);
      }
    };
  }, [
    improvementUserId,
    pendingImprovementEvent,
    submittedUntil,
    pathname,
    showImprovementPopup,
    showStreakPopup,
    isSearchOpen,
  ]);

  const handleDismissPopup = () => {
    setShowImprovementPopup(false);

    if (!improvementUserId) return;

    const nextState = dismissImprovementPopup(improvementUserId);
    setPendingImprovementEvent(nextState.pendingEvent);
    setSubmittedUntil(nextState.submittedUntil);
  };

  const handleImprovementSubmitSuccess = () => {
    if (!improvementUserId) return;

    const nextState = markImprovementPopupSubmitted(improvementUserId);
    setPendingImprovementEvent(nextState.pendingEvent);
    setSubmittedUntil(nextState.submittedUntil);
  };

  const handleSubmittedPopupClose = () => {
    setShowImprovementPopup(false);
  };
  // const handleYesInteraction = () => {
  //   setShowImprovementPopup(false);
  //   popupShownForPathRef.current.add('/dashboard/*');
  //   localStorage.setItem(
  //     'feedback_completed',
  //     JSON.stringify({
  //       completed: ['/dashboard/*'],
  //       expiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
  //     }),
  //   );
  //   sessionStorage.setItem('improvement_popup_shown', 'true');
  // };

  // useEffect(() => {
  //   const feedbackData = localStorage.getItem('feedback_completed');
  //   if (feedbackData) {
  //     const { completed, expiry } = JSON.parse(feedbackData);
  //     if (Date.now() < expiry) {
  //       completed.forEach((path: string) =>
  //         popupShownForPathRef.current.add(path),
  //       );
  //     } else {
  //       localStorage.removeItem('feedback_completed');
  //     }
  //   }
  // }, []);

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
  // const isDashboardPage = pathname.startsWith('/dashboard');
  // const isOnboardingPage = pathname === '/dashboard/onboarding-tour';
  // const showDashboardUI = isDashboardPage && !isOnboardingPage;

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

  // useEffect(() => {
  //   const handleUserActivity = () => {
  //     setHasUserEngaged(true);
  //   };

  //   window.addEventListener('click', handleUserActivity);
  //   window.addEventListener('scroll', handleUserActivity);
  //   window.addEventListener('keydown', handleUserActivity);

  //   return () => {
  //     window.removeEventListener('click', handleUserActivity);
  //     window.removeEventListener('scroll', handleUserActivity);
  //     window.removeEventListener('keydown', handleUserActivity);
  //   };
  // }, []);

  return (
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
        {/* feedback popup in 1 second delay */}
        {showImprovementPopup && (
          <ImprovementPopup
            feedbackCategory={
              pendingImprovementEvent?.type ?? 'improvement_general'
            }
            feedbackPath={pathname}
            onDismiss={handleDismissPopup}
            onSubmitSuccess={handleImprovementSubmitSuccess}
            onCloseAfterSubmit={handleSubmittedPopupClose}
          />
        )}
        {isStreakPopupRoute && (
          <StreakPopup
            isOpen={showStreakPopup}
            onClose={() => setShowStreakPopup(false)}
          />
        )}
        {/* feedback popup  */}
        {/* <FeedbackPopup delay={50000} enableAutoOpen={true} /> */}
      </SidebarContext.Provider>
    </FeedbackProvider>
  );
}
