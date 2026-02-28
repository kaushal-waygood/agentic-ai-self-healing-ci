import React from 'react';
import { Metadata } from 'next';
import JobDetailPage from './components/jobDetailPage';
import { jobDetailsMetadata } from '@/metadata/metadata';
import { Navigation } from '@/components/layout/site-header';

const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://api.zobsai.com/api/v1'
    : process.env.NODE_ENV === 'development'
      ? 'https://api.dev.zobsai.com/api/v1'
      : 'http://127.0.0.1:8080/api/v1';

type PageProps = {
  params: Promise<{ jobId: string }>;
};

// Server fetch
async function fetchJobForMetadata(jobId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      cache: 'no-store',
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// Metadata
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { jobId } = await params;
  const job = await fetchJobForMetadata(jobId);

  if (!job) {
    return {
      title: jobDetailsMetadata.title,
      description: jobDetailsMetadata.description,
    };
  }

  return {
    title: `${job.job.title} | Zobsai`,
    description: job.job.shortDescription ?? job.job.description?.slice(0, 160),
    keywords: [job.job.category, ...(jobDetailsMetadata.keywords || [])],
    openGraph: {
      title: job.job.title,
      description: job.job.shortDescription,
    },
  };
}

// ✅ Page MUST be async
const Page = async ({ params }: PageProps) => {
  const { jobId } = await params;

  return (
    <>
      <Navigation />
      <div className="container">
        <JobDetailPage jobId={jobId} />
      </div>
    </>
  );
};

export default Page;
