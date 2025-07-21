'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  Bell,
  LogOut,
  UserCircle,
  Settings,
  Gem,
  School,
  Star,
  ShieldCheck,
  Building,
  Zap,
  AlertTriangle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  mockUserProfile,
  UserProfile,
  ActionItem,
  planTierOrder,
  mockOrganizations,
  initialUserProfile,
} from '@/lib/data/user';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  mockSubscriptionPlans,
  SubscriptionPlan,
} from '@/lib/data/subscriptions';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import { ScrollArea } from '@/components/ui/scroll-area';
import apiInstance from '@/services/api';

const iconMap = { ...LucideIcons, Zap, Star, Gem, ShieldCheck, Building };

function UsageTracker({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  if (limit === 0) return null; // Don't show features the plan doesn't have at all
  const isUnlimited = limit === -1;
  const percentage = !isUnlimited && limit > 0 ? (used / limit) * 100 : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-sm text-muted-foreground">
          {isUnlimited ? 'Unlimited' : `${used} / ${limit}`}
        </p>
      </div>
      {!isUnlimited && <Progress value={percentage} className="h-2" />}
    </div>
  );
}

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [effectivePlan, setEffectivePlan] = useState<SubscriptionPlan | null>(
    null,
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const currentUser = mockUserProfile;
    setUser(currentUser);

    // Determine the user's effective plan
    const org = currentUser.organizationId
      ? mockOrganizations.find((o) => o.id === currentUser.organizationId)
      : null;
    let basePlanId = currentUser.currentPlanId;
    if (currentUser.role === 'OrgMember' && org) {
      basePlanId = org.planId;
    }

    let finalPlanId = basePlanId;
    if (
      currentUser.personalPlanId &&
      planTierOrder[currentUser.personalPlanId] > planTierOrder[basePlanId]
    ) {
      finalPlanId = currentUser.personalPlanId;
    }
    setEffectivePlan(
      mockSubscriptionPlans.find((p) => p.id === finalPlanId) || null,
    );

    setMounted(true);
  }, []);

  const navItems = [
    siteConfig.sidebarNav.find((i) => i.title === 'Dashboard'),
    siteConfig.sidebarNav.find((i) => i.title === 'Search Jobs'),
    siteConfig.sidebarNav.find((i) => i.title === 'My Applications'),
    siteConfig.sidebarNav.find((i) => i.title === 'AI Auto Apply'),
  ].filter(Boolean);

  const handleLogout = async () => {
    // Reset the mock user profile to a logged-out state
    await apiInstance.get('/user/signout');
    setUser(initialUserProfile);
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    router.push('/login');
  };

  const handleNotificationClick = (item: ActionItem) => {
    if (!user) return;
    const itemIndex = user.actionItems.findIndex((a) => a.id === item.id);
    if (itemIndex > -1 && !user.actionItems[itemIndex].isRead) {
      user.actionItems[itemIndex].isRead = true;
      setUser({ ...user }); // Trigger re-render
    }
    router.push(item.href);
  };

  const unreadCount = user
    ? user.actionItems.filter((i) => !i.isRead).length
    : 0;

  const getPlanIconColor = (planId?: string) => {
    switch (planId) {
      case 'plus':
      case 'enterprise_plus':
        return 'text-primary';
      case 'pro':
      case 'enterprise_pro':
        return 'text-yellow-500';
      case 'platinum':
      case 'enterprise_platinum':
        return 'text-purple-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getNotificationIcon = (item: ActionItem) => {
    const IconComponent = item.iconName
      ? iconMap[item.iconName]
      : LucideIcons.Info;
    let iconColor = 'text-muted-foreground';
    switch (item.type) {
      case 'application':
        iconColor = 'text-blue-500';
        break;
      case 'recommendation':
        iconColor = 'text-green-500';
        break;
      case 'alert':
        iconColor = 'text-yellow-500';
        break;
      case 'reward':
        iconColor = 'text-purple-500';
        break;
    }
    return <IconComponent className={cn('h-5 w-5 mr-3 shrink-0', iconColor)} />;
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>

      <div className="w-full flex-1 flex justify-end">
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(
            (item) =>
              item && (
                <Button
                  key={item.href}
                  variant="ghost"
                  asChild
                  className={cn(
                    'text-sm font-medium text-muted-foreground',
                    pathname?.startsWith(item.href) && 'text-foreground',
                  )}
                >
                  <Link href={item.href}>{item.title}</Link>
                </Button>
              ),
          )}
        </nav>
      </div>

      {mounted && user && effectivePlan && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              {(() => {
                const Icon = effectivePlan.icon
                  ? iconMap[effectivePlan.icon]
                  : Gem;
                return (
                  <Icon
                    className={cn(
                      'h-5 w-5',
                      getPlanIconColor(effectivePlan.id),
                    )}
                  />
                );
              })()}
              <span className="sr-only">Subscription Status</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                {(() => {
                  const Icon = effectivePlan.icon
                    ? iconMap[effectivePlan.icon]
                    : Gem;
                  return (
                    <Icon
                      className={cn(
                        'h-5 w-5',
                        getPlanIconColor(effectivePlan.id),
                      )}
                    />
                  );
                })()}
                <h3 className="text-lg font-semibold font-headline">
                  {effectivePlan.name} Plan
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Your usage for the current billing cycle.
              </p>
              <div className="space-y-4">
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
            </div>
            <div className="p-4 border-t">
              <Button className="w-full" asChild>
                <Link href="/subscriptions">
                  <Star className="mr-2 h-4 w-4" />
                  Upgrade Plan
                </Link>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}

      <DropdownMenu onOpenChange={() => setUser({ ...mockUserProfile })}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-9 w-9">
            <Bell className="h-5 w-5" />
            {mounted && unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs"
              >
                {unreadCount}
              </Badge>
            )}
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 md:w-96">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {mounted && user && user.actionItems.length > 0 ? (
            <ScrollArea className="h-[300px]">
              {user.actionItems.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  onSelect={() => handleNotificationClick(item)}
                  className={cn(
                    'flex items-start gap-1 whitespace-normal cursor-pointer p-3',
                    !item.isRead && 'bg-primary/5',
                  )}
                >
                  {getNotificationIcon(item)}
                  <div className="flex-grow">
                    <p className="font-semibold text-sm leading-tight">
                      {item.summary}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(item.date).toLocaleString()}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
            </ScrollArea>
          ) : (
            <p className="p-4 text-sm text-center text-muted-foreground">
              No notifications yet.
            </p>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard#action-items"
              className="justify-center cursor-pointer"
            >
              View All
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            {mounted && user ? (
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={'https://placehold.co/100x100.png'}
                  alt={user.fullName}
                  data-ai-hint="user avatar"
                />
                <AvatarFallback>
                  {user.fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <UserCircle className="h-6 w-6" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          {mounted && user && (
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.fullName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
          )}
          <DropdownMenuSeparator />
          {user?.scheduledPlanChange && (
            <DropdownMenuItem asChild>
              <Link
                href="/subscriptions"
                className="text-yellow-600 dark:text-yellow-400 focus:bg-yellow-100 dark:focus:bg-yellow-900/50"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                <span>Plan change scheduled</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
