import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from '@/components/layout/theme-provider';
import StoreProvider from '../redux/storeProvider';
import Script from 'next/script';
import { cookies } from 'next/headers'; // This is a dynamic function
import { poppins, pt_sans } from './fonts';

import { zobsAiHomeMetadata } from '@/metadata/metadata';

export const metadata = {
  title: zobsAiHomeMetadata.title,
  description: zobsAiHomeMetadata.description,
  keywords: zobsAiHomeMetadata.keywords,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const cookieStore = cookies();
  // const consentCookie = cookieStore.get('cookie_consent');

  // let hasAnalyticsConsent = false;

  // if (consentCookie) {
  //   try {
  //     const consentData = JSON.parse(consentCookie.value);
  //     if (consentData.analytics === true) {
  //       hasAnalyticsConsent = true;
  //     }
  //   } catch (e) {
  //     console.error('Could not parse cookie consent JSON:', e);
  //   }
  // }

  return (
    <html lang="en" suppressHydrationWarning>
      {/* <head>
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
      </head> */}
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
      </body>
    </html>
  );
}
