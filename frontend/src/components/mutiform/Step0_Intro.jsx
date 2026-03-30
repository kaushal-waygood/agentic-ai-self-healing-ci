import React, { useEffect, useState } from 'react';
import {
  Bot,
  Plus,
  Trash2,
  Zap,
  Clock,
  Briefcase,
  Activity,
} from 'lucide-react';
import apiInstance from '@/services/api';
import { toast } from '@/hooks/use-toast';
import AgentRow from './AgentRow';

/* ─── Step0_Intro ─── */
const Step0_Intro = ({
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
  const dailyLimit = planUsage?.dailyLimit ?? 5;

  useEffect(() => {
    const fetchAutoPilotStatus = async () => {
      try {
        const response = await apiInstance.get('/students/autopilot/status');
        if (response?.data)
          setAutopilotEnabled(!!response.data.autopilotStatus);
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
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-lg bg-header-gradient-primary text-white p-6 shadow-xl shadow-purple-200">
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

      {/* Delete Confirmation Modal */}
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

      {/* Stats Grid */}
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

      {/* Agents List */}
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

/* ─── Stat Card ─── */
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

/* ─── Empty State ─── */
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

export default Step0_Intro;
