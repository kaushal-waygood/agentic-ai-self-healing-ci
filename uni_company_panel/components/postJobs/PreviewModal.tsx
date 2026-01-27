import {
  X,
  MapPin,
  Briefcase,
  Banknote,
  CheckCircle2,
  Globe,
  Calendar,
  FileQuestion,
} from 'lucide-react';
import { Button } from '@/components/ui/button'; // Adjust import based on your UI library

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  data: any; // Using any to match your dynamic payload structure
}

const PreviewModal = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  data,
}: PreviewModalProps) => {
  if (!isOpen || !data) return null;

  // Helper to format currency
  const formatSalary = (salary: any) => {
    if (!salary) return 'Not specified';
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    });
    return `${formatter.format(salary.min)} - ${formatter.format(salary.max)} / ${salary.period.toLowerCase()}`;
  };

  // Helper to format text (e.g., FULL_TIME -> Full Time)
  const formatEnum = (str: string) => {
    return str
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">
        {/* --- 1. HEADER SECTION --- */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                {data.title}
              </h2>
              {data.remote && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                  Remote
                </span>
              )}
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
              {data.company}
            </p>

            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400" />
                {data.remote
                  ? 'Remote'
                  : data.jobAddress ||
                    `${data.location?.city}, ${data.location?.state}`}
              </div>
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-gray-400" />
                {data.jobTypes?.map((t: string) => formatEnum(t)).join(', ')}
                {data.contractLength && (
                  <span>
                    {data.contractLength.value}{' '}
                    {data.contractLength.type.toLowerCase()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-gray-400" />
                {formatSalary(data.salary)}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* --- 2. SCROLLABLE CONTENT --- */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Tags / Skills */}
          {data.tags && data.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.tags.map((tag: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-md border border-blue-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* HTML Description */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-l-4 border-blue-500 pl-3">
              About the Job
            </h3>
            <div
              className="prose prose-sm prose-blue max-w-none text-gray-600 dark:text-gray-300 bg-gray-50 p-4 rounded-lg border border-gray-100"
              dangerouslySetInnerHTML={{ __html: data.description }}
            />
          </div>

          {/* Responsibilities */}
          {data.responsibilities && data.responsibilities.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-l-4 border-blue-500 pl-3">
                Key Responsibilities
              </h3>
              <ul className="space-y-2">
                {data.responsibilities.map((item: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                  >
                    {/* <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" /> */}
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Qualifications */}
          {data.qualifications && data.qualifications.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-l-4 border-blue-500 pl-3">
                Qualifications & Perks
              </h3>
              <ul className="space-y-2">
                {data.qualifications.map((item: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Screening Questions (Admin View) */}
          {data.screeningQuestions && data.screeningQuestions.length > 0 && (
            <div className="pt-6 border-t border-gray-100 mt-6">
              <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
                <FileQuestion className="w-5 h-5 text-purple-600" />
                Applicant Screening Questions
              </h4>
              <div className="grid gap-3">
                {data.screeningQuestions.map((q: any, i: number) => (
                  <div
                    key={i}
                    className="p-3 bg-gray-50 rounded border border-gray-200 flex justify-between items-center text-sm"
                  >
                    <span className="font-medium text-gray-700">
                      "{q.question}"
                    </span>
                    <span className="text-xs uppercase tracking-wide text-gray-500 font-bold bg-white px-2 py-1 rounded border">
                      {q.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata Footer within scroll area */}
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-400 pt-6 border-t border-gray-100">
            <div>
              <span className="font-semibold uppercase">Apply Method:</span>{' '}
              {data.applyMethod?.method}
              {data.applyMethod?.emails?.length > 0 &&
                ` (${data.applyMethod.emails.join(', ')})`}
            </div>
            <div className="text-right">
              <span className="font-semibold uppercase">Resume Required:</span>{' '}
              {data.resumeRequiblue ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        {/* --- 3. FOOTER ACTIONS --- */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 py-2 h-11 border-gray-300 hover:bg-gray-50 text-gray-700"
          >
            Keep Editing
          </Button>

          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-8 h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-600/20"
          >
            {isSubmitting ? 'Publishing...' : 'Confirm & Publish Job'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
