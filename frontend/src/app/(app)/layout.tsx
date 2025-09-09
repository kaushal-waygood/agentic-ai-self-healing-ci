import { AppHeader } from '@/components/layout/app-header';
import { AppSidebarContent } from '@/components/layout/app-sidebar-content';
import DashboardFooter from '@/components/layout/DashboardFooter';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from '@/components/ui/sidebar';
import { getToken } from '@/utils/cookieToken';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { SessionChecker } from '@/utils/SessionChecker'; // 1. Import the component

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar
        variant="sidebar"
        collapsible="icon"
        side="left"
        className="border-r bg-white dark:bg-gray-900"
      >
        <AppSidebarContent />
      </Sidebar>

      <SidebarRail />

      <SidebarInset className="flex flex-col min-h-screen w-full">
        <header className="sticky top-0 z-50 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur">
          <AppHeader />
        </header>

        <ScrollArea className="flex-1">
          {/* 2. Wrap the main content with SessionChecker */}
          <SessionChecker>
            {/* --- CLIENT-SIDE CHECK (runs after page loads) --- */}
            {/* The SessionChecker will now verify localStorage in the browser */}
            <main className="p-4 sm:p-6 lg:p-8">{children}</main>
          </SessionChecker>
        </ScrollArea>

        <DashboardFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
