// 'use client';

// import Image from 'next/image';
// import { JobListing } from '@/lib/data/jobs';
// import {
//   MapPin,
//   Briefcase,
//   Clock,
//   Building,
//   View,
//   Eye,
//   EyeClosed,
// } from 'lucide-react';
// import { truncate } from '@/utils/formatTitle';
// import { Skeleton } from '@/components/ui/skeleton';
// import apiInstance from '@/services/api';
// import { useEffect } from 'react';

// interface JobCardProps {
//   job: JobListing;
//   isActive?: boolean;
//   onClick: () => void;
// }

// export function JobCard({ job, isActive = false, onClick }: JobCardProps) {
//   const handleClick = async () => {
//     try {
//       console.log('Viewing job:', job.slug);
//       // This call is fine, it only runs on click when job exists.
//       await apiInstance.post(`/students/job/viewed/${job.slug}`);
//       onClick();
//     } catch (error) {
//       console.error('Failed to log job view on click:', error);
//       // Still call onClick so the UI updates even if the API fails.
//       onClick();
//     }
//   };

//   // ✅ FIX: The useEffect hook is now protected and has the correct dependency.
//   useEffect(() => {
//     // 1. Guard Clause: Prevents the API call if job or job._id is missing.
//     if (!job?._id) {
//       return;
//     }

//     const isVisited = async () => {
//       try {
//         const response = await apiInstance.get(
//           `/students/jobs/is-visited/${job._id}`,
//         );
//         // You can use the response data here to update state if needed
//         // For example: setIsViewed(response.data.isVisited);
//       } catch (error) {
//         // Silently fail or handle error as needed
//         console.error('Failed to check if job was visited.', error);
//       }
//     };

//     isVisited();
//   }, [job]); // 2. Dependency Array: Ensures the effect runs when the 'job' prop is available.

//   return (
//     <div
//       onClick={handleClick}
//       className={`group relative  cursor-pointer transition-all duration-300 ease-out transform  ${
//         isActive
//           ? ' bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-400 '
//           : 'bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 border border-gray-200 hover:border-purple-300 shadow-lg hover:shadow-xl hover:shadow-purple-100/30'
//       } rounded-2xl py-2 px-2 overflow-hidden`}
//     >
//       <div className=" absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
//       {isActive && (
//         <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
//       )}

//       <div className="relative z-10  ">
//         <div className="flex items-start gap-4 ">
//           {job.logo ? (
//             <img
//               src={job.logo}
//               alt={job.company || 'Company Logo'}
//               className="w-12 h-12 object-contain rounded"
//             />
//           ) : (
//             <div className="w-12 h-12  rounded-lg flex items-center justify-center ">
//               <Image width={32} height={32} src="/logo.png" alt="abc" />
//             </div>
//           )}
//           <div className="flex-1 min-w-0">
//             <h5 className=" text-gray-900  group-hover:text-purple-700 transition-colors line-clamp-2 ">
//               {truncate(job.title, 35)}
//             </h5>

//             <div className="text-xs  ">
//               <div className="flex items-center gap-2 text-purple-500 font-semibold ">
//                 <span>{truncate(job.company, 35)}</span>
//               </div>

//               <div className="flex items-center gap-2 ">
//                 <span>{job.location.city}</span>
//               </div>
//               <div className="flex items-center justify-between gap-2">
//                 <span>{'4 hour ago'}</span>
//                 <div className="flex items-center gap-1">
//                   <Eye className="h-4 w-4 text-gray-400" />
//                   <span>{job.views} </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // JobCardSkeleton remains the same
// export function JobCardSkeleton() {
//   return (
//     <div className="bg-white border border-gray-200 rounded-2xl p-6">
//       <div className="flex items-start gap-4 mb-4">
//         <Skeleton className="w-12 h-12 rounded-xl" />
//         <div className="flex-1 space-y-2">
//           <Skeleton className="h-5 w-3/4 rounded-md" />
//           <Skeleton className="h-4 w-1/2 rounded-md" />
//         </div>
//       </div>
//       <div className="space-y-2">
//         <Skeleton className="h-4 w-5/6 rounded-md" />
//         <Skeleton className="h-4 w-2/3 rounded-md" />
//         <Skeleton className="h-4 w-3/4 rounded-md" />
//       </div>
//     </div>
//   );
// }
'use client';

import Image from 'next/image';
import { JobListing } from '@/lib/data/jobs';
import {
  MapPin,
  Briefcase,
  Clock,
  Building,
  View,
  Eye,
  EyeClosed,
  TrendingUp,
  Zap,
  Building2,
} from 'lucide-react';
import { truncate } from '@/utils/formatTitle';
import { Skeleton } from '@/components/ui/skeleton';
import apiInstance from '@/services/api';
import { useEffect } from 'react';

interface JobCardProps {
  job: JobListing;
  isActive?: boolean;
  onClick: () => void;
}

export function JobCard({ job, isActive = false, onClick }: JobCardProps) {
  const handleClick = async () => {
    try {
      console.log('Viewing job:', job.slug);
      await apiInstance.post(`/students/job/viewed/${job.slug}`);
      onClick();
    } catch (error) {
      console.error('Failed to log job view on click:', error);
      onClick();
    }
  };

  useEffect(() => {
    if (!job?._id) {
      return;
    }

    const isVisited = async () => {
      try {
        const response = await apiInstance.get(
          `/students/jobs/is-visited/${job._id}`,
        );
      } catch (error) {
        console.error('Failed to check if job was visited.', error);
      }
    };

    isVisited();
  }, [job]);

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
                <img
                  src={job.logo}
                  alt={job.company || 'Company Logo'}
                  className="w-full h-full object-contain  p-1"
                />
              </div>
            ) : (
              <div className="w-14 h-14  flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-cyan-100  ring-purple-100 group-hover:ring-purple-300 transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:scale-110 transform">
                {/* <Building2 className="w-7 h-7 text-purple-600" /> */}
                <img
                  src={'/logo.png'}
                  alt={job.company || 'Company Logo'}
                  className="w-full h-full object-contain bg-white p-1"
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
              <span className="truncate">{job.location.city}</span>
            </div>

            {/* Bottom info row with enhanced styling */}
            <div className="flex items-center justify-between gap-3 pt-1">
              {/* Time ago with clock icon */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
                <Clock className="w-3.5 h-3.5 flex-shrink-0 text-purple-400" />
                <span className="font-medium">4 hours ago</span>
              </div>

              {/* Views counter with enhanced design */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-gray-100 to-gray-50 group-hover:from-purple-100 group-hover:to-blue-100 rounded-full transition-all duration-300 shadow-sm group-hover:shadow-md">
                <Eye className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                <span className="text-xs font-semibold text-gray-600 group-hover:text-purple-700 transition-colors">
                  {job.views}
                </span>
              </div>
            </div>

            {/* Trending indicator for high-view jobs */}
            {job.views > 100 && (
              <div className="flex items-center gap-1 text-xs font-semibold text-green-600 animate-in fade-in duration-500">
                <TrendingUp className="w-3 h-3" />
                <span>Trending</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom border accent */}
        {/* <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-2xl"></div> */}
      </div>
    </div>
  );
}

// Enhanced JobCardSkeleton with modern shimmer effect
export function JobCardSkeleton() {
  return (
    <div className="relative bg-white border border-gray-200 rounded-2xl p-4 overflow-hidden">
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>

      <div className="flex items-start gap-4 mb-3">
        {/* Logo skeleton with gradient */}
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
