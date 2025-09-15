'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  LogOut,
  UserCircle,
  Settings,
  Gem,
  Star,
  AlertTriangle,
  Home,
  Search,
  FileText,
  Bot,
  ChevronDown,
  Crown,
  Shield,
  CreditCard,
  HelpCircle,
  ChevronRight,
  Newspaper,
  Wand2,
  FileCheck2,
  Users,
  DollarSign,
  Gift,
  LifeBuoy,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import { getStudentDetailsRequest } from '@/redux/reducers/studentReducer';
import { logoutRequest } from '@/redux/reducers/authReducer';
import apiInstance from '@/services/api'; // Import your API instance

// For clarity, the CommandPalette is defined as a separate component within the same file.
const CommandPalette = ({ setIsSearchOpen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const siteConfig = {
    sidebarNav: [
      { title: 'AI CV Generator', href: '/cv-generator', icon: FileText },
      {
        title: 'Cover Letter Studio',
        href: '/cover-letter-generator',
        icon: Newspaper,
      },
      { title: 'AI Auto Apply', href: '/ai-auto-apply', icon: Bot },
      {
        title: 'Organization',
        href: '/organization',
        icon: Users,
        adminOnly: true,
      },
      { title: 'Search Jobs', href: '/search-jobs', icon: Search },
      { title: 'My Applications', href: '/applications', icon: FileCheck2 },
      { title: 'Application Wizard', href: '/apply', icon: Wand2 },
      { title: 'Subscriptions', href: '/subscriptions', icon: DollarSign },
      { title: 'Refer & Earn', href: '/referrals', icon: Gift },
    ],
  };

  const commandItems = useMemo(
    () => [
      ...siteConfig.sidebarNav,
      { title: 'Profile', href: '/profile', icon: UserCircle },
      { title: 'Settings', href: '/settings', icon: Settings },
      { title: 'Help & Support', href: '/support', icon: LifeBuoy },
    ],
    [],
  );

  const filteredItems = useMemo(() => {
    if (!searchQuery) return commandItems;
    const lowerCaseQuery = searchQuery.toLowerCase();
    if (lowerCaseQuery.startsWith('/')) {
      return commandItems.filter((item) =>
        item.href.toLowerCase().includes(lowerCaseQuery),
      );
    }
    return [];
  }, [searchQuery, commandItems]);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery) {
      e.preventDefault();
      if (searchQuery.startsWith('/')) {
        const firstMatch = commandItems.find((item) =>
          item.href.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        if (firstMatch) {
          router.push(firstMatch.href);
          setIsSearchOpen(false);
        }
      } else {
        router.push(`/search-jobs?query=${encodeURIComponent(searchQuery)}`);
        setIsSearchOpen(false);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20"
      onClick={() => setIsSearchOpen(false)}
    >
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm animate-fadeIn"></div>
      <div
        className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 animate-slideDown"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search or type a command (e.g., /cv)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
              autoFocus
              className="w-full h-12 pl-12 pr-4 bg-slate-50 border-transparent focus:border-purple-500 focus:ring-purple-500 rounded-lg text-base"
            />
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {searchQuery && !searchQuery.startsWith('/') ? (
            <Link
              href={`/search-jobs?query=${encodeURIComponent(searchQuery)}`}
              onClick={() => setIsSearchOpen(false)}
              className="flex items-center space-x-4 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors duration-200 cursor-pointer"
            >
              <Search className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <p className="font-medium text-slate-800">
                  Search for jobs:{' '}
                  <span className="text-blue-600 font-semibold">
                    &quot;{searchQuery}&quot;
                  </span>
                </p>
              </div>
              <span className="text-xs text-slate-400">Press Enter</span>
            </Link>
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSearchOpen(false)}
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 cursor-pointer"
                >
                  <Icon className="w-5 h-5 text-slate-500" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.href}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              );
            })
          ) : (
            <div className="text-center p-8 text-slate-500">
              <p>No results found for your search.</p>
            </div>
          )}
        </div>
        <div className="p-3 border-t border-slate-200 text-xs text-slate-400 flex items-center justify-between">
          <span>Press `Esc` to close</span>
          <span>
            Use <kbd className="font-sans">` / `</kbd> for commands
          </span>
        </div>
      </div>
    </div>
  );
};

const AppHeader = () => {
  const [mounted, setMounted] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const [usageData, setUsageData] = useState({
    aiJobApply: 0,
    aiCvGenerator: 0,
    aiCoverLetterGenerator: 0,
    applications: 0,
  });

  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

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

  const effectivePlan = {
    id: 'pro',
    name: 'Pro',
    icon: 'Star',
    limits: {
      aiJobApply: 50,
      aiCvGenerator: 25,
      aiCoverLetterGenerator: 30,
      applicationLimit: 100,
    },
  };

  useEffect(() => {
    const fetchUsage = async () => {
      if (!user) return;

      try {
        const response = await apiInstance.get('/plan/usage');
        if (response.data && response.data.success) {
          const usageLogs = response.data.data;

          const totals = usageLogs.reduce(
            (acc, log) => {
              switch (log.feature) {
                case 'cv-creation':
                  acc.aiCvGenerator += log.creditsUsed;
                  break;
                case 'cover-letter-creation':
                  acc.aiCoverLetterGenerator += log.creditsUsed;
                  break;
                case 'auto-apply':
                  acc.aiJobApply += log.creditsUsed;
                  break;
                case 'application-tracking':
                  acc.applications += log.creditsUsed;
                  break;
                default:
                  break;
              }
              return acc;
            },
            {
              aiJobApply: 0,
              aiCvGenerator: 0,
              aiCoverLetterGenerator: 0,
              applications: 0,
            },
          );
          setUsageData(totals);
        }
      } catch (error) {
        console.error('Failed to fetch usage data:', error);
      }
    };

    fetchUsage();
  }, [user]);

  useEffect(() => {
    dispatch(getStudentDetailsRequest());
  }, [dispatch]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeAllMenus = () => {
    setIsNotificationOpen(false);
    setIsUserMenuOpen(false);
    setIsPlanOpen(false);
  };

  useEffect(() => {
    closeAllMenus();
  }, [pathname]);

  const handleMenuToggle = (menu: 'plan' | 'notification' | 'user') => {
    setIsPlanOpen(menu === 'plan' ? !isPlanOpen : false);
    setIsNotificationOpen(
      menu === 'notification' ? !isNotificationOpen : false,
    );
    setIsUserMenuOpen(menu === 'user' ? !isUserMenuOpen : false);
  };

  const unreadCount = (user?.actionItems || []).filter(
    (item) => !item.isRead,
  ).length;

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

  const UsageTracker = ({ label, used, limit }) => {
    const percentage = limit === -1 ? 0 : (used / limit) * 100;
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

  const handleLogout = async () => {
    try {
      dispatch(logoutRequest());
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
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
      {isSearchOpen && <CommandPalette setIsSearchOpen={setIsSearchOpen} />}

      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md shadow-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            {/* Breadcrumbs or page title can go here */}
          </div>

          <div className="flex flex-1 justify-center px-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full max-w-md flex items-center justify-between p-2 bg-slate-100 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-lg text-slate-500 transition-all duration-200"
            >
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4" />
                <span className="text-sm">Search...</span>
              </div>
              <kbd className="font-sans text-xs bg-white text-slate-600 px-2 py-1 rounded border border-slate-200">
                Ctrl K
              </kbd>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {mounted && (
              <div className="relative">
                <button
                  onClick={() => handleMenuToggle('plan')}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 hover:from-yellow-200 hover:to-yellow-300 transition-all duration-200 border border-yellow-300"
                >
                  <Star className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline">
                    Pro
                  </span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {isPlanOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                    <div className="p-6 bg-gradient-to-r from-yellow-400 to-yellow-600">
                      <div className="flex items-center space-x-3 text-white">
                        <Star className="w-6 h-6" />
                        <div>
                          <h3 className="font-bold text-lg">Pro Plan</h3>
                          <p className="text-yellow-100 text-sm">
                            Your current billing cycle usage
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <UsageTracker
                        label="AI Applications"
                        used={usageData.aiJobApply}
                        limit={effectivePlan.limits.aiJobApply}
                      />
                      <UsageTracker
                        label="AI CV Generations"
                        used={usageData.aiCvGenerator}
                        limit={effectivePlan.limits.aiCvGenerator}
                      />
                      <UsageTracker
                        label="AI Cover Letters"
                        used={usageData.aiCoverLetterGenerator}
                        limit={effectivePlan.limits.aiCoverLetterGenerator}
                      />
                      <UsageTracker
                        label="Tracked Applications"
                        used={usageData.applications}
                        limit={effectivePlan.limits.applicationLimit}
                      />
                    </div>
                    <div className="p-4 border-t border-slate-100">
                      <button
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
                        onClick={() => router.push('/dashboard/subscriptions')}
                      >
                        <Crown className="w-4 h-4" />
                        <span>Upgrade Plan</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="relative">
              <button
                onClick={() => handleMenuToggle('notification')}
                className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors duration-200"
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
                  <div className="p-4 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-900">
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {(user?.actionItems || []).length > 0 ? (
                      (user?.actionItems || []).map((item, index) => (
                        <div
                          key={item.id}
                          className={`p-4 hover:bg-slate-50 transition-colors duration-200 border-b border-slate-100 cursor-pointer ${
                            !item.isRead
                              ? 'bg-gradient-to-r from-blue-50/50 to-purple-50/50'
                              : ''
                          }`}
                          style={{
                            animationDelay: `${index * 100}ms`,
                            animation: 'slideIn 0.4s ease-out forwards',
                          }}
                        >
                          <div className="flex items-start space-x-3">
                            <div
                              className={`w-2 h-2 rounded-full mt-2 bg-gradient-to-r ${getNotificationColor(
                                item.type,
                              )} ${!item.isRead ? 'animate-pulse' : ''}`}
                            ></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 mb-1">
                                {item.summary}
                              </p>
                              <p className="text-xs text-slate-500">
                                {new Date(item.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No notifications yet</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t border-slate-100">
                    <button className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium">
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => handleMenuToggle('user')}
                className="flex items-center space-x-2 p-2 rounded-xl hover:bg-slate-100 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {(user?.fullName || ' ').charAt(0)}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-600 hidden sm:block" />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
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
                      href="/profile"
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <UserCircle className="w-4 h-4 text-slate-600" />
                      <span className="text-slate-700">Profile</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <Settings className="w-4 h-4 text-slate-600" />
                      <span className="text-slate-700">Settings</span>
                    </Link>
                    <Link
                      href="/billing"
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <CreditCard className="w-4 h-4 text-slate-600" />
                      <span className="text-slate-700">Billing</span>
                    </Link>
                    <Link
                      href="/support"
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-600" />
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
