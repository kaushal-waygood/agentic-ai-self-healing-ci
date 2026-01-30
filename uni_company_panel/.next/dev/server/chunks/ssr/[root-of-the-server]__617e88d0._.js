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
"[project]/components/candidates/CandidatePage.tsx [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

// 'use client';
// import React, { useState } from 'react';
// import { Search, Filter, MoreVertical, Download, Eye } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// // Mock Data - Replace this with your API call later
// const candidates = [
//   {
//     id: 1,
//     name: 'Arjun Sharma',
//     role: 'Frontend Developer',
//     status: 'Shortlisted',
//     appliedDate: 'Jan 24, 2026',
//   },
//   {
//     id: 2,
//     name: 'Priya Singh',
//     role: 'UI/UX Designer',
//     status: 'Pending',
//     appliedDate: 'Jan 26, 2026',
//   },
//   {
//     id: 3,
//     name: 'Rohan Verma',
//     role: 'Backend Engineer',
//     status: 'Rejected',
//     appliedDate: 'Jan 22, 2026',
//   },
// ];
// const CandidatePage = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'Shortlisted':
//         return 'bg-green-100 text-green-700 border-green-200';
//       case 'Pending':
//         return 'bg-yellow-100 text-yellow-700 border-yellow-200';
//       case 'Rejected':
//         return 'bg-red-100 text-red-700 border-red-200';
//       default:
//         return 'bg-gray-100 text-gray-700';
//     }
//   };
//   return (
//     <div className="p-8 bg-gray-50 min-h-screen">
//       {/* Header Section */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
//           <p className="text-gray-500 text-sm">
//             Review and manage your latest job applicants.
//           </p>
//         </div>
//         <div className="flex items-center gap-3">
//           <Button variant="outline" className="flex items-center gap-2">
//             <Download className="w-4 h-4" /> Export CSV
//           </Button>
//         </div>
//       </div>
//       {/* Filters & Search */}
//       <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
//         <div className="relative w-full md:w-96">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
//           <Input
//             placeholder="Search by name or role..."
//             className="pl-10 bg-gray-50 border-gray-200 focus:ring-blue-500"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//         <Button
//           variant="ghost"
//           className="text-gray-600 flex items-center gap-2"
//         >
//           <Filter className="w-4 h-4" /> Filters
//         </Button>
//       </div>
//       {/* Candidates Table */}
//       <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                   Candidate Name
//                 </th>
//                 <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                   Applied Role
//                 </th>
//                 <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                   Date Applied
//                 </th>
//                 <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {candidates.map((candidate) => (
//                 <tr
//                   key={candidate.id}
//                   className="hover:bg-gray-50 transition-colors"
//                 >
//                   <td className="px-6 py-4">
//                     <div className="font-medium text-gray-900">
//                       {candidate.name}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 text-gray-600">{candidate.role}</td>
//                   <td className="px-6 py-4 text-gray-500">
//                     {candidate.appliedDate}
//                   </td>
//                   <td className="px-6 py-4">
//                     <span
//                       className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(candidate.status)}`}
//                     >
//                       {candidate.status}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 text-right">
//                     <div className="flex justify-end gap-2">
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         className="h-8 w-8 text-blue-600"
//                       >
//                         <Eye className="w-4 h-4" />
//                       </Button>
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         className="h-8 w-8 text-gray-400"
//                       >
//                         <MoreVertical className="w-4 h-4" />
//                       </Button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default CandidatePage;
// 'use client';
// import { useEffect, useMemo, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { ColumnDef } from '@tanstack/react-table';
// import { useCandidateStore } from '@/store/candidate.store'; // Adjust based on your store name
// import { DataTable } from '@/components/common/TableData';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import { Checkbox } from '@/components/ui/checkbox';
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@/components/ui/popover';
// import {
//   Eye,
//   UserCheck,
//   Download,
//   Users,
//   UserMinus,
//   Clock,
//   ArrowUpDown,
//   Loader2,
//   Trash2,
//   Mail,
// } from 'lucide-react';
// const CandidatesPage = () => {
//   const router = useRouter();
//   const { candidates, getCandidates, loading } = useCandidateStore();
//   useEffect(() => {
//     getCandidates();
//   }, [getCandidates]);
//   const columns: ColumnDef<any>[] = useMemo(
//     () => [
//       {
//         id: 'select',
//         header: ({ table }) => (
//           <div className="flex justify-center px-1">
//             <Checkbox
//               checked={
//                 table.getIsAllPageRowsSelected() ||
//                 (table.getIsSomePageRowsSelected() && 'indeterminate')
//               }
//               onCheckedChange={(value) =>
//                 table.toggleAllPageRowsSelected(!!value)
//               }
//               aria-label="Select all"
//             />
//           </div>
//         ),
//         cell: ({ row }) => (
//           <div className="flex justify-center px-1">
//             <Checkbox
//               checked={row.getIsSelected()}
//               onCheckedChange={(value) => row.toggleSelected(!!value)}
//               aria-label="Select row"
//             />
//           </div>
//         ),
//         enableSorting: false,
//         enableHiding: false,
//       },
//       {
//         id: 'serialNumber',
//         header: 'S.No',
//         cell: ({ row }) => (
//           <span className="font-medium text-slate-500">
//             {parseInt(row.id) + 1}
//           </span>
//         ),
//       },
//       {
//         id: 'candidateName',
//         accessorFn: (row) => row.fullName,
//         header: ({ column }) => (
//           <Button
//             variant="ghost"
//             onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
//             className="-ml-4"
//           >
//             Candidate <ArrowUpDown className="ml-2 h-4 w-4" />
//           </Button>
//         ),
//         cell: ({ row }) => (
//           <div className="flex flex-col">
//             <div className="font-semibold text-slate-900">
//               {row.original.fullName}
//             </div>
//             <div className="text-xs text-slate-500 flex items-center gap-1">
//               <Mail className="h-3 w-3" /> {row.original.email}
//             </div>
//           </div>
//         ),
//       },
//       {
//         accessorKey: 'role',
//         header: 'Applied Role',
//         cell: ({ row }) => <div className="text-sm">{row.original.role}</div>,
//       },
//       {
//         accessorKey: 'appliedAt',
//         header: ({ column }) => (
//           <Button
//             variant="ghost"
//             onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
//           >
//             Applied Date <ArrowUpDown className="ml-2 h-4 w-4" />
//           </Button>
//         ),
//         sortingFn: 'datetime',
//         cell: ({ row }) => (
//           <span className="text-sm text-slate-600">
//             {new Date(row.original.appliedAt).toLocaleDateString('en-GB', {
//               day: '2-digit',
//               month: 'short',
//               year: 'numeric',
//             })}
//           </span>
//         ),
//       },
//       {
//         accessorKey: 'status',
//         header: () => <div className="text-center">Status</div>,
//         cell: ({ row }) => {
//           const status = row.original.status;
//           const statusStyles: any = {
//             Shortlisted: 'text-green-600 bg-green-50',
//             Pending: 'text-amber-600 bg-amber-50',
//             Rejected: 'text-red-600 bg-red-50',
//           };
//           return (
//             <div className="flex justify-center">
//               <span
//                 className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || 'text-slate-600 bg-slate-50'}`}
//               >
//                 {status}
//               </span>
//             </div>
//           );
//         },
//       },
//       {
//         id: 'actions',
//         header: () => <div className="text-center">Actions</div>,
//         cell: ({ row }) => {
//           const [isOpen, setIsOpen] = useState(false);
//           return (
//             <div className="flex justify-center gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() =>
//                   router.push(`/dashboard/candidates/${row.original._id}`)
//                 }
//                 className="hover:text-blue-500"
//               >
//                 <Eye className="h-3.5 w-3.5 mr-1" /> View
//               </Button>
//               <Popover open={isOpen} onOpenChange={setIsOpen}>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className="hover:text-red-500 hover:bg-red-50"
//                   >
//                     <Trash2 className="h-3.5 w-3.5" />
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent
//                   align="end"
//                   className="w-60 p-4 shadow-lg border-slate-200"
//                 >
//                   <div className="space-y-3">
//                     <p className="text-sm font-semibold text-slate-900">
//                       Remove Candidate?
//                     </p>
//                     <p className="text-xs text-slate-500 leading-relaxed">
//                       Delete{' '}
//                       <span className="font-bold">
//                         "{row.original.fullName}"
//                       </span>{' '}
//                       from this job application.
//                     </p>
//                     <div className="flex justify-end gap-2 pt-2">
//                       <Button
//                         size="sm"
//                         variant="ghost"
//                         onClick={() => setIsOpen(false)}
//                         className="h-8 text-xs"
//                       >
//                         Cancel
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="destructive"
//                         className="h-8 text-xs bg-red-600 hover:bg-red-700"
//                       >
//                         Confirm
//                       </Button>
//                     </div>
//                   </div>
//                 </PopoverContent>
//               </Popover>
//             </div>
//           );
//         },
//       },
//     ],
//     [router],
//   );
//   const exportToCSV = () => {
//     const data = candidates || [];
//     if (data.length === 0) return;
//     const headers = ['Name', 'Email', 'Role', 'Status', 'Applied On'];
//     const rows = data.map((c: any) =>
//       [
//         `"${c.fullName}"`,
//         `"${c.email}"`,
//         `"${c.role}"`,
//         `"${c.status}"`,
//         new Date(c.appliedAt).toLocaleDateString(),
//       ].join(','),
//     );
//     const csvContent =
//       'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
//     const link = document.createElement('a');
//     link.setAttribute('href', encodeURI(csvContent));
//     link.setAttribute(
//       'download',
//       `candidates_${new Date().toISOString().split('T')[0]}.csv`,
//     );
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };
//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-blue-500">Candidates</h1>
//           <p className="text-gray-600">
//             Review and manage your talent pipeline
//           </p>
//         </div>
//         <Button variant="outline" onClick={exportToCSV} className="gap-2">
//           <Download className="w-4 h-4" /> Export
//         </Button>
//       </div>
//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
//         <StatCard
//           label="Total Applicants"
//           value={candidates.length}
//           icon={<Users className="text-blue-600" />}
//           bgColor="bg-blue-100"
//         />
//         <StatCard
//           label="Shortlisted"
//           value={candidates.filter((c) => c.status === 'Shortlisted').length}
//           icon={<UserCheck className="text-green-600" />}
//           bgColor="bg-green-100"
//         />
//         <StatCard
//           label="Pending Review"
//           value={candidates.filter((c) => c.status === 'Pending').length}
//           icon={<Clock className="text-amber-600" />}
//           bgColor="bg-amber-100"
//         />
//         <StatCard
//           label="Rejected"
//           value={candidates.filter((c) => c.status === 'Rejected').length}
//           icon={<UserMinus className="text-red-600" />}
//           bgColor="bg-red-100"
//         />
//       </div>
//       {/* Data Table */}
//       {loading ? (
//         <div className="flex items-center justify-center h-40">
//           <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
//         </div>
//       ) : (
//         <DataTable
//           columns={columns}
//           data={candidates || []}
//           searchKey="candidateName"
//           searchPlaceholder="Search by Candidate Name..."
//         />
//       )}
//     </div>
//   );
// };
// // Reusable Stat Card Component within this file
// const StatCard = ({ label, value, icon, bgColor }: any) => (
//   <Card>
//     <CardContent className="pt-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm text-gray-600">{label}</p>
//           <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
//         </div>
//         <div
//           className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}
//         >
//           {icon}
//         </div>
//       </div>
//     </CardContent>
//   </Card>
// );
// export default CandidatesPage;
}),
"[project]/app/dashboard/candidates/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$candidates$2f$CandidatePage$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/candidates/CandidatePage.tsx [app-rsc] (ecmascript)");
;
;
const page = ()=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$candidates$2f$CandidatePage$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
        fileName: "[project]/app/dashboard/candidates/page.tsx",
        lineNumber: 5,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = page;
}),
"[project]/app/dashboard/candidates/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/dashboard/candidates/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__617e88d0._.js.map