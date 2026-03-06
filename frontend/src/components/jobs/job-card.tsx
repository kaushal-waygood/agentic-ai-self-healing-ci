'use client';

import Image from 'next/image';
import { JobListing } from '@/lib/data/jobs';
import { MapPin, Clock, Building, Eye, TrendingUp } from 'lucide-react';
import { truncate } from '@/utils/formatTitle';
import { useJobs } from '@/hooks/jobs/useJobs';

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
  console.log('job', job);
  return (
    <div
      onClick={onClick}
      className={`group relative cursor-pointer transition-all duration-500 ease-out transform hover:-translate-y-1 ${
        isActive
          ? 'bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 border-2 border-blue-400 shadow-2xl shadow-blue-200/50 scale-[1.02]'
          : 'bg-white hover:bg-gradient-to-br hover:from-purple-50/50 hover:via-blue-50/30 hover:to-white border border-gray-200 hover:border-blue-300 shadow-md hover:shadow-2xl hover:shadow-blue-100/40'
      } rounded-lg p-2 px-3 overflow-hidden`}
    >
      <div className="relative z-10">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="relative flex-shrink-0">
            {job.logo ? (
              <div className="w-14 h-14 overflow-hidden ring-purple-100 group-hover:ring-purple-300 transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:scale-110 transform">
                <Image
                  src={job.logo}
                  alt={job.company || 'Company Logo'}
                  className="w-full h-full object-contain p-1"
                  width={100}
                  height={100}
                />
              </div>
            ) : (
              <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-cyan-100 ring-purple-100 group-hover:ring-purple-300 transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:scale-110 transform">
                <Image
                  src="/logo.png"
                  alt={job.company || 'Company Logo'}
                  className="w-full h-full object-contain bg-white p-1"
                  width={100}
                  height={100}
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h5 className="text-base font-semibold text-gray-900 group-hover:bg-gradient-to-r group-hover:from-purple-700 group-hover:to-blue-700 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 line-clamp-2 leading-tight">
              {truncate(job.title, 40)}
            </h5>

            {/* Company */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-purple-600 group-hover:text-purple-700 transition-colors">
                <Building className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{truncate(job.company, 30)}</span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1.5 text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
              <span className="truncate">
                {job.remote && !job.location?.city && !job.location?.state ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    Remote
                  </span>
                ) : (
                  formatLocation(job)
                )}
              </span>
            </div>

            {/* Meta */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
                <Clock className="w-3.5 h-3.5 flex-shrink-0 text-purple-400" />
                <span className="font-medium">
                  {calculateJobPostedFromNow(job.jobPostedAt ?? '')}
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-gray-100 to-gray-50 group-hover:from-purple-100 group-hover:to-blue-100 rounded-full transition-all duration-300 shadow-sm group-hover:shadow-md">
                <Eye className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                <span className="text-xs font-semibold text-gray-600 group-hover:text-purple-700 transition-colors">
                  {job.jobViews}
                </span>
              </div>
            </div>

            {(job.jobViews ?? 0) > 100 && (
              <div className="flex items-center gap-1 text-xs font-semibold text-green-600 animate-in fade-in duration-500">
                <TrendingUp className="w-3 h-3" />
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
    <div className="relative bg-white border border-gray-200 rounded-2xl p-4 overflow-hidden">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>

      <div className="flex items-start gap-4 mb-3">
        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-gray-200 to-gray-100 animate-pulse"></div>

        <div className="flex-1 space-y-3">
          {/* Title skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-4/5 animate-pulse"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-3/5 animate-pulse"></div>
          </div>

          {/* Company skeleton */}
          <div className="h-3.5 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg w-2/5 animate-pulse"></div>

          {/* Location skeleton */}
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-2/4 animate-pulse"></div>

          {/* Bottom info skeleton */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-24 animate-pulse"></div>
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full w-16 animate-pulse"></div>
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
