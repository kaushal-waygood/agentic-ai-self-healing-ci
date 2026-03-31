'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import {
  ArrowLeft,
  Bot,
  BriefcaseBusiness,
  Files,
  RefreshCcw,
  Sparkles,
} from 'lucide-react';

import GetJobsViaAgents from '@/components/mutiform/GetJobsViaAgents';
import { Button } from '@/components/ui/button';
import { ToastAction } from '@/components/ui/toast';
import { toast } from '@/hooks/use-toast';
import {
  getAgentJobs,
  getSingleAutopilot,
  replaceAgentJob,
  startAgentJobTailoredGeneration,
} from '@/services/api/autopilot';

const PAGE_LIMIT = 30;

type Job = {
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
  tailoredApplicationId?: string;
};

type JobsByDate = {
  today: Job[];
  yesterday: Job[];
  lastWeek: Job[];
  older: Job[];
};

type PaginationState = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

type JobsPayload = {
  jobs?: Job[];
  byDate?: JobsByDate;
  pagination?: PaginationState | null;
};

const emptyByDate: JobsByDate = {
  today: [],
  yesterday: [],
  lastWeek: [],
  older: [],
};

const emptyPagination: PaginationState = {
  page: 1,
  limit: PAGE_LIMIT,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

const Page = () => {
  const params = useParams<{ id?: string | string[] }>();
  const agentId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = useMemo(() => {
    const raw = Number(searchParams.get('page') || '1');
    return Number.isFinite(raw) && raw > 0 ? raw : 1;
  }, [searchParams]);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsByDate, setJobsByDate] = useState<JobsByDate>(emptyByDate);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [agentName, setAgentName] = useState<string>('');
  const [generatingJobIds, setGeneratingJobIds] = useState<Set<string>>(
    new Set(),
  );
  const [findingJobs, setFindingJobs] = useState(false);
  const [pagination, setPagination] =
    useState<PaginationState>(emptyPagination);

  const tailoredReadyCount = useMemo(
    () => jobs.filter((job) => job.tailoredGenerated).length,
    [jobs],
  );

  const showingRange = useMemo(() => {
    if (pagination.total === 0) {
      return { from: 0, to: 0 };
    }

    const from = (pagination.page - 1) * pagination.limit + 1;
    const to = Math.min(pagination.page * pagination.limit, pagination.total);

    return { from, to };
  }, [pagination]);

  const normalizeJobsPayload = (
    data: JobsPayload = {},
    metaPagination: PaginationState | null = null,
  ) => {
    const list = data?.jobs ?? [];
    let byDate = data?.byDate ?? emptyByDate;
    if (
      list.length > 0 &&
      !byDate.today?.length &&
      !byDate.yesterday?.length &&
      !byDate.lastWeek?.length &&
      !byDate.older?.length
    ) {
      byDate = { today: list, yesterday: [], lastWeek: [], older: [] };
    }
    return {
      list,
      byDate,
      pagination: data?.pagination ?? metaPagination,
    };
  };

  const fetchJobs = () => {
    if (!agentId) return;
    setJobsLoading(true);
    setJobsError(null);

    getAgentJobs(agentId, { page: currentPage, limit: PAGE_LIMIT })
      .then((res) => {
        const {
          list,
          byDate,
          pagination: nextPagination,
        } = normalizeJobsPayload(
          res?.data?.data ?? {},
          res?.data?.meta?.pagination ?? null,
        );
        setJobs(list);
        setJobsByDate(byDate);
        if (nextPagination) {
          setPagination(nextPagination);
        } else {
          setPagination((prev) => ({
            ...prev,
            page: currentPage,
            limit: PAGE_LIMIT,
          }));
        }
      })
      .catch((err) => {
        setJobsError(err?.response?.data?.message || 'Failed to load jobs');
        setJobs([]);
        setJobsByDate(emptyByDate);
      })
      .finally(() => setJobsLoading(false));
  };

  useEffect(() => {
    if (agentId) fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId, currentPage]);

  useEffect(() => {
    if (!agentId) return;

    getSingleAutopilot(agentId)
      .then((res) => {
        const agent = res?.data?.data?.autoPilot;
        setAgentName(agent?.agentName || agent?.jobTitle || '');
      })
      .catch(() => {
        setAgentName('');
      });
  }, [agentId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const updateJobCollections = (jobId: string, updater: (job: Job) => Job) => {
    const matchId = (job: Job) => (job._id || job.id) === jobId;
    setJobs((prev) => prev.map((job) => (matchId(job) ? updater(job) : job)));
    setJobsByDate((prev) => {
      const next: JobsByDate = {
        today: [],
        yesterday: [],
        lastWeek: [],
        older: [],
      };
      for (const [key, list] of Object.entries(prev)) {
        next[key as keyof JobsByDate] = list.map((job) =>
          matchId(job) ? updater(job) : job,
        );
      }
      return next;
    });
  };

  const handleFindAnotherJob = (jobId: string) => {
    if (!agentId || !jobId) return;
    setFindingJobs(true);
    toast({ title: 'Finding a better match…' });

    replaceAgentJob(agentId, jobId, {
      page: currentPage,
      limit: PAGE_LIMIT,
    })
      .then((res) => {
        const data = res?.data?.data ?? {};
        const {
          list,
          byDate,
          pagination: nextPagination,
        } = normalizeJobsPayload(data, res?.data?.meta?.pagination ?? null);
        setJobs(list);
        setJobsByDate(byDate);
        if (nextPagination) {
          setPagination(nextPagination);
        }
        toast({
          title: data.replacementFound ? 'Replacement found' : 'Job removed',
        });
      })
      .catch((err) => {
        toast({
          variant: 'destructive',
          title: 'Failed to replace job',
          description: err?.response?.data?.message,
        });
      })
      .finally(() => setFindingJobs(false));
  };

  const handleGenerateDocs = async (jobId: string) => {
    if (!agentId || !jobId) return;
    setGeneratingJobIds((prev) => {
      const next = new Set(prev);
      next.add(jobId);
      return next;
    });

    try {
      const response = await startAgentJobTailoredGeneration(agentId, jobId);
      const data = response?.data?.data ?? {};

      updateJobCollections(jobId, (job) => ({
        ...job,
        tailoredStatus: data.tailoredStatus || 'pending',
        tailoredGenerated: !!data.tailoredGenerated,
        tailoredApplicationId: data.applicationId || job.tailoredApplicationId,
        tailoredViewUrl: data.tailoredViewUrl || job.tailoredViewUrl,
      }));

      toast({
        title: data.tailoredGenerated
          ? 'Tailored docs ready'
          : 'Tailored docs generation started',
        description: data.tailoredGenerated
          ? 'Opening your generated documents.'
          : 'You will be notified when ready.',
        action: (
          <ToastAction
            altText="View in My Docs"
            onClick={() =>
              router.push(
                data.tailoredViewUrl || '/dashboard/my-docs?tab=applications',
              )
            }
          >
            View docs
          </ToastAction>
        ),
      });

      if (data.tailoredGenerated && data.tailoredViewUrl) {
        router.push(data.tailoredViewUrl);
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          err?.response?.data?.message || 'Failed to start generation',
      });
    } finally {
      setGeneratingJobIds((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    }
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || Number.isNaN(nextPage)) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(nextPage));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleRefresh = () => {
    fetchJobs();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.12),_transparent_24%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_45%,_#f8fafc_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-6">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-blue-100/70 via-cyan-50/20 to-violet-100/70" />
          <div className="absolute -right-16 top-10 h-40 w-40 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute -left-16 bottom-0 h-36 w-36 rounded-full bg-violet-200/30 blur-3xl" />

          <div className="relative flex flex-col gap-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-700 shadow-sm">
                  <Bot className="h-3.5 w-3.5" />
                  Agent Job Inbox
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-4xl">
                  {agentName || 'Agent jobs'}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 md:text-[15px]">
                  Review stronger matches, swap weaker ones, and generate
                  tailored applications without leaving this workspace.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="h-11 rounded-xl border-slate-200 bg-white/80 px-4 shadow-sm"
                >
                  <Link href="/dashboard/ai-auto-apply">
                    <ArrowLeft className="h-4 w-4" />
                    Back to setup
                  </Link>
                </Button>
                <Button
                  variant="default"
                  onClick={handleRefresh}
                  disabled={jobsLoading}
                  className="h-11 rounded-xl bg-slate-900 px-4 text-white shadow-sm hover:bg-slate-800"
                >
                  <RefreshCcw
                    className={jobsLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'}
                  />
                  Refresh jobs
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  <BriefcaseBusiness className="h-3.5 w-3.5 text-blue-500" />
                  Total matches
                </div>
                <div className="mt-3 text-2xl font-black tracking-tight text-slate-900">
                  {pagination.total}
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Jobs currently attached to this agent
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  <Files className="h-3.5 w-3.5 text-violet-500" />
                  Showing now
                </div>
                <div className="mt-3 text-2xl font-black tracking-tight text-slate-900">
                  {showingRange.from}-{showingRange.to}
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Results on page {pagination.page} of {pagination.totalPages || 1}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Tailored ready
                </div>
                <div className="mt-3 text-2xl font-black tracking-tight text-slate-900">
                  {tailoredReadyCount}
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Jobs with generated tailored documents
                </p>
              </div>

              <div className="rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
                  <Bot className="h-3.5 w-3.5" />
                  Page size
                </div>
                <div className="mt-3 text-2xl font-black tracking-tight text-slate-900">
                  {PAGE_LIMIT}
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  Expanded from 15 so you can review more matches per page
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/90 px-4 py-3 text-sm text-slate-600">
              <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-slate-700 shadow-sm">
                {pagination.total} total jobs
              </span>
              <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-slate-700 shadow-sm">
                {PAGE_LIMIT} per page
              </span>
              <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-slate-700 shadow-sm">
                {tailoredReadyCount} ready to view
              </span>
              <span className="text-slate-400">
                Replace weak matches or generate documents directly from the
                list below.
              </span>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1">
          <GetJobsViaAgents
            className="h-full min-h-[680px]"
            jobs={jobs}
            jobsByDate={jobsByDate}
            loading={jobsLoading}
            error={jobsError}
            generatingJobIds={generatingJobIds}
            findingJobs={findingJobs}
            pagination={pagination}
            onPageChange={handlePageChange}
            onFindAnotherJob={handleFindAnotherJob}
            onGenerateDocs={handleGenerateDocs}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
