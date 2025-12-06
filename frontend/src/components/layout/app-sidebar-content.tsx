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
  Search,
  Layers,
  ZapIcon,
  Activity,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import { useSidebar } from '@/app/(app)/layout-client';
import apiInstance from '@/services/api';
import Image from 'next/image';

export const AppSidebarContent = ({
  isCollapsed,
}: {
  isCollapsed: boolean;
}) => {
  const { isPinned, setPinned } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const { user: authUser } = useSelector((state: RootState) => state.auth);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [planType, setPlanType] = useState('Free');

  // --- 1. ROLE DEFINITIONS ---
  const ROLES = {
    HR: 'hr',
    STUDENT: 'user', // Default role for job seekers
    employerAdmin: 'employer-admin',
    guestOrg: 'guest-org',
  };

  // Safe fallback to 'user' if role is missing
  const currentRole = authUser?.role || ROLES.STUDENT;

  // --- 2. DATA FETCHING ---
  useEffect(() => {
    const fetchUserPlanType = async () => {
      try {
        const response = await apiInstance.get('/plan/get-user-plan-type');
        if (response.data?.data?.planType) {
          setPlanType(response.data.data.planType);
        }
      } catch (error) {
        console.error('Failed to fetch user plan:', error);
      }
    };

    if (authUser) {
      fetchUserPlanType();
    }
  }, [authUser]);

  const user = {
    role: currentRole,
    fullName: authUser?.fullName || 'Guest User',
    plan: planType,
  };

  // --- 3. SITE CONFIGURATION WITH PERMISSIONS ---
  const siteConfig = {
    name: 'ZobsAI',
    sidebarNav: [
      // === COMMON ITEMS (Visible to Everyone) ===
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: Rocket,
      },

      // === STUDENT / JOB SEEKER TOOLS ===
      {
        title: 'Job Search',
        href: '/dashboard/search-jobs',
        icon: Search,
        allowedRoles: [ROLES.STUDENT],
      },
      {
        title: 'AI CV Generator',
        href: '/dashboard/cv-generator',
        icon: FileText,
        allowedRoles: [ROLES.STUDENT],
      },
      {
        title: 'AI Cover Letter',
        href: '/dashboard/cover-letter-generator',
        icon: Newspaper,
        allowedRoles: [ROLES.STUDENT],
      },
      {
        title: 'AI Auto Docs',
        href: '/dashboard/ai-auto-apply',
        icon: Bot,
        allowedRoles: [ROLES.STUDENT],
        comingSoon: true,
      },
      {
        title: 'Application Wizard',
        href: '/dashboard/apply',
        icon: Wand2,
        allowedRoles: [ROLES.STUDENT],
      },
      {
        title: 'My Applications',
        href: '/dashboard/applications',
        icon: FileCheck2,
        allowedRoles: [ROLES.STUDENT],
      },
      {
        title: 'My Docs',
        href: '/dashboard/my-docs',
        icon: Activity,
        allowedRoles: [ROLES.STUDENT],
      },

      // === HR / ORGANIZATION TOOLS ===
      {
        title: 'Post a Job',
        href: '/dashboard/posted-jobs',
        icon: Users, // Or Briefcase
        allowedRoles: [ROLES.HR, ROLES.employerAdmin, ROLES.guestOrg],
      },
      {
        title: 'Team Management',
        href: '/dashboard/team-management',
        icon: Building2,
        allowedRoles: [ROLES.HR, ROLES.employerAdmin],
      },
      {
        title: 'Candidates',
        href: '/dashboard/candidates',
        icon: Users,
        allowedRoles: [ROLES.HR, ROLES.employerAdmin],
      },

      // === EXTRAS (Visible to Everyone) ===
      {
        title: 'ZobsAI Partnership',
        href: '/dashboard/partnership',
        icon: ZapIcon,
      },
      {
        title: 'Refer & Earn',
        href: '/dashboard/referrals',
        icon: Gift,
      },
      {
        title: 'Request New Feature',
        href: '/dashboard/request-new-feature',
        icon: Layers,
      },
    ],
  };

  const getPlanIcon = (plan: string) => {
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

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Free':
        return 'from-blue-400 to-blue-600';
      case 'Weekly':
        return 'from-green-400 to-green-600';
      case 'Pro':
        return 'from-yellow-400 to-yellow-600';
      case 'Monthly':
        return 'from-purple-400 to-purple-600';
      case 'OrgAdmin':
        return 'from-blue-400 to-blue-600';
      default:
        return 'from-slate-400 to-slate-600';
    }
  };

  return (
    <div className="h-screen overflow-y-auto w-full flex flex-col relative bg-gradient-to-br from-slate-50 to-white border-r border-slate-200">
      {/* Ambient Background Glow */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full blur-2xl animate-pulse"></div>
        <div
          className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-cyan-200/30 to-purple-200/30 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
      </div>

      {/* Sidebar Header */}
      <div className="relative p-2 border-b border-slate-200/50">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="relative p-3">
              <div className="rounded-lg flex flex-col items-center justify-center">
                <Image
                  width={100}
                  height={100}
                  src="/logo.png"
                  className="w-10 h-auto"
                  alt="ZobsAI Logo"
                />
              </div>
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
            <button
              onClick={() => setPinned(!isPinned)}
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
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide">
        {siteConfig.sidebarNav.map((item, index) => {
          // --- FILTERING LOGIC ---
          // If allowedRoles exists and currentRole is NOT in it, skip rendering
          if (item.allowedRoles && !item.allowedRoles.includes(currentRole)) {
            return null;
          }

          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const isHovered = hoveredItem === item.href;

          return (
            <div
              key={item.href}
              id={`sidebar-link-${index}`}
              className="relative"
              style={{
                animation: `slideInLeft 0.5s ease-out ${index * 50}ms forwards`,
                opacity: 0,
              }}
            >
              {/* <Link
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`group relative w-full text-sm flex items-center space-x-3 p-1 rounded-xl transition-all duration-300 ${
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
                      ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-md'
                      : isHovered
                      ? 'bg-gradient-to-br from-purple-100 to-blue-100 text-purple-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {!isCollapsed && (
                  <span
                    className={`flex-1 text-left ${
                      isActive ? 'font-extralight' : ''
                    }`}
                  >
                    {item.title}
                  </span>
                )}
                {!isCollapsed && isHovered && !isActive && (
                  <ChevronRight className="w-4 h-4 text-slate-400 animate-pulse" />
                )}
              </Link> */}

              {/* New code added for coming soon */}
              <div
                onClick={
                  item.comingSoon
                    ? (e) => e.preventDefault() // 👉 block navigation
                    : undefined
                }
                className="group relative"
              >
                <Link
                  href={item.comingSoon ? '#' : item.href} // 👉 prevent route change
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`group relative w-full text-sm flex items-center space-x-3 p-1 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-100 via-blue-100 to-cyan-100 text-purple-700 shadow-lg scale-105'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200 hover:scale-105'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`relative flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-md'
                        : isHovered
                        ? 'bg-gradient-to-br from-purple-100 to-blue-100 text-purple-600'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Title */}
                  {!isCollapsed && (
                    <span
                      className={`flex-1 text-left ${
                        isActive ? 'font-extralight' : ''
                      }`}
                    >
                      {item.title}
                    </span>
                  )}

                  {/* 🚀 Coming Soon Badge */}
                  {!isCollapsed && item.comingSoon && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400 text-white font-semibold">
                      Coming Soon
                    </span>
                  )}

                  {!isCollapsed &&
                    isHovered &&
                    !isActive &&
                    !item.comingSoon && (
                      <ChevronRight className="w-4 h-4 text-slate-400 animate-pulse" />
                    )}
                </Link>
              </div>
              {/* Tooltip for Collapsed State */}
              {isCollapsed && isHovered && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-2 bg-slate-900 text-white text-sm rounded-lg shadow-xl z-50 whitespace-nowrap animate-fadeIn">
                  {item.title}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45"></div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="relative p-2 border-t border-slate-200/50 mt-auto">
        {!isCollapsed ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate text-sm capitalize">
                  {user.fullName}
                </p>
                <p className="text-xs text-slate-500">Welcome back!</p>
              </div>
            </div>
            {/* Show upgrade banner only if not Pro/Admin */}
            {user.plan !== 'Pro' &&
              user.plan !== 'OrgAdmin' &&
              user.plan !== 'Monthly' && (
                <div className="p-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl text-white">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-4 h-4" />
                    <span className="font-semibold text-sm">
                      Unlock More Features
                    </span>
                  </div>
                  <p className="text-xs text-purple-100 mb-3">
                    Upgrade to get unlimited AI generations.
                  </p>
                  <button
                    className="w-full bg-white/20 hover:bg-white/30 text-white text-xs font-medium py-2 rounded-lg transition-colors"
                    onClick={() => router.push('/dashboard/subscriptions')}
                  >
                    Upgrade Now
                  </button>
                </div>
              )}
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => setPinned(true)}
              className="w-full h-12 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
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
