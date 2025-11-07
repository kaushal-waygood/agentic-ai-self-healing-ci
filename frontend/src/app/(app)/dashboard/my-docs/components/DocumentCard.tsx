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
import {
  CheckCircle2,
  Copy,
  Download,
  Loader2,
  Trash2,
  RefreshCw,
  Edit3,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export const DocumentCard = ({
  item,
  type,
  onDelete,
  onCopy,
  onDownload,
  onRename, // Add onRename prop
  copiedId,
  getStatusIcon,
  getStatusColor,
  formatDate,
}: any) => {
  const router = useRouter();
  const [status, setStatus] = useState(item.status);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  // We need a separate loading state for the rename save action
  const [isSavingRename, setIsSavingRename] = useState(false);

  // Determine if we should show processing state
  const isProcessing = status === 'pending';
  const isClickable = status === 'completed';

  const getContent = () => {
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
    switch (type) {
      case 'cv':
        return (
          item.jobContextString?.slice(0, 100) +
            (item.jobContextString?.length > 100 ? '...' : '') || 'Generated CV'
        );
      case 'coverLetter':
        return (
          item.jobContextString?.slice(0, 100) +
            (item.jobContextString?.length > 100 ? '...' : '') ||
          'Generated Cover Letter'
        );
      case 'application':
        return `${item.jobTitle} - ${item.companyName}`;
      default:
        return 'Document';
    }
  };

  // Set default rename title to the displayed title
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

    if (type === 'application') {
      router.push(`/dashboard/my-docs/application/${item._id}`);
    } else if (type === 'cv') {
      router.push(`/dashboard/my-docs/cv/${item._id}`);
    } else if (type === 'coverLetter') {
      router.push(`/dashboard/my-docs/cl/${item._id}`);
    }
  };

  // Handle refresh dynamically based on type
  const handleRefresh = async () => {
    if (isRefreshing || status === 'completed') return;

    console.log('🔄 Manual refresh for:', item._id, 'type:', type);
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

  // Handle rename click
  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    // Reset renameTitle to the current title when opening
    setRenameTitle(item.title || getTitle());
    setIsRenaming(true);
  };

  // Handle the save action from the rename dialog
  const handleRenameSubmit = async () => {
    if (!renameTitle || isSavingRename) return;

    setIsSavingRename(true);
    try {
      // Call the onRename prop passed from the parent component
      await onRename(item._id, renameTitle);
    } catch (error) {
      console.error('Error during rename submission:', error);
      // You could show a toast notification here
    } finally {
      setIsSavingRename(false);
      setIsRenaming(false);
    }
  };

  // Check if this document type supports renaming
  const supportsRename = type === 'cv' || type === 'coverLetter';

  return (
    <div
      className={`p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 transition-shadow ${
        isClickable
          ? 'cursor-pointer hover:shadow-md'
          : 'cursor-not-allowed opacity-70'
      } ${isProcessing ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {isProcessing || isRefreshing ? (
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          ) : (
            getStatusIcon(status)
          )}
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
              status,
            )}`}
          >
            {status === 'pending' ? 'processing' : status}
            {isRefreshing && '...'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {/* Refresh Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            disabled={isRefreshing || status === 'completed'}
            className={`p-2 transition-colors ${
              isRefreshing || status === 'completed'
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-500 hover:text-green-600'
            }`}
            title={
              isRefreshing
                ? 'Refreshing...'
                : status === 'completed'
                ? 'Completed'
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

          {/* Copy Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopy(getContent(), item._id);
            }}
            disabled={!isClickable}
            className={`p-2 transition-colors ${
              isClickable
                ? 'text-gray-500 hover:text-blue-600'
                : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
            }`}
            title={isClickable ? 'Copy to clipboard' : 'Not available'}
          >
            {copiedId === item._id ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>

          {/* Download Button */}
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

          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item._id);
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

      <h3
        className={`font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 ${
          isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
        }`}
        onClick={openContent}
      >
        {item.cvTitle || getTitle()}
        {!isClickable && status === 'failed' && (
          <span className="text-xs text-gray-400 ml-2">
            (Failed to generate)
          </span>
        )}
        {isProcessing && (
          <span className="text-xs text-blue-500 ml-2">(Generating...)</span>
        )}
        {isRefreshing && (
          <span className="text-xs text-green-500 ml-2">(Refreshing...)</span>
        )}
      </h3>

      {item.finalTouch && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          <strong>Customization:</strong> {item.finalTouch}
        </p>
      )}

      {item.error && status === 'failed' && (
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
          <strong>Error:</strong> {item.error}
        </p>
      )}

      {(isProcessing || isRefreshing) && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>{isRefreshing ? 'Refreshing...' : 'Processing...'}</span>
            <span>0%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 animate-pulse"
              style={{ width: `0%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-3">
        <span>Created: {formatDate(item.createdAt)}</span>
        {item.completedAt && status !== 'pending' && (
          <span>Completed: {formatDate(item.completedAt)}</span>
        )}
      </div>

      {type === 'application' && status === 'completed' && (
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
      )}

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
    </div>
  );
};
