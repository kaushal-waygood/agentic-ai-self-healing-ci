'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

// Main AppHeader Component
const AppHeader = ({ setIsSearchOpen }) => {
  const {
    notifications,
    unreadCount,
    isLoading: isLoadingNotifications,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    fetchUnreadCount,
    socket,
  } = useNotifications();

  const [mounted, setMounted] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [usageLimits, setUsageLimits] = useState({
    cvCreation: 0,
    coverLetter: 0,
    aiApplication: 0,
    autoApply: 0,
    aiAutoApply: 0,
    aiAutoApplyDailyLimit: 0,
    aiMannualApplication: 0,
  });
  const [usageData, setUsageData] = useState({
    aiJobApply: 0,
    aiCvGenerator: 0,
    aiCoverLetterGenerator: 0,
    applications: 0,
    aiAutoApply: 0,
    aiAutoApplyDailyLimit: 0,
    aiMannualApplication: 0,
  });
  const [planType, setPlanType] = useState('free');

  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const effectivePlanLimits = useMemo(
    () => ({
      aiJobApply: usageLimits.aiApplication,
      aiCvGenerator: usageLimits.cvCreation,
      aiCoverLetterGenerator: usageLimits.coverLetter,
      applicationLimit: usageLimits.autoApply,
      aiAutoApply: usageLimits.aiAutoApply,
      aiAutoApplyDailyLimit: usageLimits.aiAutoApplyDailyLimit,
      aiMannualApplication: usageLimits.aiMannualApplication,
    }),
    [usageLimits],
  );

  useEffect(() => {
    setMounted(true);
    dispatch(getStudentDetailsRequest());
  }, [dispatch]);

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        const [limitsRes, planRes] = await Promise.all([
          apiInstance.get('/plan/usage-limit'),
          apiInstance.get('/plan/get-user-plan-type'),
        ]);

        setUsageData(limitsRes.data.data.usageCounters);

        if (limitsRes.data?.success)
          setUsageLimits(limitsRes.data.data.usageLimits);
        if (planRes.data?.success) setPlanType(planRes.data.data.planType);
      } catch (error) {
        console.error('Failed to fetch user plan data:', error);
      }
    };

    if (user?._id) {
      fetchUsageData();
    }
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

  const handleMenuToggle = (menu) => {
    setIsPlanOpen(menu === 'plan' ? !isPlanOpen : false);
    setIsNotificationOpen(
      menu === 'notification' ? !isNotificationOpen : false,
    );
    setIsUserMenuOpen(menu === 'user' ? !isUserMenuOpen : false);
  };

  const handleLogout = async () => {
    try {
      dispatch(logoutRequest());
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'application':
        return 'from-blue-400 to-blue-600';
      case 'recommendation':
        return 'from-green-400 to-green-600';
      case 'alert':
        return 'from-yellow-400 to-yellow-600';
      case 'reward':
        return 'from-purple-400 to-purple-600';
      default:
        return 'from-slate-400 to-slate-600';
    }
  };

  const handleViewAllNotifications = () => {
    router.push('/dashboard/notifications');
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
        <div className="flex items-center justify-between px-6 py-2 ">
          <div className="flex items-center space-x-3"></div>

          <div className="flex items-center space-x-4">
            <PlanDropdown
              planType={planType}
              isOpen={isPlanOpen}
              onToggle={() => handleMenuToggle('plan')}
              usageData={usageData}
              planLimits={effectivePlanLimits}
            />

            <div className="relative">
              {/* Notification Bell icon */}
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
                <div className="absolute right-0 mt-2 w-96  bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-900">
                      Notifications
                    </h3>
                    {/* <button
                      onClick={handleRefreshNotifications}
                      disabled={isLoading}
                      className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                    >
                      {isLoading ? 'Refreshing...' : 'Refresh'}
                    </button> */}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <NotificationBell />
                  </div>
                  <div className="p-4 border-t border-slate-100">
                    <button
                      className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium"
                      onClick={handleViewAllNotifications}
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => handleMenuToggle('user')}
                className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 transition-colors duration-200 border border-transparent hover:border-slate-300"
              >
                <div className="w-8 h-8 bg-gradient-to-br  from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white  text-3xl">
                  {(user?.fullName || ' ').charAt(0)}
                </div>
                {/* <ChevronDown className="w-4 h-4 text-slate-600 hidden sm:block" /> */}
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-4xl">
                        {(user?.fullName || ' ').charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">
                          {user?.fullName || 'Guest'}
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
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <UserCircle className="w-4 h-4 text-slate-600" />{' '}
                      <span className="text-slate-700">Profile</span>
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <Settings className="w-4 h-4 text-slate-600" />{' '}
                      <span className="text-slate-700">Settings</span>
                    </Link>
                    <Link
                      href="/dashboard/billing"
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <CreditCard className="w-4 h-4 text-slate-600" />{' '}
                      <span className="text-slate-700">Billing</span>
                    </Link>
                    <Link
                      href="/dashboard/support"
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-600" />{' '}
                      <span className="text-slate-700">Help</span>
                    </Link>
                  </div>
                  <div className="border-t border-slate-100 p-2">
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
