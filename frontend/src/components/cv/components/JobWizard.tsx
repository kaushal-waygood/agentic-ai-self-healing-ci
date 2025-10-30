// 'use client';
// import { Button } from '@/components/ui/button';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Textarea } from '@/components/ui/textarea';
// import { getAllSavedJobs } from '@/services/api/student';
// import {
//   Briefcase,
//   ChevronsRight,
//   FileSignature,
//   Loader2,
//   Sparkles,
//   Target,
//   User,
//   Zap,
// } from 'lucide-react';
// import React, { useEffect, useState } from 'react';

// import { MapPin, DollarSign } from 'lucide-react';
// import apiInstance from '@/services/api';

// // Define the structure of the job object for type safety
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
//   // Destructure the nested job object for cleaner access
//   const { job } = savedJob;

//   return (
//     <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 transition-all duration-300 hover:border-blue-400 hover:shadow-lg">
//       <div className="flex items-start gap-4">
//         {/* Company Logo or Fallback */}
//         <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
//           {job.logo ? (
//             <img
//               src={job.logo}
//               alt={`${job.company} logo`}
//               className="w-full h-full object-contain rounded-lg"
//             />
//           ) : (
//             <span className="text-xl font-bold text-gray-500">
//               {/* FIXED: Removed trailing dot and access property correctly */}
//               {job.company?.charAt(0)}
//             </span>
//           )}
//         </div>

//         {/* Job Details */}
//         <div className="flex-1 min-w-0">
//           {/* FIXED: Access nested property */}
//           <p className="text-sm text-gray-500 truncate">{job.company}</p>
//           <h3 className="text-lg font-bold text-gray-800 truncate">
//             {job.title}
//           </h3>

//           <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
//             {/* FIXED: Access location from nested structure */}
//             {job.location?.city && (
//               <div className="flex items-center gap-1.5">
//                 <MapPin className="w-4 h-4 text-gray-400" />
//                 <span>{job.location.city}</span>
//               </div>
//             )}

//             {/* FIXED: Access salary from nested structure */}
//             {job.salary && (
//               <div className="flex items-center gap-1.5">
//                 <DollarSign className="w-4 h-4 text-gray-400" />
//                 <span>{formatSalary(job.salary)}</span>
//               </div>
//             )}

//             {/* FIXED: Access jobTypes from nested structure */}
//             {job.jobTypes && job.jobTypes.length > 0 && (
//               <div className="flex items-center gap-1.5">
//                 <Briefcase className="w-4 h-4 text-gray-400" />
//                 <span className="capitalize">
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
//   const [savedJobs, setSavedJobs] = useState([]);

//   const tabData = [
//     {
//       value: 'paste',
//       icon: FileSignature,
//       label: 'Paste JD',
//       description: 'Full job description',
//       gradient: 'from-blue-500 to-cyan-400',
//     },
//     {
//       value: 'select',
//       icon: Briefcase,
//       label: 'Select Saved Jobs',
//       description: 'Choose from saved',
//       gradient: 'from-purple-500 to-pink-400',
//     },
//     {
//       value: 'title',
//       icon: User,
//       label: 'Job Title',
//       description: 'Quick setup',
//       gradient: 'from-green-500 to-emerald-400',
//     },
//   ];

//   useEffect(() => {
//     const fetchSavedJobs = async () => {
//       try {
//         const response = await apiInstance.get('/students/jobs/saved-all');
//         setSavedJobs(response.data.jobs);
//       } catch (error) {
//         console.error('Error fetching saved jobs:', error);
//       }
//     };

//     fetchSavedJobs();
//   }, []);

//   return (
//     <div className="p-3 sm:p-3 md:p-6 lg:p-2  ">
//       <div className="max-w-7xl mx-auto">
//         <div className="text-center m-4">
//           <h1 className="text-3xl  bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2">
//             CV Generator
//           </h1>
//           <p className="text-gray-600 text-md max-w-2xl mx-auto">
//             Transform your CV with AI-powered insights tailored to your dream
//             job
//           </p>
//         </div>

//         <Card className=" bg-white/80s backdrop-blur-xl border-0 shadow-2xl shadow-blue-500/10 rounded-3xl  overflow-hidden">
//           {/* Animated Header */}

//           <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden p-2">
//             <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 animate-pulse"></div>
//             <div className="relative z-10">
//               <div className="flex items-center gap-3 mb-2">
//                 <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
//                   <Target className="h-5 w-5 text-white" />
//                 </div>
//                 <CardTitle className="text-lg">
//                   Step 1: Provide Job Context
//                 </CardTitle>
//               </div>
//             </div>
//           </CardHeader>

//           <CardContent className="p-2 md:p-1">
//             <Tabs
//               value={activeTab}
//               onValueChange={setActiveTab}
//               className="w-full"
//             >
//               {/* Enhanced Tabs List */}
//               <TabsList className="grid  grid-cols-3 bg-gray-100 rounded-2xl p-1 mb-1 h-auto">
//                 {tabData.map((tab) => {
//                   const Icon = tab.icon;
//                   return (
//                     <TabsTrigger
//                       key={tab.value}
//                       value={tab.value}
//                       className={`flex flex-row items-center gap-2 p-3 border rounded-xl transition-all duration-300 hover:scale-105  ${
//                         activeTab === tab.value
//                           ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
//                           : 'hover:bg-white/80 data-[state=active]:bg-white data-[state=active]:shadow-lg'
//                       }`}
//                     >
//                       <Icon className="h-5 w-5" />
//                       <div className="text-center">
//                         <div
//                           className={`text-sm ${
//                             activeTab === tab.value
//                               ? 'text-white/80'
//                               : 'text-gray-500'
//                           }`}
//                         >
//                           {tab.description}
//                         </div>
//                       </div>
//                     </TabsTrigger>
//                   );
//                 })}
//               </TabsList>

//               {/* Paste Tab */}

//               <TabsContent value="paste" className="space-y-3">
//                 <div className="space-y-4">
//                   <div className="relative group">
//                     <Textarea
//                       placeholder="Paste the full job description here... "
//                       className={`min-h-[240px] border-2 rounded-2xl p-4 focus:ring-0 resize-none transition-all duration-300 group-hover:border-gray-300 bg-gray-50/50 backdrop-blur-sm ${
//                         pastedJobDescription.trim().length < 200
//                           ? 'border-gray-300 focus:border-red-400'
//                           : 'border-gray-200 focus:border-blue-500'
//                       }`}
//                       value={pastedJobDescription}
//                       onChange={(e) => setPastedJobDescription(e.target.value)}
//                     />
//                     <div className="absolute top-4 right-4 text-gray-400">
//                       <FileSignature className="h-5 w-5" />
//                     </div>
//                   </div>

//                   {/* ✅ Character Counter */}
//                   <div className="flex justify-between items-center text-sm">
//                     <span
//                       className={`font-medium ${
//                         pastedJobDescription.trim().length < 200
//                           ? 'text-red-600'
//                           : 'text-green-600'
//                       }`}
//                     >
//                       Characters: {pastedJobDescription.trim().length} / 200
//                     </span>

//                     {pastedJobDescription.trim().length < 200 && (
//                       <span className="text-red-500">
//                         Minimum 200 characters required.
//                       </span>
//                     )}
//                   </div>

//                   <div className="flex items-center justify-between flex-wrap gap-2 text-sm text-gray-700 p-2">
//                     {/* ✅ Button disabled until 200+ characters */}
//                     <Button
//                       className={`h-14 text-lg font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
//                         pastedJobDescription.trim().length >= 200 && !isLoading
//                           ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700  text-white'
//                           : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                       }`}
//                       onClick={() => handleSetJobContext('paste')}
//                       disabled={
//                         pastedJobDescription.trim().length < 200 || isLoading
//                       }
//                     >
//                       {isLoading ? (
//                         <>
//                           <Loader2 className="animate-spin mr-2 h-5 w-5" />
//                           Analyzing Job Description...
//                         </>
//                       ) : (
//                         <>
//                           <ChevronsRight className="mr-2 h-5 w-5" />
//                           Generate My CV
//                         </>
//                       )}
//                     </Button>

//                     <div className="flex items-center gap-2 text-sm text-gray-700 bg-blue-50 p-3 rounded-xl border border-blue-100">
//                       <Zap className="h-4 w-4 text-blue-500 flex-shrink-0" />
//                       <span className="font-medium">Pro tip:</span> Include
//                       requirements, responsibilities, and company culture for
//                       best results.
//                     </div>
//                   </div>
//                 </div>
//               </TabsContent>

//               {/* Select Tab */}
//               {/* new code with 200 character counter and limits */}
//               <TabsContent value="select" className="space-y-6">
//                 {savedJobs.length > 0 ? (
//                   <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
//                     {savedJobs.map((job: any) => (
//                       <div
//                         key={job.job._id} // Corrected: Use _id for the key
//                         onClick={() =>
//                           handleSetJobContext('select', job.job._id)
//                         }
//                         className="cursor-pointer transition-transform transform "
//                       >
//                         <JobCard job={job} />
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="text-center py-16">
//                     <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg">
//                       <Briefcase className="h-10 w-10 text-white" />
//                     </div>
//                     <h3 className="text-2xl font-bold text-gray-900 mb-3">
//                       No Saved Jobs
//                     </h3>
//                     <p className="text-gray-600 text-lg max-w-md mx-auto">
//                       You haven't saved any jobs yet. Saved jobs will appear
//                       here for quick CV generation.
//                     </p>
//                   </div>
//                 )}
//               </TabsContent>

//               {/* Title Tab */}
//               <TabsContent value="title" className="space-y-6">
//                 <div className=" flex flex-row gap-4 ">
//                   <div className="relative group flex-1">
//                     <Input
//                       placeholder="e.g., Senior Software Engineer..."
//                       className="h-14 border-2 border-gray-200 rounded-2xl px-6 text-lg focus:border-green-500 focus:ring-0 transition-all duration-300 group-hover:border-gray-300 bg-gray-50/50 backdrop-blur-sm"
//                       value={enteredJobTitle}
//                       onChange={(e) => setEnteredJobTitle(e.target.value)}
//                     />
//                     <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400">
//                       <User className="h-5 w-5" />
//                     </div>
//                   </div>
//                   <Button
//                     className={` h-14 text-lg font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
//                       enteredJobTitle && !isLoading
//                         ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl text-white'
//                         : 'bg-gray-300 text-gray-500'
//                     }`}
//                     onClick={() => handleSetJobContext('title')}
//                     disabled={!enteredJobTitle || isLoading}
//                   >
//                     {isLoading ? (
//                       <>
//                         <Loader2 className="animate-spin mr-2 h-5 w-5" />
//                         Preparing Optimization...
//                       </>
//                     ) : (
//                       <>
//                         <ChevronsRight className="mr-2 h-5 w-5" />
//                         Start Optimization
//                       </>
//                     )}
//                   </Button>
//                 </div>
//               </TabsContent>
//             </Tabs>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default JobWizard;

'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { getAllSavedJobs } from '@/services/api/student';
import {
  Briefcase,
  ChevronsRight,
  FileSignature,
  Loader2,
  Sparkles,
  Target,
  User,
  Zap,
  CheckCircle2,
  MapPin,
  DollarSign,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import apiInstance from '@/services/api';

// Define the structure of the job object for type safety
interface Job {
  _id: string;
  title: string;
  company: string;
  logo?: string;
  jobAddress: string;
  salary: {
    min: number;
    max: number;
    period: string;
  };
  jobTypes: string[];
}

interface JobCardProps {
  job: Job;
}

// Helper function to format the salary range
const formatSalary = (salary: JobDetails['salary']) => {
  if (!salary || (salary.min === 0 && salary.max === 0)) {
    return 'Not Disclosed';
  }
  const formatValue = (value: number) => `$${Math.round(value / 1000)}k`;
  const periodMap: { [key: string]: string } = {
    YEAR: 'yr',
    MONTH: 'mo',
    HOUR: 'hr',
  };

  return `${formatValue(salary.min)} - ${formatValue(salary.max)} / ${
    periodMap[salary.period] || 'yr'
  }`;
};

export const JobCard = ({ job: savedJob }: JobCardProps) => {
  const { job } = savedJob;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="w-full bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-4 transition-all duration-500 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 cursor-pointer group relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-4 relative z-10">
        {/* Company Logo with enhanced animation */}
        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 border-2 border-white">
          {job.logo ? (
            <img
              src={job.logo}
              alt={`${job.company} logo`}
              className="w-full h-full object-contain rounded-xl"
            />
          ) : (
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {job.company?.charAt(0)}
            </span>
          )}
        </div>

        {/* Job Details */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate mb-1">
            {job.company}
          </p>
          <h3 className="text-xl font-bold text-gray-900 truncate mb-3 group-hover:text-blue-600 transition-colors duration-300">
            {job.title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {job.location?.city && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-300 border border-gray-100">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-gray-700">
                  {job.location.city}
                </span>
              </div>
            )}

            {job.salary && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-300 border border-green-100">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="font-medium text-gray-700">
                  {formatSalary(job.salary)}
                </span>
              </div>
            )}

            {job.jobTypes && job.jobTypes.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-300 border border-purple-100">
                <Briefcase className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-gray-700 capitalize">
                  {job.jobTypes[0].toLowerCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Animated checkmark on hover */}
        <div
          className={`absolute top-4 right-4 transition-all duration-300 ${
            isHovered ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
        >
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
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

  const tabData = [
    {
      value: 'paste',
      icon: FileSignature,
      label: 'Paste JD',
      description: 'Full job description',
      gradient: 'from-blue-500 to-cyan-400',
    },
    {
      value: 'select',
      icon: Briefcase,
      label: 'Select Job',
      description: 'Choose from saved',
      gradient: 'from-purple-500 to-pink-400',
    },
    {
      value: 'title',
      icon: User,
      label: 'Job Title',
      description: 'Quick setup',
      gradient: 'from-green-500 to-emerald-400',
    },
  ];

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const response = await apiInstance.get('/students/jobs/saved-all');
        setSavedJobs(response.data.jobs);
      } catch (error) {
        console.error('Error fetching saved jobs:', error);
      }
    };

    fetchSavedJobs();
  }, []);

  const charCount = pastedJobDescription.trim().length;
  const charProgress = Math.min((charCount / 200) * 100, 100);

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 ">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-4 relative">
          <div className="inline-block relative ">
            <div className="absolute inset-0 2xl "></div>
            <h1 className="text-4xl  bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent relative z-10 mb-3">
              AI-Powered CV Generator
            </h1>
          </div>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto leading-relaxed">
            Transform your CV with AI-powered insights tailored to your dream
            job
          </p>
        </div>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl shadow-purple-500/10 rounded-xl overflow-hidden">
          {/* Enhanced Animated Header */}
          <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden p-2">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24 animate-pulse delay-75"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
                  <Target className="h-6 w-6 text-white" />
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
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              {/* Enhanced Tabs List with better mobile support */}
              <TabsList className="grid grid-cols-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-1.5 mb-4 h-auto shadow-inner">
                {tabData.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.value;
                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className={`flex flex-row items-center gap-2 p-4 rounded-xl transition-all duration-500 ${
                        isActive
                          ? `bg-gradient-to-r ${tab.gradient} text-white shadow-xl scale-105 transform`
                          : 'hover:bg-white/80 hover:scale-102 transform'
                      }`}
                    >
                      <Icon
                        className={`h-6 w-6 transition-transform duration-300 ${
                          isActive ? 'scale-110' : ''
                        }`}
                      />
                      <div className="text-center">
                        <div
                          className={`text-xs font-medium mb-0.5 ${
                            isActive ? 'text-white' : 'text-gray-600'
                          }`}
                        >
                          {tab.label}
                        </div>
                        <div
                          className={`text-xs ${
                            isActive ? 'text-white/90' : 'text-gray-500'
                          }`}
                        >
                          {tab.description}
                        </div>
                      </div>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Enhanced Paste Tab */}
              <TabsContent
                value="paste"
                className="space-y-6 animate-in fade-in duration-500"
              >
                <div className="space-y-4">
                  <div className="relative group">
                    <Textarea
                      placeholder="✨ Paste the full job description here... Include requirements, responsibilities, and company culture for best results."
                      className={`min-h-[280px] border-2 rounded-2xl p-6 pr-16 focus:ring-4 resize-none transition-all duration-500 bg-gradient-to-br from-gray-50 to-white shadow-inner ${
                        isFocused
                          ? 'border-blue-500 ring-blue-100 shadow-lg'
                          : charCount < 200
                          ? 'border-gray-300 hover:border-gray-400'
                          : 'border-green-300 hover:border-green-400 ring-green-50'
                      }`}
                      value={pastedJobDescription}
                      onChange={(e) => setPastedJobDescription(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                    />
                    <div
                      className={`absolute top-6 right-6 transition-all duration-300 ${
                        isFocused ? 'scale-110 rotate-12' : ''
                      }`}
                    >
                      <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                        <FileSignature
                          className={`h-6 w-6 ${
                            charCount >= 200
                              ? 'text-green-600'
                              : 'text-gray-400'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Progress indicator */}
                    {charCount > 0 && (
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              charCount >= 200
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                : 'bg-gradient-to-r from-blue-500 to-purple-500'
                            }`}
                            style={{ width: `${charProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Character Counter */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div
                        className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                          charCount < 200
                            ? 'bg-gradient-to-r from-red-50 to-orange-50 text-red-700 border-2 border-red-200'
                            : 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-2 border-green-200'
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

                  <div className="flex flex-col gap-4">
                    <Button
                      className={`h-16 text-lg font-bold rounded-2xl transition-all duration-500 transform hover:scale-[1.02] active:scale-95 shadow-xl ${
                        charCount >= 200 && !isLoading
                          ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:shadow-2xl hover:shadow-purple-500/50 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      onClick={() => handleSetJobContext('paste')}
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
                          Generate My Optimized CV
                          <ChevronsRight className="ml-3 h-6 w-6" />
                        </>
                      )}
                    </Button>

                    <div className="flex items-start gap-3  p-2 rounded-xl border-2 border-blue-100 shadow-sm">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-lg flex-shrink-0">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 ">
                          Pro Tips for Best Results:
                        </p>
                        <p className="text-sm  text-gray-700 leading-relaxed">
                          Include job requirements, responsibilities, required
                          skills, and company culture. The more detailed the job
                          description, the better your CV will be optimized!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Enhanced Select Tab */}
              <TabsContent
                value="select"
                className="space-y-6 animate-in fade-in duration-500"
              >
                {savedJobs.length > 0 ? (
                  <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                    {savedJobs.map((job: any) => (
                      <div
                        key={job.job._id}
                        onClick={() =>
                          handleSetJobContext('select', job.job._id)
                        }
                        className=""
                      >
                        <JobCard job={job} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="relative inline-block mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-2xl opacity-30 animate-pulse"></div>
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl relative z-10 transform hover:scale-110 transition-transform duration-300">
                        <Briefcase className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      No Saved Jobs Yet
                    </h3>
                    <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
                      Start saving jobs you're interested in, and they'll appear
                      here for quick CV generation!
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Enhanced Title Tab */}
              <TabsContent
                value="title"
                className="space-y-6 animate-in fade-in duration-500"
              >
                <div className="space-y-4">
                  <div className="relative group">
                    <Input
                      placeholder="e.g., Senior Software Engineer, Product Manager..."
                      className="h-16 border-2 border-gray-300 rounded-2xl px-6 pr-16 text-lg focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-500 group-hover:border-gray-400 bg-gradient-to-br from-gray-50 to-white shadow-inner"
                      value={enteredJobTitle}
                      onChange={(e) => setEnteredJobTitle(e.target.value)}
                    />
                    <div className="absolute top-1/2 right-5 transform -translate-y-1/2 transition-all duration-300 group-hover:scale-110">
                      <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                        <User
                          className={`h-6 w-6 ${
                            enteredJobTitle ? 'text-green-600' : 'text-gray-400'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    className={`w-full h-16 text-lg font-bold rounded-2xl transition-all duration-500 transform hover:scale-[1.02] active:scale-95 shadow-xl ${
                      enteredJobTitle && !isLoading
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-2xl hover:shadow-green-500/50 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    onClick={() => handleSetJobContext('title')}
                    disabled={!enteredJobTitle || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin mr-3 h-6 w-6" />
                        <span className="animate-pulse">
                          Preparing Optimization...
                        </span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-3 h-6 w-6 animate-pulse" />
                        Start CV Optimization
                        <ChevronsRight className="ml-3 h-6 w-6" />
                      </>
                    )}
                  </Button>

                  <div className="flex items-start gap-3 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border-2 border-green-100 shadow-sm">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-lg flex-shrink-0">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 mb-1">
                        Quick Setup Mode
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Enter your target job title and our AI will optimize
                        your CV based on common industry requirements and
                        expectations.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
      `}</style>
    </div>
  );
};

export default JobWizard;
