// 'use client';

// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { Filter, Bookmark, Send, Eye } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';
// import { ApplicationRow, StatCard } from './statusConfig';
// import { useRouter, useSearchParams } from 'next/navigation';
// import apiInstance from '@/services/api';
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState } from '@/redux/rootReducer';
// import { getStudentStatsRequest } from '@/redux/reducers/studentReducer';
// import { Loader } from '@/components/Loader';

// interface Application {
//   id: string;
//   job: {
//     title: string;
//     company: string;
//     slug: string;
//   };
//   status: string;
//   appliedAt: string;
// }

// const extendedApplicationStatuses = [
//   'Saved',
//   'Applied',
//   'Visited',
//   'Viewed',
//   'applications', // This represents your tailored applications
// ];

// export default function ApplicationsPage() {
//   const [applications, setApplications] = useState<Application[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   const { stats: jobStats } = useSelector((state: RootState) => state.student);

//   const { toast } = useToast();
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const [statusFilter, setStatusFilter] = useState(
//     searchParams.get('status') || 'Saved',
//   );

//   const dispatch = useDispatch();

//   useEffect(() => {
//     dispatch(getStudentStatsRequest());
//   }, [dispatch]);

//   useEffect(() => {
//     const fetchApplications = async () => {
//       setIsLoading(true);
//       try {
//         let response;
//         let rawData = [];
//         let statusLabel = 'Saved';

//         switch (statusFilter) {
//           case 'Applied':
//             response = await apiInstance.get(
//               '/students/jobs/events?type=APPLIED',
//             );
//             rawData = response.data.jobs || [];
//             statusLabel = 'Applied';
//             break;
//           case 'Visited':
//             response = await apiInstance.get(
//               `/students/jobs/events?type=VISIT`,
//             );
//             rawData = response.data.jobs || [];
//             statusLabel = 'Visited';
//             break;
//           case 'Viewed':
//             response = await apiInstance.get(`/students/jobs/events?type=VIEW`);
//             rawData = response.data.jobs || [];
//             statusLabel = 'Viewed';
//             break;
//           case 'Saved':
//             response = await apiInstance.get(
//               `/students/jobs/events?type=SAVED`,
//             );
//             rawData = response.data.jobs || [];
//             statusLabel = 'Saved';
//             break;

//           case 'applications':
//             response = await apiInstance.get(`/students/applications`);
//             const tailoredApplications = response.data.applications || [];

//             // Normalize the data from the tailored applications endpoint
//             const formattedTailored = tailoredApplications.map((app: any) => ({
//               id: app._id,
//               job: {
//                 title: app.jobTitle,
//                 company: app.jobCompany,
//                 // Create a slug on the fly for navigation
//                 slug: `application-${app._id}`, // This slug is temporary and won't point to a real job page
//               },
//               status: app.status || 'Draft',
//               appliedAt: app.createdAt,
//             }));

//             setApplications(formattedTailored);
//             setIsLoading(false);
//             return; // Exit early

//           default:
//             response = await apiInstance.get(
//               `/students/jobs/events?type=SAVED`,
//             );
//             rawData = response.data.jobs || [];
//             statusLabel = 'Saved';
//             break;
//         }

//         // Normalize data for all other job list types
//         const formattedApplications = rawData
//           .filter((apiJob: any) => apiJob && apiJob.job) // Filter out null jobs
//           .map((apiJob: any) => ({
//             id: apiJob.job._id,
//             job: {
//               title: apiJob.job.title,
//               slug: apiJob.job.slug,
//               company: apiJob.job.company,
//             },
//             status: apiJob.status || statusLabel,
//             appliedAt:
//               apiJob.savedAt ||
//               apiJob.appliedAt ||
//               apiJob.viewedAt ||
//               apiJob.visitedAt ||
//               apiJob.job.createdAt,
//           }));

//         // setApplications(formattedApplications);
//         setApplications(dedupeById(formattedApplications));
//       } catch (error) {
//         console.error(`Failed to fetch ${statusFilter} applications:`, error);
//         toast({
//           variant: 'destructive',
//           title: 'Error',
//           description: 'Could not fetch the application list.',
//         });
//         setApplications([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchApplications();
//   }, [statusFilter, toast]);

//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     params.set('status', statusFilter);
//     router.replace(`${window.location.pathname}?${params.toString()}`);
//   }, [statusFilter, router]);

//   function dedupeById<T extends { id: string }>(items: T[]) {
//     return Array.from(new Map(items.map((item) => [item.id, item])).values());
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
//       <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
//       <div className="relative z-10 p-4 sm:p-6 max-w-7xl mx-auto">
//         <div className="mb-2 text-center">
//           <h1 className="text-2xl uppercase font-semibold sm:text-3xl md:text-4xl bg-headingTextPrimary text-foreground bg-clip-text text-transparent relative z-10">
//             My Applications
//           </h1>
//           <p className="text-lg text-gray-600 dark:text-gray-400">
//             Track your career journey
//           </p>
//         </div>

//         <div className="grid grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6 mb-6 md:p-2">
//           <StatCard
//             label="Applied Jobs"
//             value={jobStats?.appliedJobsCount}
//             icon={Send}
//             // color="tabPrimary"
//             isActive={statusFilter === 'Applied'}
//             onClick={() => setStatusFilter('Applied')}
//           />
//           <StatCard
//             label="Saved Jobs"
//             value={jobStats?.savedJobsCount}
//             icon={Bookmark}
//             // color="tabPrimary"
//             isActive={statusFilter === 'Saved'}
//             onClick={() => setStatusFilter('Saved')}
//           />
//           <StatCard
//             label="Viewed Jobs"
//             value={jobStats?.jobsViewed}
//             icon={Eye}
//             // color="tabPrimary"
//             isActive={statusFilter === 'Viewed'}
//             onClick={() => setStatusFilter('Viewed')}
//           />
//           <StatCard
//             label="Visited Links"
//             value={jobStats?.jobsVisited}
//             icon={Link}
//             // color="tabPrimary"
//             isActive={statusFilter === 'Visited'}
//             onClick={() => setStatusFilter('Visited')}
//           />
//         </div>

//         <div className="mb-6 flex items-center justify-between">
//           <div>
//             <p className="text-gray-600 dark:text-gray-400 font-bold">
//               Filter by status: {statusFilter}
//             </p>
//           </div>
//           <div className="relative">
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="w-full lg:w-auto appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
//             >
//               {extendedApplicationStatuses.map((status) => (
//                 <option key={status} value={status}>
//                   {status}
//                 </option>
//               ))}
//             </select>
//             <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//           </div>
//         </div>

//         <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-4 rounded-lg border border-gray-200 dark:border-gray-800">
//           {isLoading ? (
//             <Loader
//               message="Loading applications..."
//               imageClassName="w-6 h-6"
//               textClassName="text-sm"
//             />
//           ) : applications.length > 0 ? (
//             <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
//               {applications.map((app, index) => (
//                 <ApplicationRow
//                   key={app.id}
//                   app={app}
//                   isSelected={false}
//                   onSelect={() => {}}
//                   index={index}
//                 />
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-20 px-6">
//               <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
//                 No Applications Found
//               </h3>
//               <p className="text-gray-600 dark:text-gray-400 mb-6">
//                 There are no jobs with the status "{statusFilter}".
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';

// ICONS
import {
  Bookmark,
  Send,
  Eye,
  Search,
  Filter,
  Calendar,
  Building2,
  ArrowRight,
  Link as LinkIcon,
} from 'lucide-react';

// UTILS & SERVICES
import { useToast } from '@/hooks/use-toast';
import apiInstance from '@/services/api';
import { RootState } from '@/redux/rootReducer';
import { getStudentStatsRequest } from '@/redux/reducers/studentReducer';
import { Loader } from '@/components/Loader';
import Image from 'next/image';

interface Application {
  id: string;
  job: {
    title: string;
    company: string;
    slug: string;
  };
  status: string;
  appliedAt: string;
}

const extendedApplicationStatuses = [
  'Saved',
  'Applied',
  'Visited',
  'Viewed',
  'applications', // Represents tailored applications
];

/* =========================================
   RE-STYLED STAT CARD
   ========================================= */
export function StatCard({ label, value, icon: Icon, isActive, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={`group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 sm:flex-row sm:gap-4 ${
        isActive
          ? 'border-blue-600 bg-white shadow-[0_8px_24px_rgba(37,99,235,0.12)] border-2'
          : 'border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 top-0 w-1.5 bg-blue-600 transition-colors" />
      )}
      <div
        className={`flex flex-1 flex-col justify-between ${isActive ? 'pl-2' : ''}`}
      >
        <div className="mb-2 mt-1 flex items-center justify-between">
          <span
            className={`text-xs font-bold uppercase tracking-widest transition-colors ${
              isActive
                ? 'text-blue-600'
                : 'text-slate-400 group-hover:text-slate-600'
            }`}
          >
            {label}
          </span>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-600'
                : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
            }`}
          >
            <Icon className="h-4 w-4" strokeWidth={isActive ? 2.5 : 2} />
          </div>
        </div>
        <div className="text-3xl font-black text-slate-900">{value || 0}</div>
      </div>
    </div>
  );
}

/* =========================================
   RE-STYLED APPLICATION ROW
   ========================================= */
export const ApplicationRow = ({
  app,
  index,
}: {
  app: Application;
  index: number;
}) => {
  return (
    <Link
      href={`/dashboard/search-jobs?job=${app.job.slug}`}
      prefetch={false}
      className="group relative flex cursor-pointer flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_24px_rgba(37,99,235,0.08)] sm:flex-row animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="absolute bottom-0 left-0 top-0 w-1 bg-transparent transition-colors group-hover:bg-blue-500" />
      <div className="flex-1 pl-2">
        <h3 className="mb-2 pr-4 text-[15px] font-extrabold leading-snug text-slate-900 transition-colors group-hover:text-blue-600">
          {app.job.title}
        </h3>
        <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-500">
          <Building2 className="h-4 w-4 text-slate-400" strokeWidth={2} />
          {app.job.company}
        </div>
      </div>
      <div className="flex shrink-0 flex-row items-center justify-between gap-3 sm:flex-col sm:items-end">
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-500">
          <Calendar className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
          {new Date(app.appliedAt).toLocaleDateString()}
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 shadow-sm transition-all group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white">
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            strokeWidth={2.5}
          />
        </div>
      </div>
    </Link>
  );
};

/* =========================================
   MAIN COMPONENT
   ========================================= */
export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // Added local search state to match UI

  const { stats: jobStats } = useSelector((state: RootState) => state.student);
  const { user: authUser } = useSelector((state: RootState) => state.auth);
  const studentFullName = useSelector(
    (state: RootState) =>
      state.student.students?.[0]?.student?.fullName ??
      state.student.students?.[0]?.fullName,
  );

  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get('status') || 'Saved',
  );

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getStudentStatsRequest());
  }, [dispatch]);

  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      try {
        let response;
        let rawData = [];
        let statusLabel = 'Saved';

        switch (statusFilter) {
          case 'Applied':
            response = await apiInstance.get(
              '/students/jobs/events?type=APPLIED',
            );
            rawData = response.data.jobs || [];
            statusLabel = 'Applied';
            break;
          case 'Visited':
            response = await apiInstance.get(
              `/students/jobs/events?type=VISIT`,
            );
            rawData = response.data.jobs || [];
            statusLabel = 'Visited';
            break;
          case 'Viewed':
            response = await apiInstance.get(`/students/jobs/events?type=VIEW`);
            rawData = response.data.jobs || [];
            statusLabel = 'Viewed';
            break;
          case 'Saved':
            response = await apiInstance.get(
              `/students/jobs/events?type=SAVED`,
            );
            rawData = response.data.jobs || [];
            statusLabel = 'Saved';
            break;
          case 'applications':
            response = await apiInstance.get(`/students/applications`);
            const tailoredApplications = response.data.applications || [];
            const formattedTailored = tailoredApplications.map((app: any) => ({
              id: app._id,
              job: {
                title: app.jobTitle,
                company: app.jobCompany,
                slug: `application-${app._id}`,
              },
              status: app.status || 'Draft',
              appliedAt: app.createdAt,
            }));
            setApplications(formattedTailored);
            setIsLoading(false);
            return;
          default:
            response = await apiInstance.get(
              `/students/jobs/events?type=SAVED`,
            );
            rawData = response.data.jobs || [];
            statusLabel = 'Saved';
            break;
        }

        const formattedApplications = rawData
          .filter((apiJob: any) => apiJob && apiJob.job)
          .map((apiJob: any) => ({
            id: apiJob.job._id,
            job: {
              title: apiJob.job.title,
              slug: apiJob.job.slug,
              company: apiJob.job.company,
            },
            status: apiJob.status || statusLabel,
            appliedAt:
              apiJob.savedAt ||
              apiJob.appliedAt ||
              apiJob.viewedAt ||
              apiJob.visitedAt ||
              apiJob.job.createdAt,
          }));

        setApplications(dedupeById(formattedApplications));
      } catch (error) {
        console.error(`Failed to fetch ${statusFilter} applications:`, error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch the application list.',
        });
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplications();
  }, [statusFilter, toast]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('status', statusFilter);
    router.replace(`${window.location.pathname}?${params.toString()}`);
  }, [statusFilter, router]);

  function dedupeById<T extends { id: string }>(items: T[]) {
    return Array.from(new Map(items.map((item) => [item.id, item])).values());
  }

  // Filter applications visually if the user types in the search box
  const filteredApplications = applications.filter(
    (app) =>
      app.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job.company.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-jakarta text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
        <div className="mx-auto w-full max-w-[1200px]">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-[26px] font-black leading-tight tracking-tight text-slate-900">
              My Applications
            </h1>
            <p className="mt-1 text-[14px] font-medium text-slate-500">
              Track and manage your career journey.
            </p>
          </div>

          {/* Stats Grid / Status Selector */}
          <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard
              label="Applied"
              value={jobStats?.appliedJobsCount}
              icon={Send}
              isActive={statusFilter === 'Applied'}
              onClick={() => setStatusFilter('Applied')}
            />
            <StatCard
              label="Saved Jobs"
              value={jobStats?.savedJobsCount}
              icon={Bookmark}
              isActive={statusFilter === 'Saved'}
              onClick={() => setStatusFilter('Saved')}
            />
            <StatCard
              label="Viewed"
              value={jobStats?.jobsViewed}
              icon={Eye}
              isActive={statusFilter === 'Viewed'}
              onClick={() => setStatusFilter('Viewed')}
            />
            <StatCard
              label="Visited"
              value={jobStats?.jobsVisited}
              icon={LinkIcon}
              isActive={statusFilter === 'Visited'}
              onClick={() => setStatusFilter('Visited')}
            />
          </div>

          {/* Filter / Search Bar */}
          <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <h2 className="text-[16px] font-extrabold tracking-tight text-slate-900 w-full sm:w-auto">
              Showing:{' '}
              <span className="text-blue-600">
                {statusFilter === 'applications'
                  ? 'Tailored Applications'
                  : statusFilter + ' Jobs'}
              </span>
            </h2>

            <div className="flex w-full items-center gap-3 sm:w-auto">
              <div className="flex flex-1 items-center rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition-all focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 sm:w-64">
                <Search
                  className="h-4 w-4 shrink-0 text-slate-400"
                  strokeWidth={2.5}
                />
                <input
                  type="text"
                  placeholder={`Search ${statusFilter.toLowerCase()} jobs...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border-none bg-transparent px-2 text-[13px] font-semibold text-slate-900 placeholder-slate-400 outline-none focus:ring-0"
                />
              </div>

              {/* Kept your select dropdown, styled elegantly as a "Filter" button */}
              <div className="relative shrink-0">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex cursor-pointer appearance-none items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-8 text-[13px] font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-50"
                >
                  {extendedApplicationStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status === 'applications' ? 'Tailored Apps' : status}
                    </option>
                  ))}
                </select>
                <Filter
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                  strokeWidth={2}
                />
              </div>
            </div>
          </div>

          {/* Application List */}
          <div className="pb-20">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader
                  message={`Loading ${statusFilter.toLowerCase()} jobs...`}
                  imageClassName="w-8 h-8"
                  textClassName="text-sm font-semibold text-slate-500"
                />
              </div>
            ) : filteredApplications.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {filteredApplications.map((app, index) => (
                  <ApplicationRow key={app.id} app={app} index={index} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                  <Search className="h-6 w-6" strokeWidth={2} />
                </div>
                <h3 className="mb-2 text-xl font-extrabold tracking-tight text-slate-900">
                  No Applications Found
                </h3>
                <p className="text-sm font-medium text-slate-500">
                  There are no jobs matching your search in the "{statusFilter}"
                  status.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
