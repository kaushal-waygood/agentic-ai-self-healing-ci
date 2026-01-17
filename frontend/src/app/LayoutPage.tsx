import React from 'react';
import { ThemeProvider } from '@/components/layout/theme-provider';
import StoreProvider from '../redux/storeProvider';
import WhatsAppFloatingBtn from '@/components/WhatsAppFloatingBtn';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@vercel/analytics/react';
import LogRocketProvider from '@/components/logrocket/LogRocketProvider';

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
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">{children}</main>
          <WhatsAppFloatingBtn />
        </div>
      </StoreProvider>

      <Toaster />
      <Analytics />
    </ThemeProvider>
  );
};

export default LayoutPage;
