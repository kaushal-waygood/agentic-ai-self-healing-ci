// 'use client';

// import React, { useEffect, useState } from 'react';

// import { Form, FormField } from '@/components/ui/form';
// import { motion } from 'framer-motion';
// import {
//   ArrowLeft,
//   ArrowRight,
//   FileText,
//   Edit3,
//   Save,
//   Sparkles,
//   Clock,
// } from 'lucide-react';
// import { Textarea } from '@/components/ui/textarea';
// import apiInstance from '@/services/api';
// import { Loader } from '@/components/Loader';

// const SleekClStep = ({
//   clForm,
//   handleClContextSubmit,
//   setWizardStep,
//   mockUserProfile,
// }: any) => {
//   const [coverLetters, setCoverLetters] = useState([]);

//   const [stats, setStats] = useState({ clsCount: 0 });

//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchCoverLetters = async () => {
//       try {
//         setLoading(true);
//         const response = await apiInstance.get('/students/letter/saved');

//         setCoverLetters(response.data.html || []);
//         setStats((prev) => ({
//           ...prev,
//           coverLettersCount: response.data.html?.length || 0,
//         }));
//       } catch (error) {
//         console.error('Failed to fetch cover letters:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCoverLetters();
//   }, []);

//   const options = [
//     {
//       value: 'skip',
//       icon: Sparkles,
//       title: 'Skip this step - Generate from scratch ',
//       description: 'Let AI create a personalized cover letter for you',
//       gradient: 'blue-500/20',
//     },
//     {
//       value: 'paste',
//       icon: Edit3,
//       title: 'Paste content from an old cover letter',
//       description: 'Use your existing content as a starting point',
//       gradient: 'blue-500/20',
//     },
//     {
//       value: 'saved',
//       icon: Save,
//       title: 'Use a saved cover letter',
//       description: 'Choose from your previously saved templates',
//       gradient: 'blue-500/20',
//     },
//   ];

//   const selectedSource = clForm.watch('clSource');

//   return (
//     <div className="max-w-2xl mx-auto p-4 sm:p-6 font-sans">
//       {/* Header Section */}
//       <div className="text-center mb-4">
//         <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
//           Cover Letter Context
//         </h2>
//         <p className="text-slate-600 text-lg">
//           Provide an existing cover letter to give the AI more context, or skip
//           to generate one from scratch.
//         </p>
//         {/* Progress Indicator */}
//         <div className="flex items-center justify-center mt-4">
//           <div className="flex space-x-2">
//             <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse"></div>
//             <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse delay-150"></div>
//             <div className="w-8 h-3 bg-cyan-500 rounded-full"></div>
//             <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
//           </div>
//         </div>
//       </div>

//       {/* Main Card using react-hook-form */}
//       <div className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
//         <div className="p-6 sm:p-8">
//           <Form {...clForm}>
//             <form onSubmit={clForm.handleSubmit(handleClContextSubmit)}>
//               <FormField
//                 control={clForm.control}
//                 name="clSource"
//                 render={({ field }) => (
//                   <div className="space-y-4">
//                     {/* Main Options: Skip, Paste, Saved */}
//                     {options.map((option, index) => {
//                       const Icon = option.icon;
//                       const isSelected = field.value === option.value;

//                       return (
//                         <div
//                           key={option.value}
//                           className={`group relative overflow-hidden rounded-lg border-2 transition-all duration-300 cursor-pointer ${
//                             isSelected
//                               ? 'border-blue-500 bg-blue-500/10  shadow-lg scale-[1.02]'
//                               : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md'
//                           }`}
//                           // Set the form value on click
//                           onClick={() => field.onChange(option.value)}
//                           style={{
//                             animation: `fadeInUp 0.6s ease-out ${
//                               index * 100
//                             }ms forwards`,
//                             opacity: 0, // Start with opacity 0 for animation
//                           }}
//                         >
//                           <div
//                             className={`absolute inset-0 bg-${option.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
//                           ></div>
//                           <div className="relative p-4 sm:p-6">
//                             <div className="flex items-center space-x-2">
//                               {/* Custom Radio Button Visual */}
//                               <div
//                                 className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
//                                   isSelected
//                                     ? 'border-purple-500 bg-purple-500'
//                                     : 'border-slate-300 group-hover:border-blue-400'
//                                 }`}
//                               >
//                                 {isSelected && (
//                                   <div className="w-2 h-2 bg-white rounded-full"></div>
//                                 )}
//                               </div>
//                               <div
//                                 className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 `}
//                               >
//                                 <Icon className=" w-6 h-6" />
//                               </div>
//                               <div className="flex-1 min-w-0">
//                                 <h3
//                                   className={`font-semibold text-lg mb-1 transition-colors duration-200 ${
//                                     isSelected
//                                       ? 'text-purple-900'
//                                       : 'text-slate-900'
//                                   }`}
//                                 >
//                                   {option.title}
//                                 </h3>
//                                 <p className="text-slate-600 text-sm">
//                                   {option.description}
//                                 </p>
//                               </div>
//                             </div>

//                             {/* Conditional content for 'paste' */}
//                             {isSelected && option.value === 'paste' && (
//                               <div className="mt-6 animate-fadeIn">
//                                 <FormField
//                                   control={clForm.control}
//                                   name="pastedCl"
//                                   render={({ field: pastedField }) => (
//                                     <Textarea
//                                       {...pastedField}
//                                       placeholder="Paste your draft cover letter here..."
//                                       className="w-full h-32 p-4 border-2 border-purple-200 rounded-lg bg-gradient-to-br from-purple-50/30 to-blue-50/30 focus:border-purple-500 focus:outline-none transition-all duration-200 resize-none text-slate-700 placeholder-slate-400"
//                                     />
//                                   )}
//                                 />
//                               </div>
//                             )}

//                             {/* Conditional content for 'saved' */}
//                             {isSelected && option.value === 'saved' && (
//                               // <div className="mt-6 animate-fadeIn">
//                               <div className="max-h-[35vh] overflow-y-auto border border-violet-300 rounded-lg bg-white p-2">
//                                 <FormField
//                                   control={clForm.control}
//                                   name="savedClId"
//                                   render={({ field: savedField }) => (
//                                     <>
//                                       {loading ? (
//                                         <Loader message="Fetching saved Cover Letters..." />
//                                       ) : (
//                                         <div>
//                                           {coverLetters.length > 0 ? (
//                                             <div className="space-y-2">
//                                               {coverLetters.map(
//                                                 (cl, clIndex) => {
//                                                   const isSavedClSelected =
//                                                     savedField.value === cl._id;
//                                                   return (
//                                                     <div
//                                                       key={cl._id}
//                                                       className={`flex items-center   space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
//                                                         isSavedClSelected
//                                                           ? 'border-cyan-500 bg-gradient-to-r from-cyan-50 to-blue-50'
//                                                           : 'border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/30'
//                                                       }`}
//                                                       onClick={(e) => {
//                                                         e.stopPropagation(); // Prevent parent onClick from firing
//                                                         savedField.onChange(
//                                                           cl._id,
//                                                         );
//                                                       }}
//                                                       style={{
//                                                         animation: `slideInLeft 0.4s ease-out ${
//                                                           clIndex * 100
//                                                         }ms forwards`,
//                                                         opacity: 0,
//                                                       }}
//                                                     >
//                                                       <div
//                                                         className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
//                                                           isSavedClSelected
//                                                             ? 'border-cyan-500 bg-cyan-500'
//                                                             : 'border-slate-300'
//                                                         }`}
//                                                       >
//                                                         {isSavedClSelected && (
//                                                           <div className="w-2 h-2 bg-white rounded-full"></div>
//                                                         )}
//                                                       </div>
//                                                       <FileText className="w-4 h-4 text-slate-500" />

//                                                       <div className="flex-1 min-w-0">
//                                                         <div className="font-medium text-slate-800">
//                                                           {cl.coverLetterTitle?.slice(
//                                                             0,
//                                                             50,
//                                                           ) || 'N/A'}
//                                                         </div>

//                                                         <div>
//                                                           {cl.updatedAt && (
//                                                             <div className="text-sm text-slate-500 flex  items-center gap-1">
//                                                               <Clock className="w-3 h-3" />
//                                                               <span>
//                                                                 {new Date(
//                                                                   cl.updatedAt,
//                                                                 ).toLocaleDateString()}
//                                                               </span>
//                                                             </div>
//                                                           )}
//                                                         </div>
//                                                       </div>
//                                                     </div>
//                                                   );
//                                                 },
//                                               )}
//                                             </div>
//                                           ) : (
//                                             <div className="text-center py-8">
//                                               <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
//                                                 <FileText className="w-8 h-8 text-slate-400" />
//                                               </div>
//                                               <p className="text-slate-500 text-sm">
//                                                 No saved cover letters found.
//                                               </p>
//                                             </div>
//                                           )}
//                                         </div>
//                                       )}
//                                     </>
//                                   )}
//                                 />
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}
//               />

//               {/* Footer with navigation buttons */}
//               <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200">
//                 <button
//                   type="button"
//                   onClick={() => setWizardStep('cv')}
//                   className="flex items-center space-x-2 px-6 py-3 text-slate-600 hover:text-slate-900 transition-colors duration-200 rounded-lg hover:bg-slate-100"
//                 >
//                   <ArrowLeft className="w-4 h-4" />
//                   <span className="font-medium">Back</span>
//                 </button>

//                 <motion.div
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                 >
//                   <button
//                     type="submit"
//                     className="flex items-center space-x-2 px-8 py-3 bg-buttonPrimary text-white rounded-lg font-medium shadow-lg transition-all duration-300 hover:shadow-xl hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-purple-300"
//                   >
//                     <span>Next Step</span>
//                     <ArrowRight className="w-4 h-4" />
//                   </button>
//                 </motion.div>
//               </div>
//             </form>
//           </Form>
//         </div>
//       </div>

//       {/* CSS for animations */}
//       <style jsx>{`
//         @keyframes fadeInUp {
//           from {
//             opacity: 0;
//             transform: translateY(20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: scale(0.98);
//           }
//           to {
//             opacity: 1;
//             transform: scale(1);
//           }
//         }
//         @keyframes slideInLeft {
//           from {
//             opacity: 0;
//             transform: translateX(-20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateX(0);
//           }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.4s ease-out forwards;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default SleekClStep;

'use client';

import React, { useEffect, useState } from 'react';
import { Form, FormField } from '@/components/ui/form';
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Edit3,
  Save,
  Sparkles,
  Clock,
  Check,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import apiInstance from '@/services/api';
import { Loader } from '@/components/Loader';

const SleekClStep = ({
  clForm,
  handleClContextSubmit,
  setWizardStep,
  mockUserProfile,
}: any) => {
  const [coverLetters, setCoverLetters] = useState([]);
  const [stats, setStats] = useState({ coverLettersCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoverLetters = async () => {
      try {
        setLoading(true);
        const response = await apiInstance.get('/students/letter/saved');
        setCoverLetters(response.data.html || []);
        setStats((prev) => ({
          ...prev,
          coverLettersCount: response.data.html?.length || 0,
        }));
      } catch (error) {
        console.error('Failed to fetch cover letters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoverLetters();
  }, []);

  const options = [
    {
      value: 'skip',
      icon: Sparkles,
      title: 'Skip this step - Generate from scratch',
      description: 'Let AI create a personalized cover letter for you.',
      colorClass: 'text-indigo-600',
      bgClass: 'bg-indigo-100',
      activeBorderClass: 'peer-checked:border-indigo-600',
      activeDotClass: 'bg-indigo-600',
      activeBgClass: 'peer-checked:bg-indigo-50/30',
      iconBorderClass: 'peer-checked:border-indigo-600',
    },
    {
      value: 'paste',
      icon: Edit3,
      title: 'Paste content from an old letter',
      description: 'Use your existing content as a starting point.',
      colorClass: 'text-emerald-600',
      bgClass: 'bg-emerald-100',
      activeBorderClass: 'peer-checked:border-emerald-600',
      activeDotClass: 'bg-emerald-600',
      activeBgClass: 'peer-checked:bg-emerald-50/30',
      iconBorderClass: 'peer-checked:border-emerald-600',
    },
    {
      value: 'saved',
      icon: Save,
      title: 'Use a saved cover letter',
      description: 'Choose from your previously saved templates.',
      colorClass: 'text-blue-600',
      bgClass: 'bg-blue-100',
      activeBorderClass: 'peer-checked:border-blue-600',
      activeDotClass: 'bg-blue-600',
      activeBgClass: 'peer-checked:bg-blue-50/30',
      iconBorderClass: 'peer-checked:border-blue-600',
    },
  ];

  const selectedSource = clForm.watch('clSource');

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-4 md:p-6 font-jakarta antialiased">
      <div className="mx-auto flex h-full w-full max-w-[850px] flex-col">
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
            {/* Step 2 Progress Line (100%) */}
            <div className="absolute left-8 top-1/2 z-0 h-0.5 w-[100%] -translate-y-1/2 bg-emerald-500 transition-all duration-500"></div>

            <div className="relative z-10 flex w-full justify-between">
              {/* Step 1: Completed */}
              <div className="flex flex-col items-center gap-1.5 bg-slate-50 px-2 dark:bg-transparent">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow-[0_0_0_4px_#f8fafc] transition-colors duration-300">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
                  Job Context
                </span>
              </div>
              {/* Step 2: Active */}
              <div className="flex flex-col items-center gap-1.5 bg-slate-50 px-2 dark:bg-transparent">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow-[0_0_0_4px_#f8fafc] transition-colors duration-300">
                  2
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 ">
                  CV Context
                </span>
              </div>
              {/* Step 3: Pending */}
              <div className="flex flex-col items-center gap-1.5 bg-slate-50 px-2 dark:bg-transparent">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white shadow-[0_0_0_4px_#f8fafc] transition-colors duration-300 animate-pulse">
                  3
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-600">
                  Cover Letter
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN WIZARD CARD */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm animate-in fade-in duration-500">
          {/* Card Header */}
          <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-6 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-green-600 shadow-sm">
              <FileText className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold leading-tight tracking-tight text-slate-900">
                Step 3: Cover Letter Context
              </h2>
              <p className="text-[12px] font-medium text-slate-500">
                Choose the base content the AI should reference.
              </p>
            </div>
          </div>

          <Form {...clForm}>
            <form
              onSubmit={clForm.handleSubmit(handleClContextSubmit)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
                <FormField
                  control={clForm.control}
                  name="clSource"
                  render={({ field }) => (
                    <div className="space-y-4">
                      {options.map((option) => {
                        const Icon = option.icon;
                        const isSelected = field.value === option.value;

                        return (
                          <div key={option.value} className="space-y-4">
                            <label className="group relative block cursor-pointer">
                              <input
                                type="radio"
                                name="clSource"
                                className="peer sr-only"
                                checked={isSelected}
                                onChange={() => field.onChange(option.value)}
                              />
                              <div
                                className={`flex items-center justify-between rounded-xl border-2 p-4 transition-all hover:border-slate-300 ${
                                  isSelected
                                    ? `${option.activeBorderClass} ${option.activeBgClass}`
                                    : 'border-slate-200 bg-white'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {/* Radio Ring */}
                                  <div
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 ${option.iconBorderClass}`}
                                  >
                                    <div
                                      className={`h-2.5 w-2.5 scale-0 rounded-full transition-transform ${option.activeDotClass} ${isSelected ? 'scale-100' : ''}`}
                                    ></div>
                                  </div>

                                  <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${option.bgClass} ${option.colorClass}`}
                                  >
                                    <Icon className="h-5 w-5" strokeWidth={2} />
                                  </div>

                                  <div>
                                    <div className="text-[14px] font-bold leading-tight text-slate-900">
                                      {option.title}
                                    </div>
                                    <div className="mt-0.5 text-[11px] font-medium text-slate-500">
                                      {option.description}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </label>

                            {/* CONDITIONAL SUB-CONTENT FOR PASTE */}
                            {isSelected && option.value === 'paste' && (
                              <div className="ml-[42px] animate-in fade-in slide-in-from-top-2 duration-300">
                                <FormField
                                  control={clForm.control}
                                  name="pastedCl"
                                  render={({ field: pastedField }) => (
                                    <Textarea
                                      {...pastedField}
                                      placeholder="✨ Paste your draft cover letter here..."
                                      className="custom-scrollbar min-h-[160px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-[13.5px] font-medium text-slate-900 shadow-inner transition-all placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-50"
                                    />
                                  )}
                                />
                              </div>
                            )}

                            {/* CONDITIONAL SUB-CONTENT FOR SAVED */}
                            {isSelected && option.value === 'saved' && (
                              <div className="ml-[42px] animate-in fade-in slide-in-from-top-2 duration-300">
                                <FormField
                                  control={clForm.control}
                                  name="savedClId"
                                  render={({ field: savedField }) => (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-2">
                                      {loading ? (
                                        <div className="py-6">
                                          <Loader
                                            message="Fetching saved Cover Letters..."
                                            imageClassName="w-5 h-5"
                                            textClassName="text-sm font-medium text-slate-500"
                                          />
                                        </div>
                                      ) : coverLetters.length > 0 ? (
                                        <div className="custom-scrollbar max-h-[35vh] space-y-2 overflow-y-auto pr-2">
                                          {coverLetters.map((cl: any) => {
                                            const isSavedClSelected =
                                              savedField.value === cl._id;
                                            return (
                                              <label
                                                key={cl._id}
                                                className="group relative block cursor-pointer"
                                              >
                                                <input
                                                  type="radio"
                                                  name="savedClId"
                                                  className="peer sr-only"
                                                  checked={isSavedClSelected}
                                                  onChange={() =>
                                                    savedField.onChange(cl._id)
                                                  }
                                                />
                                                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 transition-all hover:border-blue-300 peer-checked:border-blue-500 peer-checked:bg-blue-50/50">
                                                  <div className="flex items-center gap-3">
                                                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 peer-checked:border-blue-500">
                                                      <div className="h-2 w-2 scale-0 rounded-full bg-blue-500 transition-transform peer-checked:scale-100"></div>
                                                    </div>

                                                    <FileText
                                                      className="h-4 w-4 text-slate-400 shrink-0"
                                                      strokeWidth={2}
                                                    />

                                                    <div>
                                                      <div className="text-[13px] font-bold leading-tight text-slate-800 line-clamp-1">
                                                        {cl.coverLetterTitle?.slice(
                                                          0,
                                                          50,
                                                        ) ||
                                                          'Untitled Cover Letter'}
                                                      </div>
                                                      {cl.updatedAt && (
                                                        <div className="mt-0.5 flex items-center gap-1 text-[10.5px] font-medium text-slate-500">
                                                          <Clock
                                                            className="h-3 w-3"
                                                            strokeWidth={2}
                                                          />
                                                          {new Date(
                                                            cl.updatedAt,
                                                          ).toLocaleDateString()}
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              </label>
                                            );
                                          })}
                                        </div>
                                      ) : (
                                        <p className="p-6 text-center text-sm font-medium text-slate-500">
                                          No saved cover letters available.
                                        </p>
                                      )}
                                    </div>
                                  )}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                />
              </div>

              {/* Footer attached to the card */}
              <div className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setWizardStep('cv')}
                  className="flex items-center gap-2 text-[13px] font-bold text-slate-500 transition-colors hover:text-slate-800"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="group flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 text-[13.5px] font-extrabold text-white shadow-[0_4px_16px_rgba(37,99,235,0.25)] transition-all hover:-translate-y-0.5 hover:bg-teal-700"
                >
                  Next Step
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    strokeWidth={2.5}
                  />
                </button>
              </div>
            </form>
          </Form>
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

export default SleekClStep;
