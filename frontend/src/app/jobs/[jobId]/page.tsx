import React from 'react';
import { Metadata } from 'next';
import JobDetailPage from './components/jobDetailPage';
import { jobDetailsMetadata } from '@/metadata/metadata';
import { Navigation } from '@/components/layout/site-header';
// We do NOT import apiInstance here to avoid the 'use client' conflict

// 1. Define Base URL for Server Side (or import from a shared config file)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_NODE_ENV === 'production'
    ? 'https://api.zobsai.com/api/v1'
    : process.env.NEXT_PUBLIC_NODE_ENV === 'development'
    ? 'https://api.dev.zobsai.com/api/v1'
    : 'http://127.0.0.1:8080/api/v1';

type Props = {
  params: { jobId: string }; // Changed to 'jobId' to match your folder name [jobId]
};

// 2. Fetch function using native 'fetch' (Works on Server)
const fetchJobForMetadata = async (jobId: string) => {
  try {
    // Using native fetch is better for Next.js Server Components
    const res = await fetch(`${API_BASE_URL}/jobs/find?slug=${jobId}`, {
      next: { revalidate: 60 }, // Optional: Cache data for 60 seconds
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.singleJob;
  } catch (error) {
    console.error('Error fetching job metadata:', error);
    return null;
  }
};

// 3. Generate Metadata (Runs on Server)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const job = await fetchJobForMetadata(params.jobId);

  if (!job) {
    return {
      title: jobDetailsMetadata.title,
      description: jobDetailsMetadata.description,
    };
  }

  return {
    title: `${job.title} | Zobsai`,
    description: job.shortDescription || job.description?.slice(0, 160),
    keywords: [job.category, ...(jobDetailsMetadata.keywords || [])],
    openGraph: {
      title: job.title,
      description: job.shortDescription,
      // images: [job.companyLogo], // If you have an image
    },
  };
}

// 4. Page Component
const Page = ({ params }: Props) => {
  return (
    <>
      <Navigation />
      <div className="container">
        {/* Pass jobId so the client component can fetch its own data if needed, 
            or pass the initial data if you want to pre-fill it */}
        <JobDetailPage jobId={params.jobId} />
      </div>
    </>
  );
};

export default Page;
