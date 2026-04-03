// import React, { useEffect, useState } from 'react';
// import {
//   ArrowLeft,
//   Loader2,
//   UploadCloud,
//   FileText,
//   Calendar,
//   Check,
//   ChevronDown,
//   Star,
//   Clock,
// } from 'lucide-react';
// import apiInstance from '@/services/api';
// import { Loader } from '../Loader';

// const ClGenerator = ({
//   selectedSavedCvId,
//   setSelectedSavedCvId,
//   mockUserProfile,
//   handleSetCvContext,
//   handleUseActiveProfileCv,
//   fileInputRef,
//   handleFileUpload,
//   isLoading,
//   loadingMessage,
//   setWizardStep,
// }: any) => {
//   const [expandedCv, setExpandedCv] = useState(null);
//   const [cvs, setCvs] = useState([]);
//   const [stats, setStats] = useState({ cvsCount: 0 });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchCvs = async () => {
//       try {
//         setLoading(true);
//         const response = await apiInstance.get('/students/resume/saved');
//         setCvs(response.data.html || []);

//         setStats((prev) => ({
//           ...prev,
//           cvsCount: response.data.html?.length || 0,
//         }));
//       } catch (error) {
//         console.error('Failed to fetch CVs:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCvs();
//   }, []);

//   return (
//     <div className="p-4 sm:p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Progress indicator */}
//         <div className="flex items-center justify-center mb-4">
//           <div className="flex items-center">
//             <div className="flex items-center">
//               <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
//                 <Check className="w-4 h-4" />
//               </div>
//               <span className="hidden sm:inline ml-2 text-sm font-medium text-green-600">
//                 Job Details
//               </span>
//             </div>
//             <div className="w-16 h-0.5 bg-blue-200"></div>
//             <div className="flex items-center">
//               <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
//                 2
//               </div>
//               <span className="hidden sm:inline ml-2 text-sm font-medium text-blue-600">
//                 CV Context
//               </span>
//             </div>
//             <div className="w-16 h-0.5 bg-gray-200"></div>
//             <div className="flex items-center">
//               <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
//                 3
//               </div>
//               <span className="hidden sm:inline ml-2 text-sm font-medium text-gray-500">
//                 Generate
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Main Card */}
//         <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl border border-white/20 overflow-hidden">
//           {/* Header */}
//           <div className="p-2 bg-header-gradient-primary px-8 text-white">
//             <h2 className="text-xl ">CV Context Selection</h2>
//             <p className="text-blue-100">
//               Choose the CV the AI should reference for generating your cover
//               letter
//             </p>
//           </div>

//           {/* Content */}
//           <div className="sm:p-8 p-4 space-y-4">
//             {/* Saved CVs Section */}
//             <div className="space-y-4">
//               <div className="flex flex-row flex-wrap justify-between text-sm  font-medium mb-2">
//                 <label className="flex items-center">
//                   <FileText className="w-5 h-5 mr-2 text-blue-500" />
//                   Select From Saved CVs
//                 </label>
//                 <p>Total CVs: {stats.cvsCount}</p>
//                 {/* render CV list */}
//               </div>

//               {loading ? (
//                 <Loader message="Fetching saved CVs" />
//               ) : (
//                 <div>
//                   {cvs?.length > 0 ? (
//                     <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
//                       {cvs?.map((cv: any) => (
//                         <div
//                           key={cv._id}
//                           className={`group relative overflow-hidden rounded-lg border-2 transition-all duration-300 cursor-pointer transform  ${
//                             selectedSavedCvId === cv._id
//                               ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg'
//                               : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
//                           }`}
//                           onClick={() => {
//                             setSelectedSavedCvId(cv._id);
//                             // setExpandedCv(expandedCv === cv._id ? null : cv._id);
//                           }}
//                         >
//                           <div className="p-4">
//                             <div className="flex items-center justify-between">
//                               <div className="flex items-center space-x-4">
//                                 <div
//                                   className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
//                                     selectedSavedCvId === cv._id
//                                       ? 'border-blue-500 bg-blue-500'
//                                       : 'border-gray-300 group-hover:border-blue-400'
//                                   }`}
//                                 >
//                                   {selectedSavedCvId === cv._id && (
//                                     <div className="w-full h-full bg-white rounded-full scale-50"></div>
//                                   )}
//                                 </div>
//                                 <div className="flex-1">
//                                   <h4 className="font-semibold text-gray-800 text-sm sm:text-lg">
//                                     {cv.htmlCVTitle || 'Untitled CV'}
//                                   </h4>
//                                   <div className="flex items-center mt-1">
//                                     <span className="text-sm text-gray-500 flex items-center">
//                                       <Clock className="w-4 h-4 mr-1.5" />

//                                       {new Date(cv.updatedAt).toLocaleString()}
//                                     </span>
//                                   </div>
//                                 </div>
//                               </div>

//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   setExpandedCv(
//                                     expandedCv === cv._id ? null : cv._id,
//                                   );
//                                 }}
//                                 className="text-gray-400  hover:bg-gray-50  flex items-center hover:text-gray-600 transition-colors"
//                               >
//                                 <p className="text-sm text-gray-600 flex items-center">
//                                   <Star className="w-4 h-4 mr-2" />
//                                   Ats Score:{' '}
//                                   <span className="ml-1 font-medium">
//                                     {cv.ats}
//                                   </span>
//                                 </p>
//                                 <ChevronDown
//                                   className={`w-6 h-6 transition-transform  ${
//                                     expandedCv === cv._id ? 'rotate-180' : ''
//                                   }`}
//                                 />
//                               </button>
//                             </div>

//                             {expandedCv === cv._id && (
//                               <div className="mt-4 pt-4 border-t border-gray-200">
//                                 <p className="text-sm text-gray-600 flex items-center">
//                                   <Calendar className="w-4 h-4 mr-2" />
//                                   Created:{' '}
//                                   <span className="ml-1 font-medium">
//                                     {new Date(cv.createdAt).toLocaleDateString(
//                                       'en-US',
//                                       {
//                                         year: 'numeric',
//                                         month: 'long',
//                                         day: 'numeric',
//                                       },
//                                     )}
//                                   </span>
//                                 </p>
//                                 <p className="text-sm text-gray-600 flex items-center">
//                                   <Star className="w-4 h-4 mr-2" />
//                                   Ats Score:{' '}
//                                   <span className="ml-1 font-medium">
//                                     {cv.ats}
//                                   </span>
//                                 </p>
//                                 <p className="text-sm text-gray-500 mt-1">
//                                   This CV will be used as the context for AI
//                                   generation.
//                                 </p>
//                               </div>
//                             )}
//                           </div>

//                           {selectedSavedCvId === cv._id && (
//                             <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-blue-500">
//                               <Check className="absolute -top-4 -right-3 w-3 h-3 text-white" />
//                             </div>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <p className="text-sm text-slate-500 text-center p-8">
//                       No saved CVs available.
//                     </p>
//                   )}
//                 </div>
//               )}

//               {/* {selectedSavedCvId && (
//                 <button
//                   className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
//                   onClick={() =>
//                     handleSetCvContext('saved', {
//                       value:
//                         cvs.find((c) => c._id === selectedSavedCvId)
//                           ?.htmlContent || '',
//                       name:
//                         cvs.find((c) => c._id === selectedSavedCvId)?.name ||
//                         '',
//                     })
//                   }
//                 >
//                   Use Selected CV
//                 </button>
//               )} */}

//               {selectedSavedCvId && (
//                 <button
//                   className="w-full bg-buttonPrimary text-white py-3 px-6 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
//                   onClick={() => {
//                     const foundCv = cvs.find(
//                       (c: any) => c._id === selectedSavedCvId,
//                     );

//                     if (!foundCv) {
//                       console.error('Could not find CV with that ID!');
//                       // Optionally, show a toast error here
//                       return;
//                     }

//                     // --- THIS IS THE FIX ---
//                     handleSetCvContext('saved', {
//                       value: foundCv._id || '', // Use 'html'
//                       name: foundCv.htmlCVTitle || '', // Use 'htmlCVTitle'
//                       id: foundCv._id, // Pass the ID as well
//                     });
//                   }}
//                 >
//                   Use Selected CV
//                 </button>
//               )}
//             </div>

//             {/* Separator */}
//             <div className="relative">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-gray-300"></div>
//               </div>
//               <div className="relative flex justify-center text-sm">
//                 <span className="px-4 bg-white text-gray-500 font-medium">
//                   or choose alternative
//                 </span>
//               </div>
//             </div>

//             {/* Alternative Options */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {/* Active Profile CV */}
//               <button
//                 className="group p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all duration-300 text-left"
//                 onClick={handleUseActiveProfileCv}
//               >
//                 <div className="flex items-center space-x-3">
//                   <div className="w-12 h-12 bg-green-100 group-hover:bg-green-200 rounded-full flex items-center justify-center transition-colors">
//                     <FileText className="w-6 h-6 text-green-600" />
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-gray-800">
//                       Active Profile CV
//                     </h4>
//                     <p className="text-sm text-gray-500 mt-1">
//                       Use your current profile information
//                     </p>
//                   </div>
//                 </div>
//               </button>

//               {/* Upload New CV */}
//               <div className="relative">
//                 <input
//                   type="file"
//                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                   onChange={handleFileUpload}
//                   accept=".pdf,.doc,.docx,.png,.jpg"
//                   disabled={isLoading}
//                 />
//                 <div
//                   className={`group p-6 border-2 border-dashed rounded-lg transition-all duration-300 text-left ${
//                     isLoading
//                       ? 'border-blue-300 bg-blue-50'
//                       : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
//                   }`}
//                 >
//                   <div className="flex items-center space-x-3">
//                     <div
//                       className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
//                         isLoading
//                           ? 'bg-blue-200'
//                           : 'bg-blue-100 group-hover:bg-blue-200'
//                       }`}
//                     >
//                       {isLoading ? (
//                         <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
//                       ) : (
//                         <UploadCloud className="w-6 h-6 text-blue-600" />
//                       )}
//                     </div>
//                     <div>
//                       <h4 className="font-semibold text-gray-800">
//                         {isLoading && loadingMessage
//                           ? loadingMessage
//                           : 'Upload New CV'}
//                       </h4>
//                       <p className="text-sm text-gray-500 mt-1">
//                         {isLoading
//                           ? 'Please wait...'
//                           : 'PDF, DOC, DOCX, PNG, JPG'}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="bg-gray-50 px-8 py-4 flex justify-between items-center">
//             <button
//               className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
//               onClick={() => setWizardStep('job')}
//             >
//               <ArrowLeft className="w-4 h-4" />
//               <span>Back to Job Details</span>
//             </button>

//             <div className="text-sm text-gray-500">Step 2 of 3</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ClGenerator;

'use client';

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Loader2,
  UploadCloud,
  FileText,
  Calendar,
  Check,
  CheckCircle2,
  Star,
  User,
} from 'lucide-react';
import apiInstance from '@/services/api';
import { Loader } from '../Loader';

const ClGenerator = ({
  selectedSavedCvId,
  setSelectedSavedCvId,
  mockUserProfile,
  handleSetCvContext,
  handleUseActiveProfileCv,
  fileInputRef,
  handleFileUpload,
  isLoading,
  loadingMessage,
  setWizardStep,
}: any) => {
  const [cvs, setCvs] = useState([]);
  const [stats, setStats] = useState({ cvsCount: 0 });
  const [loading, setLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const fetchCvs = async () => {
      try {
        setLoading(true);
        const response = await apiInstance.get('/students/resume/saved');
        setCvs(response.data.html || []);
        setStats((prev) => ({
          ...prev,
          cvsCount: response.data.html?.length || 0,
        }));
      } catch (error) {
        console.error('Failed to fetch CVs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCvs();
  }, []);

  const handleNextStep = () => {
    if (!selectedSavedCvId) return;
    const foundCv: any = cvs.find((c: any) => c._id === selectedSavedCvId);
    if (!foundCv) {
      console.error('Could not find CV with that ID!');
      return;
    }
    handleSetCvContext('saved', {
      value: foundCv._id || '',
      name: foundCv.htmlCVTitle || '',
      id: foundCv._id,
    });
  };

  // Drag and drop handlers
  const handleDrag = (
    e: React.DragEvent<HTMLDivElement | HTMLButtonElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement | HTMLButtonElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload({ target: { files: e.dataTransfer.files } });
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-4 md:p-6 font-jakarta antialiased">
      {/* <div className="mx-auto flex h-full w-full max-w-[850px] flex-col"> */}
      <div className="mx-auto flex h-full w-full  flex-col">
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
            {/* Step 2 Progress Line (50%) */}
            <div className="absolute left-8 top-1/2 z-0 h-0.5 w-[50%] -translate-y-1/2 bg-emerald-500 transition-all duration-500"></div>

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
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-[0_0_0_4px_#f8fafc] transition-colors duration-300">
                  2
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600">
                  CV Context
                </span>
              </div>
              {/* Step 3: Pending */}
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
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm animate-in fade-in duration-500">
          {/* Card Header */}
          <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-6 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm">
              <FileText className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold leading-tight tracking-tight text-slate-900">
                Step 2: CV Context Selection
              </h2>
              <p className="text-[12px] font-medium text-slate-500">
                Choose the CV the AI should reference for generating your cover
                letter.
              </p>
            </div>
          </div>

          {/* Content Area */}
          <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
            {/* Header for Saved CVs */}
            <div className="flex shrink-0 items-center justify-between px-1">
              <h3 className="flex items-center gap-2 text-[13px] font-extrabold text-slate-900">
                <FileText
                  className="h-4 w-4 text-blue-500"
                  strokeWidth={2.5}
                />
                Select From Saved CVs
              </h3>
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Total: {stats.cvsCount}
              </span>
            </div>

            {/* List of Saved CVs */}
            <div className="shrink-0 space-y-3">
              {loading ? (
                <div className="py-8">
                  <Loader
                    message="Fetching saved CVs..."
                    imageClassName="w-6 h-6"
                    textClassName="text-sm text-slate-500"
                  />
                </div>
              ) : cvs?.length > 0 ? (
                cvs.map((cv: any) => (
                  <label
                    key={cv._id}
                    className="group relative block cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="cv_select"
                      className="peer sr-only"
                      checked={selectedSavedCvId === cv._id}
                      onChange={() => setSelectedSavedCvId(cv._id)}
                    />
                    <div className="flex items-center justify-between rounded-xl border-2 border-slate-200 bg-white p-4 transition-all hover:border-blue-300 peer-checked:border-blue-600 peer-checked:bg-blue-50/30">
                      <div className="flex items-center gap-3">
                        {/* Radio Ring */}
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 peer-checked:border-blue-600">
                          <div className="h-2.5 w-2.5 scale-0 rounded-full bg-blue-600 transition-transform peer-checked:scale-100"></div>
                        </div>
                        {/* Details */}
                        <div>
                          <div className="text-[14px] font-bold leading-tight text-slate-900">
                            {cv.htmlCVTitle || 'Untitled CV'}
                          </div>
                          <div className="mt-0.5 text-[11px] font-medium text-slate-500">
                            {new Date(
                              cv.updatedAt || cv.createdAt,
                            ).toLocaleString('en-US', {
                              month: 'numeric',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                            {cv.ats ? ` • ATS: ${cv.ats}` : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>
                ))
              ) : (
                <p className="p-4 text-center text-[13px] font-medium text-slate-500">
                  No saved CVs available. Please use an alternative method
                  below.
                </p>
              )}
            </div>

            {/* Separator */}
            <div className="flex shrink-0 items-center gap-4 py-2">
              <div className="h-px flex-1 bg-slate-200"></div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Or
              </span>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>

            {/* Alternative Options Grid */}
            <div className="grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Use Profile Button */}
              <button
                onClick={handleUseActiveProfileCv}
                disabled={isLoading}
                className="flex items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 p-3 text-left transition-all hover:bg-emerald-50/50 hover:border-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <User className="h-5 w-5" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-[13px] font-bold leading-tight text-slate-900">
                    Use Profile
                  </div>
                  <div className="mt-0.5 text-[11px] font-medium text-slate-500">
                    Base it on your saved profile.
                  </div>
                </div>
              </button>

              {/* Upload CV Button (with Drag & Drop) */}
              <button
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                disabled={isLoading}
                className={`flex items-center gap-3 rounded-xl border-2 border-dashed p-3 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-300 hover:bg-blue-50/50 hover:border-blue-400'
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2} />
                  ) : (
                    <UploadCloud className="h-5 w-5" strokeWidth={2} />
                  )}
                </div>
                <div>
                  <div className="text-[13px] font-bold leading-tight text-slate-900">
                    {isLoading && loadingMessage
                      ? 'Uploading...'
                      : dragActive
                        ? 'Drop file here!'
                        : 'Upload CV'}
                  </div>
                  <div className="mt-0.5 text-[11px] font-medium text-slate-500">
                    {isLoading && loadingMessage
                      ? loadingMessage
                      : 'PDF, DOCX, PNG, JPG, TXT'}
                  </div>
                </div>
              </button>
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Footer attached to the card */}
          <div className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button
              onClick={() => setWizardStep('job')}
              className="flex items-center gap-2 text-[13px] font-bold text-slate-500 transition-colors hover:text-slate-800"
            >
              <span>←</span> Back
            </button>
            <button
              onClick={handleNextStep}
              disabled={!selectedSavedCvId || isLoading}
              className="group flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-[13.5px] font-extrabold text-white shadow-[0_4px_16px_rgba(37,99,235,0.25)] transition-all hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              Next: Final Touches
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>
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

export default ClGenerator;
