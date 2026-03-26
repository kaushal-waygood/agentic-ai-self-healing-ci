'use client';

import Image from 'next/image';
import { JobListing } from '@/lib/data/jobs';
import { MapPin, Clock, Building, Eye, TrendingUp } from 'lucide-react';
import { truncate } from '@/utils/formatTitle';

interface JobCardProps {
  job: JobListing;
  isActive?: boolean;
  onClick?: () => void;
  jobViews?: number;
  jobPosted?: string;
}

const calculateJobPostedFromNow = (jobPostedAt: string) => {
  const date = new Date(jobPostedAt);
  if (Number.isNaN(date.getTime())) {
    return 'Date not available';
  }

  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffInDays === 0) {
    return 'Today';
  }

  if (diffInDays < 0) {
    return 'In the future';
  }

  return `${diffInDays} days ago`;
};

/**
 * Build the best possible one-line location label for a job.
 * Priority: city > state > country. Falls back to "Remote" for remote jobs
 * with no location, and "Location N/A" only as a last resort.
 */
function formatLocation(job: any): string {
  const city = job.location?.city?.trim();
  const state = job.location?.state?.trim();
  const country = (job.country || job.location?.country)?.trim();

  const parts: string[] = [];
  if (city) parts.push(city);
  if (state && state !== city) parts.push(state);
  if (country && parts.length === 0) parts.push(country); // only add country when nothing else

  if (parts.length > 0) return parts.join(', ');
  if (job.remote) return 'Remote';
  return 'Location N/A';
}

export function JobCard({ job, isActive = false, onClick }: JobCardProps) {
  return (
    <div
      onClick={onClick}
      className={`group relative cursor-pointer overflow-hidden rounded-[24px] transition-all duration-300 ease-out ${
        isActive
          ? 'border border-sky-300 bg-gradient-to-br from-sky-50 via-white to-cyan-50 shadow-[0_18px_40px_rgba(14,116,144,0.12)] ring-1 ring-sky-200/70'
          : 'border border-slate-200/90 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_34px_rgba(15,23,42,0.10)]'
      } p-4`}
    >
      {isActive && (
        <div className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-gradient-to-b from-sky-500 to-cyan-500" />
      )}

      <div className="relative z-10">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="relative flex-shrink-0">
            {job.logo ? (
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 group-hover:border-sky-200 group-hover:shadow-md">
                <Image
                  src={job.logo}
                  alt={job.company || 'Company Logo'}
                  className="h-full w-full object-contain p-2"
                  width={100}
                  height={100}
                />
              </div>
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-sky-50 to-cyan-50 shadow-sm transition-all duration-300 group-hover:border-sky-200 group-hover:shadow-md">
                <Image
                  src="/logo.png"
                  alt={job.company || 'Company Logo'}
                  className="h-full w-full object-contain bg-white p-2"
                  width={100}
                  height={100}
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h5 className="line-clamp-2 text-[15px] font-semibold leading-6 text-slate-900 transition-colors duration-300 group-hover:text-sky-700">
                  {truncate(job.title, 46)}
                </h5>
              </div>

              <div className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                {calculateJobPostedFromNow(job.jobPostedAt ?? '')}
              </div>
            </div>

            {/* Company */}
            <div className="mb-2 flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 transition-colors group-hover:text-slate-900">
                <Building className="h-3.5 w-3.5 flex-shrink-0 text-sky-600" />
                <span className="truncate">{truncate(job.company, 30)}</span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors group-hover:text-slate-700">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-cyan-600" />
              <span className="truncate">
                {job.remote && !job.location?.city && !job.location?.state ? (
                  <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Remote
                  </span>
                ) : (
                  formatLocation(job)
                )}
              </span>
            </div>

            {/* Meta */}
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 transition-colors group-hover:text-slate-700">
                <Clock className="h-3.5 w-3.5 flex-shrink-0 text-sky-500" />
                <span className="font-medium">Fresh listing</span>
              </div>

              <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 transition-all duration-300 group-hover:border-sky-200 group-hover:bg-sky-50 group-hover:text-sky-700">
                <Eye className="h-3.5 w-3.5 text-slate-400 transition-colors group-hover:text-sky-600" />
                <span>
                  {job.jobViews}
                </span>
              </div>
            </div>

            {(job.jobViews ?? 0) > 100 && (
              <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <TrendingUp className="h-3 w-3" />
                <span>Trending</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>

      <div className="flex items-start gap-4 mb-3">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-100 animate-pulse"></div>

        <div className="flex-1 space-y-3">
          {/* Title skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-4/5 rounded-lg bg-gradient-to-r from-slate-200 to-slate-100 animate-pulse"></div>
            <div className="h-4 w-3/5 rounded-lg bg-gradient-to-r from-slate-200 to-slate-100 animate-pulse"></div>
          </div>

          {/* Company skeleton */}
          <div className="h-3.5 w-2/5 rounded-lg bg-gradient-to-r from-sky-100 to-cyan-100 animate-pulse"></div>

          {/* Location skeleton */}
          <div className="h-3 w-2/4 rounded-lg bg-gradient-to-r from-slate-200 to-slate-100 animate-pulse"></div>

          {/* Bottom info skeleton */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="h-3 w-24 rounded-lg bg-gradient-to-r from-slate-200 to-slate-100 animate-pulse"></div>
            <div className="h-6 w-16 rounded-full bg-gradient-to-r from-slate-200 to-slate-100 animate-pulse"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
