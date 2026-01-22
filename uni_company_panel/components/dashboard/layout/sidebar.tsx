'use client';

import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Pin,
  PinOff,
  Users,
  Zap,
  Crown,
  Building2,
  Layers,
  FileCheck2,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

import apiInstance from '@/services/api';
import { useSidebar } from '@/app/dashboard/layout';
import { useAuthStore } from '@/store/auth.store';

type Role = 'uni-admin' | 'employer-admin' | 'student';

export const AppSidebarContent = ({
  isCollapsed,
}: {
  isCollapsed: boolean;
}) => {
  const { isPinned, setPinned } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const { user: authUser } = useAuthStore();

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [planType, setPlanType] = useState('Free');

  useEffect(() => {
    if (!authUser) return;

    apiInstance
      .get('/plan/get-user-plan-type')
      .then((res) => {
        if (res.data?.data?.planType) {
          setPlanType(res.data.data.planType);
        }
      })
      .catch(() => {});
  }, [authUser]);

  const user = {
    role: (authUser?.role || 'student') as Role,
    fullName: authUser?.fullName || 'Guest User',
    plan: planType,
  };

  const isEmployerAdmin = user.role === 'employer-admin';
  const isUniAdmin = user.role === 'uni-admin';

  /* ---------------------------
     SIDEBAR CONFIG
  ---------------------------- */

  const sidebarConfig = {
    common: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: Rocket,
      },
    ],

    employerAdmin: [
      {
        title: 'Post a Job',
        href: '/dashboard/post-job',
        icon: Pin,
      },
      {
        title: 'Get Jobs',
        href: '/dashboard/jobs',
        icon: Pin,
      },
      {
        title: 'Candidates',
        href: '/dashboard/candidates',
        icon: Users,
      },
      {
        title: 'Company Profile',
        href: '/dashboard/company',
        icon: Building2,
      },
    ],

    uniAdmin: {
      students: [
        {
          title: 'Students',
          href: '/dashboard/students',
          icon: Users,
        },
        {
          title: 'Applications',
          href: '/dashboard/student-applications',
          icon: FileCheck2,
        },
      ],
      companies: [
        {
          title: 'Partner Companies',
          href: '/dashboard/companies',
          icon: Building2,
        },
        {
          title: 'Job Listings',
          href: '/dashboard/university-jobs',
          icon: Layers,
        },
      ],
    },
  };

  const sidebarNav = (() => {
    if (isEmployerAdmin) {
      return [...sidebarConfig.common, ...sidebarConfig.employerAdmin];
    }

    if (isUniAdmin) {
      return [
        ...sidebarConfig.common,
        ...sidebarConfig.uniAdmin.students,
        ...sidebarConfig.uniAdmin.companies,
      ];
    }

    return [];
  })();

  const getPlanIcon = (plan: string) => (plan === 'Pro' ? Crown : Zap);

  const getPlanColor = (plan: string) =>
    plan === 'Pro'
      ? 'from-yellow-400 to-yellow-600'
      : 'from-blue-400 to-blue-600';

  /* ---------------------------
     RENDER
  ---------------------------- */

  if (!isEmployerAdmin && !isUniAdmin) return null;

  return (
    <div className="h-full w-full flex flex-col bg-white border-r">
      {/* Header */}

      <div
        className={`p-3 border-b flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}
      >
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            className=""
            alt="logo"
            width={36}
            height={36}
          />
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-lg">ZobsAI </h1>
              <div
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-white bg-gradient-to-r ${getPlanColor(
                  user.plan,
                )}`}
              >
                {React.createElement(getPlanIcon(user.plan), {
                  size: 12,
                })}
                Admin
              </div>
            </div>
          )}
        </Link>

        {!isCollapsed && (
          <button
            onClick={() => setPinned(!isPinned)}
            className="p-2 rounded text-blue-500 hover:bg-slate-100"
          >
            {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 px-4 space-y-1 overflow-y-auto">
        {sidebarNav.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`flex ${isCollapsed ? 'justify-center ' : 'justify-start'}  items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={18} />
              {!isCollapsed && <span>{item.title}</span>}
              {isCollapsed && hoveredItem === item.href && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded">
                  {item.title}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t text-sm">
        {!isCollapsed && (
          <>
            <p className="font-medium truncate">{user.fullName}</p>
            <p className="text-xs text-slate-500">Welcome back</p>
          </>
        )}
        {user.plan !== 'Pro' && (
          <button
            onClick={() => router.push('/dashboard/subscriptions')}
            className="mt-3 w-full text-xs py-2 rounded bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
          >
            Upgrade Plan
          </button>
        )}
      </div>
    </div>
  );
};
