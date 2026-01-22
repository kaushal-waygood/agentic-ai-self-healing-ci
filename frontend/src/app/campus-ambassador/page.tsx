import React from 'react';
import { Metadata } from 'next';
import ZobsCampusAmbassador from '@/components/campus-ambassador/ZobsCampusAmbassador';
import { Navigation } from '@/components/layout/site-header';
import { Footer } from '@/components/layout/footer';
import { CampusAmbassadorMetadata } from '@/metadata/metadata';

// FULL METADATA OBJECT
export const metadata: Metadata = {
  // Standard SEO
  title:
    CampusAmbassadorMetadata.title ||
    'ZobsAI Campus Ambassador Program | Empower Your Campus',
  description:
    CampusAmbassadorMetadata.description ||
    'Join the ZobsAI Campus Ambassador Program to build leadership skills, empower with AI career tools, grow community engagement and unlock rewards. Apply today!',
  keywords: CampusAmbassadorMetadata.keywords || [
    'ZobsAI',
    'Campus Ambassador',
    'AI career tools',
    'Leadership skills',
    'Student Program',
  ],

  // OpenGraph (Facebook, LinkedIn, Discord)
  openGraph: {
    title: 'ZobsAI Campus Ambassador Program | Empower Your Campus',
    description:
      'Join the ZobsAI Campus Ambassador Program to build leadership skills and unlock rewards.',
    url: 'https://zobsai.com/campus-ambassador',
    siteName: 'ZobsAI',
    images: [
      {
        url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
        width: 800,
        height: 600,
        alt: 'ZobsAI Campus Ambassador Program Image',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'ZobsAI Campus Ambassador Program',
    description:
      'Empower your campus with AI career tools and grow your community.',
    images: [
      'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    creator: '@ZobsAI',
  },
};

const Page = () => {
  return (
    <div>
      <Navigation />
      <main>
        <ZobsCampusAmbassador />
      </main>
      <Footer />
    </div>
  );
};

export default Page;
