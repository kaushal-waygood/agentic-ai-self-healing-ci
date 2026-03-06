'use client';

import { useState, useEffect } from 'react';
import {
  Pin,
  PinOff,
  Users,
  Zap,
  Crown,
  Building2,
  Layers,
  FileCheck2,
  LayoutDashboard,
  PlusSquare,
  Search,
  FolderTree,
  ChevronRight,
  Settings,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

import apiInstance from '@/services/api';
import { useSidebar } from '@/app/dashboard/layout';
import { useAuthStore } from '@/store/auth.store';
import { useMultiCompanyStore } from '@/store/multi-company.store';
import { Button } from '@/components/ui/button';

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

  const { allCompaniesTree, currentCompany, switchCompany, getCompanies } =
    useMultiCompanyStore();

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [planType, setPlanType] = useState('Free');
  const [expandedCompanies, setExpandedCompanies] = useState<string[]>(['1']);

  useEffect(() => {
    getCompanies();
  }, [getCompanies]);

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

  const CompanyHierarchySidebar = () => {
    const toggleExpand = (companyId: string) => {
      setExpandedCompanies((prev) =>
        prev.includes(companyId)
          ? prev.filter((id) => id !== companyId)
          : [...prev, companyId],
      );
    };

    const handleCompanyClick = (companyId: string) => {
      switchCompany(companyId);
      router.push(`/dashboard/companies/${companyId}`);
    };

    const renderTree = (nodes: any[], level = 0) => {
      return nodes.map((node) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedCompanies.includes(node._id);
        const isCurrent = currentCompany?._id === node._id;

        return (
          <div key={node._id} className="mb-1">
            <div className="flex">
              {/* Indentation */}
              <div className={`w-${level * 4}`} />

              <button
                onClick={() => handleCompanyClick(node._id)}
                className={`flex items-center gap-2 p-2 rounded-lg w-full text-left hover:bg-gray-100 transition-colors ${
                  isCurrent ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                {hasChildren ? (
                  <Button
                    asChild
                    className="w-4 h-4 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent parent click
                      toggleExpand(node._id);
                    }}
                  >
                    <span
                      className="w-4 h-4 flex items-center justify-center"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleExpand(node._id);
                        }
                      }}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3 text-gray-500" /> // ▼ when expanded
                      ) : (
                        <ChevronRight className="w-3 h-3 text-gray-500" /> // ▶ when collapsed
                      )}
                    </span>
                  </Button>
                ) : (
                  <div className="w-4 h-4" />
                )}

                {/* Company Logo/Icon */}
                {node.logo ? (
                  <img
                    src={node.logo}
                    alt={node.name}
                    className="w-5 h-5 rounded flex-shrink-0"
                  />
                ) : (
                  <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
                )}

                {/* Company Name */}
                <span className="truncate text-sm flex-1">{node.name}</span>

                {node.type === 'PARENT' && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                    Parent
                  </span>
                )}
              </button>
            </div>

            {hasChildren && isExpanded && (
              <div className="ml-8 border-l-2 border-gray-200 pl-2">
                {renderTree(node.children, level + 1)}
              </div>
            )}
          </div>
        );
      });
    };

    return (
      <div className="mt-4">
        {/* <div className="flex items-center gap-2 px-2 mb-2 text-xs font-semibold text-gray-500">
          <FolderTree className="w-3 h-3" />
          COMPANY HIERARCHY
        </div>
        <div className="max-h-64 overflow-y-auto">
{allCompaniesTree && allCompaniesTree.length > 0 ? (
            renderTree(allCompaniesTree)
          ) : (
            <p className="text-sm text-gray-500 px-2 py-4 text-center">
              No companies found
            </p>
          )}
        </div> */}
      </div>
    );
  };

  const sidebarConfig = {
    name: 'ZobsAI',
    common: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Parent Dashboard',
        href: '/dashboard/parent-dashboard',
        icon: Crown,
      },
      {
        title: 'Companies',
        href: '/dashboard/companies',
        icon: Building2,
      },
      {
        title: 'Team',
        href: '/dashboard/team',
        icon: Users,
      },
    ],

    employerAdmin: [
      {
        title: 'Post a Job',
        href: '/dashboard/post-job',
        icon: PlusSquare,
      },
      {
        title: 'Get Jobs',
        href: '/dashboard/jobs',
        icon: Search,
      },
      {
        title: 'Candidates',
        href: '/dashboard/candidates',
        icon: Users,
      },
      {
        title: 'Company Profile',
        href: '/dashboard/company',
        icon: Settings,
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
        className={`p-2 border-b border-slate-200/50 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}
      >
        {/* <Link href="/dashboard" className="flex items-center gap-4">
          <Image
            src="/logo.png"
            className=""
            alt="logo"
            width={36}
            height={36}
          />
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent animate-fadeIn">
                {sidebarConfig.name}
              </h1>
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
        </Link> */}

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
                {sidebarConfig.name}
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
            className="p-2 rounded text-blue-500 hover:bg-slate-100"
          >
            {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {sidebarNav.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`flex  ${isCollapsed ? 'justify-center ' : 'justify-start'}  items-center gap-3 px-4 py-2 rounded-sm text-sm transition ${
                isActive
                  ? 'bg-blue-500 text-blue-700 text-white'
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
      <CompanyHierarchySidebar />
      {/* Footer */}
      <div className="p-3 border-t text-sm">
        {!isCollapsed && (
          // <>
          //   <p className="font-medium truncate">{user.fullName}</p>
          //   <p className="text-xs text-slate-500">Welcome back</p>
          // </>
          <>
            <button
              onClick={() => router.push('/dashboard/company')}
              className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded transition group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                  {user.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="font-medium truncate hover:text-blue-600">
                  {user.fullName}
                </p>
                <p className="text-xs text-slate-500">Welcome back</p>
              </div>
            </button>
          </>
        )}
        {/* {user.plan !== 'Pro' && (
          <button
            onClick={() => router.push('/dashboard/subscriptions')}
            className="mt-3 w-full text-xs py-2 rounded bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
          >
            Upgrade Plan
          </button>
        )} */}
      </div>
    </div>
  );
};
