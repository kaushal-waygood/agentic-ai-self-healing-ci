import {
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  MapPin,
  Search,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const DATE_LABELS: Record<string, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  lastWeek: 'Last 7 days',
  older: 'Older',
};

interface Job {
  _id?: string;
  id?: string;
  title?: string;
  company?: string;
  location?: { city?: string; state?: string; country?: string };
  country?: string;
  remote?: boolean;
  jobPosted?: string;
  jobPostedAt?: string;
  foundAt?: string;
  tailoredGenerated?: boolean;
  tailoredStatus?: string;
  tailoredViewUrl?: string;
}

interface JobsByDate {
  today: Job[];
  yesterday: Job[];
  lastWeek: Job[];
  older: Job[];
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface GetJobsViaAgentsProps {
  jobs: Job[];
  jobsByDate: JobsByDate;
  loading: boolean;
  error: string | null;
  generatingJobIds: Set<string>;
  findingJobs: boolean;
  pagination?: PaginationState;
  onFindAnotherJob: (jobId: string) => void;
  onGenerateDocs: (jobId: string) => void;
  onPageChange?: (page: number) => void;
  className?: string;
}

const GetJobsViaAgents = ({
  jobs,
  jobsByDate,
  loading,
  error,
  generatingJobIds,
  findingJobs,
  pagination,
  onFindAnotherJob,
  onGenerateDocs,
  onPageChange,
  className = '',
}: GetJobsViaAgentsProps) => {
  const router = useRouter();

  const formatLocation = (job: Job) => {
    const city = job?.location?.city?.trim();
    const state = job?.location?.state?.trim();
    const country = (job?.country || job?.location?.country)?.trim();
    const parts: string[] = [];
    if (city) parts.push(city);
    if (state && state !== city) parts.push(state);
    if (country && parts.length === 0) parts.push(country);
    if (parts.length > 0) return parts.join(', ');
    if (job?.remote) return 'Remote';
    return 'Location N/A';
  };

  const formatPostedDate = (job: Job) => {
    if (job?.jobPosted) return job.jobPosted;
    if (job?.jobPostedAt) {
      const d = new Date(job.jobPostedAt);
      if (!Number.isNaN(d.getTime()))
        return d.toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
    }
    return 'Date not available';
  };

  const formatFoundDate = (job: Job) => {
    if (!job?.foundAt) return 'Found date not available';
    const d = new Date(job.foundAt);
    if (Number.isNaN(d.getTime())) return 'Found date not available';
    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div
      className={`flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-purple-100/60 bg-gradient-to-b from-purple-50/30 to-white shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-100/60 px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-violet-500 to-purple-400" />
          <h3 className="text-sm font-bold text-gray-700">Matched Jobs</h3>
          {jobs.length > 0 && (
            <span className="text-[11px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
              {jobs.length}
            </span>
          )}
        </div>
        <button
          onClick={() => router.push('/dashboard/my-docs?tab=applications')}
          className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors border border-purple-100"
        >
          <ExternalLink className="w-3 h-3" />
          My Docs
        </button>
      </div>

      {/* States */}
      <div className="flex min-h-0 flex-1 flex-col px-4 py-4">
        {loading ? (
          <div className="flex min-h-[280px] flex-1 items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
            <span className="text-sm">Finding matched jobs…</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-4 text-red-500">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex min-h-[280px] flex-1 flex-col items-center justify-center text-gray-400">
            <Search className="w-8 h-8 mb-2 text-gray-200" />
            <p className="text-sm font-medium">No matching jobs found</p>
            <p className="text-xs mt-1">
              The agent is actively searching for matches
            </p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scroll">
              {(['today', 'yesterday', 'lastWeek', 'older'] as const).map(
                (key) => {
                  const list = jobsByDate[key] ?? [];
                  if (list.length === 0) return null;
                  return (
                    <div key={key}>
                      <div className="mb-2 flex items-center gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          {DATE_LABELS[key]}
                        </p>
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-400">
                          {list.length}
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {list.map((job) => {
                          const jobId = (job._id || job.id) as string;
                          const isGenerating = generatingJobIds.has(jobId);
                          const isTailoredReady = !!job.tailoredGenerated;
                          const isTailoring =
                            !isTailoredReady &&
                            (job.tailoredStatus === 'pending' || isGenerating);

                          return (
                            <li
                              key={jobId}
                              className="group/job flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3 transition-all hover:border-purple-200 hover:shadow-sm"
                            >
                              {/* Icon */}
                              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gradient-to-br from-gray-100 to-gray-50">
                                <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                              </div>

                              {/* Job info */}
                              <Link
                                href={`/dashboard/jobs/${jobId}`}
                                className="min-w-0 flex-1 block"
                              >
                                <p className="truncate text-sm font-semibold text-gray-800 transition-colors group-hover/job:text-purple-700">
                                  {job.title}
                                </p>
                                <div className="mt-0.5 flex flex-wrap items-center gap-3">
                                  <span className="flex items-center gap-1 text-xs text-gray-400">
                                    <Building2 className="h-3 w-3" />
                                    <span className="truncate max-w-[120px]">
                                      {job.company}
                                    </span>
                                  </span>
                                  <span className="flex items-center gap-1 text-xs text-gray-400">
                                    <MapPin className="h-3 w-3" />
                                    {formatLocation(job)}
                                  </span>
                                  <span className="flex items-center gap-1 text-xs text-gray-400">
                                    <Clock className="h-3 w-3" />
                                    {formatPostedDate(job)}
                                  </span>
                                  <span className="text-xs text-gray-300">|</span>
                                  <span className="flex items-center gap-1 text-xs text-gray-400">
                                    <span className="font-medium text-gray-500">
                                      Found:
                                    </span>
                                    {formatFoundDate(job)}
                                  </span>
                                </div>
                              </Link>

                              {/* Actions */}
                              <div
                                className="flex shrink-0 items-center gap-2"
                                onClick={(e) => e.preventDefault()}
                              >
                                {/* Status badge */}
                                {isTailoredReady ? (
                                  <span className="flex items-center gap-1 rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-600">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Tailored ready
                                  </span>
                                ) : isTailoring ? (
                                  <span className="flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-600">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Generating
                                  </span>
                                ) : (
                                  <span className="rounded-lg border border-amber-100 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-600">
                                    Not tailored
                                  </span>
                                )}

                                {/* Find other */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onFindAnotherJob(jobId);
                                  }}
                                  disabled={findingJobs || loading}
                                  className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-[11px] font-semibold text-gray-600 transition-all hover:bg-gray-100 disabled:opacity-50"
                                >
                                  {findingJobs ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Search className="h-3 w-3" />
                                  )}
                                  Find other
                                </button>

                                {/* View / Generate */}
                                {isTailoredReady && job.tailoredViewUrl ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(job.tailoredViewUrl!);
                                    }}
                                    className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-emerald-200 transition-all hover:bg-emerald-700"
                                  >
                                    <FileText className="h-3 w-3" /> View docs
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onGenerateDocs(jobId);
                                    }}
                                    disabled={isTailoring}
                                    className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-purple-200 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {isTailoring ? (
                                      <>
                                        <Loader2 className="h-3 w-3 animate-spin" />{' '}
                                        Generating…
                                      </>
                                    ) : (
                                      <>
                                        <FileText className="h-3 w-3" /> Generate
                                        Tailored
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                },
              )}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-4 flex flex-col gap-3 border-t border-purple-100/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-medium text-gray-500">
                  Showing{' '}
                  {pagination.total === 0
                    ? 0
                    : (pagination.page - 1) * pagination.limit + 1}
                  -
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total,
                  )}{' '}
                  of {pagination.total}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onPageChange?.(1)}
                    disabled={!pagination.hasPrevPage}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    First
                  </button>
                  <button
                    type="button"
                    onClick={() => onPageChange?.(pagination.page - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => onPageChange?.(pagination.page + 1)}
                    disabled={!pagination.hasNextPage}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                  <button
                    type="button"
                    onClick={() => onPageChange?.(pagination.totalPages)}
                    disabled={!pagination.hasNextPage}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GetJobsViaAgents;
