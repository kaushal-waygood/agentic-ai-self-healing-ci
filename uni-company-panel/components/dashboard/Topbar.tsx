'use client';

import { CompanySwitcher } from './CompanySwitcher';
import { AppHeader } from '@/components/dashboard/layout/app-header';

interface TopbarProps {
  companies: any[];
  currentCompany: any;
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export function Topbar({
  companies,
  currentCompany,
  onMenuClick,
  isSidebarOpen,
}: TopbarProps) {
  return (
    <div className="sticky top-0 z-50 border-b bg-white">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4 ml-auto">
          <CompanySwitcher
            companies={companies}
            currentCompany={currentCompany}
          />
          <AppHeader onMenuClick={onMenuClick} isSidebarOpen={isSidebarOpen} />
        </div>
      </div>
    </div>
  );
}
