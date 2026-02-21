'use client';

import { AppSidebarContent } from '@/components/dashboard/layout/sidebar';

interface SidebarProps {
  currentCompany: any;
}

export function Sidebar({ currentCompany }: SidebarProps) {
  return (
    <div className="fixed left-0 top-0 h-full w-64 border-r bg-white">
      <AppSidebarContent isCollapsed={false} />
    </div>
  );
}