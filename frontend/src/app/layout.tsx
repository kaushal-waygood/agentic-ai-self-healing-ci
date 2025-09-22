import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from '@/components/layout/theme-provider';
import StoreProvider from '../redux/storeProvider';
import { Navigation } from '@/components/layout/site-header';
import { Footer } from '@/components/layout/footer';
import Script from 'next/script';
import { cookies } from 'next/headers';
import CookieConsent from '@/components/CookieConsent';
import { poppins, pt_sans } from './fonts';

export const metadata: Metadata = {
  title: 'Zobsai - Your AI Job Application Assistant',
  description:
    'Streamline your job application process with AI-powered tools and automation.',
};

export default async function RootLayout({ children }) {
  // Check for cookie consent on the server. This is the correct way.
  const cookieStorePromise = cookies();
  const [cookieStore] = [await cookieStorePromise];
  const consent = cookieStore.get('cc_accepted_categories');
  const hasAnalyticsConsent = !!consent?.value.includes('analytics');

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${poppins.variable} ${pt_sans.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        {/* Conditionally load Google Analytics scripts using the environment variable */}
        {hasAnalyticsConsent && 'G-6RKXBX7Y5K' && (
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

        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* This provider now handles Redux Persist correctly */}
          <StoreProvider>
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
            <Toaster />
            <Analytics />
            <CookieConsent />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
