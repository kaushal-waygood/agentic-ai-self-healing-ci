'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LogOut,
  ShieldCheck,
  Search as SearchIcon,
  Users,
  Activity,
  ListChecks,
  LayoutDashboard,
  Building,
  DollarSign,
  FileUp,
  Menu,
  ShieldAlert,
  PanelBottom,
  PanelTop,
} from 'lucide-react';

import {
  mockUserProfile,
  UserProfile,
  mockAdminRoles,
  Permissions,
  initialUserProfile,
} from '@/lib/data/user';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

const allPermissionsFalse: Permissions = {
  org_view: false,
  org_create: false,
  org_update_details: false,
  org_update_status: false,
  org_manage_members: false,
  org_delete: false,
  user_view_all: false,
  user_update_role: false,
  user_impersonate: false,
  admin_view: false,
  admin_create: false,
  admin_update: false,
  admin_delete: false,
  role_view: false,
  role_create: false,
  role_update: false,
  role_delete: false,
  billing_view_plans: false,
  billing_update_plans: false,
  billing_assign_plans: false,
  content_update_jobs: false,
  content_update_header: false,
  content_update_footer: false,
  platform_view_audit_logs: false,
  platform_view_health: false,
};

export default function PrimaryAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isVerified, setIsVerified] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const currentUser = mockUserProfile;
    // Protect the route: ensure user is logged in AND is a PrimaryAdmin.
    if (!currentUser.email || currentUser.role !== 'PrimaryAdmin') {
      router.push('/primary-admin/login');
    } else {
      setUser(currentUser);
      setIsVerified(true);
    }
  }, [router]);

  const handleLogout = () => {
    // Reset the mock user profile to its initial, logged-out state
    Object.assign(mockUserProfile, {
      ...initialUserProfile,
    });

    toast({
      title: 'Logged Out',
      description:
        'You have been successfully logged out from the admin panel.',
    });
    router.push('/');
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchQuery = formData.get('search') as string;
    if (searchQuery.trim()) {
      router.push(
        `/primary-admin/users?q=${encodeURIComponent(searchQuery.trim())}`,
      );
    } else {
      router.push('/primary-admin/users');
    }
  };

  // Render a loading/skeleton state until verification is complete
  if (!isVerified || !user) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          <div className="container flex h-16 items-center">
            <Skeleton className="h-8 w-32" />
          </div>
        </header>
        <main className="flex-1 p-8">
          <Skeleton className="h-12 w-1/4 mb-8" />
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }

  let permissions: Permissions;
  const loggedInUserRole = mockAdminRoles.find(
    (r) => r.id === user.adminRoleId,
  );

  if (user.email === 'iamgde@gmail.com') {
    // This user is the hardcoded super admin and gets all permissions, overriding any role.
    permissions = Object.keys(allPermissionsFalse).reduce((acc, key) => {
      acc[key as keyof Permissions] = true;
      return acc;
    }, {} as Permissions);
  } else {
    permissions = loggedInUserRole?.permissions || allPermissionsFalse;
  }

  const navItems = [
    {
      href: '/primary-admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      permission: true,
    },
    {
      href: '/primary-admin/users',
      label: 'Users',
      icon: Users,
      permission: permissions.user_view_all,
    },
    {
      href: '/primary-admin/organizations',
      label: 'Organizations',
      icon: Building,
      permission: permissions.org_view,
    },
    {
      href: '/primary-admin/subscriptions',
      label: 'Subscriptions',
      icon: DollarSign,
      permission: permissions.billing_view_plans,
    },
    {
      href: '/primary-admin/jobs',
      label: 'Job Listings',
      icon: FileUp,
      permission: permissions.content_update_jobs,
    },
    {
      href: '/primary-admin/admins',
      label: 'Admins',
      icon: ShieldAlert,
      permission: permissions.admin_view,
    },
    {
      href: '/primary-admin/roles',
      label: 'Roles',
      icon: ShieldCheck,
      permission: permissions.role_view,
    },
    {
      href: '/primary-admin/system-health',
      label: 'System Health',
      icon: Activity,
      permission: permissions.platform_view_health,
    },
    {
      href: '/primary-admin/audit-logs',
      label: 'Audit Logs',
      icon: ListChecks,
      permission: permissions.platform_view_audit_logs,
    },
    {
      href: '/primary-admin/header',
      label: 'Header Management',
      icon: PanelTop,
      permission: permissions.content_update_header,
    },
    {
      href: '/primary-admin/footer',
      label: 'Footer Management',
      icon: PanelBottom,
      permission: permissions.content_update_footer,
    },
  ].filter((item) => item.permission);

  const renderNavLinks = (isMobile = false) => (
    <nav
      className={cn(
        'grid gap-2 text-lg font-medium',
        isMobile ? 'p-4' : 'mt-6',
      )}
    >
      {navItems.map((item) => (
        <Link
          key={item.href}
          prefetch={false}
          href={item.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            pathname === item.href && 'bg-muted text-primary',
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link
              href="/primary-admin/dashboard"
              prefetch={false}
              className="flex items-center gap-2 font-semibold"
            >
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span>zobsai Admin</span>
            </Link>
          </div>
          <div className="flex-1">{renderNavLinks()}</div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
              <SheetHeader className="border-b px-4 h-14 flex flex-row items-center lg:h-[60px] lg:px-6">
                <SheetTitle asChild>
                  <Link
                    href="/primary-admin/dashboard"
                    prefetch={false}
                    className="flex items-center gap-2 font-semibold"
                  >
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    <span>zobsai Admin</span>
                  </Link>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Admin Navigation Menu
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto">
                {renderNavLinks(true)}
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  name="search"
                  placeholder="Search users..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                  defaultValue={
                    pathname === '/primary-admin/users'
                      ? (new URLSearchParams(window.location.search).get('q') ??
                        '')
                      : ''
                  }
                />
              </div>
            </form>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
