'use client';

import { memo, useCallback, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { JobListing } from '@/lib/data/jobs';
import {
  MapPin,
  Briefcase,
  Clock,
  Building,
  Eye,
  TrendingUp,
} from 'lucide-react';
import { truncate } from '@/utils/formatTitle';
import apiInstance from '@/services/api';
import { useDispatch } from 'react-redux';
import { visitedJobsRequest } from '@/redux/reducers/jobReducer';

interface JobCardProps {
  job: JobListing;
  isActive?: boolean;
  onClick: () => void;
}

const JobCardBase = ({ job, isActive = false, onClick }: JobCardProps) => {
  const dispatch = useDispatch();

  const handleClick = useCallback(async () => {
    try {
      // keep behavior: log visit then fire parent onClick
      await dispatch(visitedJobsRequest(job._id) as any);
    } catch (error) {
      console.error('Failed to log job view on click:', error);
    } finally {
      onClick();
    }
  }, [dispatch, job._id, onClick]);

  // Keep the "is visited" check, but don’t leak requests or ignore aborts
  useEffect(() => {
    if (!job?._id) return;

    const controller = new AbortController();

    (async () => {
      try {
        await apiInstance.get(`/students/jobs/is-visited/${job._id}`, {
          signal: controller.signal,
        });
        // Response unused by original code; we keep behavior intact.
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Failed to check if job was visited.', error);
        }
      }
    })();

    return () => controller.abort();
  }, [job?._id]);

  const title = job?.title ?? '';
  const company = job?.company ?? 'Unknown Company';
  const city = job?.location?.city ?? 'Not specified';
  const views = Number.isFinite(job?.views as any) ? (job.views as number) : 0;
  const logo = job?.logo ?? '/logo.png';
  const jobType =
    Array.isArray(job?.jobTypes) && job.jobTypes.length > 0
      ? job.jobTypes[0]
      : undefined;

  const isTrending = useMemo(() => views > 100, [views]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`group relative cursor-pointer transition-all duration-500 ease-out transform hover:-translate-y-1 rounded-xl p-2 px-3 overflow-hidden ${
        isActive
          ? 'bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 border-2 border-purple-400 shadow-2xl shadow-purple-200/50 scale-[1.02]'
          : 'bg-white hover:bg-gradient-to-br hover:from-purple-50/50 hover:via-blue-50/30 hover:to-white border border-gray-200 hover:border-purple-300 shadow-md hover:shadow-2xl hover:shadow-purple-100/40'
      }`}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 via-blue-600/0 to-cyan-600/0 group-hover:from-purple-600/5 group-hover:via-blue-600/5 group-hover:to-cyan-600/5 transition-all duration-700" />

      {/* Decorative corner element */}
      <div className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

      {/* Active indicator with pulse */}
      {isActive && (
        <>
          <div className="absolute top-3 right-3 w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse shadow-lg shadow-purple-500/50" />
          <div className="absolute top-3 right-3 w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-ping" />
        </>
      )}

      <div className="relative z-10">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 overflow-hidden ring-purple-100 group-hover:ring-purple-300 transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:scale-110 transform bg-white rounded-none">
              <Image
                src={logo}
                alt={company || 'Company Logo'}
                width={56}
                height={56}
                className="object-contain w-full h-full p-1"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h5 className="text-base font-bold text-gray-900 group-hover:bg-gradient-to-r group-hover:from-purple-700 group-hover:to-blue-700 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 line-clamp-2 leading-tight">
              {truncate(title, 40)}
            </h5>

            {/* Company */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-purple-600 group-hover:text-purple-700 transition-colors">
                <Building className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{truncate(company, 30)}</span>
              </div>
              {jobType && (
                <div className="ml-1 text-xs text-gray-500 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span className="capitalize">{jobType}</span>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-1.5 text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
              <span className="truncate">{city}</span>
            </div>

            {/* Bottom info row */}
            <div className="flex items-center justify-between gap-3 pt-1">
              {/* Time ago (static text preserved) */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
                <Clock className="w-3.5 h-3.5 flex-shrink-0 text-purple-400" />
                <span className="font-medium">4 hours ago</span>
              </div>

              {/* Views */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-gray-100 to-gray-50 group-hover:from-purple-100 group-hover:to-blue-100 rounded-full transition-all duration-300 shadow-sm group-hover:shadow-md">
                <Eye className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                <span className="text-xs font-semibold text-gray-600 group-hover:text-purple-700 transition-colors">
                  {views}
                </span>
              </div>
            </div>

            {/* Trending flag */}
            {isTrending && (
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
};

export const JobCard = memo(JobCardBase);

// Skeleton stays visually identical; trimmed to essentials and no unused imports
export function JobCardSkeleton() {
  return (
    <div className="relative bg-white border border-gray-200 rounded-2xl p-4 overflow-hidden">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />

      <div className="flex items-start gap-4 mb-3">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-200 to-gray-100 animate-pulse" />

        <div className="flex-1 space-y-3">
          <div className="space-y-2">
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-4/5 animate-pulse" />
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-3/5 animate-pulse" />
          </div>

          <div className="h-3.5 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg w-2/5 animate-pulse" />
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-2/4 animate-pulse" />

          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-24 animate-pulse" />
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full w-16 animate-pulse" />
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
