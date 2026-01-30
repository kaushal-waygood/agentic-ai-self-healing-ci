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
"[project]/components/organisation/OrganisationProfile.tsx [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

// 'use client';
// import React, { useEffect, useState, useRef } from 'react';
// import { useOrganisationStore } from '@/store/organisation.store';
// import { useAuthStore } from '@/store/auth.store';
// import {
//   Pencil,
//   Check,
//   X,
//   Globe,
//   Mail,
//   Phone,
//   Building2,
//   ShieldCheck,
//   MapPin,
//   Users,
//   Camera,
//   Loader2,
// } from 'lucide-react';
// import Image from 'next/image';
// const OrganizationProfilePage = () => {
//   const {
//     organisation,
//     orgStats,
//     loading,
//     getOrganisationProfile,
//     updateProfile,
//     uploadLogo,
//     getOrgStats,
//   } = useOrganisationStore();
//   const [activeSection, setActiveSection] = useState<string | null>(null);
//   const [tempData, setTempData] = useState<any>(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   useEffect(() => {
//     getOrganisationProfile();
//     getOrgStats();
//   }, []);
//   console.log(orgStats);
//   // --- Actions ---
//   const handleLogoClick = () => fileInputRef.current?.click();
//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setIsUploading(true);
//     await uploadLogo(file);
//     setIsUploading(false);
//   };
//   const startEditing = (section: string) => {
//     setActiveSection(section);
//     setTempData({
//       ...organisation,
//       name: organisation?.name || '',
//       profile: {
//         industry: organisation?.profile?.industry || '',
//         size: organisation?.profile?.size || '',
//         website: organisation?.profile?.website || '',
//         description: organisation?.profile?.description || '',
//         address: organisation?.profile?.address || '',
//       },
//       contactInfo: {
//         name: organisation?.contactInfo?.name || '',
//         email: organisation?.contactInfo?.email || '',
//         phone: organisation?.contactInfo?.phone || '',
//       },
//     });
//   };
//   const handleSave = async () => {
//     const payload = {
//       name: tempData.name,
//       profile: tempData.profile,
//       contactInfo: tempData.contactInfo,
//       betaFeaturesEnabled: tempData.betaFeaturesEnabled,
//     };
//     const success = await updateProfile(payload);
//     if (success) setActiveSection(null);
//   };
//   if (loading && !organisation)
//     return (
//       <div className="p-10 text-center animate-pulse text-gray-500 font-medium font-mono">
//         SYNCING_WITH_ZOBS_DATABASE...
//       </div>
//     );
//   if (!organisation)
//     return <div className="p-10 text-center">Organization not found.</div>;
//   // Reusable Section Header
//   const SectionHeader = ({ title, id }: { title: string; id: string }) => (
//     <div className="flex justify-between items-center mb-6">
//       <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
//         {title}
//       </h2>
//       {activeSection === id ? (
//         <div className="flex gap-3 flex-col">
//           <button
//             onClick={() => setActiveSection(null)}
//             className="text-gray-400 hover:text-red-500 transition"
//           >
//             <X size={18} />
//           </button>
//           <button
//             onClick={handleSave}
//             className="text-gray-400 hover:text-green-600 transition"
//           >
//             <Check size={18} />
//           </button>
//         </div>
//       ) : (
//         <button
//           onClick={() => startEditing(id)}
//           className="group flex items-center gap-2 text-gray-400 hover:text-black transition"
//         >
//           <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 uppercase transition-all">
//             Edit Section
//           </span>
//           <Pencil size={14} />
//         </button>
//       )}
//     </div>
//   );
//   return (
//     <div className="max-w-6xl mx-auto p-4 md:p-10 bg-[#FBFBFB] min-h-screen">
//       {/* 1. TOP BRAND CARD */}
//       <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
//         <div className="flex items-center gap-6">
//           {/* Logo Uploadable Avatar */}
//           <div
//             onClick={handleLogoClick}
//             className="group relative h-20 w-20 bg-black rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl cursor-pointer overflow-hidden transition-all hover:scale-105"
//           >
//             {organisation.profile?.logo ? (
//               <Image
//                 src={organisation.profile.logo}
//                 alt="Org Logo"
//                 width={100}
//                 height={100}
//                 className="h-full w-full object-cover group-hover:opacity-30 transition-opacity"
//               />
//             ) : (
//               <span className="group-hover:opacity-20">
//                 {organisation.name?.charAt(0)}
//               </span>
//             )}
//             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
//               {isUploading ? (
//                 <Loader2 className="animate-spin" />
//               ) : (
//                 <Camera size={20} />
//               )}
//             </div>
//             <input
//               type="file"
//               ref={fileInputRef}
//               onChange={handleFileChange}
//               className="hidden"
//               accept="image/*"
//             />
//           </div>
//           <div>
//             {activeSection === 'header' ? (
//               <input
//                 className="text-3xl font-black border-b-2 border-black focus:outline-none mb-2 bg-transparent"
//                 value={tempData?.name}
//                 onChange={(e) =>
//                   setTempData({ ...tempData, name: e.target.value })
//                 }
//               />
//             ) : (
//               <h1 className="text-3xl font-black text-gray-900 leading-tight">
//                 {organisation.name || 'Untitled Organization'}
//               </h1>
//             )}
//             <div className="flex items-center gap-3 mt-1">
//               <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-black rounded uppercase">
//                 {organisation.type}
//               </span>
//               <span className="flex items-center gap-1 text-[11px] text-green-600 font-bold uppercase tracking-tight">
//                 <ShieldCheck size={12} /> {organisation.status}
//               </span>
//             </div>
//           </div>
//         </div>
//         <div className="flex flex-col items-end gap-2">
//           <SectionHeader title="" id="header" />
//           <p className="text-[9px] text-gray-300 font-mono tracking-widest uppercase bg-gray-50 px-2 py-1 rounded">
//             UID: {organisation._id}
//           </p>
//         </div>
//       </div>
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* LEFT COLUMN: INFORMATION */}
//         <div className="lg:col-span-2 space-y-8">
//           {/* PROFILE SECTION */}
//           <div
//             className={`bg-white rounded-[2rem] p-8 border transition-all duration-300 ${activeSection === 'profile' ? 'border-black ring-4 ring-gray-50' : 'border-gray-100 shadow-sm'}`}
//           >
//             <SectionHeader title="Organization Profile" id="profile" />
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
//               <div className="space-y-4">
//                 {/* Industry */}
//                 <div className="space-y-1">
//                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
//                     Industry
//                   </label>
//                   {activeSection === 'profile' ? (
//                     <input
//                       className="w-full mt-1 p-3 bg-gray-50 border-none rounded-xl text-sm"
//                       value={tempData?.profile?.industry}
//                       onChange={(e) =>
//                         setTempData({
//                           ...tempData,
//                           profile: {
//                             ...tempData.profile,
//                             industry: e.target.value,
//                           },
//                         })
//                       }
//                     />
//                   ) : (
//                     <p className="text-sm font-bold text-gray-800 flex items-center gap-2 mt-1">
//                       <Building2 size={16} className="text-gray-300" />{' '}
//                       {organisation.profile?.industry || '—'}
//                     </p>
//                   )}
//                 </div>
//                 {/* Website */}
//                 <div className="space-y-1">
//                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
//                     Website
//                   </label>
//                   {activeSection === 'profile' ? (
//                     <input
//                       className="w-full mt-1 p-3 bg-gray-50 border-none rounded-xl text-sm"
//                       value={tempData?.profile?.website}
//                       onChange={(e) =>
//                         setTempData({
//                           ...tempData,
//                           profile: {
//                             ...tempData.profile,
//                             website: e.target.value,
//                           },
//                         })
//                       }
//                     />
//                   ) : (
//                     <p className="text-blue-600 text-sm font-bold flex items-center gap-2 mt-1 underline italic cursor-pointer">
//                       <Globe size={16} className="text-gray-300" />{' '}
//                       {organisation.profile?.website || '—'}
//                     </p>
//                   )}
//                 </div>
//               </div>
//               <div className="space-y-4">
//                 {/* Size */}
//                 <div className="space-y-1">
//                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
//                     Org Size
//                   </label>
//                   {activeSection === 'profile' ? (
//                     <input
//                       className="w-full mt-1 p-3 bg-gray-50 border-none rounded-xl text-sm"
//                       value={tempData?.profile?.size}
//                       onChange={(e) =>
//                         setTempData({
//                           ...tempData,
//                           profile: {
//                             ...tempData.profile,
//                             size: e.target.value,
//                           },
//                         })
//                       }
//                     />
//                   ) : (
//                     <p className="text-sm font-bold text-gray-800 flex items-center gap-2 mt-1">
//                       <Users size={16} className="text-gray-300" />{' '}
//                       {organisation.profile?.size || '—'}
//                     </p>
//                   )}
//                 </div>
//                 {/* Address */}
//                 <div className="space-y-1">
//                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
//                     Headquarters
//                   </label>
//                   {activeSection === 'profile' ? (
//                     <input
//                       className="w-full mt-1 p-3 bg-gray-50 border-none rounded-xl text-sm"
//                       value={tempData?.profile?.address}
//                       onChange={(e) =>
//                         setTempData({
//                           ...tempData,
//                           profile: {
//                             ...tempData.profile,
//                             address: e.target.value,
//                           },
//                         })
//                       }
//                     />
//                   ) : (
//                     <p className="text-sm font-bold text-gray-800 flex items-center gap-2 mt-1">
//                       <MapPin size={16} className="text-gray-300" />{' '}
//                       {organisation.profile?.address || '—'}
//                     </p>
//                   )}
//                 </div>
//               </div>
//               {/* Description */}
//               <div className="md:col-span-2 border-t border-gray-50 pt-6">
//                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
//                   Description
//                 </label>
//                 {activeSection === 'profile' ? (
//                   <textarea
//                     className="w-full mt-2 p-4 bg-gray-50 border-none rounded-2xl text-sm min-h-[120px]"
//                     value={tempData?.profile?.description}
//                     onChange={(e) =>
//                       setTempData({
//                         ...tempData,
//                         profile: {
//                           ...tempData.profile,
//                           description: e.target.value,
//                         },
//                       })
//                     }
//                   />
//                 ) : (
//                   <p className="text-sm text-gray-500 font-medium leading-relaxed mt-2">
//                     {organisation.profile?.description ||
//                       'No description provided. Click edit to add one.'}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>
//           {/* CONTACT INFO */}
//           <div
//             className={`bg-white rounded-[2rem] p-8 border transition-all duration-300 ${activeSection === 'contact' ? 'border-black ring-4 ring-gray-50' : 'border-gray-100 shadow-sm'}`}
//           >
//             <SectionHeader title="Primary Contact Information" id="contact" />
//             <div className="grid grid-cols-1 md:grid-cols-1 gap-8 ">
//               {[
//                 { label: 'Representative', key: 'name', icon: null },
//                 {
//                   label: 'Official Email',
//                   key: 'email',
//                   icon: <Mail size={14} className="text-gray-300" />,
//                 },
//                 {
//                   label: 'Phone Line',
//                   key: 'phone',
//                   icon: <Phone size={14} className="text-gray-300" />,
//                 },
//               ].map((field) => (
//                 <div key={field.label} className="space-y-1">
//                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
//                     {field.label}
//                   </label>
//                   {activeSection === 'contact' ? (
//                     <input
//                       className="w-full mt-1 p-3 bg-gray-50 border-none rounded-xl text-sm"
//                       value={tempData?.contactInfo?.[field.key]}
//                       onChange={(e) =>
//                         setTempData({
//                           ...tempData,
//                           contactInfo: {
//                             ...tempData.contactInfo,
//                             [field.key]: e.target.value,
//                           },
//                         })
//                       }
//                     />
//                   ) : (
//                     <p className="text-sm font-bold text-gray-900 flex items-center gap-2 mt-1">
//                       {field.icon}{' '}
//                       {organisation.contactInfo?.[field.key] || '—'}
//                     </p>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//         {/* RIGHT COLUMN: ANALYTICS & BETA */}
//         <div className="space-y-8">
//           <div className="bg-black rounded-[2.5rem] p-8 text-white shadow-2xl relative group overflow-hidden">
//             <div className="relative z-10">
//               <div className="flex justify-between items-center mb-6">
//                 <h3 className="font-black italic tracking-tighter text-xl underline decoration-blue-500">
//                   BETA_ACCESS
//                 </h3>
//                 <input
//                   type="checkbox"
//                   className="w-5 h-5 accent-blue-500 cursor-pointer"
//                   checked={organisation.betaFeaturesEnabled}
//                   onChange={async (e) =>
//                     await updateProfile({
//                       betaFeaturesEnabled: e.target.checked,
//                     })
//                   }
//                 />
//               </div>
//               <p className="text-xs text-gray-400 font-medium leading-relaxed">
//                 Unlock experimental AI recruiting modules and advanced API
//                 analytics.
//               </p>
//             </div>
//             <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-600 rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default OrganizationProfilePage;
}),
"[project]/app/dashboard/company/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$organisation$2f$OrganisationProfile$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/organisation/OrganisationProfile.tsx [app-rsc] (ecmascript)");
;
;
const page = ()=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$organisation$2f$OrganisationProfile$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
            fileName: "[project]/app/dashboard/company/page.tsx",
            lineNumber: 7,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/app/dashboard/company/page.tsx",
        lineNumber: 6,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = page;
}),
"[project]/app/dashboard/company/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/dashboard/company/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e837403b._.js.map