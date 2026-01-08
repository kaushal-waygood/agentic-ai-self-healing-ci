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
import { Download, Loader2, Trash2, RefreshCw, Edit3, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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

  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRenameTitle(item.title || getTitle());
    setIsRenaming(true);
  };

  const supportsRename = type === 'cv' || type === 'coverLetter';

  return (
    <div
      className={`p-4 border  border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition-shadow ${
        isClickable
          ? 'cursor-pointer hover:shadow-md'
          : 'cursor-not-allowed opacity-70'
      } ${isProcessing ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}`}
    >
      <div className="flex items-center flex-wrap justify-between mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3" onClick={openContent}>
          <div className="flex items-center gap-3">
            {!isSaved && (
              <>
                {isProcessing || isRefreshing ? (
                  <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                ) : (
                  getStatusIcon(status)
                )}

                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(
                    status,
                  )}`}
                >
                  {status}
                </span>
              </>
            )}

            {isSaved && (
              <span className="text-xs text-gray-500">Saved document</span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2 ">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            disabled={!canRefresh || isRefreshing}
            className={`p-2 transition-colors ${
              !canRefresh || isRefreshing
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-500 hover:text-green-600'
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
              className={`p-2 transition-colors ${
                isProcessing || isRefreshing
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-500 hover:text-yellow-600'
              }`}
              title="Rename"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload(getContent(), getFilename());
            }}
            disabled={!isClickable}
            className={`p-2 transition-colors ${
              isClickable
                ? 'text-gray-500 hover:text-green-600'
                : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
            }`}
            title={isClickable ? 'Download' : 'Not available'}
          >
            <Download className="h-4 w-4" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              docState === 'generated'
                ? onDelete(item._id)
                : onDeleteSaved(item._id);
            }}
            disabled={isProcessing || isRefreshing}
            className={`p-2 transition-colors ${
              isProcessing || isRefreshing
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-500 hover:text-red-600'
            }`}
            title={
              isProcessing || isRefreshing
                ? 'Cannot delete while processing'
                : 'Delete'
            }
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div onClick={openContent}>
        <div className="flex flex-col gap-2 flex-wrap  ">
          <h3
            className={`flex items-center justify-between font-semibold text-gray-900 dark:text-white  line-clamp-1 ${
              isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
            }`}
          >
            <span className="break-all line-clamp-1">
              <span className="text-xs md:text-sm text-gray-500   ">
                {index}
                {'. '}
              </span>
              {(item.cvTitle || getTitle()).slice(0, 30) +
                ((item.cvTitle || getTitle()).length > 40 ? '...' : '')}
            </span>

            <div className="hidden md:flex  items-end flex-col">
              {/* <button
                onClick={(e) => {
                  e.stopPropagation();
                  openContent();
                }}
                className={`ml-3 px-3 py-1 border border-blue-600 text-blue-600 text-xs rounded hover:bg-blue-600 hover:text-white transition flex items-center gap-1 ${
                  isClickable
                    ? 'cursor-pointer'
                    : 'cursor-not-allowed opacity-50'
                } `}
              >
                <Eye className="w-3.5 h-3.5" />
                View Doc
              </button> */}
              {item.flag && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 mt-1">
                  from: {item.flag}
                </p>
              )}
            </div>

            {!isClickable && status === 'failed' && (
              <span className="text-xs text-gray-400 ml-2">
                (Failed to generate)
              </span>
            )}
          </h3>

          {/* {item.finalTouch && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              <strong>Customization:</strong> {item.finalTouch}
            </p>
          )} */}

          {item.error && status === 'failed' && (
            <p
              className="text-sm text-red-600 dark:text-red-400 mb-2
    break-words break-all
    whitespace-normal
    max-w-full"
            >
              <strong>Error:</strong> {item.error}
            </p>
          )}
        </div>

        <div className="flex items-center flex-wrap justify-between text-xs text-gray-500 dark:text-gray-400 mt-3">
          <span>Created: {formatDate(item.createdAt)}</span>
          {item.completedAt && status !== 'pending' && (
            <span>Completed: {formatDate(item.completedAt)}</span>
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
              // onClick={
              //   docState === 'generated'
              //     ? handleRenameSubmit
              //     : onRenameSaved(item._id, renameTitle)
              // }
              onClick={(e) => {
                e.stopPropagation();
                docState === 'generated'
                  ? onRename(item._id, renameTitle)
                  : onRenameSaved(item._id, renameTitle);
              }}
              // onClick={handleRenameSubmit}
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
    </div>
  );
};
