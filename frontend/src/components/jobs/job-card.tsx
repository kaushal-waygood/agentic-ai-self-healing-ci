'use client';

import Image from 'next/image';
import { JobListing } from '@/lib/data/jobs';
import { MapPin, Clock, Building, Eye, TrendingUp } from 'lucide-react';
import { truncate } from '@/utils/formatTitle';
import apiInstance from '@/services/api';
import { useDispatch } from 'react-redux';
import {
  viewedJobsRequest,
  visitedJobsRequest,
} from '@/redux/reducers/jobReducer';
import { viewedJobs } from '@/services/api/student';

interface JobCardProps {
  job: JobListing;
  isActive?: boolean;
  onClick: () => void;
}

export function JobCard({ job, isActive = false, onClick }: JobCardProps) {
  const dispatch = useDispatch();
  const handleClick = async () => {
    try {
      // dispatch(viewedJobsRequest(job._id || job.slug));

      const response = await viewedJobs(job._id || job.slug);
      console.log('response', response);
      onClick();
    } catch (error) {
      console.error('Failed to log job view on click:', error);
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative  cursor-pointer transition-all duration-500 ease-out transform hover:-translate-y-1 ${
        isActive
          ? 'bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 border-2 border-purple-400 shadow-2xl shadow-purple-200/50 scale-[1.02]'
          : 'bg-white hover:bg-gradient-to-br hover:from-purple-50/50 hover:via-blue-50/30 hover:to-white border border-gray-200 hover:border-purple-300 shadow-md hover:shadow-2xl hover:shadow-purple-100/40'
      } rounded-xl p-2 px-3 overflow-hidden`}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 via-blue-600/0 to-cyan-600/0 group-hover:from-purple-600/5 group-hover:via-blue-600/5 group-hover:to-cyan-600/5 transition-all duration-700"></div>

      {/* Decorative corner element */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

      {/* Active indicator with pulse */}
      {isActive && (
        <>
          <div className="absolute top-3 right-3 w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse shadow-lg shadow-purple-500/50"></div>
          <div className="absolute top-3 right-3 w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-ping"></div>
        </>
      )}

      {/* New job badge */}
      {/* {job.views < 10 && (
        <div className="absolute top-3 left-3 z-20">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg shadow-amber-500/30 animate-in slide-in-from-left duration-500">
            <Zap className="w-3 h-3 fill-current" />
            <span>NEW</span>
          </div>
        </div>
      )} */}

      <div className="relative z-10">
        <div className="flex items-start gap-4">
          {/* Enhanced Logo Container */}
          <div className="relative flex-shrink-0">
            {job.logo ? (
              <div className="w-14 h-14   overflow-hidden  ring-purple-100 group-hover:ring-purple-300 transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:scale-110 transform">
                <Image
                  src={job.logo}
                  alt={job.company || 'Company Logo'}
                  className="w-full h-full object-contain  p-1"
                  width={100}
                  height={100}
                />
              </div>
            ) : (
              <div className="w-14 h-14  flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-cyan-100  ring-purple-100 group-hover:ring-purple-300 transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:scale-110 transform">
                {/* <Building2 className="w-7 h-7 text-purple-600" /> */}
                <Image
                  src={'/logo.png'}
                  alt={job.company || 'Company Logo'}
                  className="w-full h-full object-contain bg-white p-1"
                  width={100}
                  height={100}
                />
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0 ">
            {/* Job Title with gradient on hover */}
            <h5 className="text-base font-bold text-gray-900 group-hover:bg-gradient-to-r group-hover:from-purple-700 group-hover:to-blue-700 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 line-clamp-2 leading-tight">
              {truncate(job.title, 40)}
            </h5>

            {/* Company Name with enhanced styling */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-purple-600 group-hover:text-purple-700 transition-colors">
                <Building className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{truncate(job.company, 30)}</span>
              </div>
            </div>

            {/* Location with icon */}
            <div className="flex items-center gap-1.5 text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
              <span className="truncate">{job.location.city || 'Unknown'}</span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
                <Clock className="w-3.5 h-3.5 flex-shrink-0 text-purple-400" />
                <span className="font-medium">
                  {job.jobPosted || 'unknown'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-gray-100 to-gray-50 group-hover:from-purple-100 group-hover:to-blue-100 rounded-full transition-all duration-300 shadow-sm group-hover:shadow-md">
                <Eye className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                <span className="text-xs font-semibold text-gray-600 group-hover:text-purple-700 transition-colors">
                  {job.views}
                </span>
              </div>
            </div>

            {job.views > 100 && (
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
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-200 to-gray-100 animate-pulse"></div>

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
