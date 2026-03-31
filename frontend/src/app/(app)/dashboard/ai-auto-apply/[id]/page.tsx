'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import { ArrowLeft, Bot, RefreshCcw } from 'lucide-react';

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

const PAGE_LIMIT = 15;

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-4 py-6 md:px-6 lg:px-8">
        <div className="rounded-[28px] border border-slate-200 bg-white/90 px-5 py-4 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-700">
                <Bot className="h-3.5 w-3.5" />
                Agent Job Inbox
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                {agentName || 'Agent jobs'}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Page {pagination.page} of {pagination.totalPages || 1}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="border-slate-200">
                <Link href="/dashboard/ai-auto-apply">
                  <ArrowLeft className="h-4 w-4" />
                  Back to setup
                </Link>
              </Button>
              <Button
                variant="default"
                onClick={handleRefresh}
                disabled={jobsLoading}
                className="bg-slate-900 text-white hover:bg-slate-800"
              >
                <RefreshCcw
                  className={jobsLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <GetJobsViaAgents
            className="h-full"
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
