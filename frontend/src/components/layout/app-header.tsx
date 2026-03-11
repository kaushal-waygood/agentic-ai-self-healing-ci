'use client';

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import {
  Bell,
  LogOut,
  UserCircle,
  Settings,
  AlertTriangle,
  Search,
  CreditCard,
  HelpCircle,
  ChevronRight,
  Loader2,
  Zap,
  X,
  Menu,
  Coins,
  Flame,
} from 'lucide-react';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import { getStudentDetailsRequest } from '@/redux/reducers/studentReducer';
import { logoutRequest } from '@/redux/reducers/authReducer';
import apiInstance from '@/services/api';
import { debounce } from 'lodash';
import PlanDropdown from './PlanDropdown';
import { useNotifications } from '@/hooks/notifications/useNoifications';
import { NotificationBell } from '../notifications/NotificationBell';
import StreakDropdown from './StreakDropdown';
import { Tooltip } from './tooltip';
import { useDailyStreak } from '@/hooks/credits/useStreakCredit';
import ThemeToggle from '../ui/theme-toggle';
import { useFeedback } from '../Feedback-context/feedbackContext';
import { useProfile } from '@/hooks/useProfile';
import Image from 'next/image';
import { useIsMobile } from '@/hooks/use-mobile';
import { fetchPlanRequest } from '@/redux/reducers/planReducer';
import {
  earnCreditRequest,
  getTotalCreditRequest,
} from '@/redux/reducers/creditReducer';

const UsageTracker = ({ label, used, limit }) => {
  const percentage = limit > 0 ? (used / limit) * 100 : 0;
  const isUnlimited = limit === -1;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-xs text-slate-500">
          {isUnlimited ? 'Unlimited' : `${used} / ${limit}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};

const fetchJobSuggestions = async (query: string) => {
  const allPossibleJobs = [
    'Software Engineer',
    'Senior Software Developer',
    'Frontend Developer',
    'React Developer',
    'Node.js Developer',
    'Full-Stack Developer',
    'Product Manager',
    'UI/UX Designer',
    'Data Scientist',
    'DevOps Engineer',
  ];
  await new Promise((r) => setTimeout(r, 250));
  if (!query) return [];
  const q = query.toLowerCase();
  return allPossibleJobs.filter((j) => j.toLowerCase().includes(q));
};

export const CommandPalette = ({ setIsSearchOpen }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const debounced = useCallback(
    debounce(async (q: string) => {
      if (!q) {
        setSuggestions([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const res = await fetchJobSuggestions(q);
      setSuggestions(res);
      setLoading(false);
    }, 300),
    [],
  );

  useEffect(() => {
    debounced(query);
    return () => debounced.cancel();
  }, [query, debounced]);

  const doSearch = (q: string) => {
    if (!q) return;
    router.push(`/dashboard/search-jobs?query=${encodeURIComponent(q)}`);
    setIsSearchOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20"
      onClick={() => setIsSearchOpen(false)}
    >
      <div className="fixed inset-0 bg-black/30" />
      <div
        className="relative z-10 w-full max-w-lg bg-white rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') doSearch(query);
                if (e.key === 'Escape') setIsSearchOpen(false);
              }}
              autoFocus
              className="w-full h-12 pl-12 pr-4 rounded-lg"
              placeholder="Search for jobs..."
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {loading && (
            <div className="p-8 text-center">
              <Loader2 className="animate-spin inline-block mr-2" /> Loading...
            </div>
          )}

          {!loading && query && (
            <>
              <div
                onClick={() => doSearch(query)}
                className="p-3 bg-blue-50 rounded cursor-pointer flex items-center"
              >
                <Search />{' '}
                <span className="ml-3">Search for &quot;{query}&quot;</span>
              </div>
              {suggestions.map((s) => (
                <div
                  key={s}
                  onClick={() => doSearch(s)}
                  className="p-3 hover:bg-slate-100 rounded flex items-center"
                >
                  <Search />
                  <span className="ml-3">{s}</span>
                  <ChevronRight className="ml-auto" />
                </div>
              ))}
              {suggestions.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  No suggestions. Press Enter to search.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const TotalCredit = () => {
  const [open, setOpen] = useState(false);

  const { streak, claiming, claim, credit } = useDailyStreak();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const openDropdown = () => setOpen(true);

    window.addEventListener('open-streak-dropdown', openDropdown);

    return () => {
      window.removeEventListener('open-streak-dropdown', openDropdown);
    };
  }, []);
  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center  bg-gradient-to-r from-yellow-100 to-purple-100 rounded-lg border border-gray-200">
        {/* Fire */}
        <Tooltip label={'Streak'}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 hover:bg-gray-50 px-2 py-1 rounded-lg  "
          >
            <Flame className="w-6 h-6 text-pink-500" />
            <span className="text-sm font-medium text-pink-500">
              {streak.current || 0}
            </span>
          </button>
        </Tooltip>
        {/* Gold */}
        <Tooltip label={'Credits'}>
          <Link
            href="/dashboard/credits"
            prefetch={false}
            className="flex items-center gap-1  hover:bg-gray-50 px-2 py-1  rounded-lg"
          >
            <Coins className="w-6 h-6 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">
              {credit?.credits || 0}
            </span>
          </Link>
        </Tooltip>
      </div>

      {/* Dropdown */}
      {open && (
        <StreakDropdown
          streak={streak.current}
          longest={streak.longest}
          activeDays={streak.activeDays}
          canClaimToday={streak.canClaimToday}
          isClaiming={claiming}
          onCheckIn={claim}
        />
      )}
    </div>
  );
};

interface AppHeaderProps {
  setIsSearchOpen: (open: boolean) => void;
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

const AppHeader = ({
  setIsSearchOpen,
  onMenuClick,
  isSidebarOpen,
}: AppHeaderProps) => {
  const {
    notifications,
    unreadCount,
    isLoading: isLoadingNotifications,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    isLoading,
    fetchUnreadCount,
    connectionStatus,
    socket,
  } = useNotifications();

  const { profile } = useProfile();

  const [preview, setPreview] = useState(null);
  useEffect(() => {
    if (profile.avatar) {
      setPreview(profile.avatar);
    }
  }, [profile.avatar]);

  const [mounted, setMounted] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const studentWrapper = useSelector(
    (state: RootState) => state.student.students?.[0],
  );
  const { planType, usageLimits, usageData } = useSelector(
    (state: RootState) => state.plan,
  );

  const effectivePlanLimits = useMemo(
    () => ({
      aiJobApply: usageLimits.aiApplication,
      aiCvGenerator: usageLimits.cvCreation,
      aiCoverLetterGenerator: usageLimits.coverLetter,
      applicationLimit: usageLimits.autoApply,
      aiAutoApply: usageLimits.aiAutoApply,
      aiAutoApplyDailyLimit: usageLimits.aiAutoApplyDailyLimit,
      atsScore: usageLimits.atsScore,
      jobMatching: usageLimits.jobMatching,
      aiMannualApplication: usageLimits.aiMannualApplication,
    }),
    [usageLimits],
  );

  const planRef = useRef<HTMLDivElement | null>(null);
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const userRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
    dispatch(getStudentDetailsRequest());
  }, [dispatch]);

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        dispatch(fetchPlanRequest());
      } catch (error) {
        console.error('Failed to fetch user plan data:', error);
      }
    };

    if (user?._id) {
      fetchUsageData();
    }
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) return;

    let isCancelled = false;

    const prefetchJobs = async () => {
      try {
        const { getRecommendJobs } = await import('@/services/api/job');
        const { makeCacheKey, getCache, setCache } =
          await import('@/lib/jobCache');

        // Preload up to 5 pages of recommended jobs into frontend cache
        for (let page = 1; page <= 5; page++) {
          if (isCancelled) break;

          const cacheKey = makeCacheKey('recommend', { page });
          if (!getCache(cacheKey)) {
            const response = await getRecommendJobs({ page });
            if (response?.data && !isCancelled) {
              setCache(cacheKey, {
                jobs: response.data.jobs,
                pagination: response.data.pagination,
              });

              if (!response.data.pagination?.hasNextPage) {
                break;
              }
            }
          }
        }
      } catch (err) {
        console.warn('Background job prefetch failed:', err);
      }
    };

    // Stagger prefetch to not block critical UI render
    const timer = setTimeout(() => prefetchJobs(), 2000);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [user?._id]);

  useEffect(() => {
    setIsNotificationOpen(false);
    setIsUserMenuOpen(false);
    setIsPlanOpen(false);
  }, [pathname]);

  const closeAllMenus = () => {
    setIsNotificationOpen(false);
    setIsUserMenuOpen(false);
    setIsPlanOpen(false);
  };

  const isMobile = useIsMobile();

  // const handleMenuToggle = (menu) => {
  //   // 1. Check if the action is for notifications AND if user is on mobile
  //   if (menu === 'notification' && isMobile) {
  //     router.push('/dashboard/notifications'); // Redirect immediately
  //     return; // Stop function execution here
  //   }

  //   // 2. Default behavior for Desktop (or other menus)
  //   setIsPlanOpen(menu === 'plan' ? !isPlanOpen : false);
  //   setIsNotificationOpen(
  //     menu === 'notification' ? !isNotificationOpen : false,
  //   );
  //   setIsUserMenuOpen(menu === 'user' ? !isUserMenuOpen : false);
  // };

  const handleMenuToggle = (menu) => {
    if (menu === 'notification') {
      if (isMobile) {
        if (unreadCount > 0) {
          markAllAsRead(); // call saga action
        }
        router.push('/dashboard/notifications');
        return;
      }

      const willOpen = !isNotificationOpen;

      setIsNotificationOpen(willOpen);
      setIsPlanOpen(false);
      setIsUserMenuOpen(false);

      if (willOpen && unreadCount > 0) {
        markAllAsRead();
      }

      return;
    }

    // Other menus (unchanged)
    setIsPlanOpen(menu === 'plan' ? !isPlanOpen : false);
    setIsUserMenuOpen(menu === 'user' ? !isUserMenuOpen : false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      const target = e.target;

      // If click is inside any of these, do nothing
      if (
        (planRef.current && planRef.current.contains(target)) ||
        (notificationRef.current && notificationRef.current.contains(target)) ||
        (userRef.current && userRef.current.contains(target))
      ) {
        return;
      }

      closeAllMenus();
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // we can safely leave deps empty because we just call setters

  const { openFeedback } = useFeedback();
  const handleLogout = async () => {
    try {
      // remove feedback session token
      sessionStorage.removeItem('feedback_shown');
      sessionStorage.removeItem('improvement_popup_shown');
      dispatch(logoutRequest());
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleViewAllNotifications = () => {
    router.push('/dashboard/notifications');
    setIsNotificationOpen(false);
  };

  if (!user) {
    return (
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md shadow-sm">
        <div className="flex h-16 items-center justify-between px-6 animate-pulse">
          <div className="h-8 w-24 bg-slate-200 rounded-md"></div>
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
            <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
            <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
          </div>
        </div>
      </header>
    );
  }
  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md ">
        <div className="flex items-center justify-between px-4 lg:px-6 py-2">
          {/* LEFT SIDE */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition"
              aria-label="Toggle menu"
            >
              <span className="relative block w-6 h-6">
                <Menu
                  className={`absolute inset-0 transition-all duration-200 ${
                    isSidebarOpen
                      ? 'opacity-0 rotate-90 scale-75'
                      : 'opacity-100'
                  }`}
                />
                <X
                  className={`absolute inset-0 transition-all duration-200 ${
                    isSidebarOpen
                      ? 'opacity-100'
                      : 'opacity-0 rotate-90 scale-75'
                  }`}
                />
              </span>
            </button>
          </div>

          {/* RIGHT SIDE (UNCHANGED) */}
          <div className="flex items-center space-x-4">
            <TotalCredit />
            <div id="current-plan-driver" ref={planRef}>
              <PlanDropdown
                planType={planType}
                isOpen={isPlanOpen}
                onToggle={() => handleMenuToggle('plan')}
                usageData={usageData}
                planLimits={effectivePlanLimits}
              />
            </div>

            <div id="bell-driver" className="relative" ref={notificationRef}>
              <button
                onClick={() => handleMenuToggle('notification')}
                className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors duration-200 border border-transparent hover:border-slate-300"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </div>
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                  {/* <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-900">
                      Notifications
                    </h3>
                  </div> */}
                  <div className=" overflow-y-auto">
                    {/* <NotificationBell /> */}
                    <NotificationBell
                      notifications={notifications}
                      unreadCount={unreadCount}
                      isLoading={isLoading}
                      markAsRead={markAsRead}
                      fetchNotifications={fetchNotifications}
                      // connectionStatus={connectionStatus}
                      onClose={() => setIsNotificationOpen(false)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div id="user-driver" className="relative" ref={userRef}>
              <button
                onClick={() => handleMenuToggle('user')}
                className="flex items-center space-x-2 rounded-xl hover:bg-slate-100 transition-colors duration-200 border border-transparent hover:border-slate-300"
              >
                {preview ? (
                  <Image
                    width={48}
                    height={48}
                    src={preview}
                    alt=""
                    className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 border border-slate-200 rounded-full flex items-center justify-center text-white text-2xl uppercase"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl uppercase">
                    {(user?.fullName || ' ').charAt(0)}
                  </div>
                )}

                {/* <ChevronDown className="w-4 h-4 text-slate-600 hidden sm:block" /> */}
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      {preview ? (
                        <Image width={48} height={48} src={preview} alt="" />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-4xl uppercase">
                          {(user?.fullName || ' ').charAt(0)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">
                          {/* {user?.fullName || 'Guest'} */}
                          {studentWrapper?.student.fullName || 'Guest'}
                        </p>
                        <p className="text-sm text-slate-500 truncate">
                          {user?.email || ''}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="py-2">
                    {user?.scheduledPlanChange && (
                      <button className="w-full px-4 py-3 text-left hover:bg-yellow-50 transition-colors duration-200 flex items-center space-x-3">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        <span className="text-yellow-700 font-medium">
                          Plan change scheduled
                        </span>
                      </button>
                    )}
                    <Link
                      href="/dashboard/profile"
                      prefetch={false}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <UserCircle className="w-4 h-4 text-slate-600" />{' '}
                      <span className="text-slate-700">Profile</span>
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      prefetch={false}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <Settings className="w-4 h-4 text-slate-600" />{' '}
                      <span className="text-slate-700">Settings</span>
                    </Link>
                    <Link
                      href="/dashboard/billing"
                      prefetch={false}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <CreditCard className="w-4 h-4 text-slate-600" />{' '}
                      <span className="text-slate-700">Billing</span>
                    </Link>
                    <Link
                      href="/dashboard/support"
                      prefetch={false}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-600" />{' '}
                      <span className="text-slate-700">Help</span>
                    </Link>
                  </div>
                  <div className="border-t border-slate-100 p-2">
                    {/* dark and light theme toggle */}
                    {/* <ThemeToggle /> */}
                    <button
                      className="w-full px-4 py-3 text-left hover:bg-red-50 transition-colors duration-200 flex items-center space-x-3 text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {(isNotificationOpen || isUserMenuOpen || isPlanOpen) && (
          <div className="fixed inset-0 z-30" onClick={closeAllMenus} />
        )}

        <style jsx>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
          .animate-slideDown {
            animation: slideDown 0.3s ease-out;
          }
        `}</style>
      </header>
    </>
  );
};

export { AppHeader };
