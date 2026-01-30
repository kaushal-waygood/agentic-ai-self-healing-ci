module.exports = [
"[project]/app/favicon.ico.mjs { IMAGE => \"[project]/app/favicon.ico (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/favicon.ico.mjs { IMAGE => \"[project]/app/favicon.ico (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript)"));
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/app/dashboard/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/dashboard/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/app/dashboard/jobs/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

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
}),
"[project]/app/dashboard/jobs/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/dashboard/jobs/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__39d28f3c._.js.map