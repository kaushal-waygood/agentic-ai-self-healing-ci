import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bot,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Building2,
  Loader2,
  FileText,
  ExternalLink,
  Search,
  Zap,
  Target,
  TrendingUp,
  Clock,
  Briefcase,
  Activity,
  CheckCircle2,
  XCircle,
  Tag,
  Check,
} from 'lucide-react';
import apiInstance from '@/services/api';
import {
  getAgentJobs,
  startAgentJobTailoredGeneration,
} from '@/services/api/autopilot';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

const Step0_SimpleIntroSlim = ({
  nextStep = () => {},
  agents = [],
  onEdit = () => {},
  onDelete = () => {},
  deletePopup = { open: false, agentId: null },
  confirmDelete = () => {},
  cancelDelete = () => {},
}) => {
  const [autopilotEnabled, setAutopilotEnabled] = useState(false);

  const getAgentList = () => {
    if (Array.isArray(agents)) return agents;
    if (Array.isArray(agents?.agents)) return agents.agents;
    if (Array.isArray(agents?.autopilot)) return agents.autopilot;
    if (Array.isArray(agents?.autoPilot)) return agents.autoPilot;
    return [];
  };

  const list = getAgentList();
  const planUsage = agents?.planUsage ?? null;

  const totalAgents = list.length;
  const activeAgents = list.filter(
    (a) => a?.status?.toLowerCase() === 'active' || a?.isAgentActive,
  ).length;
  const todayApps = planUsage
    ? Number(planUsage.applicationsToday) || 0
    : list.reduce((s, a) => s + (Number(a.applicationsToday) || 0), 0);
  const totalApplied = planUsage
    ? Number(planUsage.totalApplied) || 0
    : list.reduce((s, a) => s + (Number(a.totalApplications) || 0), 0);
  const dailyLimit = planUsage?.dailyLimit ?? 5;
  const totalLimit = planUsage?.totalLimit ?? '∞';
  const avgSuccess = list.length
    ? Math.round(
        list.reduce((s, a) => s + (Number(a.successRate) || 0), 0) /
          list.length,
      )
    : 0;

  useEffect(() => {
    const fetchAutoPilotStatus = async () => {
      try {
        const response = await apiInstance.get('/students/autopilot/status');
        if (response?.data) {
          setAutopilotEnabled(!!response.data.autopilotStatus);
        }
      } catch (error) {
        console.error('Autopilot status error:', error);
      }
    };
    fetchAutoPilotStatus();
  }, []);

  const onToggleAutoPilot = async () => {
    try {
      const newState = !autopilotEnabled;
      const response = await apiInstance.post('/students/autopilot/toggle', {
        autopilotEnabled: newState,
      });
      setAutopilotEnabled(!!response.data.autopilotStatus);
      toast({ title: `Autopilot ${newState ? 'Enabled' : 'Disabled'}` });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Failed to toggle autopilot' });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-lg bg-header-gradient-primary text-white p-6 shadow-xl shadow-purple-200">
        {/* decorative blobs */}

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                AI Job Agents
              </h1>
              <p className="text-sm text-white/70 mt-0.5">
                Automate your job search with intelligent agents
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Autopilot toggle */}
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2">
              <Zap
                className={`w-4 h-4 transition-colors ${autopilotEnabled ? 'text-green-300' : 'text-white/50'}`}
              />
              <span className="text-sm font-medium text-white/90">
                Autopilot
              </span>
              <button
                onClick={onToggleAutoPilot}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                  autopilotEnabled ? 'bg-green-400' : 'bg-white/25'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                    autopilotEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-purple-700 font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              New Agent
            </button>
          </div>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {deletePopup.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-[340px] border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-1 text-center">
              Delete Agent?
            </h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 font-medium text-gray-700 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 font-medium text-sm transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<Bot className="w-4 h-4" />}
          label="Total Agents"
          value={totalAgents}
          color="violet"
        />
        <StatCard
          icon={<Activity className="w-4 h-4" />}
          label="Active"
          value={activeAgents}
          color="emerald"
        />
        <StatCard
          icon={<Clock className="w-4 h-4" />}
          label="Today"
          value={
            dailyLimit === '∞' || dailyLimit === -1
              ? `${todayApps}`
              : `${todayApps}/${dailyLimit}`
          }
          color="blue"
        />
      </div>

      {/* ── Agents List ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-gray-500" />
            <h2 className="text-gray-800 font-bold text-base">Your Agents</h2>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {list.length === 0 ? (
            <EmptyState nextStep={nextStep} />
          ) : (
            list.map((agent, index) => (
              <AgentRow
                key={agent._id || agent.agentId || index}
                agent={agent}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleActive={(agentId, newState) => {
                  // Optimistically update the parent list if needed
                  // If your parent passes a refresh callback, call it here instead
                  console.log(`Agent ${agentId} toggled to ${newState}`);
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Stat Card ── */
const colorMap = {
  violet: {
    bg: 'bg-violet-50',
    icon: 'text-violet-500',
    value: 'text-violet-700',
    border: 'border-violet-100',
  },
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-500',
    value: 'text-emerald-700',
    border: 'border-emerald-100',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-500',
    value: 'text-blue-700',
    border: 'border-blue-100',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'text-amber-500',
    value: 'text-amber-700',
    border: 'border-amber-100',
  },
  pink: {
    bg: 'bg-pink-50',
    icon: 'text-pink-500',
    value: 'text-pink-700',
    border: 'border-pink-100',
  },
};

const StatCard = ({ icon, label, value, color }) => {
  const c = colorMap[color] || colorMap.violet;
  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border ${c.border} ${c.bg} px-4 py-3 hover:shadow-sm transition-shadow`}
    >
      <div
        className={`w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm ${c.icon}`}
      >
        {icon}
      </div>
      <div>
        <p className={`text-xl font-bold ${c.value}`}>{value}</p>
        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mt-0.5">
          {label}
        </p>
      </div>
    </div>
  );
};

/* ── Empty State ── */
const EmptyState = ({ nextStep }) => (
  <div className="py-16 text-center flex flex-col items-center">
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mb-4 shadow-inner">
      <Bot className="w-10 h-10 text-purple-400" />
    </div>
    <p className="font-bold text-gray-700 text-lg">No agents yet</p>
    <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto mb-6">
      Create an AI agent to automatically find and apply to jobs that match your
      profile.
    </p>
    <button
      onClick={nextStep}
      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-md shadow-purple-200"
    >
      <Plus className="w-4 h-4" /> Create First Agent
    </button>
  </div>
);

/* ── Date Labels ── */
const DATE_LABELS = {
  today: 'Today',
  yesterday: 'Yesterday',
  lastWeek: 'Last 7 days',
  older: 'Older',
};

/* ── Agent Row ── */
/* ── Agent Row ── */
const AgentRow = ({ agent, onEdit, onDelete, onToggleActive }) => {
  const router = useRouter();
  const id = agent.agentId || agent._id;
  const [expanded, setExpanded] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [jobsByDate, setJobsByDate] = useState({
    today: [],
    yesterday: [],
    lastWeek: [],
    older: [],
  });
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState(null);
  const [generatingJobIds, setGeneratingJobIds] = useState(new Set());
  const [findingJobs, setFindingJobs] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);
  const [isActive, setIsActive] = useState(agent.isAgentActive);

  // Keep local state in sync if parent re-renders with updated agent
  useEffect(() => {
    setIsActive(agent.isAgentActive);
  }, [agent.isAgentActive]);

  const handleToggleActive = async (e) => {
    e.stopPropagation();
    if (togglingActive) return;
    setTogglingActive(true);
    const newState = !isActive;
    setIsActive(newState); // optimistic update
    try {
      await apiInstance.patch(`/pilotagent/agent/active/${id}`, {
        isAgentActive: newState,
      });
      toast({
        title: `Agent ${newState ? 'activated' : 'deactivated'}`,
      });
      if (onToggleActive) onToggleActive(id, newState);
    } catch (err) {
      setIsActive(!newState); // revert on error
      toast({
        variant: 'destructive',
        title: 'Failed to update agent status',
        description: err?.response?.data?.message || 'Please try again',
      });
    } finally {
      setTogglingActive(false);
    }
  };

  const fetchJobs = (userFeedback) => {
    if (!id) return;
    setJobsLoading(true);
    setJobsError(null);
    getAgentJobs(id, 30, userFeedback)
      .then((res) => {
        const data = res?.data?.data ?? {};
        const list = data.jobs ?? [];
        let byDate = data.byDate ?? {
          today: [],
          yesterday: [],
          lastWeek: [],
          older: [],
        };
        if (
          list.length > 0 &&
          !byDate.today?.length &&
          !byDate.yesterday?.length &&
          !byDate.lastWeek?.length &&
          !byDate.older?.length
        ) {
          byDate = { today: list, yesterday: [], lastWeek: [], older: [] };
        }
        setJobs(list);
        setJobsByDate(byDate);
      })
      .catch((err) => {
        setJobsError(err?.response?.data?.message || 'Failed to load jobs');
        setJobs([]);
        setJobsByDate({ today: [], yesterday: [], lastWeek: [], older: [] });
      })
      .finally(() => setJobsLoading(false));
  };

  const handleFindAnotherJob = () => {
    setFindingJobs(true);
    toast({ title: 'Refreshing jobs…' });
    getAgentJobs(id, 30)
      .then((res) => {
        const data = res?.data?.data ?? {};
        const list = data.jobs ?? [];
        let byDate = data.byDate ?? {
          today: [],
          yesterday: [],
          lastWeek: [],
          older: [],
        };
        if (
          list.length > 0 &&
          !byDate.today?.length &&
          !byDate.yesterday?.length &&
          !byDate.lastWeek?.length &&
          !byDate.older?.length
        ) {
          byDate = { today: list, yesterday: [], lastWeek: [], older: [] };
        }
        setJobs(list);
        setJobsByDate(byDate);
      })
      .catch((err) => {
        setJobsError(err?.response?.data?.message || 'Failed to load jobs');
        toast({ variant: 'destructive', title: 'Failed to find jobs' });
      })
      .finally(() => setFindingJobs(false));
  };

  useEffect(() => {
    if (!expanded || !id) return;
    fetchJobs();
  }, [expanded, id]);

  const handleGenerateDocs = async (jobId) => {
    if (!id || !jobId) return;
    setGeneratingJobIds((prev) => new Set(prev).add(jobId));
    try {
      await startAgentJobTailoredGeneration(id, jobId);
      toast({
        title: 'Tailored docs generation started',
        description: 'You will be notified when ready.',
        action: (
          <ToastAction
            altText="View in My Docs"
            onClick={() => router.push('/dashboard/my-docs?tab=applications')}
          >
            View in My Docs
          </ToastAction>
        ),
      });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to start generation';
      toast({ variant: 'destructive', title: 'Error', description: msg });
    } finally {
      setGeneratingJobIds((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    }
  };

  const formatLocation = (job) => {
    const city = job?.location?.city?.trim();
    const state = job?.location?.state?.trim();
    const country = (job?.country || job?.location?.country)?.trim();
    const parts = [];
    if (city) parts.push(city);
    if (state && state !== city) parts.push(state);
    if (country && parts.length === 0) parts.push(country);
    if (parts.length > 0) return parts.join(', ');
    if (job?.remote) return 'Remote';
    return 'Location N/A';
  };

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
      {/* ── Card Header ── */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 cursor-pointer bg-white hover:bg-purple-50/20 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        {/* Left */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Avatar with status ring */}
          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold text-base shadow-md shadow-purple-200">
              {(agent.agentName && agent.agentName.charAt(0).toUpperCase()) ||
                'A'}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-1 border-white transition-colors ${
                isActive ? 'bg-green-400' : 'bg-gray-300'
              }`}
            />
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            {/* Name + status badge + toggle */}
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

              {/* Toggle */}
              {/* Toggle — same as Autopilot toggle in header */}
              <button
                onClick={handleToggleActive}
                disabled={togglingActive}
                title={isActive ? 'Deactivate agent' : 'Activate agent'}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${
                  isActive ? 'bg-green-400' : 'bg-white/25 bg-gray-300'
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

            {/* Role · Country · Remote */}
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                {agent.jobTitle || 'General'}
              </span>
              {agent.country && (
                <span className="text-xs text-gray-400">• {agent.country}</span>
              )}
              {agent.isRemote && (
                <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-medium border border-blue-100">
                  Remote
                </span>
              )}
              {agent.isOnsite && (
                <span className="text-[11px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-md font-medium border border-orange-100">
                  Onsite
                </span>
              )}
            </div>

            {/* Employment types */}
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

            {/* Keywords */}
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

          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((e) => !e);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all shrink-0 mt-0.5"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Right: stats */}
        <div
          className="flex items-center gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Daily progress */}
          <div className="flex flex-col items-center gap-1 min-w-[64px]">
            <div className="flex items-center gap-1">
              <span className="text-base font-bold text-gray-800">
                {todayCount}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                / {dailyMax}
              </span>
            </div>
            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
              Today
            </span>
          </div>

          {/* CV badge */}
          <div className="text-center">
            <span className="text-[11px] bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap block">
              {agent.cvOption === 'current_profile'
                ? 'Current Profile'
                : 'Uploaded CV'}
            </span>
          </div>

          {/* Delete */}
          <button
            onClick={() => onDelete(id)}
            className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
            title="Delete Agent"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Accordion: Jobs ── */}
      {expanded && (
        <div className="border-t border-purple-100/60 bg-gradient-to-b from-purple-50/30 to-white px-4 py-4">
          <div className="flex items-center justify-between mb-4">
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

          {jobsLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
              <span className="text-sm">Finding matched jobs…</span>
            </div>
          ) : jobsError ? (
            <div className="flex items-center gap-2 py-4 text-red-500 bg-red-50 rounded-xl px-4">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">{jobsError}</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-gray-400">
              <Search className="w-8 h-8 mb-2 text-gray-200" />
              <p className="text-sm font-medium">No matching jobs found</p>
              <p className="text-xs mt-1">
                The agent is actively searching for matches
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1 custom-scroll">
              {['today', 'yesterday', 'lastWeek', 'older'].map((key) => {
                const list = jobsByDate[key] ?? [];
                if (list.length === 0) return null;
                return (
                  <div key={key}>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {DATE_LABELS[key]}
                      </p>
                      <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-semibold">
                        {list.length}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {list.map((job) => {
                        const jobId = job._id || job.id;
                        const isGenerating = generatingJobIds.has(jobId);
                        return (
                          <li
                            key={jobId}
                            className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all group/job"
                          >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                            </div>

                            <Link
                              href={`/dashboard/jobs/${jobId}`}
                              className="flex-1 min-w-0 block"
                            >
                              <p className="font-semibold text-sm text-gray-800 truncate group-hover/job:text-purple-700 transition-colors">
                                {job.title}
                              </p>
                              <div className="flex items-center gap-3 mt-0.5">
                                <span className="flex items-center gap-1 text-xs text-gray-400">
                                  <Building2 className="w-3 h-3" />
                                  <span className="truncate max-w-[120px]">
                                    {job.company}
                                  </span>
                                </span>
                                <span className="flex items-center gap-1 text-xs text-gray-400">
                                  <MapPin className="w-3 h-3" />
                                  {formatLocation(job)}
                                </span>
                              </div>
                            </Link>

                            {/* Actions */}
                            <div
                              className="flex items-center gap-2 shrink-0"
                              onClick={(e) => e.preventDefault()}
                            >
                              {job.tailoredGenerated ? (
                                <span className="flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-1 rounded-lg">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Tailored
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-100 px-2 py-1 rounded-lg">
                                  Not tailored
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFindAnotherJob();
                                }}
                                disabled={findingJobs || jobsLoading}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 transition-all disabled:opacity-50"
                              >
                                {findingJobs ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Search className="w-3 h-3" />
                                )}
                                Find other
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGenerateDocs(jobId);
                                }}
                                disabled={isGenerating}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm shadow-purple-200"
                              >
                                {isGenerating ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />{' '}
                                    Generating…
                                  </>
                                ) : (
                                  <>
                                    <FileText className="w-3 h-3" /> Generate
                                    Tailored
                                  </>
                                )}
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Step0_SimpleIntroSlim;
