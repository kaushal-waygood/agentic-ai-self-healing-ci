// Step0_SimpleIntroSlim.jsx
import React, { useState } from 'react';
import { Bot, Plus, Trash2, Edit } from 'lucide-react';

const Step0_SimpleIntroSlim = ({
  nextStep = () => {},
  agents = {},
  onEdit = () => {},
  onDelete = () => {},
  deletePopup = { open: false, agentId: null },

  confirmDelete = () => {},
  cancelDelete = () => {},
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
    <div className="w-full max-w-5xl mx-auto p-6 animate-fade-in">
      {/* Header */}
      <div className="bg-header-gradient-primary text-white px-6 py-4 rounded-lg shadow-lg mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-wide">AI Job Agents</h1>
            <p className="text-sm opacity-90 ">
              Manage, track & automate your job search
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/90 font-medium">
                Autopilot
              </span>

              <button
                onClick={() => onToggleAutoPilot()}
                className={`
          relative inline-flex h-6 w-12 items-center rounded-full transition-all
          ${agents?.autopilotEnabled ? 'bg-green-500' : 'bg-gray-400'}
        `}
              >
                <span
                  className={`
            inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all
            ${agents?.autopilotEnabled ? 'translate-x-6' : 'translate-x-1'}
          `}
                />
              </button>
            </div>

            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-purple-700 font-medium shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              Create Agent
            </button>
          </div>
        </div>

        {/* Delete Confirmation Popup */}
        {deletePopup.open && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-xl w-[320px]">
              <h2 className="text-lg text-gray-800 font-semibold mb-4 text-center">
                Are you sure you want to delete this agent?
              </h2>

              <div className="flex justify-between gap-4 mt-4">
                <button
                  onClick={cancelDelete}
                  className="w-full py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmDelete}
                  className="w-full py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Row */}

      <div className="flex flex-wrap  gap-4 mb-4">
        <div className="flex-1  min-w-[120px]">
          <MiniStat label="Total" value={totalAgents} />
        </div>
        <div className="flex-1 min-w-[120px]">
          <MiniStat label="Active" value={activeAgents} />
        </div>
        <div className="flex-1 min-w-[120px]">
          <MiniStat label="Today" value={todayApps} />
        </div>
        <div className="flex-1 min-w-[120px]">
          <MiniStat label="Applied" value={totalApplied} />
        </div>
        <div className="flex-1 min-w-[120px]">
          <MiniStat label="Avg %" value={`${avgSuccess}%`} />
        </div>
      </div>

      {/* Agents List */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b bg-slate-50 flex justify-between items-center">
          <h2 className="text-slate-700 font-semibold">Your Agents</h2>
          <span className="text-xs text-slate-500">{list.length} total</span>
        </div>

        <div className="p-4 space-y-3">
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

/* --- UI Sub-components --- */
const MiniStat = ({ label, value }) => (
  <div className="flex items-center justify-between bg-slate-50 border rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-all">
    <span className="text-sm text-slate-600">{label}</span>
    <span className="font-bold text-slate-800 text-sm">{value}</span>
  </div>
);

const EmptyState = () => (
  <div className="py-10 text-center text-slate-500">
    <div className="mx-auto w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3 shadow-inner">
      <Bot className="w-7 h-7 text-slate-400" />
    </div>
    <p className="font-semibold text-slate-700">No agents created yet</p>
    <p className="text-sm mt-1 opacity-80">
      Click <b>Create Agent</b> to start automating your applications.
    </p>
  </div>
);

const AgentRow = ({ agent, onEdit, onDelete }) => {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-3 rounded-lg border hover:bg-slate-50 transition-all shadow-sm hover:shadow-md">
      {/* Left Section */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-11 h-11 flex items-center justify-center rounded-lg bg-slate-100 text-slate-700 font-semibold shadow-inner">
          {(agent.agentName && agent.agentName.charAt(0).toUpperCase()) || 'A'}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">
            {agent.agentName || 'Untitled Agent'}
          </p>
          <p className="text-xs text-slate-500 truncate">
            {agent.jobTitle || 'No target job set'}
          </p>
        </div>
      </div>

      {/* Stats + Actions */}
      <div className="flex items-center gap-4 text-sm text-slate-600">
        <div className="text-right">
          <p className="font-semibold text-slate-800">
            {agent.applicationsToday || 0}/{agent.autopilotLimit || '-'}
          </p>
          <p className="text-xs text-slate-400">today</p>
        </div>

        <button
          onClick={() => onEdit(agent.agentId)}
          className="p-2 rounded-lg hover:bg-indigo-50 transition text-indigo-600"
        >
          <Edit className="w-4 h-4" />
        </button>

        <button
          // onDeleteClick={() => onDelete(agent._id)}
          onClick={() => onDelete(agent.agentId)}
          className="p-2 rounded-lg hover:bg-red-50 transition text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Step0_SimpleIntroSlim;
