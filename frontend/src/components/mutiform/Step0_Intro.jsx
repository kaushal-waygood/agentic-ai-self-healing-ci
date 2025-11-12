// Step0_SimpleIntro.jsx
import React from 'react';
import { Sparkles, Bot, Plus, Trash2, Edit } from 'lucide-react';

/**
 * Props:
 *  - nextStep: () => void
 *  - agents: { autoPilot: Array } | undefined
 *  - onEdit: (id) => void
 *  - onDelete: (id) => void
 */
const Step0_SimpleIntro = ({
  nextStep,
  agents = {},
  onEdit = () => {},
  onDelete = () => {},
}) => {
  const list = Array.isArray(agents?.autoPilot) ? agents.autoPilot : [];
  const totalAgents = list.length;
  const activeAgents = list.filter((a) => a.status === 'active').length || 0;
  const todayApps = list.reduce((s, a) => s + (a.applicationsToday || 0), 0);
  const totalApplied = list.reduce((s, a) => s + (a.totalApplications || 0), 0);
  const avgSuccess = list.length
    ? Math.round(
        list.reduce((s, a) => s + (a.successRate || 0), 0) / list.length,
      )
    : 0;

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-slate-900 to-indigo-600 text-white">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              AI Job Agents
            </h1>
            <p className="text-sm text-slate-500">
              Manage your automated job application agents — simple & fast.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={nextStep}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4" /> Create Agent
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <Stat label="Total" value={totalAgents} />
        <Stat label="Active" value={activeAgents} />
        <Stat label="Today" value={todayApps} />
        <Stat label="Applied" value={totalApplied} />
        <Stat label="Avg %" value={`${avgSuccess}%`} />
      </div>

      {/* Agent list */}
      <div className="bg-white border rounded-xl shadow-sm divide-y">
        {/* list header */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="text-sm font-medium text-slate-700">Agents</div>
          <div className="text-xs text-slate-400">{list.length} total</div>
        </div>

        {/* items */}
        <div className="p-4 space-y-3">
          {list.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <Bot className="w-6 h-6 text-slate-400" />
              </div>
              <div className="font-medium">No agents yet</div>
              <div className="text-sm mt-1">
                Create your first agent to automate applications.
              </div>
            </div>
          ) : (
            list.map((agent) => (
              <div
                key={agent.agentId || agent.agentName}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 flex items-center justify-center rounded-md bg-slate-50 text-slate-700 font-semibold">
                    {(agent.agentName &&
                      agent.agentName.charAt(0).toUpperCase()) ||
                      'A'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">
                      {agent.agentName || 'Untitled Agent'}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {agent.jobTitle || 'Target role not set'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-xs text-slate-500 text-right mr-2">
                    <div className="font-medium">
                      {agent.applicationsToday || 0}/
                      {agent.autopilotLimit || '-'}
                    </div>
                    <div className="text-xs text-slate-400">today</div>
                  </div>

                  <button
                    onClick={() => onEdit(agent.agentId)}
                    title="Edit"
                    className="p-2 rounded-md hover:bg-slate-50 text-slate-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDelete(agent.agentId)}
                    title="Delete"
                    className="p-2 rounded-md hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

function Stat({ label, value }) {
  return (
    <div className="bg-white border rounded-lg p-3 flex flex-col items-start justify-center shadow-sm">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-lg font-semibold text-slate-800">{value}</div>
    </div>
  );
}

export default Step0_SimpleIntro;
