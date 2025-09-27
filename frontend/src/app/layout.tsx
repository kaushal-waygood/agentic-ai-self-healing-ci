import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from '@/components/layout/theme-provider';
import StoreProvider from '../redux/storeProvider';
import Script from 'next/script';
import { cookies } from 'next/headers'; // This is a dynamic function
import { poppins, pt_sans } from './fonts';

export const metadata: Metadata = {
  title: 'Zobsai - Your AI Job Application Assistant',
  description:
    'Streamline your job application process with AI-powered tools and automation.',
};

// By making the component 'async', we enable the use of server-side hooks like cookies().
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This is the correct, official way to read cookies in a Server Component.
  // The Next.js framework understands this call and automatically makes this
  // component dynamically rendered on the server at request time.
  const cookieStore = cookies();
  const consentCookie = cookieStore.get('cookie_consent');

  let hasAnalyticsConsent = false;

  if (consentCookie) {
    try {
      const consentData = JSON.parse(consentCookie.value);
      if (consentData.analytics === true) {
        hasAnalyticsConsent = true;
      }
    } catch (e) {
      // It's good practice to handle potential JSON parsing errors.
      console.error('Could not parse cookie consent JSON:', e);
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* This conditional rendering based on a cookie is a perfect use case for a dynamic Server Component. */}
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
      </body>
    </html>
  );
}
