import React, { useState, useEffect } from 'react';
import {
  Bell,
  LogOut,
  UserCircle,
  Settings,
  Gem,
  Star,
  ShieldCheck,
  Building,
  Zap,
  AlertTriangle,
  Menu,
  Home,
  Search,
  FileText,
  Bot,
  ChevronDown,
  Sparkles,
  Crown,
  Shield,
  Award,
} from 'lucide-react';
import Link from 'next/link';

const AppHeader = () => {
  const [mounted, setMounted] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('/dashboard');

  // Mock data
  const user = {
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    avatar: null,
    usage: {
      aiJobApply: 15,
      aiCvGenerator: 8,
      aiCoverLetterGenerator: 12,
      applications: 25,
    },
    actionItems: [
      {
        id: '1',
        type: 'application',
        summary: 'Application for Senior Developer at TechCorp was viewed',
        date: '2024-01-20T10:30:00Z',
        isRead: false,
        href: '/applications/1',
      },
      {
        id: '2',
        type: 'recommendation',
        summary: 'New job matches found for your profile',
        date: '2024-01-19T15:45:00Z',
        isRead: false,
        href: '/jobs',
      },
      {
        id: '3',
        type: 'reward',
        summary: 'Congratulations! You earned the "Active Applicant" badge',
        date: '2024-01-18T09:20:00Z',
        isRead: true,
        href: '/profile',
      },
    ],
    scheduledPlanChange: false,
  };

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

  const navItems = [
    { title: 'Dashboard', href: '/dashboard', icon: Home },
    { title: 'Search Jobs', href: '/jobs', icon: Search },
    { title: 'My Applications', href: '/applications', icon: FileText },
    { title: 'AI Auto Apply', href: '/auto-apply', icon: Bot },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const unreadCount = user.actionItems.filter((item) => !item.isRead).length;

  const getPlanIcon = (planId) => {
    switch (planId) {
      case 'pro':
        return Star;
      case 'platinum':
        return Crown;
      case 'enterprise':
        return Shield;
      default:
        return Gem;
    }
  };

  const getPlanColor = (planId) => {
    switch (planId) {
      case 'pro':
        return 'from-yellow-400 to-yellow-600';
      case 'platinum':
        return 'from-purple-400 to-purple-600';
      case 'enterprise':
        return 'from-blue-400 to-blue-600';
      default:
        return 'from-slate-400 to-slate-600';
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

  return (
    <header className="sticky top-0 z-50 w-full  bg-white/95 backdrop-blur-md shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Mobile menu button */}
        <button className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors duration-200">
          <Menu className="w-5 h-5 text-slate-600" />
        </button>

        {/* Logo/Brand */}
        <div className="flex items-center space-x-3"></div>

        {/* Right side actions */}
        <div className="flex items-center space-x-3">
          {/* Plan Status */}
          {mounted && (
            <div className="relative">
              <button
                onClick={() => setIsPlanOpen(!isPlanOpen)}
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
                  {/* Plan header */}
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

                  {/* Usage tracking */}
                  <div className="p-6 space-y-4">
                    <UsageTracker
                      label="AI Applications"
                      used={user.usage.aiJobApply}
                      limit={effectivePlan.limits.aiJobApply}
                    />
                    <UsageTracker
                      label="AI CV Generations"
                      used={user.usage.aiCvGenerator}
                      limit={effectivePlan.limits.aiCvGenerator}
                    />
                    <UsageTracker
                      label="AI Cover Letters"
                      used={user.usage.aiCoverLetterGenerator}
                      limit={effectivePlan.limits.aiCoverLetterGenerator}
                    />
                    <UsageTracker
                      label="Tracked Applications"
                      used={user.usage.applications}
                      limit={effectivePlan.limits.applicationLimit}
                    />
                  </div>

                  {/* Upgrade button */}
                  <div className="p-4 border-t border-slate-100">
                    <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2">
                      <Crown className="w-4 h-4" />
                      <span>Upgrade Plan</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
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
                  {user.actionItems.length > 0 ? (
                    user.actionItems.map((item, index) => (
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

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 p-2 rounded-xl hover:bg-slate-100 transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user.fullName.charAt(0)}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-600 hidden sm:block" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                {/* User info */}
                <div className="p-4 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {user.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        {user.fullName}
                      </p>
                      <p className="text-sm text-slate-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-2">
                  {user.scheduledPlanChange && (
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
                </div>

                {/* Logout */}
                <div className="border-t border-slate-100 p-2">
                  <button className="w-full px-4 py-3 text-left hover:bg-red-50 transition-colors duration-200 flex items-center space-x-3 text-red-600">
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(isNotificationOpen || isUserMenuOpen || isPlanOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsNotificationOpen(false);
            setIsUserMenuOpen(false);
            setIsPlanOpen(false);
          }}
        />
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
      `}</style>
    </header>
  );
};

export { AppHeader };
