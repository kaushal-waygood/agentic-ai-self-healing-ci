import React from 'react';
import { ThemeProvider } from '@/components/layout/theme-provider';
import StoreProvider from '../redux/storeProvider';
import WhatsAppFloatingBtn from '@/components/WhatsAppFloatingBtn';
import { Toaster } from '@/components/ui/toaster';
import LogRocketProvider from '@/components/logrocket/LogRocketProvider';
import ProtectedRoute from '@/components/protected/ProtectedRoute';

const LayoutPage = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {/* Global client-side telemetry */}
      <LogRocketProvider />

      <StoreProvider>
        <ProtectedRoute>
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow">{children}</main>
            <WhatsAppFloatingBtn />
          </div>
        </ProtectedRoute>
      </StoreProvider>

      <Toaster />
    </ThemeProvider>
  );
};

export default LayoutPage;
