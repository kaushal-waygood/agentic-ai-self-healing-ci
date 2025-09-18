'use client';

import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Pin,
  PinOff,
  FileText,
  Bot,
  Users,
  ChevronRight,
  Zap,
  Crown,
  Gift,
  Newspaper,
  Wand2,
  FileCheck2,
  Building2,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import { useSidebar } from '@/app/(app)/layout'; // Assuming DashboardLayout exports this

// MODIFIED: The component now accepts `isCollapsed` as a prop
const AppSidebarContent = ({ isCollapsed }) => {
  const { isPinned, setPinned } = useSidebar(); // Get state from context
  const pathname = usePathname();
  const route = useRouter();
  const { user: authUser } = useSelector((state: RootState) => state.auth);
  const [hoveredItem, setHoveredItem] = useState(null);

  // This user object can stay as it is
  const user = {
    role: 'User',
    fullName: authUser?.fullName || 'Guest User',
    plan: 'Free',
  };

  // This config can stay as it is
  const siteConfig = {
    name: 'ZobsAI',
    sidebarNav: [
      {
        title: 'AI CV Generator',
        href: '/dashboard/cv-generator',
        icon: FileText,
      },
      {
        title: 'AI Cover Letter',
        href: '/dashboard/cover-letter-generator',
        icon: Newspaper,
      },
      { title: 'AI Auto Apply', href: '/dashboard/ai-auto-apply', icon: Bot },
      { title: 'Application Wizard', href: '/dashboard/apply', icon: Wand2 },
      {
        title: 'My Applications',
        href: '/dashboard/applications',
        icon: FileCheck2,
      },
      {
        title: 'Organization',
        href: '/dashboard/organization',
        icon: Users,
        adminOnly: true,
      },
      { title: 'Refer & Earn', href: '/dashboard/referrals', icon: Gift },
    ],
  };

  const getPlanIcon = (plan) => {
    // This function can stay as it is
    switch (plan) {
      case 'Free':
        return Zap;
      case 'Pro':
        return Crown;
      case 'OrgAdmin':
        return Building2;
      default:
        return Zap;
    }
  };

  const getPlanColor = (plan) => {
    // This function can stay as it is
    switch (plan) {
      case 'Free':
        return 'from-slate-400 to-slate-600';
      case 'Pro':
        return 'from-yellow-400 to-yellow-600';
      case 'OrgAdmin':
        return 'from-blue-400 to-blue-600';
      default:
        return 'from-slate-400 to-slate-600';
    }
  };

  return (
    // MODIFIED: Removed width and hover handlers. Width is now `w-full` to fill the parent <aside>.
    <div
      className={`h-screen overflow-y-auto transition-all duration-300 w-full flex flex-col relative bg-gradient-to-br from-slate-50 to-white border-r border-slate-200`}
    >
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full blur-2xl animate-pulse"></div>
        <div
          className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-cyan-200/30 to-purple-200/30 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
      </div>

      <div className="relative p-4 border-b border-slate-200/50">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Rocket className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div
                className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full animate-bounce"
                style={{ animationDelay: '0.5s' }}
              ></div>
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent animate-fadeIn">
                  {siteConfig.name}
                </h1>
                <div className="flex items-center space-x-1 mt-1">
                  {(() => {
                    const PlanIcon = getPlanIcon(user.plan);
                    return (
                      <div
                        className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-gradient-to-r ${getPlanColor(
                          user.plan,
                        )} text-white text-xs font-medium`}
                      >
                        <PlanIcon className="w-3 h-3" />
                        <span>{user.plan}</span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </Link>
          {!isCollapsed && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setPinned(!isPinned)} // MODIFIED: Use the function from context
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isPinned
                    ? 'text-purple-600 bg-purple-100 hover:bg-purple-200'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
                title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
              >
                {isPinned ? (
                  <PinOff className="w-4 h-4" />
                ) : (
                  <Pin className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        className={`flex-1 p-3 space-y-2 relative transition-all duration-300 overflow-y-auto scrollbar-hide`}
      >
        {siteConfig.sidebarNav.map((item, index) => {
          if (item.adminOnly && user?.role !== 'OrgAdmin') return null;
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const isHovered = hoveredItem === item.href;

          return (
            <div
              key={item.href}
              className="relative"
              style={{
                animation: `slideInLeft 0.5s ease-out ${index * 50}ms forwards`,
                opacity: 0,
              }}
            >
              <Link
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`group relative w-full flex items-center space-x-3 p-3 rounded-xl font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-100 via-blue-100 to-cyan-100 text-purple-700 shadow-lg scale-105'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200 hover:scale-105'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-r-full animate-pulse"></div>
                )}
                <div
                  className={`relative flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg'
                      : isHovered
                      ? 'bg-gradient-to-br from-purple-100 to-blue-100 text-purple-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {!isCollapsed && (
                  <span
                    className={`flex-1 text-left transition-all duration-200 ${
                      isActive ? 'font-semibold' : 'font-medium'
                    }`}
                  >
                    {item.title}
                  </span>
                )}
                {!isCollapsed && isHovered && !isActive && (
                  <ChevronRight className="w-4 h-4 text-slate-400 animate-pulse" />
                )}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-xl blur-sm -z-10"></div>
                )}
              </Link>
              {isCollapsed && isHovered && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg shadow-xl z-50 whitespace-nowrap animate-fadeIn">
                  {item.title}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="relative p-4 border-t border-slate-200/50 mt-auto">
        {!isCollapsed ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate text-sm capitalize">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-slate-500">Welcome back!</p>
                </div>
              </div>
            </div>
            {user.plan !== 'Pro' && user.plan !== 'OrgAdmin' && (
              <div className="p-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl text-white">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4" />
                  <span className="font-semibold text-sm">
                    Unlock More Features
                  </span>
                </div>
                <p className="text-xs text-purple-100 mb-3">
                  Upgrade to get unlimited AI generations and premium features.
                </p>
                <button
                  className="w-full bg-white/20 hover:bg-white/30 text-white text-xs font-medium py-2 rounded-lg transition-colors duration-200"
                  onClick={() => route.push('/dashboard/subscriptions')}
                >
                  Upgrade Now
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => setPinned(true)} // MODIFIED: This button should expand and pin the sidebar
              className="w-full h-12 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors duration-200"
              title="Expand sidebar"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        /* Your styles can remain unchanged */
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
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
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export { AppSidebarContent };
