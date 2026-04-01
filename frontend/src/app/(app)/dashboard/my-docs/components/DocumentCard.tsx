// // components/DocumentCard.tsx
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from '@/components/ui/alert-dialog';
// import { Input } from '@/components/ui/input';
// import apiInstance from '@/services/api';
// import {
//   Download,
//   Loader2,
//   Trash2,
//   RefreshCw,
//   Edit3,
//   Eye,
//   Calendar,
//   CheckCircle2,
// } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { useState } from 'react';
// import { useEffect } from 'react';

// export const DocumentCard = ({
//   item,
//   index,
//   type,
//   onDelete,
//   onDeleteSaved,
//   onDownload,
//   onRename,
//   onRenameSaved,
//   getStatusIcon,
//   getStatusColor,
//   formatDate,
//   docState,
// }: any) => {
//   const router = useRouter();
//   const normalizeStatus = (s: string) => (s === 'new' ? 'completed' : s);

//   const [status, setStatus] = useState(normalizeStatus(item.status));

//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [isRenaming, setIsRenaming] = useState(false);
//   const [isSavingRename, setIsSavingRename] = useState(false);

//   const isProcessing = status === 'pending';

//   const isClickable = status === 'completed' || docState === 'saved';
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [isDeleteLoading, setIsDeleteLoading] = useState(false);

//   const getContent = () => {
//     if (docState === 'saved') {
//       return item.html || null;
//     }

//     switch (type) {
//       case 'cv':
//         return item.cvData;
//       case 'coverLetter':
//         return item.clData;
//       case 'application':
//         return {
//           cv: item.tailoredCV,
//           coverLetter: item.tailoredCoverLetter,
//           email: item.applicationEmail,
//         };
//       default:
//         return null;
//     }
//   };

//   const getTitle = () => {
//     if (docState === 'saved') {
//       if (type === 'cv') {
//         return item.htmlCVTitle || item.title || 'Saved CV';
//       }

//       if (type === 'coverLetter') {
//         return item.coverLetterTitle || item.title || 'Saved Cover Letter';
//       }
//     }

//     // ✅ GENERATED DOCS (existing logic)
//     if (type === 'cv') {
//       return item.cvTitle || item.jobContextString || 'Generated CV';
//     }

//     if (type === 'coverLetter') {
//       return item.clTitle || item.jobContextString || 'Generated Cover Letter';
//     }

//     if (type === 'application') {
//       return `${item.jobTitle || 'Job'} - ${item.companyName || ''}`;
//     }

//     return 'Document';
//   };

//   const [renameTitle, setRenameTitle] = useState(item.title || getTitle());

//   const getFilename = () => {
//     const baseName =
//       type === 'cv'
//         ? 'cv'
//         : type === 'coverLetter'
//           ? 'cover-letter'
//           : 'application';
//     return `${baseName}-${item._id}-${
//       new Date(item.createdAt).toISOString().split('T')[0]
//     }.txt`;
//   };

//   const openContent = () => {
//     if (!isClickable) return;

//     const savedQuery = docState === 'saved' ? '?q=saved' : '';

//     if (type === 'application') {
//       router.push(`/dashboard/my-docs/application/${item._id}${savedQuery}`);
//     } else if (type === 'cv') {
//       router.push(`/dashboard/my-docs/cv/${item._id}${savedQuery}`);
//     } else if (type === 'coverLetter') {
//       router.push(`/dashboard/my-docs/cl/${item._id}${savedQuery}`);
//     }
//   };

//   const isSaved = docState === 'saved';

//   const canRefresh = status !== 'completed' && docState !== 'saved';

//   const handleRefresh = async () => {
//     if (isRefreshing || status === 'completed') return;

//     setIsRefreshing(true);

//     try {
//       let endpoint = '';
//       switch (type) {
//         case 'cv':
//           endpoint = `/students/status/cv/${item._id}`;
//           break;
//         case 'coverLetter':
//           endpoint = `/students/status/cl/${item._id}`;
//           break;
//         case 'application':
//           endpoint = `/students/status/tailored/${item._id}`;
//           break;
//         default:
//           console.error('Unknown document type for refresh:', type);
//           setIsRefreshing(false);
//           return;
//       }

//       const response = await apiInstance.get(endpoint);
//       const { data } = response;
//       if (data.document && data.document.status) {
//         setStatus(data.document.status);
//       } else if (data.item && data.item.status) {
//         // Fallback for different response structures
//         setStatus(data.item.status);
//       }
//     } catch (error) {
//       console.error('❌ Error refreshing document:', error);
//     } finally {
//       setIsRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     if (status === 'completed' || status === 'failed' || docState === 'saved') {
//       return; // stop auto refresh
//     }

//     const interval = setInterval(() => {
//       if (!isRefreshing) {
//         handleRefresh();
//       }
//     }, 6000); // 6 seconds

//     return () => clearInterval(interval);
//   }, [status, docState, isRefreshing]);

//   const handleRenameClick = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setRenameTitle(item.title || getTitle());
//     setIsRenaming(true);
//   };

//   const supportsRename = type === 'cv' || type === 'coverLetter';

//   const handleRenameSubmit = async () => {
//     if (!renameTitle.trim()) return;

//     setIsSavingRename(true);
//     try {
//       if (docState === 'generated') {
//         await onRename(item._id, renameTitle.trim());
//       } else {
//         await onRenameSaved(item._id, renameTitle.trim());
//       }
//       setIsRenaming(false); // ✅ close dialog
//     } finally {
//       setIsSavingRename(false);
//     }
//   };

//   return (
//     <div
//       className={`p-5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200 ${
//         isClickable
//           ? 'cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-gray-700/50'
//           : 'cursor-not-allowed opacity-70'
//       } ${isProcessing ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}`}
//     >
//       <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
//         <div className="flex items-center gap-3" onClick={openContent}>
//           <div className="flex items-center gap-2.5">
//             {!isSaved && (
//               <>
//                 {isProcessing || isRefreshing ? (
//                   <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
//                 ) : (
//                   <div className="flex items-center">
//                     {getStatusIcon(status)}
//                   </div>
//                 )}

//                 <span
//                   className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
//                     status,
//                   )}`}
//                 >
//                   {status}
//                 </span>
//               </>
//             )}
//             {isSaved && (
//               <span className="px-3 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">
//                 Saved
//               </span>
//             )}
//           </div>
//         </div>

//         <div className="flex items-center gap-1">
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               handleRefresh();
//             }}
//             disabled={!canRefresh || isRefreshing}
//             className={`p-2 rounded-lg transition-all ${
//               !canRefresh || isRefreshing
//                 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
//                 : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-green-600'
//             }`}
//             title={
//               !canRefresh
//                 ? isSaved
//                   ? 'Saved documents cannot be refreshed'
//                   : 'Completed'
//                 : 'Refresh status'
//             }
//           >
//             <RefreshCw
//               className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
//             />
//           </button>

//           {/* Rename Button - Only show for CV and Cover Letter */}
//           {supportsRename && (
//             <button
//               onClick={handleRenameClick}
//               disabled={isProcessing || isRefreshing}
//               className={`p-2 rounded-lg transition-all ${
//                 isProcessing || isRefreshing
//                   ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
//                   : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-yellow-600'
//               }`}
//               title="Rename"
//             >
//               <Edit3 className="h-4 w-4" />
//             </button>
//           )}
//           {!isSaved && (
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onDownload(getContent(), getFilename());
//               }}
//               disabled={!isClickable}
//               className={`p-2 rounded-lg transition-all ${
//                 isClickable
//                   ? 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-green-600'
//                   : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
//               }`}
//               title={isClickable ? 'Download' : 'Not available'}
//             >
//               <Download className="h-4 w-4" />
//             </button>
//           )}

//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               setIsDeleting(true);
//             }}
//             disabled={isProcessing || isRefreshing}
//             className={`p-2 rounded-lg transition-all ${
//               isProcessing || isRefreshing
//                 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
//                 : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-600'
//             }`}
//             title="Delete"
//           >
//             <Trash2 className="h-4 w-4" />
//           </button>
//         </div>
//       </div>

//       <div onClick={openContent} className="space-y-3">
//         <div className="flex items-start justify-between gap-4">
//           <h3
//             className={`font-semibold text-gray-900 dark:text-white flex-1 ${isClickable ? 'cursor-pointer' : ''}`}
//           >
//             <span className="text-sm text-gray-500 font-normal mr-2">
//               #{index}
//             </span>
//             <span className="text-base">
//               {(item.cvTitle || getTitle()).slice(0, 30)}
//               {(item.cvTitle || getTitle()).length > 40 ? '...' : ''}
//             </span>
//           </h3>

//           <div className="hidden md:flex items-center gap-2">
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 openContent();
//               }}
//               className={`flex-shrink-0 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1.5 ${
//                 isClickable ? '' : 'opacity-50 cursor-not-allowed'
//               }`}
//             >
//               <Eye className="w-3.5 h-3.5" />
//               View
//             </button>
//             {item.flag && (
//               <span className="text-xs rounded-md text-gray-600 bg-gray-100 uppercase px-2.5 py-1.5 dark:text-gray-300 font-medium">
//                 from: {item.flag}
//               </span>
//             )}
//           </div>
//         </div>

//         {!isClickable && status === 'failed' && (
//           <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg">
//             <span className="text-xs font-semibold text-red-600 dark:text-red-400">
//               Failed to generate
//             </span>
//           </div>
//         )}

//         {/* {item.finalTouch && (
//             <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
//               <strong>Customization:</strong> {item.finalTouch}
//             </p>
//           )} */}
//         <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2">
//           <div className="flex items-center gap-1.5">
//             <Calendar className="w-3.5 h-3.5" />
//             <span>Created: {formatDate(item.createdAt)}</span>
//           </div>
//           {item.completedAt && status !== 'pending' && (
//             <div className="flex items-center gap-1.5">
//               <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
//               <span>Completed: {formatDate(item.completedAt)}</span>
//             </div>
//           )}
//         </div>

//         {/* {type === 'application' && status === 'completed' && (
//           <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
//             <div className="flex space-x-4 text-xs">
//               <span className="text-blue-600 dark:text-blue-400">
//                 ✓ CV Generated
//               </span>
//               <span className="text-green-600 dark:text-green-400">
//                 ✓ Cover Letter Generated
//               </span>
//               <span className="text-purple-600 dark:text-purple-400">
//                 ✓ Email Prepared
//               </span>
//             </div>
//           </div>
//         )} */}
//       </div>

//       {/* Corrected AlertDialog for renaming */}
//       <AlertDialog open={isRenaming} onOpenChange={setIsRenaming}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Rename Document</AlertDialogTitle>
//             <AlertDialogDescription>
//               Please enter a new name for the document.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <Input
//             placeholder={`Enter ${
//               type === 'coverLetter' ? 'Cover Letter' : 'CV'
//             } Name`}
//             value={renameTitle}
//             onChange={(e) => setRenameTitle(e.target.value)}
//             className="my-4"
//           />
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>

//             <AlertDialogAction
//               onClick={handleRenameSubmit}
//               disabled={isSavingRename}
//             >
//               {isSavingRename ? (
//                 <Loader2 className="h-4 w-4 animate-spin" />
//               ) : (
//                 'Save'
//               )}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       {/* delete alert dialog */}
//       <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle className="text-red-600">
//               Delete Document?
//             </AlertDialogTitle>
//             <AlertDialogDescription>
//               This action cannot be undone. Are you sure you want to delete{' '}
//               <strong>{getTitle()}</strong>?
//             </AlertDialogDescription>
//           </AlertDialogHeader>

//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={isDeleteLoading}>
//               Cancel
//             </AlertDialogCancel>

//             <AlertDialogAction
//               onClick={async () => {
//                 setIsDeleteLoading(true);
//                 try {
//                   docState === 'generated'
//                     ? await onDelete(item._id)
//                     : await onDeleteSaved(item._id);

//                   setIsDeleting(false);
//                 } finally {
//                   setIsDeleteLoading(false);
//                 }
//               }}
//               className="bg-red-600 hover:bg-red-700"
//               disabled={isDeleteLoading}
//             >
//               {isDeleteLoading ? (
//                 <Loader2 className="h-4 w-4 animate-spin" />
//               ) : (
//                 'Delete'
//               )}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// };

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import apiInstance from '@/services/api';
import {
  Download,
  Loader2,
  Trash2,
  RefreshCw,
  Edit3,
  Eye,
  Calendar,
  CheckCircle2,
  Clock,
  X,
  Send,
  Wand2,
  FileText,
  Copy,
  Bookmark,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export const DocumentCard = ({
  item,
  index,
  type,
  onDelete,
  onDeleteSaved,
  onDownload,
  onRename,
  onRenameSaved,
  onCopy,
  copiedId,
  formatDate,
  docState,
}: any) => {
  const router = useRouter();
  const normalizeStatus = (s: string) => (s === 'new' ? 'completed' : s);

  const [status, setStatus] = useState(
    normalizeStatus(item.status || 'pending'),
  );

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isSavingRename, setIsSavingRename] = useState(false);

  const isSaved = docState === 'saved';
  const isProcessing = !isSaved && status === 'pending';
  const isClickable = status === 'completed' || docState === 'saved';

  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const getContent = () => {
    if (docState === 'saved') {
      return item.html || null;
    }
    switch (type) {
      case 'cv':
        return item.cvData;
      case 'coverLetter':
        return item.clData;
      case 'application':
        return {
          cv: item.tailoredCV,
          coverLetter: item.tailoredCoverLetter,
          email: item.applicationEmail,
        };
      default:
        return null;
    }
  };

  const getTitle = () => {
    if (docState === 'saved') {
      if (type === 'cv') return item.htmlCVTitle || item.title || 'Saved CV';
      if (type === 'coverLetter')
        return item.coverLetterTitle || item.title || 'Saved Cover Letter';
    }
    if (type === 'cv')
      return item.cvTitle || item.jobContextString || 'Generated CV';
    if (type === 'coverLetter')
      return item.clTitle || item.jobContextString || 'Generated Cover Letter';
    if (type === 'application')
      return `${item.jobTitle || 'Job'} - ${item.companyName || ''}`;
    return 'Document';
  };

  const [renameTitle, setRenameTitle] = useState(item.title || getTitle());

  const getFilename = () => {
    const baseName =
      type === 'cv'
        ? 'cv'
        : type === 'coverLetter'
          ? 'cover-letter'
          : 'application';
    return `${baseName}-${item._id}-${new Date(item.createdAt || item.savedAt).toISOString().split('T')[0]}.txt`;
  };

  const openContent = () => {
    if (!isClickable) return;
    const savedQuery = docState === 'saved' ? '?q=saved' : '';
    if (type === 'application') {
      router.push(`/dashboard/my-docs/application/${item._id}${savedQuery}`);
    } else if (type === 'cv') {
      router.push(`/dashboard/my-docs/cv/${item._id}${savedQuery}`);
    } else if (type === 'coverLetter') {
      router.push(`/dashboard/my-docs/cl/${item._id}${savedQuery}`);
    }
  };

  const canRefresh =
    status !== 'completed' && docState !== 'saved' && status !== 'failed';

  const handleRefresh = async () => {
    if (isRefreshing || status === 'completed') return;
    setIsRefreshing(true);
    try {
      let endpoint = '';
      switch (type) {
        case 'cv':
          endpoint = `/students/status/cv/${item._id}`;
          break;
        case 'coverLetter':
          endpoint = `/students/status/cl/${item._id}`;
          break;
        case 'application':
          endpoint = `/students/status/tailored/${item._id}`;
          break;
        default:
          return;
      }
      const response = await apiInstance.get(endpoint);
      const { data } = response;
      if (data.document?.status) setStatus(data.document.status);
      else if (data.item?.status) setStatus(data.item.status);
    } catch (error) {
      console.error('❌ Error refreshing document:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (status === 'completed' || status === 'failed' || docState === 'saved')
      return;
    const interval = setInterval(() => {
      if (!isRefreshing) handleRefresh();
    }, 6000);
    return () => clearInterval(interval);
  }, [status, docState, isRefreshing]);

  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRenameTitle(item.title || getTitle());
    setIsRenaming(true);
  };

  const supportsRename = type === 'cv' || type === 'coverLetter';

  const handleRenameSubmit = async () => {
    if (!renameTitle.trim()) return;
    setIsSavingRename(true);
    try {
      if (docState === 'generated') {
        await onRename(item._id, renameTitle.trim());
      } else {
        await onRenameSaved(item._id, renameTitle.trim());
      }
      setIsRenaming(false);
    } finally {
      setIsSavingRename(false);
    }
  };

  // UI Theme Configuration
  const theme = {
    cv: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      hoverText: 'group-hover:text-blue-600',
      hoverBar: 'group-hover:bg-blue-500',
      icon: FileText,
    },
    coverLetter: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      hoverText: 'group-hover:text-indigo-600',
      hoverBar: 'group-hover:bg-indigo-500',
      icon: Send,
    },
    application: {
      bg: 'bg-teal-50',
      text: 'text-teal-600',
      hoverText: 'group-hover:text-teal-600',
      hoverBar: 'group-hover:bg-teal-500',
      icon: Wand2,
    },
  }[type as 'cv' | 'coverLetter' | 'application'];

  const Icon = theme.icon;

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_24px_rgba(37,99,235,0.08)]">
        {/* Hover Left Border Accent */}
        <div
          className={`absolute bottom-0 left-0 top-0 w-1 bg-transparent transition-colors ${theme.hoverBar}`}
        ></div>

        {/* HEADER: Status Pill & Actions */}
        <div className="mb-5 flex items-center justify-between pl-2">
          {/* Status Pill */}
          <span
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest ${
              isSaved
                ? 'border-purple-200 bg-purple-50 text-purple-700'
                : status === 'completed'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : status === 'pending'
                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                    : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {isSaved ? (
              <Bookmark className="h-3 w-3" strokeWidth={3} />
            ) : status === 'completed' ? (
              <CheckCircle2 className="h-3 w-3" strokeWidth={3} />
            ) : status === 'pending' ? (
              <Clock className="h-3 w-3" strokeWidth={3} />
            ) : (
              <X className="h-3 w-3" strokeWidth={3} />
            )}
            {isSaved ? 'Saved' : status === 'pending' ? 'Draft' : status}
          </span>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 text-slate-300 transition-colors group-hover:text-slate-400">
            {/* Refresh */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRefresh();
              }}
              disabled={!canRefresh || isRefreshing}
              className={`rounded-lg p-1.5 transition-colors ${
                !canRefresh || isRefreshing
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-slate-100 hover:text-blue-600'
              }`}
              title={
                !canRefresh
                  ? isSaved
                    ? 'Saved documents cannot be refreshed'
                    : 'Completed'
                  : 'Refresh status'
              }
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`}
                strokeWidth={2}
              />
            </button>

            {/* Copy (If supported by parent) */}
            {onCopy && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy(getContent(), item._id);
                }}
                className="rounded-lg p-1.5 transition-colors hover:bg-slate-100 hover:text-blue-600"
                title="Copy Content"
              >
                {copiedId === item._id ? (
                  <CheckCircle2
                    className="h-4 w-4 text-green-500"
                    strokeWidth={2}
                  />
                ) : (
                  <Copy className="h-4 w-4" strokeWidth={2} />
                )}
              </button>
            )}

            {/* Rename */}
            {supportsRename && (
              <button
                onClick={handleRenameClick}
                disabled={isProcessing || isRefreshing}
                className={`rounded-lg p-1.5 transition-colors ${
                  isProcessing || isRefreshing
                    ? 'cursor-not-allowed opacity-50'
                    : 'hover:bg-slate-100 hover:text-yellow-600'
                }`}
                title="Rename"
              >
                <Edit3 className="h-4 w-4" strokeWidth={2} />
              </button>
            )}

            {/* Download */}
            {!isSaved && type !== 'application' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(getContent(), getFilename());
                }}
                disabled={!isClickable}
                className={`rounded-lg p-1.5 transition-colors ${
                  isClickable
                    ? 'hover:bg-slate-100 hover:text-green-600'
                    : 'cursor-not-allowed opacity-50'
                }`}
                title="Download PDF"
              >
                <Download className="h-4 w-4" strokeWidth={2} />
              </button>
            )}

            {/* Delete */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleting(true);
              }}
              disabled={isProcessing || isRefreshing}
              className={`rounded-lg p-1.5 transition-colors ${
                isProcessing || isRefreshing
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-red-50 hover:text-red-500'
              }`}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* MIDDLE: Icon, Title & Tags */}
        <div
          className={`mb-5 flex flex-1 items-start gap-3 pl-2 ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}`}
          onClick={openContent}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] ${theme.bg} ${theme.text}`}
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <h3
              className={`mb-1.5 line-clamp-2 text-[14.5px] font-extrabold leading-snug text-slate-900 transition-colors ${theme.hoverText}`}
            >
              {getTitle()}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                #{index}
              </span>
              <span className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                From: {item.flag || item.source || 'WEB'}
              </span>
            </div>
          </div>
        </div>

        {/* FOOTER: Dates & View Button */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 pl-2">
          <div className="flex flex-col gap-1.5">
            {/* <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
              <Calendar className="h-3.5 w-3.5" strokeWidth={2} />
              Created: {formatDate(item.createdAt || item.savedAt)}
            </div> */}
            {item.completedAt && status !== 'pending' && (
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                <CheckCircle2
                  className="h-3.5 w-3.5 text-green-500"
                  strokeWidth={2}
                />
                Completed: {formatDate(item.completedAt)}
              </div>
            )}
            {status === 'failed' && (
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-red-500">
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                Generation Failed
              </div>
            )}
          </div>

          <button
            onClick={openContent}
            disabled={!isClickable}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm ${
              isClickable
                ? 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'
                : 'bg-slate-50 text-slate-400 cursor-not-allowed'
            }`}
          >
            {type === 'application' ? 'View App' : 'View'}
          </button>
        </div>
      </div>

      {/* RENAME DIALOG */}
      <AlertDialog open={isRenaming} onOpenChange={setIsRenaming}>
        <AlertDialogContent className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
          <AlertDialogHeader className="mb-2">
            <AlertDialogTitle className="text-lg font-bold text-slate-900">
              Rename {type === 'cv' ? 'CV' : 'Cover Letter'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-slate-500">
              Enter a new name to identify this document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            placeholder={`Enter ${type === 'coverLetter' ? 'Cover Letter' : 'CV'} Name`}
            value={renameTitle}
            onChange={(e) => setRenameTitle(e.target.value)}
            className="my-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] font-semibold text-slate-900 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
            autoFocus
          />
          <AlertDialogFooter className="mt-4 gap-3 sm:justify-end">
            <AlertDialogCancel className="mt-0 rounded-xl border-none bg-slate-100 px-5 py-2.5 text-[13px] font-bold text-slate-700 hover:bg-slate-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleRenameSubmit();
              }}
              disabled={isSavingRename || !renameTitle.trim()}
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-70"
            >
              {isSavingRename ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Save'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DELETE DIALOG */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
          <AlertDialogHeader className="mb-2">
            <AlertDialogTitle className="text-lg font-bold text-red-600">
              Delete Document?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-slate-500">
              This action cannot be undone. Are you sure you want to delete{' '}
              <strong className="text-slate-800">{getTitle()}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-3 sm:justify-end">
            <AlertDialogCancel
              disabled={isDeleteLoading}
              className="mt-0 rounded-xl border-none bg-slate-100 px-5 py-2.5 text-[13px] font-bold text-slate-700 hover:bg-slate-200"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault();
                setIsDeleteLoading(true);
                try {
                  docState === 'generated'
                    ? await onDelete(item._id)
                    : await onDeleteSaved(item._id);
                  setIsDeleting(false);
                } finally {
                  setIsDeleteLoading(false);
                }
              }}
              className="rounded-xl bg-red-600 px-6 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-70"
              disabled={isDeleteLoading}
            >
              {isDeleteLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
