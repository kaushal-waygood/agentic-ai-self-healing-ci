import { FileText } from 'lucide-react';
import { DocumentCard } from './DocumentCard';

export const DocumentSection = ({
  title,
  items,
  onDelete,
  onCopy,
  onDownload,
  copiedId,
  getStatusIcon,
  getStatusColor,
  formatDate,
  type,
  onStatusUpdate,
}: any) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
      {title}
    </h2>

    {items.length === 0 ? (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No{' '}
          {type === 'cv'
            ? 'CVs'
            : type === 'coverLetter'
            ? 'Cover Letters'
            : 'Applications'}{' '}
          Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {type === 'cv'
            ? 'Generate your first CV to get started'
            : type === 'coverLetter'
            ? 'Create your first cover letter to see it here'
            : 'Create your first tailored application to see it here'}
        </p>
      </div>
    ) : (
      <div className="space-y-4">
        {items.map((item: any) => (
          <DocumentCard
            key={item._id}
            item={item}
            type={type}
            onDelete={onDelete}
            onCopy={onCopy}
            onDownload={onDownload}
            copiedId={copiedId}
            getStatusIcon={getStatusIcon}
            getStatusColor={getStatusColor}
            formatDate={formatDate}
            onStatusUpdate={onStatusUpdate}
          />
        ))}
      </div>
    )}
  </div>
);
