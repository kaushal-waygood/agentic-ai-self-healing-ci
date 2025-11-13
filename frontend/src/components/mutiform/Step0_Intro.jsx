// Step0_SimpleIntroSlim.jsx
import React from 'react';
import { Sparkles, Bot, Plus, Trash2, Edit } from 'lucide-react';

const Step0_SimpleIntroSlim = ({
  nextStep = () => {},
  agents = {},
  onEdit = () => {},
  onDelete = () => {},
}) => {
  const list = Array.isArray(agents?.autoPilot) ? agents.autoPilot : [];
  const totalAgents = list.length;
  const activeAgents = list.filter((a) => a.status === 'active').length;
  const todayApps = list.reduce((s, a) => s + (a.applicationsToday || 0), 0);
  const totalApplied = list.reduce((s, a) => s + (a.totalApplications || 0), 0);
  const avgSuccess = list.length
    ? Math.round(
        list.reduce((s, a) => s + (a.successRate || 0), 0) / list.length,
      )
    : 0;

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-slate-900 text-white flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              AI Job Agents
            </h1>
            <p className="text-sm text-slate-500">
              Manage agents — minimal, fast, clear.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={nextStep}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>
      </div>

      {/* Compact stats row */}
      <div className="flex gap-3 mb-5">
        <MiniStat label="Total" value={totalAgents} />
        <MiniStat label="Active" value={activeAgents} />
        <MiniStat label="Today" value={todayApps} />
        <MiniStat label="Applied" value={totalApplied} />
        <MiniStat label="Avg %" value={`${avgSuccess}%`} />
      </div>

      {/* Agents card */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between border-b">
          <div className="text-sm font-medium text-slate-700">Agents</div>
          <div className="text-xs text-slate-400">{list.length} total</div>
        </div>

        <div className="p-3 space-y-2">
          {list.length === 0 ? (
            <EmptyState />
          ) : (
            list.map((agent) => (
              <AgentRow
                key={agent.agentId || agent.agentName}
                agent={agent}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

/* Small presentational pieces */

const MiniStat = ({ label, value }) => (
  <div className="flex-1 min-w-[72px] bg-slate-50 border rounded-md px-3 py-2 flex flex-col">
    <span className="text-xs text-slate-400">{label}</span>
    <span className="mt-1 font-semibold text-slate-800">{value}</span>
  </div>
);

const EmptyState = () => (
  <div className="py-8 text-center text-slate-500">
    <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
      <Bot className="w-6 h-6 text-slate-400" />
    </div>
    <div className="font-medium">No agents yet</div>
    <div className="text-sm mt-1">
      Create your first agent to start automating applications.
    </div>
  </div>
);

const AgentRow = ({ agent, onEdit, onDelete }) => {
  return (
    <div className="flex items-center justify-between gap-3 px-2 py-2 rounded-md hover:bg-slate-50">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 flex items-center justify-center rounded-md bg-slate-50 text-slate-700 font-semibold">
          {(agent.agentName && agent.agentName.charAt(0).toUpperCase()) || 'A'}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-800 truncate">
            {agent.agentName || 'Untitled'}
          </div>
          <div className="text-xs text-slate-400 truncate">
            {agent.jobTitle || 'Target not set'}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm text-slate-600">
        <div className="text-right mr-2">
          <div className="font-medium">
            {agent.applicationsToday || 0}/{agent.autopilotLimit || '-'}
          </div>
          <div className="text-xs text-slate-400">today</div>
        </div>

        <button
          onClick={() => onEdit(agent.agentId)}
          title="Edit"
          className="p-2 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <Edit className="w-4 h-4 text-slate-600" />
        </button>

        <button
          onClick={() => onDelete(agent.agentId)}
          title="Delete"
          className="p-2 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-100 text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Step0_SimpleIntroSlim;
