// components/DocumentCard.tsx
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
import { Download, Loader2, Trash2, RefreshCw, Edit3, Eye, Calendar, CheckCircle2,} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useEffect } from 'react';

export const DocumentCard = ({
  item,
  index,
  type,
  onDelete,
  onDeleteSaved,
  onDownload,
  onRename,
  onRenameSaved,
  getStatusIcon,
  getStatusColor,
  formatDate,
  docState,
}: any) => {
  const router = useRouter();
  const normalizeStatus = (s: string) => (s === 'new' ? 'completed' : s);

  const [status, setStatus] = useState(normalizeStatus(item.status));

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isSavingRename, setIsSavingRename] = useState(false);

  const isProcessing = status === 'pending';

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
      if (type === 'cv') {
        return item.htmlCVTitle || item.title || 'Saved CV';
      }

      if (type === 'coverLetter') {
        return item.coverLetterTitle || item.title || 'Saved Cover Letter';
      }
    }

    // ✅ GENERATED DOCS (existing logic)
    if (type === 'cv') {
      return item.cvTitle || item.jobContextString || 'Generated CV';
    }

    if (type === 'coverLetter') {
      return item.clTitle || item.jobContextString || 'Generated Cover Letter';
    }

    if (type === 'application') {
      return `${item.jobTitle || 'Job'} - ${item.companyName || ''}`;
    }

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
    return `${baseName}-${item._id}-${
      new Date(item.createdAt).toISOString().split('T')[0]
    }.txt`;
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

  const isSaved = docState === 'saved';

  const canRefresh = status !== 'completed' && docState !== 'saved';

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
          console.error('Unknown document type for refresh:', type);
          setIsRefreshing(false);
          return;
      }

      const response = await apiInstance.get(endpoint);
      const { data } = response;
      if (data.document && data.document.status) {
        setStatus(data.document.status);
      } else if (data.item && data.item.status) {
        // Fallback for different response structures
        setStatus(data.item.status);
      }
    } catch (error) {
      console.error('❌ Error refreshing document:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (status === 'completed' || status === 'failed' || docState === 'saved') {
      return; // stop auto refresh
    }

    const interval = setInterval(() => {
      if (!isRefreshing) {
        handleRefresh();
      }
    }, 7000); // 7 seconds

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
      setIsRenaming(false); // ✅ close dialog
    } finally {
      setIsSavingRename(false);
    }
  };

  return (
    <div
      className={`p-5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200 ${
        isClickable
          ? 'cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-gray-700/50'
          : 'cursor-not-allowed opacity-70'
      } ${isProcessing ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}`}
    >
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3" onClick={openContent}>
          <div className="flex items-center gap-2.5">
            {!isSaved && (
              <>
                {isProcessing || isRefreshing ? (
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                ) : (
                  <div className="flex items-center">
                    {getStatusIcon(status)}
                  </div>
                )}

                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    status,
                  )}`}
                >
                  {status}
                </span>
              </>
            )}
            {isSaved && (
              <span className="px-3 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">
                Saved
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            disabled={!canRefresh || isRefreshing}
            className={`p-2 rounded-lg transition-all ${
              !canRefresh || isRefreshing
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-green-600'
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
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </button>

          {/* Rename Button - Only show for CV and Cover Letter */}
          {supportsRename && (
            <button
              onClick={handleRenameClick}
              disabled={isProcessing || isRefreshing}
              className={`p-2 rounded-lg transition-all ${
                isProcessing || isRefreshing
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-yellow-600'
              }`}
              title="Rename"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          )}
          {!isSaved && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownload(getContent(), getFilename());
              }}
              disabled={!isClickable}
              className={`p-2 rounded-lg transition-all ${
                isClickable
                  ? 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-green-600'
                  : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              }`}
              title={isClickable ? 'Download' : 'Not available'}
            >
              <Download className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleting(true);
            }}
            disabled={isProcessing || isRefreshing}
            className={`p-2 rounded-lg transition-all ${
              isProcessing || isRefreshing
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-600'
            }`}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div onClick={openContent} className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h3
            className={`font-semibold text-gray-900 dark:text-white flex-1 ${isClickable ? 'cursor-pointer' : ''}`}
          >
            <span className="text-sm text-gray-500 font-normal mr-2">
              #{index}
            </span>
            <span className="text-base">
              {(item.cvTitle || getTitle()).slice(0, 30)}
              {(item.cvTitle || getTitle()).length > 40 ? '...' : ''}
            </span>
          </h3>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openContent();
              }}
              className={`flex-shrink-0 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1.5 ${
                isClickable ? '' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              View
            </button>
            {item.flag && (
              <span className="text-xs rounded-md text-gray-600 bg-gray-100 uppercase px-2.5 py-1.5 dark:text-gray-300 font-medium">
                from: {item.flag}
              </span>
            )}
          </div>
        </div>

        {!isClickable && status === 'failed' && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <span className="text-xs font-semibold text-red-600 dark:text-red-400">
              Failed to generate
            </span>
          </div>
        )}

        {/* {item.finalTouch && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              <strong>Customization:</strong> {item.finalTouch}
            </p>
          )} */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Created: {formatDate(item.createdAt)}</span>
          </div>
          {item.completedAt && status !== 'pending' && (
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              <span>Completed: {formatDate(item.completedAt)}</span>
            </div>
          )}
        </div>

        {/* {type === 'application' && status === 'completed' && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-4 text-xs">
              <span className="text-blue-600 dark:text-blue-400">
                ✓ CV Generated
              </span>
              <span className="text-green-600 dark:text-green-400">
                ✓ Cover Letter Generated
              </span>
              <span className="text-purple-600 dark:text-purple-400">
                ✓ Email Prepared
              </span>
            </div>
          </div>
        )} */}
      </div>

      {/* Corrected AlertDialog for renaming */}
      <AlertDialog open={isRenaming} onOpenChange={setIsRenaming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename Document</AlertDialogTitle>
            <AlertDialogDescription>
              Please enter a new name for the document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            placeholder={`Enter ${
              type === 'coverLetter' ? 'Cover Letter' : 'CV'
            } Name`}
            value={renameTitle}
            onChange={(e) => setRenameTitle(e.target.value)}
            className="my-4"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={handleRenameSubmit}
              disabled={isSavingRename}
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

      {/* delete alert dialog */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              Delete Document?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete{' '}
              <strong>{getTitle()}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleteLoading}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={async () => {
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
              className="bg-red-600 hover:bg-red-700"
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
    </div>
  );
};
