'use client';

import { CompanySwitcher } from './CompanySwitcher';
import { AppHeader } from '@/components/dashboard/layout/app-header'; 

interface TopbarProps {
  companies: any[];
  currentCompany: any;
}

export function Topbar({ companies, currentCompany }: TopbarProps) {
  return (
    <div className="sticky top-0 z-50 border-b bg-white">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <CompanySwitcher 
            companies={companies} 
            currentCompany={currentCompany} 
          />
        </div>
        <AppHeader onMenuClick={() => {}} isSidebarOpen={true} />
      </div>
    </div>
  );
}