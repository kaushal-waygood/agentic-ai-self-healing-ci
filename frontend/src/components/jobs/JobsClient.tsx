'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import apiInstance from '@/services/api';
import { JobCard, JobCardSkeleton } from '@/components/JobCard';
import JobDetail from '@/components/JobDetail'; // your detail component
import { JobListing } from '@/lib/data/jobs';
import { X } from 'lucide-react';

type FetchState<T> = { data: T | null; loading: boolean; error: string | null };

function parseJobId(jobParam: string | null) {
  if (!jobParam) return null;
  const parts = jobParam.split('-');
  return parts.length ? parts[parts.length - 1] : null;
}

export default function JobsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobParam = searchParams.get('job');
  const activeJobId = parseJobId(jobParam);

  const [list, setList] = useState<FetchState<JobListing[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const [detail, setDetail] = useState<FetchState<JobListing>>({
    data: null,
    loading: false,
    error: null,
  });

  // Fetch jobs list
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setList((s) => ({ ...s, loading: true, error: null }));
        const res = await apiInstance.get('/students/jobs');
        if (!alive) return;
        setList({
          data: res.data?.data ?? res.data ?? [],
          loading: false,
          error: null,
        });
      } catch (err: any) {
        if (!alive) return;
        setList({
          data: null,
          loading: false,
          error: err?.message || 'Failed to load jobs',
        });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Fetch job detail when ?job= changes
  useEffect(() => {
    let alive = true;
    if (!activeJobId) {
      setDetail({ data: null, loading: false, error: null });
      return;
    }
    (async () => {
      try {
        setDetail((s) => ({ ...s, loading: true, error: null }));
        const res = await apiInstance.get(`/students/jobs/${activeJobId}`);
        if (!alive) return;
        setDetail({
          data: res.data?.data ?? res.data,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        if (!alive) return;
        setDetail({
          data: null,
          loading: false,
          error: err?.message || 'Failed to load job',
        });
      }
    })();
    return () => {
      alive = false;
    };
  }, [activeJobId]);

  const jobs = useMemo(() => list.data ?? [], [list.data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
      {/* Left: list */}
      <div className="lg:col-span-5 flex flex-col gap-2">
        {list.loading && !jobs.length ? (
          <>
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
          </>
        ) : list.error ? (
          <div className="text-sm text-red-600">{list.error}</div>
        ) : jobs.length === 0 ? (
          <div className="text-sm text-gray-500">No jobs found.</div>
        ) : (
          jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              isActive={activeJobId === job._id}
            />
          ))
        )}
      </div>

      {/* Right: detail panel */}
      <div className="lg:col-span-7">
        {!activeJobId ? (
          <div className="h-full min-h-[320px] rounded-xl border border-dashed border-gray-300 p-6 flex items-center justify-center text-gray-500">
            Select a job from the list to view details.
          </div>
        ) : detail.loading ? (
          <div className="h-full min-h-[320px] rounded-xl border p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-6 w-2/3 bg-gray-200 rounded" />
              <div className="h-4 w-1/2 bg-gray-200 rounded" />
              <div className="h-4 w-4/5 bg-gray-200 rounded" />
              <div className="h-4 w-3/5 bg-gray-200 rounded" />
            </div>
          </div>
        ) : detail.error ? (
          <div className="rounded-xl border p-6 text-red-600">
            {detail.error}
          </div>
        ) : (
          <div className="relative rounded-xl border p-0 bg-transparent">
            <JobDetail job={detail.data as JobListing} />
          </div>
        )}
      </div>
    </div>
  );
}
