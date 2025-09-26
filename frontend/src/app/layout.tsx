// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from '@/components/layout/theme-provider';
import StoreProvider from '../redux/storeProvider';
import Script from 'next/script';
import { cookies } from 'next/headers';
import CookieConsent from '@/components/CookieConsent'; // Ensure this path is correct
import { poppins, pt_sans } from './fonts';

export const metadata: Metadata = {
  title: 'Zobsai - Your AI Job Application Assistant',
  description:
    'Streamline your job application process with AI-powered tools and automation.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Read the cookie set by the CookieConsent component
  const cookieStore = cookies();
  const consentCookie = cookieStore.get('cookie_consent');

  let hasAnalyticsConsent = false;

  // 2. Safely parse the JSON and check for the 'analytics' property
  if (consentCookie) {
    try {
      const consentData = JSON.parse(consentCookie.value);
      if (consentData.analytics === true) {
        hasAnalyticsConsent = true;
      }
    } catch (e) {
      console.error('Could not parse cookie consent JSON:', e);
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* 3. This conditional logic now works correctly with the new component */}
        {hasAnalyticsConsent && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=G-6RKXBX7Y5K`}
            />
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'G-6RKXBX7Y5K');
                `,
              }}
            />
          </>
        )}
      </head>
      <body
        className={`${poppins.variable} ${pt_sans.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <StoreProvider>
            <div className="flex flex-col min-h-screen">
              <main className="flex-grow">{children}</main>
            </div>
            <Toaster />
            <Analytics />
          </StoreProvider>
        </ThemeProvider>

        {/* 4. Add the CookieConsent component here */}
        <CookieConsent />
      </body>
    </html>
  );
}
