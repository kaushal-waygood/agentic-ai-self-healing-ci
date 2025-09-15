import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from '@/components/layout/theme-provider';
import StoreProvider from '../redux/storeProvider';

export const metadata: Metadata = {
  title: 'Zobsai - Your AI Job Application Assistant',
  description:
    'Streamline your job application process with AI-powered tools and automation.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="font-body antialiased min-h-screen bg-background text-foreground"
        suppressHydrationWarning={false}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <StoreProvider>
            {children}
            <Toaster />
            <Analytics />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
