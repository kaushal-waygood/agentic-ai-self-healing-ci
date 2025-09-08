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
import { cookies } from 'next/headers'; // Import cookies here

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies(); // Await cookies() since it returns a Promise
  const token = getToken(cookieStore); // Pass the store to the utility function

  if (!token) {
    redirect('/login');
  }

  console.log(token);

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
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </ScrollArea>

        <DashboardFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
