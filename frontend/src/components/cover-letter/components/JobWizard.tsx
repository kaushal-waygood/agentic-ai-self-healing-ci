// 'use client';

// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Textarea } from '@/components/ui/textarea';
// import {
//   Briefcase,
//   ChevronsRight,
//   FileSignature,
//   Loader2,
//   Sparkles,
//   Target,
//   User,
//   CheckCircle2,
//   MapPin,
//   DollarSign,
// } from 'lucide-react';
// import React, { useEffect, useState } from 'react';
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
//   location?: {
//     city?: string;
//   };
// }

// interface JobCardProps {
//   job: Job;
// }

// const formatSalary = (salary: Job['salary']) => {
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
//       className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-lg p-4 transition-all duration-500 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1 cursor-pointer group relative overflow-hidden"
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <div className="flex items-start gap-4 relative z-10">
//         <div className="hidden sm:flex flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg items-center justify-center shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 border-2 border-white">
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

// const JobWizard = ({
//   isLoading,
//   pastedJobDescription,
//   setPastedJobDescription,
//   enteredJobTitle,
//   handleSetJobContext,
//   setEnteredJobTitle,
// }: any) => {
//   const [activeTab, setActiveTab] = useState('paste');
//   const [savedJobs, setSavedJobs] = useState<any[]>([]);
//   const [isFocused, setIsFocused] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [jobTitleError, setJobTitleError] = useState<string | null>(null);

//   const validateJobTitle = (value: string): string | null => {
//     const trimmed = value.trim();

//     if (trimmed.length === 0) return null;

//     if (trimmed.length > 100) {
//       return 'Job title cannot exceed 100 characters';
//     }

//     const allowedPattern = /^[a-zA-Z0-9\s\-&,./'():+]+$/;
//     if (!allowedPattern.test(trimmed)) {
//       return "Only letters, numbers, spaces and - & , . / ' ( ) + allowed";
//     }

//     return null;
//   };

//   const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = e.target.value;
//     setEnteredJobTitle(newValue);
//     setJobTitleError(validateJobTitle(newValue));
//   };

//   useEffect(() => {
//     const fetchSavedJobs = async () => {
//       try {
//         setLoading(true);
//         const response = await apiInstance.get(
//           '/students/jobs/events?type=SAVED',
//         );
//         setSavedJobs(response.data.jobs || []);
//       } catch (error) {
//         console.error('Error fetching saved jobs:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchSavedJobs();
//   }, []);

//   const charCount = pastedJobDescription.trim().length;
//   const charProgress = Math.min((charCount / 200) * 100, 100);

//   const tabData = [
//     {
//       value: 'paste',
//       icon: FileSignature,
//       label: 'Paste JD',
//       gradient: 'tabPrimary',
//     },
//     {
//       value: 'select',
//       icon: Briefcase,
//       label: 'Saved Job',
//       gradient: 'tabPrimary',
//     },
//     { value: 'title', icon: User, label: 'Job Title', gradient: 'tabPrimary' },
//   ];

//   return (
//     <div className="p-3 sm:p-4 md:p-6 lg:p-8">
//       <div className="max-w-7xl mx-auto">
//         <div className="text-center mb-4 relative">
//           <h1 className="text-2xl uppercase font-semibold sm:text-3xl md:text-4xl bg-headingTextPrimary text-foreground bg-clip-text text-transparent relative z-10">
//             AI Cover Letter Generator
//           </h1>
//           <p className="text-gray-600 text-sm max-w-2xl mx-auto leading-relaxed mt-2">
//             Transform your Cover Letter with AI-powered insights tailored to
//             your dream job
//           </p>
//         </div>

//         <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl shadow-pink-500/10 rounded-lg overflow-hidden">
//           {/* Enhanced Animated Header */}
//           <CardHeader className="bg-header-gradient-primary text-white relative overflow-hidden p-2">
//             <div className="relative z-10">
//               <div className="flex items-center gap-4 mb-2">
//                 <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg border border-white/30">
//                   <Target className="h-6 w-6 text-white" />
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
//             <Tabs
//               value={activeTab}
//               onValueChange={setActiveTab}
//               className="w-full"
//             >
//               {/* Enhanced Tabs List */}
//               <TabsList className="grid grid-cols-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-1.5 mb-4 h-auto shadow-inner">
//                 {tabData.map((tab) => {
//                   const Icon = tab.icon;
//                   const isActive = activeTab === tab.value;
//                   return (
//                     <TabsTrigger
//                       key={tab.value}
//                       value={tab.value}
//                       className={`flex flex-row items-center gap-2 p-4 rounded-lg transition-all duration-500 ${
//                         isActive
//                           ? `bg-${tab.gradient} text-white shadow-xl scale-105 transform`
//                           : 'hover:bg-white/80 hover:scale-102 transform'
//                       }`}
//                     >
//                       <Icon
//                         className={`h-6 w-6 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}
//                       />
//                       <div className="text-center">
//                         <div
//                           className={`text-sm font-medium mb-0.5 ${isActive ? 'text-white' : 'text-gray-600'}`}
//                         >
//                           {tab.label}
//                         </div>
//                       </div>
//                     </TabsTrigger>
//                   );
//                 })}
//               </TabsList>

//               {/* Enhanced Paste Tab */}
//               <TabsContent
//                 value="paste"
//                 className="space-y-6 animate-in fade-in duration-500"
//               >
//                 <div className="space-y-4">
//                   <div className="relative group">
//                     <Textarea
//                       placeholder="✨ Paste the full job description here... Include requirements, responsibilities, and company culture for best results."
//                       className={`min-h-[280px] border-2 rounded-lg p-6 pr-16 focus:ring-4 resize-none transition-all duration-500 bg-gradient-to-br from-gray-50 to-white shadow-inner ${
//                         isFocused
//                           ? ''
//                           : charCount < 200
//                             ? 'border-gray-300 hover:border-gray-400'
//                             : 'border-green-300 hover:border-green-400 ring-green-50'
//                       }`}
//                       value={pastedJobDescription}
//                       onChange={(e) => setPastedJobDescription(e.target.value)}
//                       onFocus={() => setIsFocused(true)}
//                       onBlur={() => setIsFocused(false)}
//                     />
//                     {/* Progress indicator */}
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

//                   <div className="flex flex-wrap justify-between items-center gap-4">
//                     <div className="flex items-center gap-3">
//                       <div
//                         className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
//                           charCount < 200
//                             ? 'text-red-700 bg-red-50'
//                             : 'text-green-700 bg-green-50'
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
//                           ? 'bg-buttonPrimary hover:shadow-2xl hover:shadow-pink-500/50 text-white'
//                           : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                       }`}
//                       onClick={() => handleSetJobContext('paste')}
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
//                           <Sparkles className="h-6 w-6 animate-pulse mr-2" />
//                           Generate My Cover Letter
//                           <ChevronsRight className="h-6 w-6 ml-2" />
//                         </>
//                       )}
//                     </Button>
//                   </div>
//                 </div>
//               </TabsContent>

//               {/* Enhanced Select Tab */}
//               <TabsContent
//                 value="select"
//                 className="space-y-6 animate-in fade-in duration-500"
//               >
//                 {loading ? (
//                   <Loader
//                     message="Fetching saved Jobs"
//                     imageClassName="w-6 h-6"
//                     textClassName="text-sm"
//                   />
//                 ) : savedJobs.length > 0 ? (
//                   <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
//                     {savedJobs.map((job: any) => (
//                       <div
//                         // key={job.job._id}
//                         key={job.job?._id || job._id}
//                         onClick={() =>
//                           //  handleSetJobContext('select', job.job._id)
//                           handleSetJobContext('select', job.job?._id || job._id)
//                         }
//                         className="cursor-pointer transition-transform hover:scale-[1.01]"
//                       >
//                         <JobCard job={job} />
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="text-center py-20">
//                     <div className="relative inline-block mb-6">
//                       <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-2xl opacity-30 animate-pulse"></div>
//                       <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mx-auto flex items-center justify-center shadow-2xl relative z-10 transform hover:scale-110 transition-transform duration-300">
//                         <Briefcase className="h-12 w-12 text-white" />
//                       </div>
//                     </div>
//                     <h3 className="text-3xl font-bold text-gray-900 mb-4">
//                       No Saved Jobs Yet
//                     </h3>
//                     <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
//                       Start saving jobs you're interested in, and they'll appear
//                       here for quick cover letter generation!
//                     </p>
//                   </div>
//                 )}
//               </TabsContent>

//               {/* Job Title Tab – with validation */}
//               <TabsContent
//                 value="title"
//                 className="space-y-6 animate-in fade-in duration-500"
//               >
//                 <div className="space-y-4">
//                   <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-center">
//                     <div className="relative">
//                       <Input
//                         placeholder="e.g., Senior Software Engineer, Product Manager..."
//                         className={`h-14 md:h-16 border-2 rounded-lg px-5 pr-14 text-md transition-all duration-300 bg-gradient-to-br from-gray-50 to-white shadow-inner ${
//                           jobTitleError
//                             ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
//                             : 'border-gray-300 focus:border-green-500 focus:ring-green-100'
//                         }`}
//                         value={enteredJobTitle}
//                         // onChange={(e) => setEnteredJobTitle(e.target.value)}
//                         onChange={handleTitleChange}
//                       />
//                       <div className="absolute top-1/2 right-4 -translate-y-1/2">
//                         <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
//                           <User
//                             className={`h-5 w-5 ${
//                               //  enteredJobTitle
//                               enteredJobTitle && !jobTitleError
//                                 ? 'text-green-600'
//                                 : jobTitleError
//                                   ? 'text-red-500'
//                                   : 'text-gray-400'
//                             }`}
//                           />
//                         </div>
//                       </div>
//                     </div>

//                     <Button
//                       className={`h-14 md:h-16 px-6 md:px-8 text-base md:text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95 whitespace-nowrap ${
//                         //  enteredJobTitle && !isLoading
//                         enteredJobTitle.trim() && !jobTitleError && !isLoading
//                           ? 'bg-buttonPrimary hover:shadow-2xl hover:shadow-green-500/50 text-white'
//                           : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                       }`}
//                       // onClick={() => handleSetJobContext('title')}
//                       onClick={() => {
//                         const error = validateJobTitle(enteredJobTitle);
//                         if (error) {
//                           setJobTitleError(error);
//                           return;
//                         }
//                         handleSetJobContext('title');
//                       }}
//                       // disabled={!enteredJobTitle || isLoading}
//                       disabled={
//                         !enteredJobTitle.trim() || !!jobTitleError || isLoading
//                       }
//                     >
//                       {isLoading ? (
//                         <>
//                           <Loader2 className="animate-spin h-5 w-5 mr-2" />
//                           Preparing...
//                         </>
//                       ) : (
//                         <>
//                           Start Cover Letter Optimization
//                           <ChevronsRight className="ml-2" />
//                         </>
//                       )}
//                     </Button>
//                   </div>

//                   {jobTitleError && (
//                     <p className="text-sm text-red-600 font-medium pl-1.5 mt-1">
//                       {jobTitleError}
//                     </p>
//                   )}

//                   {/* Info Box */}
//                   <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-green-100 shadow-sm">
//                     <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-lg flex-shrink-0">
//                       <Sparkles className="h-5 w-5 text-white" />
//                     </div>
//                     <div className="flex-1">
//                       <p className="font-bold text-gray-900 mb-1">
//                         Quick Setup Mode
//                       </p>
//                       <p className="text-sm text-gray-700 leading-relaxed">
//                         Enter your target job title and our AI will craft a
//                         compelling cover letter based on common industry
//                         requirements and expectations for that role.
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </TabsContent>
//             </Tabs>
//           </CardContent>
//         </Card>
//       </div>

//       <style jsx>{`
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 8px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: #f1f5f9;
//           border-radius: 10px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: linear-gradient(to bottom, #9333ea, #ec4899);
//           border-radius: 10px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//           background: linear-gradient(to bottom, #7e22ce, #db2777);
//         }
//       `}</style>
//     </div>
//   );
// };

// export default JobWizard;

'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Briefcase,
  Loader2,
  Target,
  User,
  CheckCircle2,
  FileSignature,
  FileText,
  Send,
  Bookmark,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
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
    <div className="group flex cursor-pointer items-center justify-between rounded-xl border-2 border-slate-200 bg-white p-4 transition-all hover:border-indigo-300 hover:bg-slate-50">
      <div className="flex items-center gap-4">
        {/* Pseudo-radio button */}
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 transition-colors group-hover:border-indigo-500">
          <div className="h-2.5 w-2.5 scale-0 rounded-full bg-indigo-600 transition-transform group-active:scale-100"></div>
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

const JobWizard = ({
  isLoading,
  pastedJobDescription,
  setPastedJobDescription,
  enteredJobTitle,
  handleSetJobContext,
  setEnteredJobTitle,
}: any) => {
  const [activeTab, setActiveTab] = useState('paste');
  const [savedJobs, setSavedJobs] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jobTitleError, setJobTitleError] = useState<string | null>(null);

  const { events } = useSelector((state: RootState) => state.student);

  const tabData = [
    {
      value: 'paste',
      icon: FileSignature,
      label: 'Paste JD',
    },
    {
      value: 'select',
      icon: Bookmark, // Using bookmark for Saved Jobs
      label: 'Saved Job',
    },
    {
      value: 'title',
      icon: FileText, // Using FileText for Job Title
      label: 'Job Title',
    },
  ];

  const validateJobTitle = (value: string): string | null => {
    const trimmed = value.trim();
    if (trimmed.length === 0) return null;
    if (trimmed.length > 100) return 'Job title cannot exceed 100 characters';

    const allowedPattern = /^[a-zA-Z0-9\s\-&,./'():+]+$/;
    if (!allowedPattern.test(trimmed)) {
      return "Only letters, numbers, spaces and - & , . / ' ( ) + allowed";
    }
    return null;
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setEnteredJobTitle(newValue);
    setJobTitleError(validateJobTitle(newValue));
  };

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

  const charCount = pastedJobDescription.trim().length;
  const charProgress = Math.min((charCount / 200) * 100, 100);

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-4 md:p-6 font-jakarta antialiased">
      {/* <div className="mx-auto flex h-full w-full max-w-[850px] flex-col"> */}
      <div className="mx-auto flex h-full w-full flex-col">
        {/* HEADER & STEPPER */}
        <div className="mb-6 shrink-0">
          <div className="mb-6 text-center">
            <h1 className="text-[22px] font-black uppercase tracking-tight text-slate-900 md:text-[26px]">
              AI Cover Letter Generator
            </h1>
            <p className="mt-0.5 text-[13px] font-medium text-slate-500">
              Transform your Cover Letter with AI-powered insights tailored to
              your dream job.
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
                  CV Context
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5 bg-slate-50 px-2 dark:bg-transparent">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-500 shadow-[0_0_0_4px_#f8fafc] transition-colors duration-300">
                  3
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Final Touches
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
              <Target className="h-5 w-5" strokeWidth={2} />
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
              onValueChange={setActiveTab}
              className="flex min-h-0 flex-1 flex-col"
            >
              {/* Custom Tab List Matching Reference */}
              <TabsList className="mb-4 flex h-auto shrink-0 rounded-xl border border-slate-200/60 bg-slate-100/80 p-1">
                {tabData.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="flex-1 gap-2 rounded-lg py-2.5 text-[13px] font-semibold transition-all data-[state=active]:bg-white data-[state=active]:font-bold data-[state=active]:text-blue-600 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200/50 text-slate-500 hover:text-slate-800"
                    >
                      <Icon className="h-4 w-4" strokeWidth={2.5} />
                      {tab.label}
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
                    value={pastedJobDescription}
                    onChange={(e) => setPastedJobDescription(e.target.value)}
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
                      Switch to the "Job Title" tab to let our AI write your
                      cover letter based on industry standards.
                    </p>
                  </div>
                </div>

                {/* Footer attached to this tab content */}
                <div className="mt-auto flex shrink-0 items-center justify-end border-t border-slate-100 pt-4">
                  <button
                    onClick={() => handleSetJobContext('paste')}
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
                        Next: Select Tone
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
                        <Bookmark
                          className="h-4 w-4 text-indigo-500"
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
                            handleSetJobContext(
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
                      <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-20 blur-2xl"></div>
                      <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-2xl transition-transform duration-300 hover:scale-110">
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
                      they'll appear here for instant cover letter generation.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* === TAB 3: JOB TITLE === */}
              <TabsContent
                value="title"
                className="flex min-h-0 flex-1 flex-col gap-4 data-[state=active]:flex mt-0 focus-visible:outline-none"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="relative flex-1">
                    <div className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center rounded-lg bg-indigo-50 p-1.5 text-indigo-600">
                      <User className="h-4 w-4" strokeWidth={2.5} />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g., Senior Software Engineer, Product Manager..."
                      value={enteredJobTitle}
                      onChange={handleTitleChange}
                      className={`w-full rounded-xl border py-4 pl-14 pr-4 text-[14px] font-bold text-slate-900 shadow-sm transition-all placeholder:font-medium placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 ${
                        jobTitleError
                          ? 'border-red-400 focus:border-red-400 focus:ring-red-100 bg-red-50/30'
                          : 'border-slate-200 bg-slate-50 focus:border-indigo-400 focus:ring-indigo-50'
                      }`}
                    />
                  </div>
                </div>

                {jobTitleError && (
                  <p className="pl-1.5 text-[12px] font-bold text-red-500">
                    {jobTitleError}
                  </p>
                )}

                <div className="flex shrink-0 items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
                    <Target className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="mb-1 text-[14px] font-extrabold leading-tight text-slate-900">
                      Quick Setup Mode
                    </h4>
                    <p className="text-[12px] font-medium leading-relaxed text-slate-600">
                      Enter your target job title and our AI will automatically
                      craft a compelling cover letter based on common industry
                      requirements and expectations for this role.
                    </p>
                  </div>
                </div>

                {/* Footer attached to this tab content */}
                <div className="mt-auto flex shrink-0 items-center justify-end border-t border-slate-100 pt-4">
                  <button
                    onClick={() => handleSetJobContext('title')}
                    disabled={
                      !enteredJobTitle.trim() || !!jobTitleError || isLoading
                    }
                    className="group flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-[13.5px] font-extrabold text-white shadow-[0_4px_16px_rgba(79,70,229,0.25)] transition-all hover:-translate-y-0.5 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Next: Select Tone
                        <span className="transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </>
                    )}
                  </button>
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
};

export default JobWizard;
