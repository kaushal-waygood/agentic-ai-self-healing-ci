import './globals.css';
import { poppins, pt_sans } from './fonts';
import 'driver.js/dist/driver.css';
import './driver-custom.css';

import { zobsAiHomeMetadata } from '@/metadata/metadata';
import LayoutPage from './LayoutPage';
import Head from 'next/head';
import Script from 'next/script';

export const metadata = {
  title: zobsAiHomeMetadata.title,
  description: zobsAiHomeMetadata.description,
  keywords: zobsAiHomeMetadata.keywords,
  alternates: {
    canonical: 'https://www.zobsai.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-NTPZ57GVC2"
        />
        <Script id="google-analytics">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-NTPZ57GVC2');
          `}
        </Script>
      </head>
      <body
        className={`${poppins.variable} ${pt_sans.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        <LayoutPage>{children}</LayoutPage>
      </body>
    </html>
  );
}
