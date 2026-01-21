// 'use client';

// import { useEffect } from 'react';
// import { useJobStore } from '@/store/job.store';
// import { Eye, FileText, Pencil } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { timeAgo } from '@/utils/TimeAgo';

// const JobsPage = () => {
//   const { jobs, getJobs, loading } = useJobStore();
//   const router = useRouter();

//   useEffect(() => {
//     getJobs();
//   }, [getJobs]);

//   return (
//     <div className="p-6">
//       <div className="flex items-center justify-between mb-4">
//         <h1 className="text-xl font-semibold">Posted Jobs</h1>
//         <span className="text-sm text-slate-500">Total: {jobs.length}</span>
//       </div>

//       <div className="overflow-x-auto rounded-xl border bg-white">
//         <table className="w-full border-collapse text-sm">
//           <thead className="bg-slate-100 text-slate-700">
//             <tr>
//               <th className="px-4 py-3 text-left">Job</th>
//               <th className="px-4 py-3 text-left">Location</th>
//               <th className="px-4 py-3 text-left">Type</th>
//               <th className="px-4 py-3 text-left">Posted</th>
//               <th className="px-4 py-3 text-center">Views</th>
//               <th className="px-4 py-3 text-center">Impressions</th>
//               <th className="px-4 py-3 text-center">Applications</th>
//               <th className="px-4 py-3 text-left">Status</th>
//               <th className="px-4 py-3 text-right">Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {loading && (
//               <tr>
//                 <td
//                   colSpan={8}
//                   className="px-4 py-6 text-center text-slate-500"
//                 >
//                   Loading jobs…
//                 </td>
//               </tr>
//             )}

//             {!loading && jobs.length === 0 && (
//               <tr>
//                 <td
//                   colSpan={8}
//                   className="px-4 py-6 text-center text-slate-500"
//                 >
//                   No jobs posted yet.
//                 </td>
//               </tr>
//             )}

//             {jobs?.map((job) => (
//               <tr
//                 key={job._id}
//                 className="border-t hover:bg-slate-50 transition"
//               >
//                 {/* JOB */}
//                 <td className="px-4 py-3">
//                   <div className="font-medium text-slate-900">{job.title}</div>
//                   <div className="text-xs text-slate-500">{job.company}</div>
//                 </td>

//                 {/* LOCATION */}
//                 <td className="px-4 py-3 text-slate-600">
//                   {job.location?.city}, {job.location?.state}
//                 </td>

//                 {/* TYPE */}
//                 <td className="px-4 py-3 text-slate-600">
//                   {job.jobTypes?.join(', ')}
//                 </td>

//                 {/* POSTED */}
//                 <td className="px-4 py-3 text-slate-600">{job.jobPosted}</td>

//                 {/* VIEWS */}
//                 <td className="px-4 py-3 text-center font-medium">
//                   {job.jobViews ?? 0}
//                 </td>

//                 <td className="px-4 py-3 text-center font-medium">
//                   {job.impressions ?? 0}
//                 </td>

//                 {/* APPLICATIONS */}
//                 <td className="px-4 py-3 text-center font-medium">
//                   {job.appliedCount ?? 0}
//                 </td>

//                 {/* STATUS */}
//                 <td className="px-4 py-3">
//                   <span
//                     className={`px-2 py-1 rounded-full text-xs font-medium ${
//                       job.isActive
//                         ? 'bg-green-100 text-green-700'
//                         : 'bg-red-100 text-red-700'
//                     }`}
//                   >
//                     {job.isActive ? 'Active' : 'Inactive'}
//                   </span>
//                 </td>

//                 {/* ACTIONS */}
//                 <td className="px-4 py-3 text-right">
//                   <div className="inline-flex items-center gap-2">
//                     <button
//                       title="View job"
//                       onClick={() => router.push(`/dashboard/jobs/${job._id}`)}
//                       className="p-1 rounded hover:bg-slate-100"
//                     >
//                       <Eye size={16} />
//                     </button>

//                     <button
//                       title="Edit job"
//                       onClick={() =>
//                         router.push(`/dashboard/jobs/${job._id}/edit`)
//                       }
//                       className="p-1 rounded hover:bg-slate-100"
//                     >
//                       <Pencil size={16} />
//                     </button>

//                     <button
//                       title="View applications"
//                       onClick={() =>
//                         router.push(`/dashboard/jobs/${job._id}/applications`)
//                       }
//                       className="p-1 rounded hover:bg-slate-100"
//                     >
//                       <FileText size={16} />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default JobsPage;

'use client';

import { useEffect, useState } from 'react';
import { useJobStore } from '@/store/job.store';
// import { Eye, FileText, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Eye,
  Pencil,
  FileText,
  MapPin,
  Clock,
  TrendingUp,
  Search,
  Filter,
  Download,
  MoreVertical,
  Briefcase,
  Users,
  RemoveFormatting,
  Delete,
  Trash,
  Trash2,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { timeAgo } from '@/utils/TimeAgo';

const JobsPage = () => {
  const { jobs, getJobs, loading } = useJobStore();
  const router = useRouter();

  useEffect(() => {
    getJobs();
  }, [getJobs]);

  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Posted Jobs</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage and track all your job postings
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button> */}
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Briefcase className="w-4 h-4" />
            Post New Job
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Jobs</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {jobs.length}
                </h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Jobs</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {jobs.filter((j) => j.isActive).length}
                </h3>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {jobs.reduce((sum, j) => sum + (j.jobViews || 0), 0)}
                </h3>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Applications</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {jobs.reduce((sum, j) => sum + (j.appliedCount || 0), 0)}
                </h3>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      {/* <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by job title, company, or location..."
                className="pl-10 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card> */}

      {/* Jobs Cards/Table */}
      <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2  gap-4 ">
        {loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600">Loading jobs...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && jobs.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No jobs posted yet
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by posting your first job opening
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Post Your First Job
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading &&
          jobs.map((job, index) => (
            <Card key={job._id} className="hover:shadow-md transition-shadow ">
              <CardContent className=" ">
                <div className="flex items-center gap-1 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    <span>{index + 1}.</span> {job.title}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {job.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Left: Job Info */}

                  <div className="flex-1 space-y-3">
                    {/* <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 font-medium">
                          {job.company}
                        </p>
                      </div>
                    </div> */}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-4 h-4" />
                        <span>{job.company} </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {job.location?.city}, {job.location?.state}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" />
                        <span>{job.jobTypes?.join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />

                        <span className="text-sm">
                          Posted {timeAgo(job.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Stats & Actions */}
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8">
                    {/* Stats */}
                    <div className="flex gap-6">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-gray-600 text-xs mb-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Views</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">
                          {job.jobViews ?? 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-gray-600 text-xs mb-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>Applied</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">
                          {job.appliedCount ?? 0}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/dashboard/jobs/${job._id}`)
                        }
                        className="gap-2 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/dashboard/jobs/${job._id}/edit`)
                        }
                        className="gap-2"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </Button> */}

                      {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/dashboard/jobs/${job._id}/applications`)
                        }
                        className="gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="hidden xl:inline">Applications</span>
                      </Button> */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 cursor-pointer hover:bg-red-200"
                      >
                        <Trash2 className="w-4 h-4 " />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default JobsPage;
