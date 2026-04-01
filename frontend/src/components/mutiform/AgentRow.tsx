import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2, Tag, Link } from 'lucide-react';
import apiInstance from '@/services/api';
import {
  getAgentJobs,
  replaceAgentJob,
  startAgentJobTailoredGeneration,
} from '@/services/api/autopilot';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import GetJobsViaAgents from './GetJobsViaAgents';

const AgentRow = ({ agent, onEdit, onDelete, onToggleActive }) => {
  const router = useRouter();
  const id = agent.agentId || agent._id;

  const [expanded, setExpanded] = useState(false);

  const emptyByDate = {
    today: [],
    yesterday: [],
    lastWeek: [],
    older: [],
  };
  const [jobs, setJobs] = useState([]);
  const [jobsByDate, setJobsByDate] = useState(emptyByDate);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState(null);
  const [generatingJobIds, setGeneratingJobIds] = useState(new Set());
  const [findingJobs, setFindingJobs] = useState(false);

  const [togglingActive, setTogglingActive] = useState(false);
  const [isActive, setIsActive] = useState(agent.isAgentActive);

  useEffect(() => {
    setIsActive(agent.isAgentActive);
  }, [agent.isAgentActive]);

  /* ── Helpers ── */
  const normalizeJobsPayload = (data = {}) => {
    const list = data.jobs ?? [];
    let byDate = data.byDate ?? emptyByDate;
    if (
      list.length > 0 &&
      !byDate.today?.length &&
      !byDate.yesterday?.length &&
      !byDate.lastWeek?.length &&
      !byDate.older?.length
    ) {
      byDate = { today: list, yesterday: [], lastWeek: [], older: [] };
    }
    return { list, byDate };
  };

  const updateJobCollections = (jobId, updater) => {
    const matchId = (job) => (job._id || job.id) === jobId;
    setJobs((prev) => prev.map((job) => (matchId(job) ? updater(job) : job)));
    setJobsByDate((prev) => {
      const next = {};
      for (const [key, list] of Object.entries(prev)) {
        next[key] = list.map((job) => (matchId(job) ? updater(job) : job));
      }
      return next;
    });
  };

  /* ── API calls ── */
  const fetchJobs = (userFeedback) => {
    if (!id) return;
    setJobsLoading(true);
    setJobsError(null);
    getAgentJobs(id, 30, userFeedback)
      .then((res) => {
        const { list, byDate } = normalizeJobsPayload(res?.data?.data ?? {});
        setJobs(list);
        setJobsByDate(byDate);
      })
      .catch((err) => {
        setJobsError(err?.response?.data?.message || 'Failed to load jobs');
        setJobs([]);
        setJobsByDate(emptyByDate);
      })
      .finally(() => setJobsLoading(false));
  };

  const handleFindAnotherJob = (jobId) => {
    if (!id || !jobId) return;
    setFindingJobs(true);
    toast({ title: 'Finding a better match…' });
    replaceAgentJob(id, jobId, 30)
      .then((res) => {
        const data = res?.data?.data ?? {};
        const { list, byDate } = normalizeJobsPayload(data);
        setJobs(list);
        setJobsByDate(byDate);
        toast({
          title: data.replacementFound ? 'Replacement found' : 'Job removed',
        });
      })
      .catch((err) => {
        setJobsError(err?.response?.data?.message || 'Failed to load jobs');
        toast({ variant: 'destructive', title: 'Failed to replace job' });
      })
      .finally(() => setFindingJobs(false));
  };

  const handleGenerateDocs = async (jobId) => {
    if (!id || !jobId) return;
    setGeneratingJobIds((prev) => new Set(prev).add(jobId));
    try {
      const response = await startAgentJobTailoredGeneration(id, jobId);
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
    } catch (err) {
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

  const handleToggleActive = async (e) => {
    e.stopPropagation();
    if (togglingActive) return;
    setTogglingActive(true);
    const newState = !isActive;
    setIsActive(newState);
    try {
      await apiInstance.patch(`/pilotagent/agent/active/${id}`, {
        isAgentActive: newState,
      });
      toast({ title: `Agent ${newState ? 'activated' : 'deactivated'}` });
      if (onToggleActive) onToggleActive(id, newState);
    } catch (err) {
      setIsActive(!newState);
      toast({
        variant: 'destructive',
        title: 'Failed to update agent status',
        description: err?.response?.data?.message || 'Please try again',
      });
    } finally {
      setTogglingActive(false);
    }
  };

  useEffect(() => {
    if (!expanded || !id) return;
    fetchJobs();
  }, [expanded, id]);

  useEffect(() => {
    if (!expanded) return;
    const hasPending = jobs.some((job) => job.tailoredStatus === 'pending');
    if (!hasPending) return;
    const timer = setInterval(() => fetchJobs(), 10000);
    return () => clearInterval(timer);
  }, [expanded, jobs, id]);

  const parsedKeywords = (() => {
    try {
      return JSON.parse(agent.keywords?.[0] || '[]');
    } catch {
      return [];
    }
  })();

  const parsedEmploymentTypes = (() => {
    try {
      return JSON.parse(agent.employmentType || '[]');
    } catch {
      return [];
    }
  })();

  const todayCount = agent.applicationsToday ?? 0;
  const dailyMax = agent.maxApplications ?? agent.agentDailyLimit ?? 5;
  const progressPct = Math.min((todayCount / dailyMax) * 100, 100);

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden group ${
        expanded
          ? 'border-purple-200 shadow-md shadow-purple-100/50'
          : 'border-gray-100 hover:border-purple-200 hover:shadow-md hover:shadow-purple-100/50'
      }`}
    >
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 cursor-pointer bg-white hover:bg-purple-50/20 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold text-base shadow-md shadow-purple-200">
              {(agent.agentName && agent.agentName.charAt(0).toUpperCase()) ||
                'A'}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-white transition-colors ${
                isActive ? 'bg-green-400' : 'bg-gray-300'
              }`}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-gray-800">
                {agent.agentName || 'Untitled Agent'}
              </p>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wide ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {isActive ? '● Active' : '○ Inactive'}
              </span>

              <button
                onClick={handleToggleActive}
                disabled={togglingActive}
                title={isActive ? 'Deactivate agent' : 'Activate agent'}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${
                  isActive ? 'bg-green-400' : 'bg-gray-300'
                }`}
              >
                {togglingActive ? (
                  <Loader2
                    className={`w-4 h-4 animate-spin text-white absolute transition-transform duration-300 ${
                      isActive ? 'left-[22px]' : 'left-[4px]'
                    }`}
                  />
                ) : (
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${
                      isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                )}
              </button>
            </div>

            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                {agent.jobTitle || 'General'}
              </span>
              {agent.country && (
                <span className="text-xs text-gray-400">• {agent.country}</span>
              )}

              {agent.isOnsite && (
                <span className="text-[11px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-md font-medium border border-orange-100">
                  Onsite
                </span>
              )}
            </div>

            {parsedEmploymentTypes.length > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
                  Type
                </span>
                {parsedEmploymentTypes.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {parsedKeywords.length > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <Tag className="w-3 h-3 text-gray-300" />
                {parsedKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-[11px] bg-violet-50 text-violet-600 border border-violet-100 px-2 py-0.5 rounded-full font-medium"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          className="flex items-center gap-4 w-full sm:w-auto  pt-3 sm:pt-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onDelete(id)}
            className="p-2 rounded-xl text-gray-300 hover:text-red-500 border-red-100 hover:border-red-200 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
            title="Delete Agent"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <button onClick={() => router.push(`/dashboard/ai-auto-apply/${id}`)}>
          <Link />
        </button>
      </div>

      {expanded && (
        <GetJobsViaAgents
          jobs={jobs}
          jobsByDate={jobsByDate}
          loading={jobsLoading}
          error={jobsError}
          generatingJobIds={generatingJobIds}
          findingJobs={findingJobs}
          onFindAnotherJob={handleFindAnotherJob}
          onGenerateDocs={handleGenerateDocs}
          agentTitle={agent.agentName || agent.agentId}
        />
      )}
    </div>
  );
};

export default AgentRow;
