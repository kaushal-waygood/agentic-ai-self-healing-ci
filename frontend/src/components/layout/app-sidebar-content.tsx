'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Rocket, Pin, PinOff } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfileRequest } from '@/redux/reducers/authReducer';

export function AppSidebarContent() {
  const pathname = usePathname();
  const {
    isMobile,
    state: sidebarState,
    isPinnedOpen,
    setIsPinnedOpen,
    setOpen,
  } = useSidebar();

  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    dispatch(getProfileRequest());
  }, [dispatch]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePinToggle = () => {
    const newPinnedState = !isPinnedOpen;
    setIsPinnedOpen(newPinnedState);
    if (newPinnedState) {
      setOpen(true);
    }
  };

  return (
    <>
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Rocket className="h-7 w-7 text-primary" />
            <h1
              className={cn(
                'text-xl font-bold font-headline text-foreground',
                sidebarState === 'collapsed' &&
                  'group-data-[collapsible=icon]:hidden',
              )}
            >
              {siteConfig.name}
            </h1>
          </Link>

          <div
            className={cn(
              'flex items-center gap-1',
              sidebarState === 'collapsed' &&
                'group-data-[collapsible=icon]:hidden',
            )}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={handlePinToggle}
                  aria-label={isPinnedOpen ? 'Unpin sidebar' : 'Pin sidebar'}
                >
                  {isPinnedOpen ? (
                    <PinOff className="h-4 w-4" />
                  ) : (
                    <Pin className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                align="center"
                hidden={sidebarState !== 'collapsed' || isMobile}
              >
                <p>{isPinnedOpen ? 'Unpin' : 'Pin'}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {siteConfig.sidebarNav.map((item) => {
            if (item.adminOnly && user?.role !== 'OrgAdmin') {
              return null;
            }
            const isActive = mounted
              ? pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              : false;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={{ children: item.title, className: 'font-body' }}
                >
                  <Link href={item.href}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2 h-14" />
    </>
  );
}
