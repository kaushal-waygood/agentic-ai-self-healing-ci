// 'use client';

// import React, { useState, useEffect } from 'react';
// import {
//   FileText,
//   Bookmark,
//   Send,
//   Clock,
//   Trash2,
//   CheckCircle2,
//   X,
//   Search,
// } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';
// import apiInstance from '@/services/api';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { useSelector } from 'react-redux';
// import { RootState } from '@/redux/rootReducer';
// import {
//   deleteSavedCoverLetterRequest,
//   deleteSavedResumeRequest,
//   fetchGeneratedCLsRequest,
//   fetchGeneratedCVsRequest,
//   getDocumentCountsRequest,
//   renameSavedCoverLetterRequest,
//   renameSavedResumeRequest,
//   savedStudentCoverLetterRequest,
//   savedStudentResumeRequest,
// } from '@/redux/reducers/aiReducer';
// import { useDispatch } from 'react-redux';
// import { Loader } from '@/components/Loader';
// import { DocumentSection } from './DocumentSection';
// import { StatCard } from './StatusCard';
// import { fetchTailoredApps } from '@/services/api/ai';
// import { DocumentCard } from './DocumentCard';

// interface CV {
//   _id: string;
//   jobId: string;
//   status: 'pending' | 'completed' | 'failed';
//   jobContextString: string;
//   finalTouch?: string;
//   cvData: any;
//   error?: string;
//   createdAt: string;
//   completedAt?: string;
// }

// interface CoverLetter {
//   _id: string;
//   jobId: string;
//   status: 'pending' | 'completed' | 'failed';
//   jobContextString: string;
//   finalTouch?: string;
//   clData: any;
//   error?: string;
//   createdAt: string;
//   completedAt?: string;
// }

// interface TailoredApplication {
//   _id: string;
//   jobId?: string;
//   jobTitle: string;
//   companyName: string;
//   jobDescription: string;
//   status: 'pending' | 'completed' | 'failed';
//   tailoredCV?: any;
//   tailoredCoverLetter?: any;
//   applicationEmail?: any;
//   error?: string;
//   createdAt: string;
//   completedAt?: string;
// }

// interface ApplicationPagination {
//   totalApplications: number;
//   hasNextPage: boolean;
// }

// const APPLICATIONS_PAGE_SIZE = 10;

// export default function DocumentsPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { toast } = useToast();

//   // Initialize from query param
//   const initialTab =
//     (searchParams.get('tab') as 'cvs' | 'cover-letters' | 'applications') ||
//     'cvs';
//   const [activeTab, setActiveTab] = useState<
//     'cvs' | 'cover-letters' | 'applications'
//   >(initialTab);

//   const [cvs, setCvs] = useState<CV[]>([]);
//   const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
//   const [applications, setApplications] = useState<TailoredApplication[]>([]);
//   const [applicationsPage, setApplicationsPage] = useState(1);
//   const [applicationsPagination, setApplicationsPagination] =
//     useState<ApplicationPagination | null>(null);
//   const [isLoadingMoreApplications, setIsLoadingMoreApplications] =
//     useState(false);

//   const dispatch = useDispatch();
//   const { documentCounts, generatedCVs, generatedCLs } = useSelector(
//     (state: RootState) => state.ai,
//   );

//   useEffect(() => {
//     dispatch(getDocumentCountsRequest());
//   }, [dispatch]);

//   const [isLoading, setIsLoading] = useState(true);
//   const [copiedId, setCopiedId] = useState<string | null>(null);

//   // Rename functionality states
//   const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
//   const [currentDocument, setCurrentDocument] = useState<{
//     id: string;
//     type: 'cv' | 'coverLetter';
//     currentTitle: string;
//   } | null>(null);
//   const [newTitle, setNewTitle] = useState('');
//   const [isRenaming, setIsRenaming] = useState(false);

//   // Update the URL whenever tab changes
//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     params.set('tab', activeTab);
//     params.delete('page');
//     router.replace(`${window.location.pathname}?${params.toString()}`);
//   }, [activeTab, router]);

//   // Fetch data only for the active tab
//   useEffect(() => {
//     const fetchTabData = async () => {
//       setIsLoading(true);
//       try {
//         if (activeTab === 'cvs') {
//           await fetchCVs();
//         } else if (activeTab === 'cover-letters') {
//           await fetchCoverLetters();
//         } else if (activeTab === 'applications') {
//           setApplicationsPage(1);
//           await fetchApplications(1, false);
//         }
//       } catch (error) {
//         console.error('Failed to fetch tab data:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchTabData();
//   }, [activeTab]);

//   useEffect(() => {
//     if (generatedCVs) setCvs(generatedCVs || []);
//     if (generatedCLs) setCoverLetters(generatedCLs || []);
//   }, [generatedCVs, generatedCLs]);

//   // Api calls

//   const fetchCVs = async () => {
//     try {
//       dispatch(fetchGeneratedCVsRequest());
//     } catch (error) {
//       console.error('Failed to fetch CVs:', error);
//       throw error;
//     }
//   };

//   const fetchCoverLetters = async () => {
//     try {
//       dispatch(fetchGeneratedCLsRequest());
//     } catch (error) {
//       console.error('Failed to fetch cover letters:', error);
//       throw error;
//     }
//   };

//   const fetchApplications = async (page = 1, append = false) => {
//     try {
//       const response = await fetchTailoredApps({
//         page,
//         limit: APPLICATIONS_PAGE_SIZE,
//       });

//       const nextApplications = response.data.tailoredApplications || [];
//       setApplications((prev) => {
//         if (!append) return nextApplications;

//         const merged = [...prev, ...nextApplications];
//         return Array.from(
//           new Map(merged.map((item) => [item._id, item])).values(),
//         );
//       });
//       setApplicationsPagination(
//         response.data.pagination || {
//           totalApplications: response.data.tailoredApplications?.length || 0,
//           hasNextPage: false,
//         },
//       );
//       setApplicationsPage(page);
//     } catch (error) {
//       console.error('Failed to fetch applications:', error);
//       throw error;
//     }
//   };

//   const handleRename = (
//     documentId: string,
//     type: 'cv' | 'coverLetter',
//     currentTitle: string,
//   ) => {
//     setCurrentDocument({ id: documentId, type, currentTitle });
//     setNewTitle(currentTitle);
//     setIsRenameDialogOpen(true);
//   };

//   const confirmRename = async () => {
//     if (!currentDocument || !newTitle.trim()) return;

//     setIsRenaming(true);
//     try {
//       const endpoint =
//         currentDocument.type === 'cv'
//           ? '/students/resume/title/rename'
//           : '/students/cover-letter/title/rename';

//       const payload =
//         currentDocument.type === 'cv'
//           ? { cvId: currentDocument.id, newTitle: newTitle.trim() }
//           : { coverLetterId: currentDocument.id, newTitle: newTitle.trim() };

//       const response = await apiInstance.patch(endpoint, payload);

//       // Update local state based on document type
//       if (currentDocument.type === 'cv') {
//         setCvs((prev) =>
//           prev.map((cv) =>
//             cv._id === currentDocument.id
//               ? { ...cv, jobContextString: newTitle.trim() }
//               : cv,
//           ),
//         );
//       } else {
//         setCoverLetters((prev) =>
//           prev.map((cl) =>
//             cl._id === currentDocument.id
//               ? { ...cl, jobContextString: newTitle.trim() }
//               : cl,
//           ),
//         );
//       }

//       toast({
//         title: 'Document Renamed!',
//         description: `${
//           currentDocument.type === 'cv' ? 'CV' : 'Cover letter'
//         } has been renamed successfully.`,
//       });

//       setIsRenameDialogOpen(false);
//       setCurrentDocument(null);
//       setNewTitle('');
//     } catch (error: any) {
//       console.error('Error renaming document:', error);
//       toast({
//         variant: 'destructive',
//         title: 'Rename Failed',
//         description: error.response?.data?.error || 'Failed to rename document',
//       });
//     } finally {
//       setIsRenaming(false);
//     }
//   };

//   const deleteCV = async (cvId: string) => {
//     try {
//       await apiInstance.delete(`/students/cv/${cvId}`);
//       toast({ title: 'Success', description: 'CV deleted successfully' });

//       fetchCVs();
//       dispatch(getDocumentCountsRequest());
//     } catch {
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: 'Failed to delete CV',
//       });
//     }
//   };

//   const deleteCoverLetter = async (clId: string) => {
//     try {
//       await apiInstance.delete(`/students/cl/${clId}`);
//       toast({ title: 'Success', description: 'Cover letter deleted' });

//       fetchCoverLetters();
//       dispatch(getDocumentCountsRequest());
//     } catch {
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: 'Failed to delete cover letter',
//       });
//     }
//   };

//   const deleteSavedCV = async (documentId: string) => {
//     try {
//       await dispatch(deleteSavedResumeRequest({ cvId: documentId }));
//       toast({ title: 'Success', description: 'CV deleted successfully' });
//       await dispatch(savedStudentResumeRequest());
//     } catch {
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: 'Failed to delete CV',
//       });
//     }
//   };

//   const deleteSavedCoverLetter = async (documentId: string) => {
//     try {
//       await dispatch(deleteSavedCoverLetterRequest({ clId: documentId }));
//       toast({ title: 'Success', description: 'Cover letter deleted' });
//     } catch {
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: 'Failed to delete cover letter',
//       });
//     }
//   };

//   const renameSavedCoverLetter = async (
//     documentId: string,
//     newTitle: string,
//   ) => {
//     try {
//       await dispatch(
//         renameSavedCoverLetterRequest({ clId: documentId, newTitle }) as any,
//       );
//       toast({ title: 'Success', description: 'Cover letter renamed' });
//     } catch {
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: 'Failed to rename cover letter',
//       });
//     }
//   };

//   const renameSavedCV = async (documentId: string, newTitle: string) => {
//     try {
//       await dispatch(
//         renameSavedResumeRequest({
//           cvId: documentId,
//           newTitle,
//         }) as any,
//       );

//       toast({
//         title: 'Document Renamed',
//         description: 'Updated name fetched successfully.',
//       });
//     } catch (error) {
//       console.error('Rename failed:', error);
//       toast({
//         variant: 'destructive',
//         title: 'Rename Failed',
//         description: 'Could not update the document name.',
//       });
//       throw error;
//     }
//   };

//   const deleteApplication = async (appId: string) => {
//     try {
//       await apiInstance.delete(`/students/tailored-applications/${appId}`);
//       toast({ title: 'Success', description: 'Application deleted' });
//       const loadedPages = Math.max(applicationsPage, 1);
//       const refreshLimit = loadedPages * APPLICATIONS_PAGE_SIZE;
//       const response = await fetchTailoredApps({
//         page: 1,
//         limit: refreshLimit,
//       });
//       setApplications(response.data.tailoredApplications || []);
//       setApplicationsPagination({
//         totalApplications:
//           response.data.pagination?.totalApplications ||
//           response.data.tailoredApplications?.length ||
//           0,
//         hasNextPage:
//           response.data.pagination?.hasNextPage ||
//           (response.data.tailoredApplications?.length || 0) < refreshLimit,
//       });
//       dispatch(getDocumentCountsRequest());
//     } catch {
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: 'Failed to delete application',
//       });
//     }
//   };

//   const copyToClipboard = async (content: any, id: string) => {
//     if (!content) return;
//     const textToCopy = content.cv || content.html;
//     if (!textToCopy) return;

//     try {
//       await navigator.clipboard.writeText(textToCopy);
//       setCopiedId(id);
//       setTimeout(() => setCopiedId(null), 2000);
//       toast({
//         title: 'Copied to Clipboard!',
//         description: `Content has been copied as plain text.`,
//       });
//     } catch (err) {
//       console.error('Failed to copy text: ', err);
//       toast({ variant: 'destructive', title: 'Copy Failed' });
//     }
//   };

//   const downloadFile = (blob: Blob, filename: string) => {
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = filename;
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//     window.URL.revokeObjectURL(url);
//   };

//   const downloadAsFile = async (content: any, title: string) => {
//     if (!content) return;
//     setIsLoading(true);
//     toast({ title: 'Generating PDF...' });

//     const htmlContent = content.cv || content.html;
//     try {
//       const response = await apiInstance.post(
//         '/students/pdf/generate-pdf',
//         { html: htmlContent, title },
//         { responseType: 'blob' },
//       );
//       if (response.status !== 200)
//         throw new Error('PDF generation failed on the server.');

//       const blob = new Blob([response.data], { type: 'application/pdf' });
//       downloadFile(blob, `zobsai_${title.replace(/ /g, '_')}.pdf`);
//       toast({ title: 'PDF downloaded successfully!' });
//     } catch (error) {
//       console.error('PDF Download Error:', error);
//       toast({
//         variant: 'destructive',
//         title: 'PDF Download Failed',
//         description: 'An error occurred while generating the PDF.',
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'completed':
//         return <CheckCircle2 className="h-4 w-4 text-green-500" />;
//       case 'pending':
//         return <Clock className="h-4 w-4 text-yellow-500" />;
//       case 'failed':
//         return <Trash2 className="h-4 w-4 text-red-500" />;
//       default:
//         return <Clock className="h-4 w-4 text-gray-500" />;
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'completed':
//         return 'text-green-600 bg-green-50 border-green-200';
//       case 'pending':
//         return 'text-yellow-600 bg-yellow-50 border-yellow-200';
//       case 'failed':
//         return 'text-red-600 bg-red-50 border-red-200';
//       default:
//         return 'text-gray-600 bg-gray-50 border-gray-200';
//     }
//   };

//   const formatDate = (dateString: string) =>
//     new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     });

//   const refreshGeneratedDocs = (type: 'cv' | 'coverLetter' | 'application') => {
//     if (type === 'cv') {
//       fetchCVs();
//     } else if (type === 'coverLetter') {
//       fetchCoverLetters();
//     } else if (type === 'application') {
//       fetchApplications();
//     }
//   };

//   const handleLoadMoreApplications = async () => {
//     if (!applicationsPagination?.hasNextPage || isLoadingMoreApplications) {
//       return;
//     }

//     setIsLoadingMoreApplications(true);
//     try {
//       await fetchApplications(applicationsPage + 1, true);
//     } finally {
//       setIsLoadingMoreApplications(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
//       <div className="p-4 sm:p-6 max-w-7xl mx-auto">
//         <div className="mb-8 text-center">
//           <h1 className="text-2xl uppercase font-semibold sm:text-3xl md:text-4xl bg-headingTextPrimary text-foreground bg-clip-text text-transparent relative z-10">
//             My Documents
//           </h1>
//           <p className="text-lg text-gray-600 dark:text-gray-400">
//             Manage your CVs, Cover Letters, and Applications
//           </p>
//         </div>

//         {/* ✅ Stat Tabs (interactive with params) */}
//         <div className="grid grid-cols-3 md:grid-cols-3 gap-4 md:gap-6 mb-8">
//           <StatCard
//             label="Curiculums Vitae"
//             value={documentCounts?.cv?.total}
//             icon={FileText}
//             color="from-blue-500 to-blue-600"
//             isActive={activeTab === 'cvs'}
//             onClick={() => setActiveTab('cvs')}
//           />
//           <StatCard
//             label="Cover Letters"
//             value={documentCounts?.cl?.total}
//             icon={Bookmark}
//             color="from-purple-500 to-pink-500"
//             isActive={activeTab === 'cover-letters'}
//             onClick={() => setActiveTab('cover-letters')}
//           />
//           <StatCard
//             label="Tailored Applications "
//             value={documentCounts?.tailored?.total}
//             icon={Send}
//             color="from-green-500 to-emerald-500"
//             isActive={activeTab === 'applications'}
//             onClick={() => setActiveTab('applications')}
//           />
//         </div>

//         {/* ✅ Conditional Sections */}
//         <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800 backdrop-blur-sm">
//           {isLoading ? (
//             <Loader imageClassName="w-6 h-6" textClassName="text-sm" />
//           ) : (
//             <>
//               {activeTab === 'cvs' && (
//                 <DocumentSection
//                   title="CVs"
//                   items={cvs}
//                   documentCounts={documentCounts}
//                   refreshGeneratedDocs={refreshGeneratedDocs}
//                   onDelete={deleteCV}
//                   onDeleteSaved={deleteSavedCV}
//                   onCopy={copyToClipboard}
//                   onDownload={downloadAsFile}
//                   onRename={handleRename}
//                   onRenameSaved={renameSavedCV}
//                   copiedId={copiedId}
//                   getStatusIcon={getStatusIcon}
//                   getStatusColor={getStatusColor}
//                   formatDate={formatDate}
//                   type="cv"
//                 />
//               )}

//               {activeTab === 'cover-letters' && (
//                 <DocumentSection
//                   title="Cover Letters"
//                   refreshGeneratedDocs={refreshGeneratedDocs}
//                   items={coverLetters}
//                   documentCounts={documentCounts}
//                   onDelete={deleteCoverLetter}
//                   onDeleteSaved={deleteSavedCoverLetter}
//                   onRename={handleRename}
//                   onRenameSaved={renameSavedCoverLetter}
//                   onCopy={copyToClipboard}
//                   onDownload={downloadAsFile}
//                   copiedId={copiedId}
//                   getStatusIcon={getStatusIcon}
//                   getStatusColor={getStatusColor}
//                   formatDate={formatDate}
//                   type="coverLetter"
//                 />
//               )}

//               {activeTab === 'applications' && (
//                 <>
//                   <DocumentSection
//                     title="Tailored Applications"
//                     items={applications}
//                     documentCounts={documentCounts}
//                     onDelete={deleteApplication}
//                     onCopy={copyToClipboard}
//                     onDownload={downloadAsFile}
//                     copiedId={copiedId}
//                     getStatusIcon={getStatusIcon}
//                     getStatusColor={getStatusColor}
//                     formatDate={formatDate}
//                     type="application"
//                     hasMore={applicationsPagination?.hasNextPage}
//                     isLoadingMore={isLoadingMoreApplications}
//                     onLoadMore={handleLoadMoreApplications}
//                   />
//                 </>
//               )}
//             </>
//           )}
//         </div>
//       </div>

//       {/* Rename Dialog */}
//       {isRenameDialogOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                 Rename {currentDocument?.type === 'cv' ? 'CV' : 'Cover Letter'}
//               </h3>
//               <button
//                 onClick={() => {
//                   setIsRenameDialogOpen(false);
//                   setCurrentDocument(null);
//                   setNewTitle('');
//                 }}
//                 className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
//               Enter a new name for your{' '}
//               {currentDocument?.type === 'cv' ? 'CV' : 'cover letter'}.
//             </p>

//             <input
//               type="text"
//               value={newTitle}
//               onChange={(e) => setNewTitle(e.target.value)}
//               className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
//               placeholder={`Enter ${
//                 currentDocument?.type === 'cv' ? 'CV' : 'cover letter'
//               } name`}
//               maxLength={100}
//             />

//             <div className="flex justify-end space-x-3">
//               <button
//                 onClick={() => {
//                   setIsRenameDialogOpen(false);
//                   setCurrentDocument(null);
//                   setNewTitle('');
//                 }}
//                 className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
//                 disabled={isRenaming}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmRename}
//                 disabled={!newTitle.trim() || isRenaming}
//                 className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
//               >
//                 {isRenaming ? 'Renaming...' : 'Rename'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // Stat Card Component
// const StatCard = ({
//   label,
//   value,
//   icon: Icon,
//   color,
//   isActive,
//   onClick,
// }: {
//   label: string;
//   value: number;
//   icon: any;
//   color: string;
//   isActive: boolean;
//   onClick: () => void;
// }) => (
//   <div
//     className={`p-4 md:p-6 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
//       isActive
//         ? 'border-blue-500 bg-white dark:bg-gray-800 shadow-lg scale-105'
//         : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:scale-102'
//     }`}
//     onClick={onClick}
//   >
//     <div className="flex items-center justify-between">
//       <div>
//         <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
//           {label}
//         </p>
//         <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
//           {value}
//         </p>
//       </div>
//       <div
//         className={`hidden md:block p-3 rounded-lg bg-gradient-to-r ${color}`}
//       >
//         <Icon className="h-6 w-6 text-white" />
//       </div>
//     </div>
//   </div>
// );

// const DocumentSection = ({
//   documentCounts,
//   title,
//   items,
//   onDelete,
//   onDeleteSaved,
//   onRenameSaved,
//   onCopy,
//   onDownload,
//   copiedId,
//   getStatusIcon,
//   refreshGeneratedDocs,
//   getStatusColor,
//   formatDate,
//   type,
//   hasMore,
//   isLoadingMore,
//   onLoadMore,
// }: any) => {
//   const [visibleCount, setVisibleCount] = useState(10);
//   const dispatch = useDispatch();

//   const searchParams = useSearchParams();

//   const initialDocState =
//     searchParams.get('q') === 'saved' ? 'saved' : 'generated';

//   const [docState, setDocState] = useState<'generated' | 'saved'>(
//     initialDocState,
//   );

//   // 1. Add state to store the search input
//   const [searchTerm, setSearchTerm] = useState('');

//   // actual search used for filtering
//   const [finalSearchTerm, setFinalSearchTerm] = useState('');

//   // Auto reset when input becomes empty
//   useEffect(() => {
//     if (searchTerm === '') {
//       setFinalSearchTerm('');
//     }
//   }, [searchTerm]);

//   const { resume, coverLetter } = useSelector((state: RootState) => state.ai);

//   const countsForType = (() => {
//     if (!documentCounts) return { generated: 0, saved: 0, total: 0 };

//     switch (type) {
//       case 'cv':
//         return documentCounts.cv;
//       case 'coverLetter':
//         return documentCounts.cl;
//       case 'application':
//         return documentCounts.tailored;
//       default:
//         return { generated: 0, saved: 0, total: 0 };
//     }
//   })();
//   useEffect(() => {
//     if (docState === 'saved') {
//       const serverSavedCount = countsForType?.saved || 0;

//       const localItemsLoaded =
//         type === 'cv'
//           ? (resume?.html?.length ?? -1)
//           : (coverLetter?.html?.length ?? -1);

//       if (localItemsLoaded !== serverSavedCount) {
//         if (type === 'cv') {
//           console.log('Syncing saved CVs...');
//           dispatch(savedStudentResumeRequest());
//         } else if (type === 'coverLetter') {
//           console.log('Syncing saved Cover Letters...');
//           dispatch(savedStudentCoverLetterRequest());
//         }
//       }
//     }
//   }, [docState, type, dispatch, countsForType?.saved]);

//   useEffect(() => {
//     if (type === 'application') {
//       setDocState('generated');
//     }
//   }, [type]);

//   const listToRender = (() => {
//     if (docState === 'saved') {
//       if (type === 'cv') {
//         return Array.isArray(resume?.html) ? resume.html : [];
//       }

//       if (type === 'coverLetter') {
//         return Array.isArray(coverLetter?.html) ? coverLetter.html : [];
//       }

//       return [];
//     }

//     return Array.isArray(items) ? items : [];
//   })();

//   const filteredItems = listToRender.filter((item: any) => {
//     if (!finalSearchTerm.trim()) return true;

//     const searchLower = finalSearchTerm.toLowerCase();

//     // Collect all searchable text safely
//     const searchableText = [
//       item.clTitle,
//       item.coverLetterTitle,
//       item.cvTitle,
//       item.htmlCVTitle,
//     ]
//       .filter(Boolean)
//       .join(' ')
//       .toLowerCase();

//     return searchableText.includes(searchLower);
//   });

//   const handleSearch = () => {
//     setFinalSearchTerm(searchTerm);
//   };

//   const handleRenameDocument = async (documentId: string, newTitle: string) => {
//     try {
//       const endpoint =
//         docState === 'saved'
//           ? type === 'cv'
//             ? `/students/resume/${documentId}/rename`
//             : `/students/cover-letter/${documentId}/rename`
//           : type === 'cv'
//             ? `/students/cv/${documentId}/rename`
//             : `/students/cl/${documentId}/rename`;

//       await apiInstance.patch(endpoint, { title: newTitle });

//       // 🔥 refresh logic
//       if (docState === 'saved') {
//         type === 'cv'
//           ? dispatch(savedStudentResumeRequest())
//           : dispatch(savedStudentCoverLetterRequest());
//       } else {
//         refreshGeneratedDocs(type);
//       }

//       toast({
//         title: 'Document Renamed',
//         description: 'Updated name fetched successfully.',
//       });
//     } catch (error) {
//       console.error('Rename failed:', error);
//       toast({
//         variant: 'destructive',
//         title: 'Rename Failed',
//         description: 'Could not update the document name.',
//       });
//       throw error;
//     }
//   };

//   return (
//     <div className="p-6">
//       <div className="flex items-center flex-wrap justify-between  mb-6">
//         <h2 className="text-lg md:text-2xl font-semibold text-gray-900 dark:text-white ">
//           {title}
//         </h2>

//         <div className="flex gap-2 mb-4 md:mb-0">
//           {type !== 'application' ? (
//             <div className="flex gap-2">
//               {/* GENERATED BUTTON */}
//               <button
//                 onClick={() => {
//                   setDocState('generated');
//                   const params = new URLSearchParams(window.location.search);
//                   params.delete('q');
//                   window.history.replaceState(
//                     null,
//                     '',
//                     `?${params.toString()}`,
//                   );
//                 }}
//                 className={`px-4 py-2 rounded-md flex items-center gap-2 ${
//                   docState === 'generated'
//                     ? 'bg-blue-500 text-white'
//                     : 'bg-gray-200 dark:bg-gray-700'
//                 }`}
//               >
//                 Generated
//                 <span
//                   className={`text-xs px-2 py-0.5 rounded-full ${
//                     docState === 'generated'
//                       ? 'bg-white text-blue-600'
//                       : 'bg-gray-300 dark:bg-gray-600'
//                   }`}
//                 >
//                   {countsForType?.generated || 0}
//                 </span>
//               </button>

//               {/* SAVED BUTTON */}
//               <button
//                 onClick={() => {
//                   setDocState('saved');
//                   const params = new URLSearchParams(window.location.search);
//                   params.set('q', 'saved');
//                   window.history.replaceState(
//                     null,
//                     '',
//                     `?${params.toString()}`,
//                   );
//                 }}
//                 className={`px-4 py-2 rounded-md flex items-center gap-2 ${
//                   docState === 'saved'
//                     ? 'bg-blue-500 text-white'
//                     : 'bg-gray-200 dark:bg-gray-700'
//                 }`}
//               >
//                 Saved
//                 <span
//                   className={`text-xs px-2 py-0.5 rounded-full ${
//                     docState === 'saved'
//                       ? 'bg-white text-blue-600'
//                       : 'bg-gray-300 dark:bg-gray-600'
//                   }`}
//                 >
//                   {countsForType?.saved || 0}
//                 </span>
//               </button>
//             </div>
//           ) : (
//             <button
//               onClick={() => {
//                 setDocState('generated');
//                 const params = new URLSearchParams(window.location.search);
//                 params.delete('q');
//                 window.history.replaceState(null, '', `?${params.toString()}`);
//               }}
//               className={`px-4 py-2 rounded-md flex items-center gap-2 ${
//                 docState === 'generated'
//                   ? 'bg-blue-500 text-white'
//                   : 'bg-gray-200 dark:bg-gray-700'
//               }`}
//             >
//               Generated
//               <span
//                 className={`text-xs px-2 py-0.5 rounded-full ${
//                   docState === 'generated'
//                     ? 'bg-white text-blue-600'
//                     : 'bg-gray-300 dark:bg-gray-600'
//                 }`}
//               >
//                 {countsForType?.generated || 0}
//               </span>
//             </button>
//           )}
//         </div>
//         <div className="flex items-center">
//           {/* Input + X inside */}
//           <div className="relative">
//             <input
//               type="text"
//               className="p-1 pr-8 border border-gray-300 dark:border-gray-600 rounded-md"
//               placeholder="Search Doc"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === 'Enter') handleSearch();
//               }}
//             />

//             {/* X Button inside input */}
//             {searchTerm && (
//               <button
//                 className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
//                 onClick={() => {
//                   setSearchTerm('');
//                   setFinalSearchTerm('');
//                 }}
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             )}
//           </div>

//           {/* Search Button OUTSIDE */}
//           <button
//             className="ml-2 p-1 border border-gray-300 dark:border-gray-600 rounded-md"
//             onClick={handleSearch}
//           >
//             <Search className="w-4 h-4" />
//           </button>
//         </div>
//       </div>

//       {listToRender?.length === 0 ? (
//         <div className="text-center py-12">
//           <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
//           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
//             No{' '}
//             {type === 'cv'
//               ? 'CVs'
//               : type === 'coverLetter'
//                 ? 'Cover Letters'
//                 : 'Applications'}{' '}
//             Found
//           </h3>
//           <p className="text-gray-600 dark:text-gray-400">
//             {type === 'cv'
//               ? 'Generate your first CV to get started'
//               : type === 'coverLetter'
//                 ? 'Create your first cover letter to see it here'
//                 : 'Create your first tailored application to see it here'}
//           </p>
//         </div>
//       ) : filteredItems?.length === 0 ? (
//         // This shows if there are items, but none match the search
//         <div className="text-center py-12">
//           <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
//           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
//             No Results Found
//           </h3>
//           <p className="text-gray-600 dark:text-gray-400">
//             Your search for "{searchTerm}" did not match any documents.
//           </p>
//         </div>
//       ) : (
//         // This shows the filtered results
//         <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
//           {/* 5. Map over the filtered list */}
//           {(type === 'application'
//             ? filteredItems
//             : filteredItems.slice(0, visibleCount)
//           ).map((item: any, index: number) => (
//             <DocumentCard
//               key={item._id}
//               index={index + 1}
//               item={item}
//               type={type}
//               onDelete={onDelete}
//               onDeleteSaved={onDeleteSaved}
//               onRenameSaved={onRenameSaved}
//               onRename={handleRenameDocument}
//               onCopy={onCopy}
//               onDownload={onDownload}
//               copiedId={copiedId}
//               getStatusIcon={getStatusIcon}
//               getStatusColor={getStatusColor}
//               formatDate={formatDate}
//               docState={docState}
//             />
//           ))}
//         </div>
//       )}

//       {/* Show "See More" only if not all items are visible */}
//       {type === 'application' && hasMore && (
//         <div className="text-center mt-4">
//           <button
//             onClick={onLoadMore}
//             disabled={isLoadingMore}
//             className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-50"
//           >
//             {isLoadingMore ? 'Loading...' : 'See More'}
//           </button>
//         </div>
//       )}

//       {type !== 'application' && visibleCount < filteredItems?.length && (
//         <div className="text-center mt-4">
//           <button
//             onClick={() => setVisibleCount(visibleCount + 10)}
//             className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
//           >
//             See More
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Filter,
  Bookmark,
  Send,
  Eye,
  FileText,
  Bot,
  Search,
  X,
  CheckCircle2,
  Clock,
  Trash2,
  Edit3,
  Download,
  Copy,
  ChevronRight,
  Wand2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import apiInstance from '@/services/api';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import { getStudentStatsRequest } from '@/redux/reducers/studentReducer';
import { Loader } from '@/components/Loader';
import {
  deleteSavedCoverLetterRequest,
  deleteSavedResumeRequest,
  fetchGeneratedCLsRequest,
  fetchGeneratedCVsRequest,
  getDocumentCountsRequest,
  renameSavedCoverLetterRequest,
  renameSavedResumeRequest,
  savedStudentCoverLetterRequest,
  savedStudentResumeRequest,
} from '@/redux/reducers/aiReducer';
import { fetchTailoredApps } from '@/services/api/ai';
import { DocumentCard } from './DocumentCard';
// import { formatDate } from '@/utils/formatDate';

/* =========================================
   TYPES & INTERFACES
   ========================================= */

interface CV {
  _id: string;
  jobId: string;
  status: 'pending' | 'completed' | 'failed';
  jobContextString: string;
  finalTouch?: string;
  cvData: any;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

interface CoverLetter {
  _id: string;
  jobId: string;
  status: 'pending' | 'completed' | 'failed';
  jobContextString: string;
  finalTouch?: string;
  clData: any;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

interface TailoredApplication {
  _id: string;
  jobId?: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  status: 'pending' | 'completed' | 'failed';
  tailoredCV?: any;
  tailoredCoverLetter?: any;
  applicationEmail?: any;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

interface ApplicationPagination {
  totalApplications: number;
  hasNextPage: boolean;
}

const APPLICATIONS_PAGE_SIZE = 10;

/* =========================================
   RE-STYLED STAT CARD
   ========================================= */
const StatCard = ({
  label,
  value,
  icon: Icon,
  isActive,
  onClick,
}: {
  label: string;
  value: number;
  icon: any;
  isActive: boolean;
  onClick: () => void;
}) => (
  <div
    className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-[20px] bg-white p-5 transition-all duration-300 ${
      isActive
        ? 'border-blue-500 shadow-[0_4px_20px_rgba(37,99,235,0.08)] ring-1 ring-blue-500'
        : 'border border-slate-200 hover:border-blue-300 hover:shadow-md'
    }`}
    onClick={onClick}
  >
    {isActive && (
      <div className="absolute bottom-0 left-0 top-0 w-1.5 bg-blue-600 transition-colors"></div>
    )}
    <div
      className={`flex items-center justify-between ${isActive ? 'pl-2' : ''}`}
    >
      <div>
        <div
          className={`mb-1 text-[13px] font-extrabold uppercase tracking-widest transition-colors ${
            isActive
              ? 'text-blue-600'
              : 'text-slate-400 group-hover:text-blue-500'
          }`}
        >
          {label}
        </div>
        <div className="text-4xl font-black tracking-tight text-slate-900">
          {value || 0}
        </div>
      </div>
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
          isActive
            ? 'bg-blue-50 text-blue-600 shadow-sm'
            : 'border border-slate-100 bg-slate-50 text-slate-400 group-hover:border-blue-100 group-hover:bg-blue-50 group-hover:text-blue-500'
        }`}
      >
        <Icon className="h-6 w-6" strokeWidth={2} />
      </div>
    </div>
  </div>
);

/* =========================================
   RE-STYLED DOCUMENT SECTION
   ========================================= */
const DocumentSection = ({
  documentCounts,
  title,
  items,
  onDelete,
  onDeleteSaved,
  onRenameSaved,
  onCopy,
  onDownload,
  copiedId,
  getStatusIcon,
  refreshGeneratedDocs,
  getStatusColor,
  formatDate,
  type,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: any) => {
  const [visibleCount, setVisibleCount] = useState(10);
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const initialDocState =
    searchParams.get('q') === 'saved' ? 'saved' : 'generated';
  const [docState, setDocState] = useState<'generated' | 'saved'>(
    initialDocState,
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [finalSearchTerm, setFinalSearchTerm] = useState('');

  useEffect(() => {
    if (searchTerm === '') setFinalSearchTerm('');
  }, [searchTerm]);

  const { resume, coverLetter } = useSelector((state: RootState) => state.ai);

  const countsForType = (() => {
    if (!documentCounts) return { generated: 0, saved: 0, total: 0 };
    switch (type) {
      case 'cv':
        return documentCounts.cv;
      case 'coverLetter':
        return documentCounts.cl;
      case 'application':
        return documentCounts.tailored;
      default:
        return { generated: 0, saved: 0, total: 0 };
    }
  })();

  useEffect(() => {
    if (docState === 'saved') {
      const serverSavedCount = countsForType?.saved || 0;
      const localItemsLoaded =
        type === 'cv'
          ? (resume?.html?.length ?? -1)
          : (coverLetter?.html?.length ?? -1);
      if (localItemsLoaded !== serverSavedCount) {
        if (type === 'cv') dispatch(savedStudentResumeRequest());
        else if (type === 'coverLetter')
          dispatch(savedStudentCoverLetterRequest());
      }
    }
  }, [docState, type, dispatch, countsForType?.saved]);

  useEffect(() => {
    if (type === 'application') setDocState('generated');
  }, [type]);

  const listToRender = (() => {
    if (docState === 'saved') {
      if (type === 'cv') return Array.isArray(resume?.html) ? resume.html : [];
      if (type === 'coverLetter')
        return Array.isArray(coverLetter?.html) ? coverLetter.html : [];
      return [];
    }
    return Array.isArray(items) ? items : [];
  })();

  const filteredItems = listToRender.filter((item: any) => {
    if (!finalSearchTerm.trim()) return true;
    const searchLower = finalSearchTerm.toLowerCase();
    const searchableText = [
      item.clTitle,
      item.coverLetterTitle,
      item.cvTitle,
      item.htmlCVTitle,
      item.jobTitle,
      item.companyName,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return searchableText.includes(searchLower);
  });

  const handleSearch = () => setFinalSearchTerm(searchTerm);

  const handleRenameDocument = async (documentId: string, newTitle: string) => {
    try {
      const endpoint =
        docState === 'saved'
          ? type === 'cv'
            ? `/students/resume/${documentId}/rename`
            : `/students/cover-letter/${documentId}/rename`
          : type === 'cv'
            ? `/students/cv/${documentId}/rename`
            : `/students/cl/${documentId}/rename`;

      await apiInstance.patch(endpoint, { title: newTitle });

      if (docState === 'saved') {
        type === 'cv'
          ? dispatch(savedStudentResumeRequest())
          : dispatch(savedStudentCoverLetterRequest());
      } else {
        refreshGeneratedDocs(type);
      }
    } catch (error) {
      console.error('Rename failed:', error);
      throw error;
    }
  };

  return (
    <div className="mb-10">
      {/* Controls Row */}
      <div className="mb-6 flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div className="flex items-center gap-4 sm:gap-6">
          <h2 className="text-[20px] font-extrabold tracking-tight text-slate-900">
            {title}
          </h2>

          {type !== 'application' && (
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-inner">
              <button
                onClick={() => {
                  setDocState('generated');
                  const params = new URLSearchParams(window.location.search);
                  params.delete('q');
                  window.history.replaceState(
                    null,
                    '',
                    `?${params.toString()}`,
                  );
                }}
                className={`flex items-center gap-2 rounded-[10px] px-5 py-1.5 text-[13px] font-bold transition-all ${
                  docState === 'generated'
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Generated
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] ${docState === 'generated' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}
                >
                  {countsForType?.generated || 0}
                </span>
              </button>

              <button
                onClick={() => {
                  setDocState('saved');
                  const params = new URLSearchParams(window.location.search);
                  params.set('q', 'saved');
                  window.history.replaceState(
                    null,
                    '',
                    `?${params.toString()}`,
                  );
                }}
                className={`flex items-center gap-2 rounded-[10px] px-5 py-1.5 text-[13px] font-bold transition-all ${
                  docState === 'saved'
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Saved
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] ${docState === 'saved' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}
                >
                  {countsForType?.saved || 0}
                </span>
              </button>
            </div>
          )}
        </div>

        <div className="relative w-full md:w-72">
          <Search
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            strokeWidth={2.5}
          />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-[13.5px] font-medium text-slate-800 shadow-sm transition-all placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-50"
          />
          {searchTerm && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              onClick={() => {
                setSearchTerm('');
                setFinalSearchTerm('');
              }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Lists */}
      {listToRender?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 px-6 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400">
            <FileText className="h-6 w-6" strokeWidth={2} />
          </div>
          <h3 className="mb-2 text-xl font-extrabold tracking-tight text-slate-900">
            No{' '}
            {type === 'cv'
              ? 'CVs'
              : type === 'coverLetter'
                ? 'Cover Letters'
                : 'Applications'}{' '}
            Found
          </h3>
          <p className="text-sm font-medium text-slate-500">
            {type === 'cv'
              ? 'Generate your first CV to get started.'
              : type === 'coverLetter'
                ? 'Create your first cover letter to see it here.'
                : 'Create your first tailored application to see it here.'}
          </p>
        </div>
      ) : filteredItems?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 px-6 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400">
            <Search className="h-6 w-6" strokeWidth={2} />
          </div>
          <h3 className="mb-2 text-xl font-extrabold tracking-tight text-slate-900">
            No Results Found
          </h3>
          <p className="text-sm font-medium text-slate-500">
            Your search for "{searchTerm}" did not match any documents.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {(type === 'application'
            ? filteredItems
            : filteredItems.slice(0, visibleCount)
          ).map((item: any, index: number) => (
            <DocumentCard
              key={item._id || item.id}
              index={index + 1}
              item={item}
              type={type}
              onDelete={onDelete}
              onDeleteSaved={onDeleteSaved}
              onRenameSaved={onRenameSaved}
              onRename={handleRenameDocument}
              onCopy={onCopy}
              onDownload={onDownload}
              copiedId={copiedId}
              formatDate={formatDate}
              docState={docState}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {type === 'application' && hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="rounded-xl bg-white border border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50"
          >
            {isLoadingMore ? 'Loading...' : 'See More'}
          </button>
        </div>
      )}

      {type !== 'application' && visibleCount < filteredItems?.length && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setVisibleCount(visibleCount + 10)}
            className="rounded-xl bg-white border border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-blue-600"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

/* =========================================
   MAIN COMPONENT
   ========================================= */
export default function DocumentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const initialTab =
    (searchParams.get('tab') as 'cvs' | 'cover-letters' | 'applications') ||
    'cvs';
  const [activeTab, setActiveTab] = useState<
    'cvs' | 'cover-letters' | 'applications'
  >(initialTab);

  const [cvs, setCvs] = useState<CV[]>([]);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [applications, setApplications] = useState<TailoredApplication[]>([]);
  const [applicationsPage, setApplicationsPage] = useState(1);
  const [applicationsPagination, setApplicationsPagination] =
    useState<ApplicationPagination | null>(null);
  const [isLoadingMoreApplications, setIsLoadingMoreApplications] =
    useState(false);

  const dispatch = useDispatch();
  const { documentCounts, generatedCVs, generatedCLs } = useSelector(
    (state: RootState) => state.ai,
  );

  useEffect(() => {
    dispatch(getDocumentCountsRequest());
  }, [dispatch]);

  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Rename functionality states
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<{
    id: string;
    type: 'cv' | 'coverLetter';
    currentTitle: string;
  } | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('tab', activeTab);
    params.delete('page');
    router.replace(`${window.location.pathname}?${params.toString()}`);
  }, [activeTab, router]);

  useEffect(() => {
    const fetchTabData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === 'cvs') {
          await fetchCVs();
        } else if (activeTab === 'cover-letters') {
          await fetchCoverLetters();
        } else if (activeTab === 'applications') {
          setApplicationsPage(1);
          await fetchApplications(1, false);
        }
      } catch (error) {
        console.error('Failed to fetch tab data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTabData();
  }, [activeTab]);

  useEffect(() => {
    if (generatedCVs) setCvs(generatedCVs || []);
    if (generatedCLs) setCoverLetters(generatedCLs || []);
  }, [generatedCVs, generatedCLs]);

  const fetchCVs = async () => dispatch(fetchGeneratedCVsRequest());
  const fetchCoverLetters = async () => dispatch(fetchGeneratedCLsRequest());

  const fetchApplications = async (page = 1, append = false) => {
    try {
      const response = await fetchTailoredApps({
        page,
        limit: APPLICATIONS_PAGE_SIZE,
      });
      const nextApplications = response.data.tailoredApplications || [];
      setApplications((prev) => {
        if (!append) return nextApplications;
        const merged = [...prev, ...nextApplications];
        return Array.from(
          new Map(merged.map((item) => [item._id, item])).values(),
        );
      });
      setApplicationsPagination(
        response.data.pagination || {
          totalApplications: response.data.tailoredApplications?.length || 0,
          hasNextPage: false,
        },
      );
      setApplicationsPage(page);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      throw error;
    }
  };

  const handleRename = (
    documentId: string,
    type: 'cv' | 'coverLetter',
    currentTitle: string,
  ) => {
    setCurrentDocument({ id: documentId, type, currentTitle });
    setNewTitle(currentTitle);
    setIsRenameDialogOpen(true);
  };

  const confirmRename = async () => {
    if (!currentDocument || !newTitle.trim()) return;
    setIsRenaming(true);
    try {
      const endpoint =
        currentDocument.type === 'cv'
          ? '/students/resume/title/rename'
          : '/students/cover-letter/title/rename';
      const payload =
        currentDocument.type === 'cv'
          ? { cvId: currentDocument.id, newTitle: newTitle.trim() }
          : { coverLetterId: currentDocument.id, newTitle: newTitle.trim() };
      await apiInstance.patch(endpoint, payload);

      if (currentDocument.type === 'cv') {
        setCvs((prev) =>
          prev.map((cv) =>
            cv._id === currentDocument.id
              ? { ...cv, jobContextString: newTitle.trim() }
              : cv,
          ),
        );
      } else {
        setCoverLetters((prev) =>
          prev.map((cl) =>
            cl._id === currentDocument.id
              ? { ...cl, jobContextString: newTitle.trim() }
              : cl,
          ),
        );
      }

      toast({
        title: 'Document Renamed!',
        description: 'Has been renamed successfully.',
      });
      setIsRenameDialogOpen(false);
      setCurrentDocument(null);
      setNewTitle('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Rename Failed',
        description: error.response?.data?.error || 'Failed to rename',
      });
    } finally {
      setIsRenaming(false);
    }
  };

  const deleteCV = async (cvId: string) => {
    try {
      await apiInstance.delete(`/students/cv/${cvId}`);
      toast({ title: 'Success', description: 'CV deleted successfully' });
      fetchCVs();
      dispatch(getDocumentCountsRequest());
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete CV',
      });
    }
  };

  const deleteCoverLetter = async (clId: string) => {
    try {
      await apiInstance.delete(`/students/cl/${clId}`);
      toast({ title: 'Success', description: 'Cover letter deleted' });
      fetchCoverLetters();
      dispatch(getDocumentCountsRequest());
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete cover letter',
      });
    }
  };

  const deleteSavedCV = async (documentId: string) => {
    try {
      await dispatch(deleteSavedResumeRequest({ cvId: documentId }));
      toast({ title: 'Success', description: 'CV deleted successfully' });
      await dispatch(savedStudentResumeRequest());
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete CV',
      });
    }
  };

  const deleteSavedCoverLetter = async (documentId: string) => {
    try {
      await dispatch(deleteSavedCoverLetterRequest({ clId: documentId }));
      toast({ title: 'Success', description: 'Cover letter deleted' });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete cover letter',
      });
    }
  };

  const renameSavedCoverLetter = async (
    documentId: string,
    newTitle: string,
  ) => {
    try {
      await dispatch(
        renameSavedCoverLetterRequest({ clId: documentId, newTitle }) as any,
      );
      toast({ title: 'Success', description: 'Cover letter renamed' });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to rename cover letter',
      });
    }
  };

  const renameSavedCV = async (documentId: string, newTitle: string) => {
    try {
      await dispatch(
        renameSavedResumeRequest({ cvId: documentId, newTitle }) as any,
      );
      toast({
        title: 'Document Renamed',
        description: 'Updated name fetched successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Rename Failed',
        description: 'Could not update the document name.',
      });
      throw error;
    }
  };

  const deleteApplication = async (appId: string) => {
    try {
      await apiInstance.delete(`/students/tailored-applications/${appId}`);
      toast({ title: 'Success', description: 'Application deleted' });
      const loadedPages = Math.max(applicationsPage, 1);
      const refreshLimit = loadedPages * APPLICATIONS_PAGE_SIZE;
      const response = await fetchTailoredApps({
        page: 1,
        limit: refreshLimit,
      });
      setApplications(response.data.tailoredApplications || []);
      setApplicationsPagination({
        totalApplications:
          response.data.pagination?.totalApplications ||
          response.data.tailoredApplications?.length ||
          0,
        hasNextPage:
          response.data.pagination?.hasNextPage ||
          (response.data.tailoredApplications?.length || 0) < refreshLimit,
      });
      dispatch(getDocumentCountsRequest());
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete application',
      });
    }
  };

  const copyToClipboard = async (content: any, id: string) => {
    if (!content) return;
    const textToCopy = content.cv || content.html;
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast({
        title: 'Copied to Clipboard!',
        description: `Content has been copied as plain text.`,
      });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Copy Failed' });
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const downloadAsFile = async (
    content: any,
    title: string,
    documentType?: string,
  ) => {
    if (!content) return;
    setIsLoading(true);
    toast({ title: 'Generating PDF...' });
    const htmlContent = content.cv || content.html;
    try {
      const response = await apiInstance.post(
        '/students/pdf/generate-pdf',
        {
          html: htmlContent,
          title,
          documentType: documentType || 'resume',
          margin: {
            top: '10mm',
            right: '15mm',
            bottom: '15mm',
            left: '15mm',
          },
        },
        { responseType: 'blob' },
      );
      if (response.status !== 200)
        throw new Error('PDF generation failed on the server.');
      const blob = new Blob([response.data], { type: 'application/pdf' });
      downloadFile(blob, `zobsai_${title.replace(/ /g, '_')}.pdf`);
      toast({ title: 'PDF downloaded successfully!' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'PDF Download Failed',
        description: 'An error occurred while generating the PDF.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const refreshGeneratedDocs = (type: 'cv' | 'coverLetter' | 'application') => {
    if (type === 'cv') fetchCVs();
    else if (type === 'coverLetter') fetchCoverLetters();
    else if (type === 'application') fetchApplications();
  };

  const handleLoadMoreApplications = async () => {
    if (!applicationsPagination?.hasNextPage || isLoadingMoreApplications)
      return;
    setIsLoadingMoreApplications(true);
    try {
      await fetchApplications(applicationsPage + 1, true);
    } finally {
      setIsLoadingMoreApplications(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50 font-jakarta text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="mb-8">
            <h1 className="text-[26px] font-black leading-tight tracking-tight text-slate-900">
              My Documents
            </h1>
            <p className="mt-1 text-[14px] font-medium text-slate-500">
              Manage your CVs, Cover Letters, and Applications seamlessly.
            </p>
          </div>

          {/* Stat Tabs */}
          <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            <StatCard
              label="Curriculums Vitae"
              value={documentCounts?.cv?.total}
              icon={FileText}
              isActive={activeTab === 'cvs'}
              onClick={() => setActiveTab('cvs')}
            />
            <StatCard
              label="Cover Letters"
              value={documentCounts?.cl?.total}
              icon={Send}
              isActive={activeTab === 'cover-letters'}
              onClick={() => setActiveTab('cover-letters')}
            />
            <StatCard
              label="Tailored Apps"
              value={documentCounts?.tailored?.total}
              icon={Wand2}
              isActive={activeTab === 'applications'}
              onClick={() => setActiveTab('applications')}
            />
          </div>

          {/* Conditional Sections */}
          <div className="rounded-2xl">
            {isLoading && !isLoadingMoreApplications ? (
              <div className="flex justify-center py-20">
                <Loader
                  imageClassName="w-8 h-8"
                  textClassName="text-sm font-semibold text-slate-500"
                  message="Loading documents..."
                />
              </div>
            ) : (
              <>
                {activeTab === 'cvs' && (
                  <DocumentSection
                    title="CVs"
                    items={cvs}
                    documentCounts={documentCounts}
                    refreshGeneratedDocs={refreshGeneratedDocs}
                    onDelete={deleteCV}
                    onDeleteSaved={deleteSavedCV}
                    onCopy={copyToClipboard}
                    onDownload={downloadAsFile}
                    onRename={handleRename}
                    onRenameSaved={renameSavedCV}
                    copiedId={copiedId}
                    formatDate={formatDate}
                    type="cv"
                  />
                )}

                {activeTab === 'cover-letters' && (
                  <DocumentSection
                    title="Cover Letters"
                    refreshGeneratedDocs={refreshGeneratedDocs}
                    items={coverLetters}
                    documentCounts={documentCounts}
                    onDelete={deleteCoverLetter}
                    onDeleteSaved={deleteSavedCoverLetter}
                    onRename={handleRename}
                    onRenameSaved={renameSavedCoverLetter}
                    onCopy={copyToClipboard}
                    onDownload={downloadAsFile}
                    copiedId={copiedId}
                    formatDate={formatDate}
                    type="coverLetter"
                  />
                )}

                {activeTab === 'applications' && (
                  <DocumentSection
                    title="Tailored Applications"
                    items={applications}
                    documentCounts={documentCounts}
                    onDelete={deleteApplication}
                    onCopy={copyToClipboard}
                    onDownload={downloadAsFile}
                    copiedId={copiedId}
                    formatDate={formatDate}
                    type="application"
                    hasMore={applicationsPagination?.hasNextPage}
                    isLoadingMore={isLoadingMoreApplications}
                    onLoadMore={handleLoadMoreApplications}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Rename Dialog Modal */}
      {isRenameDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Rename {currentDocument?.type === 'cv' ? 'CV' : 'Cover Letter'}
              </h3>
              <button
                onClick={() => {
                  setIsRenameDialogOpen(false);
                  setCurrentDocument(null);
                  setNewTitle('');
                }}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            <p className="mb-5 text-[13px] text-slate-500">
              Enter a new name for your{' '}
              {currentDocument?.type === 'cv' ? 'CV' : 'cover letter'}.
            </p>

            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="mb-6 w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-[14px] font-semibold text-slate-900 shadow-sm transition-all focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50"
              placeholder={`Enter ${currentDocument?.type === 'cv' ? 'CV' : 'cover letter'} name`}
              maxLength={100}
              autoFocus
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsRenameDialogOpen(false);
                  setCurrentDocument(null);
                  setNewTitle('');
                }}
                className="rounded-xl bg-slate-100 px-5 py-2.5 text-[13px] font-bold text-slate-700 transition-colors hover:bg-slate-200"
                disabled={isRenaming}
              >
                Cancel
              </button>
              <button
                onClick={confirmRename}
                disabled={!newTitle.trim() || isRenaming}
                className="flex items-center justify-center rounded-xl bg-blue-600 px-6 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-70"
              >
                {isRenaming ? 'Renaming...' : 'Rename'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Elegant custom scrollbars */
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
