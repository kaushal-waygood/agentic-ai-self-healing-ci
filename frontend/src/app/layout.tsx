import './globals.css';
import { poppins, pt_sans } from './fonts';
import 'driver.js/dist/driver.css';
import './driver-custom.css';

import { zobsAiHomeMetadata } from '@/metadata/metadata';
import LayoutPage from './LayoutPage';
import Script from 'next/script';
import { Metadata } from 'next';
import NextTopLoader from 'nextjs-toploader';
import Clarity from '@microsoft/clarity';
import { Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';

// 1. Fully Expanded Metadata
export const metadata: Metadata = {
  title: zobsAiHomeMetadata.title,
  description: zobsAiHomeMetadata.description,
  keywords: zobsAiHomeMetadata.keywords,
  metadataBase: new URL('https://zobsai.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: zobsAiHomeMetadata.title,
    description: zobsAiHomeMetadata.description,
    url: 'https://zobsai.com',
    siteName: 'ZobsAI',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://zobsai.com/logo.png', // Ensure this exists in your public folder
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 2. Schema Object
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://zobsai.com/#organization',
        name: 'ZobsAI',
        url: 'https://zobsai.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://zobsai.com/logo.png',
        },
        sameAs: [
          'https://www.linkedin.com/company/zobsai-com/',
          'https://www.instagram.com/zobsai.co/',
          'https://www.facebook.com/zobsai.co',
        ],
        description:
          'ZobsAI is an AI-powered career and hiring platform helping students, job seekers, and recruiters automate job applications, optimize resumes, and discover global career opportunities.',
      },
      {
        '@type': 'WebSite',
        '@id': 'https://zobsai.com/#website',
        url: 'https://zobsai.com',
        name: 'ZobsAI',
        publisher: { '@id': 'https://zobsai.com/#organization' },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://zobsai.com/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': 'https://zobsai.com/#software',
        name: 'ZobsAI Platform',
        operatingSystem: 'Web',
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Career & Recruitment Platform',
        url: 'https://zobsai.com',
        description:
          'ZobsAI is an AI-driven job search and recruitment platform offering resume optimization, AI auto-apply, global job discovery, and campus ambassador programs.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        publisher: { '@id': 'https://zobsai.com/#organization' },
      },
    ],
  };

  // const projectId = 'vi5ne0i7kt';
  const projectId = 'vi4y7xtc9c';

  Clarity.init(projectId);

  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="9trSliJlM2HKVWMlq1MfSfbYH58MtDebWTl1nHUZ_rk"
        />
        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-NTPZ57GVC2"
        />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-NTPZ57GVC2');
          `}
        </Script>

        {/* 3. JSON-LD Schema Injection */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${poppins.variable} ${pt_sans.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        <NextTopLoader
          color="#2563eb" // Change this to your preferred color
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #2563eb,0 0 5px #2563eb"
        />
        <LayoutPage>
          <Suspense fallback={null}>
            {children} <Toaster />
          </Suspense>
        </LayoutPage>
      </body>
    </html>
  );
}
