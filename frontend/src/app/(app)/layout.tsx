'use client';

import { useState } from 'react';
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
// import ProtectedRoute from '@/components/protected/ProtectedRoute';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isVerified, setIsVerified] = useState(false);

  return (
    <SidebarProvider defaultOpen={true}>
      {/* Left Sidebar */}
      <Sidebar
        variant="sidebar"
        collapsible="icon"
        side="left"
        className="border-r bg-white dark:bg-gray-900"
      >
        <AppSidebarContent />
      </Sidebar>

      {/* Sidebar Rail for collapse/expand button */}
      <SidebarRail />

      {/* Main Area */}
      <SidebarInset className="flex flex-col min-h-screen w-full">
        {/* Top Navbar */}
        <header className="sticky top-0 z-50 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur">
          <AppHeader />
        </header>

        {/* Page Content */}
        <ScrollArea className="flex-1">
          <main className="p-4 sm:p-6 lg:p-8">
            {/* Wrap children in ProtectedRoute if needed */}
            {/* <ProtectedRoute>{children}</ProtectedRoute> */}
            {children}
          </main>
        </ScrollArea>

        {/* Footer */}
        <footer className="border-t">
          <Footer />
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
