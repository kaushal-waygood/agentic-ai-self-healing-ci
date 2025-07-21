'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarRail,
} from '@/components/ui/sidebar';
import { AppSidebarContent } from '@/components/layout/app-sidebar-content';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AppHeader } from '@/components/layout/app-header';
import { Footer } from '@/components/layout/footer';
import { mockUserProfile } from '@/lib/data/user';
import { Loader2 } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isVerified, setIsVerified] = useState(false);

  return (
    <SidebarProvider defaultOpen={false}>
      <Sidebar
        variant="sidebar"
        collapsible="icon"
        side="left"
        className="border-r"
      >
        <AppSidebarContent />
      </Sidebar>
      <SidebarRail />
      <SidebarInset className="flex flex-col min-h-screen">
        <AppHeader />
        <ScrollArea className="flex-1">
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </ScrollArea>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
