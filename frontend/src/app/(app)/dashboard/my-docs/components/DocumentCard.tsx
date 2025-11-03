import { useCVGenerationStatus } from '@/hooks/useCVGenerationStatus';
import {
  CheckCircle2,
  Copy,
  Download,
  Loader2,
  Trash2,
  Bug,
  RefreshCw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export const DocumentCard = ({
  item,
  type,
  onDelete,
  onCopy,
  onDownload,
  copiedId,
  getStatusIcon,
  getStatusColor,
  formatDate,
  onStatusUpdate,
}: any) => {
  const router = useRouter();
  const [localItem, setLocalItem] = useState(item);

  // Determine if we should show processing state
  const isProcessing = localItem.status === 'pending';
  const isClickable = localItem.status === 'completed';

  const getContent = () => {
    switch (type) {
      case 'cv':
        return localItem.cvData;
      case 'coverLetter':
        return localItem.clData;
      case 'application':
        return {
          cv: localItem.tailoredCV,
          coverLetter: localItem.tailoredCoverLetter,
          email: localItem.applicationEmail,
        };
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'cv':
        return (
          localItem.jobContextString?.slice(0, 100) +
            (localItem.jobContextString?.length > 100 ? '...' : '') ||
          'Generated CV'
        );
      case 'coverLetter':
        return (
          localItem.jobContextString?.slice(0, 100) +
            (localItem.jobContextString?.length > 100 ? '...' : '') ||
          'Generated Cover Letter'
        );
      case 'application':
        return `${localItem.jobTitle} - ${localItem.companyName}`;
      default:
        return 'Document';
    }
  };

  const getFilename = () => {
    const baseName =
      type === 'cv'
        ? 'cv'
        : type === 'coverLetter'
        ? 'cover-letter'
        : 'application';
    return `${baseName}-${localItem._id}-${
      new Date(localItem.createdAt).toISOString().split('T')[0]
    }.txt`;
  };

  const openContent = () => {
    if (!isClickable) return;

    if (type === 'application') {
      router.push(`/dashboard/my-docs/application/${localItem._id}`);
    } else if (type === 'cv') {
      router.push(`/dashboard/my-docs/cv/${localItem._id}`);
    } else if (type === 'coverLetter') {
      router.push(`/dashboard/my-docs/cl/${localItem._id}`);
    }
  };

  // Manual refresh function
  const handleManualRefresh = () => {
    console.log('🔄 Manual refresh for:', localItem._id);
    // You can replace this with an API call to refresh the status
    // For now, it just logs the action
  };

  // Show progress bar for pending items
  const renderProgress = () => {
    if (!isProcessing) return null;

    return (
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Processing...</span>
          <span>0%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `0%` }}
          ></div>
        </div>
      </div>
    );
  };

  console.log('🔍 DocumentCard state:', {
    itemId: localItem._id,
    status: localItem.status,
    isProcessing,
    isClickable,
  });

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
          {isProcessing ? (
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          ) : (
            getStatusIcon(localItem.status)
          )}
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
              localItem.status,
            )}`}
          >
            {localItem.status === 'pending' ? 'processing' : localItem.status}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {/* Debug Button */}
          <button
            onClick={() => {
              console.log('🔍 ===== DEBUG INFO =====');
              console.log('Item:', localItem);
              console.log('Type:', type);
              console.log('Status:', localItem.status);
            }}
            className="p-2 text-gray-500 hover:text-yellow-600 transition-colors"
            title="Debug info"
          >
            <Bug className="h-4 w-4" />
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleManualRefresh}
            className="p-2 text-gray-500 hover:text-green-600 transition-colors"
            title="Refresh status"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button
            onClick={() => onCopy(getContent(), localItem._id)}
            disabled={!isClickable}
            className={`p-2 transition-colors ${
              isClickable
                ? 'text-gray-500 hover:text-blue-600'
                : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
            }`}
            title={isClickable ? 'Copy to clipboard' : 'Not available'}
          >
            {copiedId === localItem._id ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => onDownload(getContent(), getFilename())}
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
            onClick={() => onDelete(localItem._id)}
            disabled={isProcessing}
            className={`p-2 transition-colors ${
              isProcessing
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-500 hover:text-red-600'
            }`}
            title={isProcessing ? 'Cannot delete while processing' : 'Delete'}
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
        {getTitle()}
        {!isClickable && localItem.status === 'failed' && (
          <span className="text-xs text-gray-400 ml-2">
            (Failed to generate)
          </span>
        )}
        {isProcessing && (
          <span className="text-xs text-blue-500 ml-2">(Generating...)</span>
        )}
      </h3>

      {localItem.finalTouch && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          <strong>Customization:</strong> {localItem.finalTouch}
        </p>
      )}

      {localItem.error && localItem.status === 'failed' && (
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
          <strong>Error:</strong> {localItem.error}
        </p>
      )}

      {renderProgress()}

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-3">
        <span>Created: {formatDate(localItem.createdAt)}</span>
        {localItem.completedAt && localItem.status !== 'pending' && (
          <span>Completed: {formatDate(localItem.completedAt)}</span>
        )}
      </div>

      {type === 'application' && localItem.status === 'completed' && (
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

      {/* Debug info panel - visible in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-3 pt-3 border-t border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-xs text-gray-500 space-y-1">
            <div>ID: {localItem._id}</div>
            <div>Status: {localItem.status}</div>
            <div>Type: {type}</div>
          </div>
        </div>
      )}
    </div>
  );
};
