// 'use client';

// import { useState, useRef, useEffect } from 'react';
// import {
//   Loader2,
//   UploadCloud,
//   List,
//   ClipboardPaste,
//   Briefcase,
//   UploadCloudIcon,
//   Sparkles,
//   ChevronsRight,
//   CheckCircle2,
//   DollarSign,
//   MapPin,
// } from 'lucide-react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import apiInstance from '@/services/api';
// import { Loader } from '@/components/Loader';

// interface Job {
//   _id: string;
//   title: string;
//   company: string;
//   logo?: string;
//   jobAddress: string;
//   salary: {
//     min: number;
//     max: number;
//     period: string;
//   };
//   jobTypes: string[];
// }

// interface JobCardProps {
//   job: Job;
// }

// // Helper function to format the salary range
// const formatSalary = (salary: JobDetails['salary']) => {
//   if (!salary || (salary.min === 0 && salary.max === 0)) {
//     return 'Not Disclosed';
//   }
//   const formatValue = (value: number) => `$${Math.round(value / 1000)}k`;
//   const periodMap: { [key: string]: string } = {
//     YEAR: 'yr',
//     MONTH: 'mo',
//     HOUR: 'hr',
//   };

//   return `${formatValue(salary.min)} - ${formatValue(salary.max)} / ${
//     periodMap[salary.period] || 'yr'
//   }`;
// };

// export const JobCard = ({ job: savedJob }: JobCardProps) => {
//   const { job } = savedJob;
//   const [isHovered, setIsHovered] = useState(false);

//   return (
//     <div
//       className="w-full bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-lg p-4 transition-all duration-500 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1 cursor-pointer group relative overflow-hidden"
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <div className="flex items-start gap-4 relative z-10">
//         {/* Company Logo with enhanced animation */}
//         <div
//           className="hidden
//     sm:flex flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 border-2 border-white"
//         >
//           {job.logo ? (
//             <img
//               src={job.logo}
//               alt={`${job.company} logo`}
//               className="w-full h-full object-contain rounded-lg"
//             />
//           ) : (
//             <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
//               {job.company?.charAt(0)}
//             </span>
//           )}
//         </div>

//         {/* Job Details */}
//         <div className="flex-1 min-w-0">
//           <p className="text-sm font-medium text-gray-500 truncate mb-1">
//             {job.company}
//           </p>
//           <p className="font-semibold text-gray-900">
//             {job.title.length > 45 ? job.title.slice(0, 35) + '…' : job.title}
//           </p>

//           <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
//             {job.location?.city && (
//               <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-300 border border-gray-100">
//                 <MapPin className="w-4 h-4 text-purple-500" />
//                 <span className="font-medium text-gray-700">
//                   {job.location.city}
//                 </span>
//               </div>
//             )}

//             {job.salary && (
//               <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-300 border border-green-100">
//                 <DollarSign className="w-4 h-4 text-green-600" />
//                 <span className="font-medium text-gray-700">
//                   {formatSalary(job.salary)}
//                 </span>
//               </div>
//             )}

//             {job.jobTypes && job.jobTypes.length > 0 && (
//               <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-300 border border-blue-100">
//                 <Briefcase className="w-4 h-4 text-blue-600" />
//                 <span className="font-medium text-gray-700 capitalize">
//                   {job.jobTypes[0].toLowerCase()}
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
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

// export function JobStep({
//   isLoading,
//   loadingMessage,
//   handleJobContextSubmit,
// }: JobStepProps) {
//   const [activeTab, setActiveTab] = useState<'paste' | 'select' | 'upload'>(
//     'paste',
//   );
//   const [pastedJobDesc, setPastedJobDesc] = useState('');
//   const [selectedJobId, setSelectedJobId] = useState('');
//   const jobDescFileInputRef = useRef<HTMLInputElement>(null);
//   const [savedJobs, setSavedJobs] = useState([]);

//   useEffect(() => {
//     const fetchSavedJobs = async () => {
//       try {
//         const response = await apiInstance.get(
//           '/students/jobs/events?type=SAVED',
//         );
//         setSavedJobs(response.data.jobs);
//       } catch (error) {
//         console.error('Error fetching saved jobs:', error);
//       }
//     };

//     fetchSavedJobs();
//   }, []);

//   const charCount = pastedJobDesc.trim().length;
//   const charProgress = Math.min((charCount / 200) * 100, 100);

//   return (
//     <div className="p-3 sm:p-4 md:p-6 lg:p-8 ">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-4 relative">
//           <div className="inline-block relative ">
//             <h1 className="text-2xl uppercase font-semibold sm:text-3xl md:text-4xl bg-headingTextPrimary bg-clip-text text-transparent relative z-10">
//               Tailored Application
//             </h1>
//           </div>
//           <p className="text-gray-600 text-sm max-w-2xl mx-auto leading-relaxed">
//             Simplify your job application process with our intuitive
//             step-by-step
//           </p>
//         </div>

//         <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl shadow-pink-500/10 rounded-lg overflow-hidden">
//           <CardHeader className="bg-header-gradient-primary text-white relative overflow-hidden p-2">
//             <div className="relative z-10">
//               <div className="flex items-center gap-4 mb-2">
//                 <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg border border-white/30">
//                   <Briefcase className="h-6 w-6 text-white" />
//                 </div>
//                 <div>
//                   <CardTitle className="text-xl font-semibold">
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
//             <div className="grid grid-cols-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-1.5 mb-4 shadow-inner">
//               {[
//                 { key: 'paste', label: 'Paste JD', icon: ClipboardPaste },
//                 { key: 'select', label: 'Saved Job', icon: List },
//                 { key: 'upload', label: 'Upload', icon: UploadCloudIcon },
//               ].map((tab) => (
//                 <button
//                   key={tab.key}
//                   onClick={() =>
//                     setActiveTab(tab.key as 'paste' | 'select' | 'upload')
//                   }
//                   className={`flex items-center justify-center gap-2 p-4 rounded-lg transition-all duration-500 ${
//                     activeTab === tab.key
//                       ? 'bg-tabPrimary text-white shadow-md scale-[1.02]'
//                       : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
//                   }`}
//                 >
//                   <tab.icon className="w-5 h-5" />
//                   {tab.label}
//                 </button>
//               ))}
//             </div>

//             {/* Tab Content */}
//             <div>
//               {/* ✅ Paste Tab Enhanced */}
//               {activeTab === 'paste' && (
//                 <div className="space-y-4">
//                   <div className="relative group">
//                     <textarea
//                       placeholder="✨ Paste the full job description here... Include requirements, responsibilities, and company culture for best results."
//                       className={`w-full min-h-[280px] p-6 pr-16 border-2 rounded-lg resize-none focus:ring-4 transition-all duration-500  ${
//                         charCount < 200
//                           ? ''
//                           : 'border-green-300 hover:border-green-400 ring-green-50'
//                       }`}
//                       value={pastedJobDesc}
//                       onChange={(e) => setPastedJobDesc(e.target.value)}
//                     />

//                     {/* Progress bar */}
//                     {charCount > 0 && (
//                       <div className="absolute bottom-3 left-3 right-3">
//                         <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
//                           <div
//                             className={`h-full transition-all duration-500 rounded-full ${
//                               charCount >= 200
//                                 ? 'bg-gradient-to-r from-green-500 to-emerald-500'
//                                 : 'bg-gradient-to-r from-purple-500 to-pink-500'
//                             }`}
//                             style={{ width: `${charProgress}%` }}
//                           ></div>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* Character Counter */}
//                   <div className="flex flex-wrap justify-between items-center">
//                     <div className="flex items-center gap-3">
//                       <div
//                         className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
//                           charCount < 200 ? 'text-red-700' : ' text-green-700 '
//                         }`}
//                       >
//                         {charCount} / 200 characters
//                       </div>
//                       {charCount >= 200 && (
//                         <div className="flex items-center gap-1.5 text-green-600 animate-in fade-in slide-in-from-left duration-500">
//                           <CheckCircle2 className="w-5 h-5" />
//                           <span className="text-sm font-medium">
//                             Ready to generate!
//                           </span>
//                         </div>
//                       )}
//                     </div>

//                     {charCount < 200 && charCount > 0 && (
//                       <span className="text-sm text-orange-600 font-medium animate-pulse">
//                         {200 - charCount} more characters needed
//                       </span>
//                     )}
//                     <Button
//                       className={`h-16 text-lg font-bold rounded-lg transition-all duration-500 transform hover:scale-[1.02] active:scale-95 shadow-xl ${
//                         charCount >= 200 && !isLoading
//                           ? 'text-white'
//                           : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                       }`}
//                       onClick={() =>
//                         handleJobContextSubmit('paste', pastedJobDesc)
//                       }
//                       disabled={charCount < 200 || isLoading}
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
//                           <Sparkles className=" h-6 w-6 animate-pulse" />
//                           Generate My Cover Letter
//                           <ChevronsRight className=" h-6 w-6" />
//                         </>
//                       )}
//                     </Button>
//                   </div>
//                 </div>
//               )}

//               {activeTab === 'select' && (
//                 <div
//                   value="select"
//                   className="space-y-6 animate-in fade-in duration-500"
//                 >
//                   {isLoading ? (
//                     <Loader />
//                   ) : (
//                     <>
//                       {savedJobs?.length > 0 ? (
//                         <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
//                           {savedJobs.map((job: any) => (
//                             <div
//                               key={job?.job?._id || job._id}
//                               onClick={() => {
//                                 handleJobContextSubmit('select', job?.job?._id);
//                               }}
//                               className="cursor-pointer transition-transform hover:scale-[1.01]"
//                             >
//                               <JobCard job={job} />
//                             </div>
//                           ))}
//                         </div>
//                       ) : (
//                         /* 3. EMPTY STATE */
//                         <div className="text-center py-20">
//                           <div className="relative inline-block mb-6">
//                             <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-2xl opacity-30 animate-pulse"></div>
//                             <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mx-auto flex items-center justify-center shadow-2xl relative z-10 transform hover:scale-110 transition-transform duration-300">
//                               <Briefcase className="h-12 w-12 text-white" />
//                             </div>
//                           </div>
//                           <h3 className="text-3xl font-bold text-gray-900 mb-4">
//                             No Saved Jobs Yet
//                           </h3>
//                           <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
//                             Start saving jobs you're interested in, and they'll
//                             appear here for quick cover letter generation!
//                           </p>
//                         </div>
//                       )}
//                     </>
//                   )}
//                 </div>
//               )}
//               {/* ✅ Existing Upload Tab (unchanged) */}
//               {activeTab === 'upload' && (
//                 <div className="text-center p-10">
//                   <button
//                     onClick={() => jobDescFileInputRef.current?.click()}
//                     disabled={isLoading}
//                     className="w-full min-h-[280px] bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-semibold text-md hover:bg-slate-200 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
//                       handleJobContextSubmit('upload', e.target.files[0])
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

'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Briefcase,
  Loader2,
  Target,
  User,
  CheckCircle2,
  FileSignature,
  UploadCloudIcon,
  UploadCloud,
} from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import apiInstance from '@/services/api';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import { Loader } from '@/components/Loader';

// Define the structure of the job object for type safety
interface Job {
  _id: string;
  title: string;
  company: string;
  logo?: string;
  jobAddress?: string;
  salary?: {
    min: number;
    max: number;
    period: string;
  };
  jobTypes?: string[];
  createdAt?: string;
}

interface JobCardProps {
  job: {
    job: Job;
    status?: string;
    savedAt?: string;
  };
}

// Redesigned JobCard to match the clean radio-selection list from the reference
export const JobCard = ({ job: savedJob }: JobCardProps) => {
  const { job, savedAt } = savedJob;

  // Format date nicely
  const dateStr = savedAt || job.createdAt;
  const displayDate = dateStr
    ? new Date(dateStr).toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'Recently';

  return (
    <div className="group flex cursor-pointer items-center justify-between rounded-xl border-2 border-slate-200 bg-white p-4 transition-all hover:border-blue-300 hover:bg-slate-50">
      <div className="flex items-center gap-4">
        {/* Pseudo-radio button */}
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 transition-colors group-hover:border-blue-500">
          <div className="h-2.5 w-2.5 scale-0 rounded-full bg-blue-600 transition-transform group-active:scale-100"></div>
        </div>
        <div>
          <div className="text-[14px] font-bold leading-tight text-slate-900 line-clamp-1">
            {job.title}
          </div>
          <div className="mt-0.5 text-[11px] font-medium text-slate-500">
            {job.company}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-[11px] font-medium text-slate-400">
          {displayDate}
        </div>
      </div>
    </div>
  );
};

type JobStepProps = {
  isLoading: boolean;
  loadingMessage: string;
  handleJobContextSubmit: (
    mode: 'select' | 'paste' | 'upload' | 'title',
    value: File | string,
  ) => void;
};

export function JobStep({
  isLoading,
  loadingMessage,
  handleJobContextSubmit,
}: JobStepProps) {
  const [activeTab, setActiveTab] = useState<
    'paste' | 'select' | 'upload' | 'title'
  >('paste');
  const [pastedJobDesc, setPastedJobDesc] = useState('');
  const [enteredJobTitle, setEnteredJobTitle] = useState('');
  const [jobTitleError, setJobTitleError] = useState<string | null>(null);

  const [savedJobs, setSavedJobs] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const jobDescFileInputRef = useRef<HTMLInputElement>(null);

  const { events } = useSelector((state: RootState) => state.student);

  const tabData = [
    { key: 'paste', icon: FileSignature, label: 'Paste JD' },
    { key: 'select', icon: Briefcase, label: 'Saved Job' },
    // { key: 'title', icon: User, label: 'Job Title' },
    { key: 'upload', icon: UploadCloudIcon, label: 'Upload' },
  ];

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        setLoading(true);
        const response = await apiInstance.get(
          '/students/jobs/events?type=SAVED',
        );
        setSavedJobs(response.data.jobs || []);
      } catch (error) {
        console.error('Error fetching saved jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedJobs();
  }, []);

  const validateJobTitle = (value: string): string | null => {
    const trimmed = value.trim();
    if (trimmed.length === 0) return null;
    if (trimmed.length > 100) return 'Job title cannot exceed 100 characters';
    const allowedPattern = /^[a-zA-Z0-9\s\-&,./'():+]+$/;
    if (!allowedPattern.test(trimmed))
      return "Only letters, numbers, spaces and - & , . / ' ( ) + allowed";
    return null;
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setEnteredJobTitle(newValue);
    setJobTitleError(validateJobTitle(newValue));
  };

  const charCount = pastedJobDesc.trim().length;
  const charProgress = Math.min((charCount / 200) * 100, 100);

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-4 md:p-6 font-jakarta antialiased">
      {/* <div className="mx-auto flex h-full w-full max-w-[850px] flex-col"> */}
      <div className="mx-auto flex h-full w-full max-w-[1250px] flex-col">
        {/* HEADER & STEPPER */}
        <div className="mb-6 shrink-0">
          <div className="mb-6 text-center">
            <h1 className="text-[22px] font-black uppercase tracking-tight text-slate-900 md:text-[26px]">
              Tailored Application
            </h1>
            <p className="mt-0.5 text-[13px] font-medium text-slate-500">
              Simplify your job application process with our intuitive
              step-by-step wizard.
            </p>
          </div>

          <div className="mx-auto flex max-w-[400px] items-center justify-center relative">
            <div className="absolute left-8 right-8 top-1/2 z-0 h-0.5 -translate-y-1/2 bg-slate-200"></div>
            <div className="absolute left-8 top-1/2 z-0 h-0.5 w-[0%] -translate-y-1/2 bg-emerald-500 transition-all duration-500"></div>

            <div className="relative z-10 flex w-full justify-between">
              <div className="flex flex-col items-center gap-1.5 bg-slate-50 px-2 dark:bg-transparent">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-[0_0_0_4px_#f8fafc] transition-colors duration-300">
                  1
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600">
                  Job Context
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5 bg-slate-50 px-2 dark:bg-transparent">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-500 shadow-[0_0_0_4px_#f8fafc] transition-colors duration-300">
                  2
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  CV Setup
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5 bg-slate-50 px-2 dark:bg-transparent">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-500 shadow-[0_0_0_4px_#f8fafc] transition-colors duration-300">
                  3
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Cover Letter
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN WIZARD CARD */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
          {/* Card Header */}
          <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-6 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm">
              <Briefcase className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold leading-tight tracking-tight text-slate-900">
                Step 1: Provide Job Context
              </h2>
              <p className="text-[12px] font-medium text-slate-500">
                Choose your preferred method below to provide the job
                description.
              </p>
            </div>
          </div>

          {/* Tabs & Content */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 py-6">
            <Tabs
              value={activeTab}
              onValueChange={(val: any) => setActiveTab(val)}
              className="flex min-h-0 flex-1 flex-col"
            >
              {/* Custom Tab List Matching Reference (4 items now) */}
              <TabsList className="mb-4 flex h-auto shrink-0 rounded-xl border border-slate-200/60 bg-slate-100/80 p-1">
                {tabData.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.key}
                      value={tab.key}
                      className="flex-1 gap-2 rounded-lg py-2.5 text-[13px] font-semibold transition-all data-[state=active]:bg-white data-[state=active]:font-bold data-[state=active]:text-blue-600 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200/50 text-slate-500 hover:text-slate-800"
                    >
                      <Icon className="h-4 w-4" strokeWidth={2.5} />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* === TAB 1: PASTE JD === */}
              <TabsContent
                value="paste"
                className="flex min-h-0 flex-1 flex-col gap-4 data-[state=active]:flex mt-0 focus-visible:outline-none"
              >
                <div className="relative flex-1 min-h-[160px]">
                  <textarea
                    placeholder="✨ Paste the full job description here... Include requirements, responsibilities, and company culture for best results."
                    className={`custom-scrollbar absolute inset-0 h-full w-full resize-none rounded-xl border bg-slate-50 p-4 pb-8 text-[13.5px] font-medium text-slate-900 shadow-inner transition-all placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-50 ${
                      isFocused ? 'border-blue-300' : 'border-slate-200'
                    }`}
                    value={pastedJobDesc}
                    onChange={(e) => setPastedJobDesc(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                  ></textarea>

                  <div className="pointer-events-none absolute bottom-2 left-4 text-[11px] font-bold text-slate-400">
                    <span
                      className={
                        charCount >= 200 ? 'text-green-600' : 'text-blue-600'
                      }
                    >
                      {charCount}
                    </span>{' '}
                    / 200 characters
                  </div>

                  {charCount > 0 && charCount < 200 && (
                    <div className="pointer-events-none absolute bottom-2 right-4 text-[11px] font-bold text-amber-500 animate-pulse">
                      {200 - charCount} more needed
                    </div>
                  )}
                  {charCount >= 200 && (
                    <div className="pointer-events-none absolute bottom-2 right-4 flex items-center gap-1 text-[11px] font-bold text-green-600 animate-in fade-in slide-in-from-right-4">
                      <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />{' '}
                      Ready
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 shadow-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <Target className="h-4 w-4" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-extrabold leading-tight text-slate-900">
                      Quick Setup Mode Available
                    </h4>
                    <p className="text-[11.5px] font-medium leading-tight text-slate-600">
                      Switch to the "Job Title" tab to let our AI optimize your
                      Application based on industry standards.
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex shrink-0 items-center justify-end border-t border-slate-100 pt-4">
                  <button
                    onClick={() =>
                      handleJobContextSubmit('paste', pastedJobDesc)
                    }
                    disabled={charCount < 200 || isLoading}
                    className="group flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-[13.5px] font-extrabold text-white shadow-[0_4px_16px_rgba(37,99,235,0.25)] transition-all hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing JD...
                      </>
                    ) : (
                      <>
                        Next Step
                        <span className="transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </TabsContent>

              {/* === TAB 2: SAVED JOBS === */}
              <TabsContent
                value="select"
                className="flex min-h-0 flex-1 flex-col data-[state=active]:flex mt-0 focus-visible:outline-none"
              >
                {loading ? (
                  <div className="flex flex-1 items-center justify-center">
                    <Loader
                      message="Fetching saved jobs..."
                      imageClassName="w-6 h-6"
                      textClassName="text-sm font-medium text-slate-500"
                    />
                  </div>
                ) : savedJobs.length > 0 ? (
                  <>
                    <div className="mb-3 flex shrink-0 items-center justify-between px-1">
                      <h3 className="flex items-center gap-2 text-[13px] font-extrabold text-slate-900">
                        <Briefcase
                          className="h-4 w-4 text-blue-500"
                          strokeWidth={2.5}
                        />
                        Select From Saved Jobs
                      </h3>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Total: {savedJobs.length}
                      </span>
                    </div>
                    <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto pr-2 pb-4">
                      {savedJobs.map((job: any) => (
                        <div
                          key={job.job?._id || job._id}
                          onClick={() =>
                            handleJobContextSubmit(
                              'select',
                              job.job?._id || job._id,
                            )
                          }
                        >
                          <JobCard job={job} />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center text-center py-10">
                    <div className="relative mb-6 inline-block">
                      <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-20 blur-2xl"></div>
                      <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl transition-transform duration-300 hover:scale-110">
                        <Briefcase
                          className="h-10 w-10 text-white"
                          strokeWidth={1.5}
                        />
                      </div>
                    </div>
                    <h3 className="mb-2 text-2xl font-black tracking-tight text-slate-900">
                      No Saved Jobs Yet
                    </h3>
                    <p className="mx-auto max-w-sm text-[13.5px] font-medium leading-relaxed text-slate-500">
                      Start saving jobs you're interested in while browsing, and
                      they'll appear here for instant application generation.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* === TAB 4: UPLOAD === */}
              <TabsContent
                value="upload"
                className="flex min-h-0 flex-1 flex-col data-[state=active]:flex mt-0 focus-visible:outline-none"
              >
                <div className="flex flex-1 flex-col items-center justify-center p-4">
                  <button
                    onClick={() => jobDescFileInputRef.current?.click()}
                    disabled={isLoading}
                    className="group flex w-full max-w-md flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 transition-all hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading && loadingMessage ? (
                      <>
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                        <span className="text-[14px] font-bold text-slate-700">
                          {loadingMessage}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-transform group-hover:scale-110">
                          <UploadCloud className="h-8 w-8" strokeWidth={2} />
                        </div>
                        <div className="text-center">
                          <h4 className="text-[15px] font-extrabold text-slate-900">
                            Upload Job Description
                          </h4>
                          <p className="mt-1 text-[12px] font-medium text-slate-500">
                            PDF, PNG, JPG, DOCX, or TXT
                          </p>
                        </div>
                      </>
                    )}
                  </button>
                  <input
                    type="file"
                    ref={jobDescFileInputRef}
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleJobContextSubmit('upload', e.target.files[0])
                    }
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.txt,.docx"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
