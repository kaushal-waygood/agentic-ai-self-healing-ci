// 'use client';

// import { useState, useRef } from 'react';
// import { motion } from 'framer-motion';
// import {
//   Loader2,
//   UploadCloud,
//   List,
//   ClipboardPaste,
//   Briefcase,
// } from 'lucide-react';

// interface JobListing {
//   _id: string; // Use _id to match the database
//   title: string;
//   company: string;
// }

// type JobStepProps = {
//   isLoading: boolean;
//   loadingMessage: string;
//   jobListings: JobListing[];
//   handleJobContextSubmit: (
//     mode: 'select' | 'paste' | 'upload',
//     value: File | string,
//   ) => void;
// };

// const OptionCard = ({
//   title,
//   icon: Icon,
//   children,
// }: {
//   title: string;
//   icon: React.ElementType;
//   children: React.ReactNode;
// }) => (
//   <div className="rounded-2xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-lg">
//     <div className="flex items-center mb-4">
//       <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 flex items-center justify-center mr-4">
//         <Icon className="w-5 h-5 text-slate-600" />
//       </div>
//       <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
//     </div>
//     <div className="space-y-4">{children}</div>
//   </div>
// );

// export function JobStep({
//   isLoading,
//   loadingMessage,
//   jobListings = [],
//   handleJobContextSubmit,
// }: JobStepProps) {
//   const [pastedJobDesc, setPastedJobDesc] = useState('');
//   const [selectedJobId, setSelectedJobId] = useState('');
//   const jobDescFileInputRef = useRef<HTMLInputElement>(null);

//   return (
//     <div className="p-4 sm:p-6 font-sans">
//       <div className="max-w-7xl mx-auto">
//         <div className="text-center mb-8">
//           <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl shadow-sm">
//             <Briefcase className="w-8 h-8 text-purple-600" />
//           </div>
//           <h2 className="text-3xl font-bold text-slate-800 mb-2">
//             Step 1: The Job Description
//           </h2>
//           <p className="text-slate-600 text-lg max-w-md mx-auto">
//             Start by providing the job you're applying for.
//           </p>
//         </div>

//         <div className="space-y-6">
//           <OptionCard title="Select a Saved Job" icon={List}>
//             <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg bg-slate-50/50 p-2 border border-slate-200">
//               {jobListings.length > 0 ? (
//                 jobListings.slice(0, 10).map((job) => (
//                   <label
//                     key={job._id}
//                     className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
//                       selectedJobId === job._id
//                         ? 'bg-purple-50 border-purple-400 shadow-sm'
//                         : 'bg-white border-transparent hover:bg-slate-100'
//                     }`}
//                   >
//                     <input
//                       type="radio"
//                       name="job-selection"
//                       value={job._id}
//                       checked={selectedJobId === job._id}
//                       onChange={(e) => setSelectedJobId(e.target.value)}
//                       className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-slate-300"
//                     />
//                     <div>
//                       <span className="font-semibold text-slate-800">
//                         {job.title}
//                       </span>
//                       <span className="text-slate-600"> at {job.company}</span>
//                     </div>
//                   </label>
//                 ))
//               ) : (
//                 <div className="text-center p-4 text-slate-500">
//                   No saved jobs found.
//                 </div>
//               )}
//             </div>
//             <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
//               <button
//                 onClick={() => handleJobContextSubmit('select', selectedJobId)}
//                 disabled={!selectedJobId || isLoading}
//                 className="w-full p-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white rounded-xl font-bold text-md shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Use Selected Job
//               </button>
//             </motion.div>
//           </OptionCard>

//           <OptionCard title="Paste Job Details" icon={ClipboardPaste}>
//             <textarea
//               placeholder="Paste the full job description here..."
//               className="w-full min-h-[150px] p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-shadow"
//               value={pastedJobDesc}
//               onChange={(e) => setPastedJobDesc(e.target.value)}
//             />
//             <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
//               <button
//                 onClick={() => handleJobContextSubmit('paste', pastedJobDesc)}
//                 disabled={!pastedJobDesc || isLoading}
//                 className="w-full p-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white rounded-xl font-bold text-md shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Use Pasted Description
//               </button>
//             </motion.div>
//           </OptionCard>

//           <OptionCard title="Upload a File" icon={UploadCloud}>
//             <button
//               onClick={() => jobDescFileInputRef.current?.click()}
//               disabled={isLoading}
//               className="w-full p-4 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-semibold text-md hover:bg-slate-200 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isLoading && loadingMessage ? (
//                 <>
//                   {' '}
//                   <Loader2 className="mr-2 h-5 w-5 text-purple-600 animate-spin" />{' '}
//                   {loadingMessage}{' '}
//                 </>
//               ) : (
//                 <>
//                   {' '}
//                   <UploadCloud className="mr-2 h-5 w-5 text-purple-500" />{' '}
//                   Upload Job Description File{' '}
//                 </>
//               )}
//             </button>
//             <input
//               type="file"
//               ref={jobDescFileInputRef}
//               onChange={(e) =>
//                 e.target.files?.[0] &&
//                 handleJobContextSubmit('upload', e.target.files[0])
//               }
//               className="hidden"
//               accept=".pdf,.png,.jpg,.jpeg,.txt,.docx"
//             />
//             <p className="text-xs text-slate-500 text-center">
//               PDF, PNG, JPG, DOCX, and TXT are supported.
//             </p>
//           </OptionCard>
//         </div>
//       </div>
//     </div>
//   );
// }

// 'use client';

// import { useState, useRef } from 'react';
// import { motion } from 'framer-motion';
// import {
//   Loader2,
//   UploadCloud,
//   List,
//   ClipboardPaste,
//   Briefcase,
// } from 'lucide-react';

// interface JobListing {
//   _id: string;
//   title: string;
//   company: string;
// }

// type JobStepProps = {
//   isLoading: boolean;
//   loadingMessage: string;
//   jobListings: JobListing[];
//   handleJobContextSubmit: (
//     mode: 'select' | 'paste' | 'upload',
//     value: File | string,
//   ) => void;
// };

// const OptionCard = ({
//   title,
//   icon: Icon,
//   children,
// }: {
//   title: string;
//   icon: React.ElementType;
//   children: React.ReactNode;
// }) => (
//   <div className="rounded-2xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-lg">
//     <div className="flex items-center mb-4">
//       <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 flex items-center justify-center mr-4">
//         <Icon className="w-5 h-5 text-slate-600" />
//       </div>
//       <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
//     </div>
//     <div className="space-y-4">{children}</div>
//   </div>
// );

// export function JobStep({
//   isLoading,
//   loadingMessage,
//   jobListings = [],
//   handleJobContextSubmit,
// }: JobStepProps) {
//   const [activeTab, setActiveTab] = useState<'select' | 'paste' | 'upload'>(
//     'select',
//   );
//   const [pastedJobDesc, setPastedJobDesc] = useState('');
//   const [selectedJobId, setSelectedJobId] = useState('');
//   const jobDescFileInputRef = useRef<HTMLInputElement>(null);

//   return (
//     <div className="p-4 sm:p-6 font-sans">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl shadow-sm">
//             <Briefcase className="w-8 h-8 text-purple-600" />
//           </div>
//           <h2 className="text-3xl font-bold text-slate-800 mb-2">
//             Step 1: The Job Description
//           </h2>
//           <p className="text-slate-600 text-lg max-w-md mx-auto">
//             Start by providing the job you're applying for.
//           </p>
//         </div>

//         {/* Tabs */}
//         <div className="flex justify-center mb-6 border-b border-slate-200">
//           {[
//             { key: 'select', label: 'Select Job', icon: List },
//             { key: 'paste', label: 'Paste JD', icon: ClipboardPaste },
//             { key: 'upload', label: 'Upload File', icon: UploadCloud },
//           ].map((tab) => (
//             <button
//               key={tab.key}
//               onClick={() =>
//                 setActiveTab(tab.key as 'select' | 'paste' | 'upload')
//               }
//               className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
//                 activeTab === tab.key
//                   ? 'border-purple-500 text-purple-600'
//                   : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
//               }`}
//             >
//               <tab.icon className="w-4 h-4" />
//               {tab.label}
//             </button>
//           ))}
//         </div>

//         {/* Tab Content */}
//         <div className="mt-6">
//           {activeTab === 'select' && (
//             <OptionCard title="Select a Saved Job" icon={List}>
//               <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg bg-slate-50/50 p-2 border border-slate-200">
//                 {jobListings.length > 0 ? (
//                   jobListings.slice(0, 10).map((job) => (
//                     <label
//                       key={job._id}
//                       className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
//                         selectedJobId === job._id
//                           ? 'bg-purple-50 border-purple-400 shadow-sm'
//                           : 'bg-white border-transparent hover:bg-slate-100'
//                       }`}
//                     >
//                       <input
//                         type="radio"
//                         name="job-selection"
//                         value={job._id}
//                         checked={selectedJobId === job._id}
//                         onChange={(e) => setSelectedJobId(e.target.value)}
//                         className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-slate-300"
//                       />
//                       <div>
//                         <span className="font-semibold text-slate-800">
//                           {job.title}
//                         </span>
//                         <span className="text-slate-600">
//                           {' '}
//                           at {job.company}
//                         </span>
//                       </div>
//                     </label>
//                   ))
//                 ) : (
//                   <div className="text-center p-4 text-slate-500">
//                     No saved jobs found.
//                   </div>
//                 )}
//               </div>
//               <motion.div
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 <button
//                   onClick={() =>
//                     handleJobContextSubmit('select', selectedJobId)
//                   }
//                   disabled={!selectedJobId || isLoading}
//                   className="w-full p-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white rounded-xl font-bold text-md shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Use Selected Job
//                 </button>
//               </motion.div>
//             </OptionCard>
//           )}

//           {activeTab === 'paste' && (
//             <OptionCard title="Paste Job Details" icon={ClipboardPaste}>
//               <textarea
//                 placeholder="Paste the full job description here..."
//                 className="w-full min-h-[150px] p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-shadow"
//                 value={pastedJobDesc}
//                 onChange={(e) => setPastedJobDesc(e.target.value)}
//               />
//               <motion.div
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 <button
//                   onClick={() => handleJobContextSubmit('paste', pastedJobDesc)}
//                   disabled={!pastedJobDesc || isLoading}
//                   className="w-full p-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white rounded-xl font-bold text-md shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Use Pasted Description
//                 </button>
//               </motion.div>
//             </OptionCard>
//           )}

//           {activeTab === 'upload' && (
//             <OptionCard title="Upload a File" icon={UploadCloud}>
//               <button
//                 onClick={() => jobDescFileInputRef.current?.click()}
//                 disabled={isLoading}
//                 className="w-full p-4 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-semibold text-md hover:bg-slate-200 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isLoading && loadingMessage ? (
//                   <>
//                     <Loader2 className="mr-2 h-5 w-5 text-purple-600 animate-spin" />
//                     {loadingMessage}
//                   </>
//                 ) : (
//                   <>
//                     <UploadCloud className="mr-2 h-5 w-5 text-purple-500" />
//                     Upload Job Description File
//                   </>
//                 )}
//               </button>
//               <input
//                 type="file"
//                 ref={jobDescFileInputRef}
//                 onChange={(e) =>
//                   e.target.files?.[0] &&
//                   handleJobContextSubmit('upload', e.target.files[0])
//                 }
//                 className="hidden"
//                 accept=".pdf,.png,.jpg,.jpeg,.txt,.docx"
//               />
//               <p className="text-xs text-slate-500 text-center">
//                 PDF, PNG, JPG, DOCX, and TXT are supported.
//               </p>
//             </OptionCard>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useState, useRef } from "react";
// import { motion } from "framer-motion";
// import {
//   Loader2,
//   UploadCloud,
//   List,
//   ClipboardPaste,
//   Briefcase,
//   Type,
//   CloudUpload,
//   UploadCloudIcon,
//   Target,
//   Sparkles,
//   ChevronsRight,
// } from "lucide-react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";

// interface JobListing {
//   _id: string;
//   title: string;
//   company: string;
// }

// type JobStepProps = {
//   isLoading: boolean;
//   loadingMessage: string;
//   jobListings: JobListing[];
//   handleJobContextSubmit: (
//     mode: "select" | "paste" | "upload",
//     value: File | string
//   ) => void;
// };

// export function JobStep({
//   isLoading,
//   loadingMessage,
//   jobListings = [],
//   handleJobContextSubmit,
// }: JobStepProps) {
//   const [activeTab, setActiveTab] = useState<"paste" | "select" | "upload">(
//     "paste"
//   );
//   const [pastedJobDesc, setPastedJobDesc] = useState("");
//   const [selectedJobId, setSelectedJobId] = useState("");
//   const jobDescFileInputRef = useRef<HTMLInputElement>(null);

//   return (
//     // <div className="w-full max-w-5xl mx-auto font-sans bg-white rounded-2xl shadow-sm border border-slate-100">
//     <div className="p-3 sm:p-4 md:p-6 lg:p-8 ">
//       <div className="max-w-7xl mx-auto">
//         {/* Enhanced Header */}
//         <div className="text-center mb-4 relative">
//           <div className="inline-block relative ">
//             <div className="absolute inset-0 "></div>
//             <h1 className="text-4xl  bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent relative z-10 mb-3">
//               Application Wizard
//             </h1>
//           </div>
//           <p className="text-gray-600 text-sm max-w-2xl mx-auto leading-relaxed">
//             Simplify your job application process with our intuitive
//             step-by-step
//           </p>
//         </div>

//         <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl shadow-pink-500/10 rounded-xl overflow-hidden">
//           {/* Header */}

//           <CardHeader className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white relative overflow-hidden p-2">
//             <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
//             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse"></div>
//             <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24 animate-pulse delay-75"></div>

//             <div className="relative z-10">
//               <div className="flex items-center gap-4 mb-2">
//                 <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
//                   <Briefcase className="h-6 w-6 text-white" />
//                 </div>
//                 <div>
//                   <CardTitle className="text-xl font-bold">
//                     Step 1: Provide Job Context
//                   </CardTitle>
//                   <p className="text-white/80 text-sm mt-1">
//                     Choose your preferred method below
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </CardHeader>

//           <CardContent className="p-2 md:p-3">
//             {/* Tabs */}

//             <div className="grid grid-cols-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-1.5 mb-4 h-auto shadow-inner">
//               {[
//                 { key: "paste", label: "Paste JD", icon: ClipboardPaste },
//                 { key: "select", label: "Saved Job", icon: List },
//                 { key: "upload", label: "Upload", icon: UploadCloudIcon },
//               ].map((tab) => (
//                 <button
//                   key={tab.key}
//                   onClick={() =>
//                     setActiveTab(tab.key as "paste" | "select" | "upload")
//                   }
//                   className={`flex items-center justify-center gap-2 p-4 rounded-xl transition-all duration-500 ${
//                     activeTab === tab.key
//                       ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md scale-[1.02]"
//                       : "bg-slate-100 text-slate-700 hover:bg-slate-200"
//                   }`}
//                 >
//                   <tab.icon className="w-5 h-5" />
//                   {tab.label}
//                 </button>
//               ))}
//             </div>

//             {/* Tab Content */}
//             <div className="">
//               {activeTab === "paste" && (
//                 <div>
//                   <textarea
//                     placeholder="✨ Paste the full job description here... Include requirements, responsibilities, and company culture for best results."
//                     className="w-full min-h-[280px] p-4 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-shadow"
//                     value={pastedJobDesc}
//                     onChange={(e) => setPastedJobDesc(e.target.value)}
//                   />
//                   <div className="text-red-500 text-sm mt-2 font-medium">
//                     {pastedJobDesc.length} / 200 characters
//                   </div>
//                   <motion.div
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                   >
//                     {/* <button
//                       onClick={() =>
//                         handleJobContextSubmit("paste", pastedJobDesc)
//                       }
//                       disabled={!pastedJobDesc || isLoading}
//                       className="mt-4 w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 shadow-lg hover:shadow-purple-400/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       {isLoading ? (
//                         <Loader2 className="w-5 h-5 animate-spin mx-auto" />
//                       ) : (
//                         "Generate My Cover Letter"
//                       )}
//                     </button> */}

//                     <Button
//                       className={`h-16 text-lg font-bold rounded-2xl transition-all duration-500 transform hover:scale-[1.02] active:scale-95 shadow-xl ${
//                          !isLoading
//                           ? "bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:shadow-2xl hover:shadow-pink-500/50 text-white"
//                           : "bg-gray-300 text-gray-500 cursor-not-allowed"
//                       }`}
//                       onClick={() => handleJobContextSubmit("paste",pastedJobDesc)}
//                       disabled={ isLoading}
//                     >
//                       {isLoading ? (
//                         <>
//                           <Loader2 className="animate-spin mr-3 h-6 w-6" />
//                           <span className="animate-pulse">
//                             Analyzing Job Description...
//                           </span>
//                         </>
//                       ) : (
//                         <>
//                           <Sparkles className="mr-3 h-6 w-6 animate-pulse" />
//                           Generate My Cover Letter
//                           <ChevronsRight className="ml-3 h-6 w-6" />
//                         </>
//                       )}
//                     </Button>
//                   </motion.div>
//                 </div>
//               )}

//               {activeTab === "select" && (
//                 <div>
//                   <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg bg-slate-50/50 p-2 border border-slate-200">
//                     {jobListings.length > 0 ? (
//                       jobListings.slice(0, 10).map((job) => (
//                         <label
//                           key={job._id}
//                           className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
//                             selectedJobId === job._id
//                               ? "bg-purple-50 border-purple-400 shadow-sm"
//                               : "bg-white border-transparent hover:bg-slate-100"
//                           }`}
//                         >
//                           <input
//                             type="radio"
//                             name="job-selection"
//                             value={job._id}
//                             checked={selectedJobId === job._id}
//                             onChange={(e) => setSelectedJobId(e.target.value)}
//                             className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-slate-300"
//                           />
//                           <div>
//                             <span className="font-semibold text-slate-800">
//                               {job.title}
//                             </span>
//                             <span className="text-slate-600">
//                               {" "}
//                               at {job.company}
//                             </span>
//                           </div>
//                         </label>
//                       ))
//                     ) : (
//                       <div className="text-center p-4 text-slate-500">
//                         No saved jobs found.
//                       </div>
//                     )}
//                   </div>
//                   <motion.div
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                   >
//                     <button
//                       onClick={() =>
//                         handleJobContextSubmit("select", selectedJobId)
//                       }
//                       disabled={!selectedJobId || isLoading}
//                       className="mt-4 w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 shadow-lg hover:shadow-purple-400/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       Use Selected Job
//                     </button>
//                   </motion.div>
//                 </div>
//               )}

//               {activeTab === "upload" && (
//                 <div className="text-center">
//                   <button
//                     onClick={() => jobDescFileInputRef.current?.click()}
//                     disabled={isLoading}
//                     className="w-full p-4 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-semibold text-md hover:bg-slate-200 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {isLoading && loadingMessage ? (
//                       <>
//                         <Loader2 className="mr-2 h-5 w-5 text-purple-600 animate-spin" />
//                         {loadingMessage}
//                       </>
//                     ) : (
//                       <>
//                         <UploadCloud className="mr-2 h-5 w-5 text-purple-500" />
//                         Upload Job Description File
//                       </>
//                     )}
//                   </button>
//                   <input
//                     type="file"
//                     ref={jobDescFileInputRef}
//                     onChange={(e) =>
//                       e.target.files?.[0] &&
//                       handleJobContextSubmit("upload", e.target.files[0])
//                     }
//                     className="hidden"
//                     accept=".pdf,.png,.jpg,.jpeg,.txt,.docx"
//                   />
//                   <p className="text-xs text-slate-500 text-center mt-2">
//                     PDF, PNG, JPG, DOCX, and TXT are supported.
//                   </p>
//                 </div>
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }



"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  UploadCloud,
  List,
  ClipboardPaste,
  Briefcase,
  UploadCloudIcon,
  Sparkles,
  ChevronsRight,
  CheckCircle2,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface JobListing {
  _id: string;
  title: string;
  company: string;
}

type JobStepProps = {
  isLoading: boolean;
  loadingMessage: string;
  jobListings: JobListing[];
  handleJobContextSubmit: (
    mode: "select" | "paste" | "upload",
    value: File | string
  ) => void;
};

export function JobStep({
  isLoading,
  loadingMessage,
  jobListings = [],
  handleJobContextSubmit,
}: JobStepProps) {
  const [activeTab, setActiveTab] = useState<"paste" | "select" | "upload">(
    "paste"
  );
  const [pastedJobDesc, setPastedJobDesc] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");
  const jobDescFileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Added: Character tracking logic (non-breaking)
  const charCount = pastedJobDesc.trim().length;
  const charProgress = Math.min((charCount / 200) * 100, 100);

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 relative">
          <div className="inline-block relative ">
            <div className="absolute inset-0 "></div>
            <h1 className="text-4xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent relative z-10 mb-3">
              Application Wizard
            </h1>
          </div>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto leading-relaxed">
            Simplify your job application process with our intuitive
            step-by-step
          </p>
        </div>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl shadow-pink-500/10 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white relative overflow-hidden p-2">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24 animate-pulse delay-75"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">
                    Step 1: Provide Job Context
                  </CardTitle>
                  <p className="text-white/80 text-sm mt-1">
                    Choose your preferred method below
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-2 md:p-3">
            {/* Tabs */}
            <div className="grid grid-cols-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-1.5 mb-4 shadow-inner">
              {[
                { key: "paste", label: "Paste JD", icon: ClipboardPaste },
                { key: "select", label: "Saved Job", icon: List },
                { key: "upload", label: "Upload", icon: UploadCloudIcon },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() =>
                    setActiveTab(tab.key as "paste" | "select" | "upload")
                  }
                  className={`flex items-center justify-center gap-2 p-4 rounded-xl transition-all duration-500 ${
                    activeTab === tab.key
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md scale-[1.02]"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div>
              {/* ✅ Paste Tab Enhanced */}
              {activeTab === "paste" && (
                <div className="space-y-4">
                  <div className="relative group">
                    <textarea
                      placeholder="✨ Paste the full job description here... Include requirements, responsibilities, and company culture for best results."
                      className={`w-full min-h-[280px] p-6 pr-16 border-2 rounded-2xl resize-none focus:ring-4 transition-all duration-500 bg-gradient-to-br from-gray-50 to-white shadow-inner ${
                        charCount < 200
                          ? "border-gray-300 hover:border-gray-400"
                          : "border-green-300 hover:border-green-400 ring-green-50"
                      }`}
                      value={pastedJobDesc}
                      onChange={(e) => setPastedJobDesc(e.target.value)}
                    />

                    {/* Progress bar */}
                    {charCount > 0 && (
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              charCount >= 200
                                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                : "bg-gradient-to-r from-purple-500 to-pink-500"
                            }`}
                            style={{ width: `${charProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Character Counter */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div
                        className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                          charCount < 200
                            ? "bg-gradient-to-r from-red-50 to-orange-50 text-red-700 border-2 border-red-200"
                            : "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-2 border-green-200"
                        }`}
                      >
                        {charCount} / 200 characters
                      </div>
                      {charCount >= 200 && (
                        <div className="flex items-center gap-1.5 text-green-600 animate-in fade-in slide-in-from-left duration-500">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-sm font-medium">
                            Ready to generate!
                          </span>
                        </div>
                      )}
                    </div>

                    {charCount < 200 && charCount > 0 && (
                      <span className="text-sm text-orange-600 font-medium animate-pulse">
                        {200 - charCount} more characters needed
                      </span>
                    )}
                  </div>

                  {/* Generate Button */}
                  <div className="flex flex-col gap-4">
                    <Button
                      className={`h-16 text-lg font-bold rounded-2xl transition-all duration-500 transform hover:scale-[1.02] active:scale-95 shadow-xl ${
                        charCount >= 200 && !isLoading
                          ? "bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:shadow-2xl hover:shadow-pink-500/50 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                      onClick={() =>
                        handleJobContextSubmit("paste", pastedJobDesc)
                      }
                      disabled={charCount < 200 || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin mr-3 h-6 w-6" />
                          <span className="animate-pulse">
                            Analyzing Job Description...
                          </span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-3 h-6 w-6 animate-pulse" />
                          Generate My Cover Letter
                          <ChevronsRight className="ml-3 h-6 w-6" />
                        </>
                      )}
                    </Button>
                    <div className="flex items-start gap-3  p-2 rounded-xl border-2 border-purple-100 shadow-sm">
                      <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg flex-shrink-0">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 ">
                          Pro Tips for Best Results:
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          Include job requirements, key responsibilities,
                          required skills, and company culture. The more
                          detailed the job description, the better your cover
                          letter will be optimized!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ Existing Select Tab (unchanged) */}
              {activeTab === "select" && (
                <div>
                  <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg bg-slate-50/50 p-2 border border-slate-200">
                    {jobListings.length > 0 ? (
                      jobListings.slice(0, 10).map((job) => (
                        <label
                          key={job._id}
                          className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                            selectedJobId === job._id
                              ? "bg-purple-50 border-purple-400 shadow-sm"
                              : "bg-white border-transparent hover:bg-slate-100"
                          }`}
                        >
                          <input
                            type="radio"
                            name="job-selection"
                            value={job._id}
                            checked={selectedJobId === job._id}
                            onChange={(e) => setSelectedJobId(e.target.value)}
                            className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-slate-300"
                          />
                          <div>
                            <span className="font-semibold text-slate-800">
                              {job.title}
                            </span>
                            <span className="text-slate-600">
                              {" "}
                              at {job.company}
                            </span>
                          </div>
                        </label>
                      ))
                    ) : (
                      <div className="text-center p-4 text-slate-500">
                        No saved jobs found.
                      </div>
                    )}
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <button
                      onClick={() =>
                        handleJobContextSubmit("select", selectedJobId)
                      }
                      disabled={!selectedJobId || isLoading}
                      className="mt-4 w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 shadow-lg hover:shadow-purple-400/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Use Selected Job
                    </button>
                  </motion.div>
                </div>
              )}

              {/* ✅ Existing Upload Tab (unchanged) */}
              {activeTab === "upload" && (
                <div className="text-center p-10">
                  <button
                    onClick={() => jobDescFileInputRef.current?.click()}
                    disabled={isLoading}
                    className="w-full min-h-[280px] bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-semibold text-md hover:bg-slate-200 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading && loadingMessage ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 text-purple-600 animate-spin" />
                        {loadingMessage}
                      </>
                    ) : (
                      <>
                        <UploadCloud className="mr-2 h-5 w-5 text-purple-500" />
                        Upload Job Description File
                      </>
                    )}
                  </button>
                  <input
                    type="file"
                    ref={jobDescFileInputRef}
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleJobContextSubmit("upload", e.target.files[0])
                    }
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.txt,.docx"
                  />
                  <p className="text-xs text-slate-500 text-center mt-2">
                    PDF, PNG, JPG, DOCX, and TXT are supported.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
