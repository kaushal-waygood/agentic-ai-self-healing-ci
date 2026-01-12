// Step0_SimpleIntroSlim.jsx
import React, { useEffect, useState } from 'react';
import { Bot, Plus, Trash2, Edit } from 'lucide-react';
import apiInstance from '@/services/api';
import { toast } from '@/hooks/use-toast'; // Ensure you import your toast hook

const Step0_SimpleIntroSlim = ({
  nextStep = () => {},
  agents = [], // Default to empty array
  onEdit = () => {},
  onDelete = () => {},
  deletePopup = { open: false, agentId: null },
  confirmDelete = () => {},
  cancelDelete = () => {},
}) => {
  const [autopilotEnabled, setAutopilotEnabled] = useState(false);

  // ===================== 1. ROBUST DATA EXTRACTION ===================== //
  // Fix: Check if 'agents' is the array itself, or if it's inside a property like .autopilot or .autoPilot
  const getAgentList = () => {
    if (Array.isArray(agents)) return agents;
    if (Array.isArray(agents?.autopilot)) return agents.autopilot;
    if (Array.isArray(agents?.autoPilot)) return agents.autoPilot;
    return [];
  };

  const list = getAgentList();

  // ===================== 2. STATS CALCULATION ===================== //
  const totalAgents = list.length;
  // Check for 'active' status (case-insensitive safe check)
  const activeAgents = list.filter(
    (a) => a?.status?.toLowerCase() === 'active',
  ).length;
  const todayApps = list.reduce(
    (s, a) => s + (Number(a.applicationsToday) || 0),
    0,
  );
  const totalApplied = list.reduce(
    (s, a) => s + (Number(a.totalApplications) || 0),
    0,
  );
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
        // Handle response safely
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
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/90 font-medium">
                Autopilot
              </span>

              {/* TOGGLE BUTTON */}
              <button
                onClick={onToggleAutoPilot}
                className={`
                  relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none border-2 border-transparent
                  ${autopilotEnabled ? 'bg-green-500' : 'bg-gray-400'}
                `}
              >
                <span
                  className={`
                    inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out
                    ${autopilotEnabled ? 'translate-x-6' : 'translate-x-0.5'}
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
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-[320px] animate-in zoom-in-95 duration-200">
              <h2 className="text-lg text-gray-800 font-semibold mb-4 text-center">
                Delete this agent?
              </h2>
              <div className="flex justify-between gap-4 mt-4">
                <button
                  onClick={cancelDelete}
                  className="w-full py-2 rounded-lg bg-gray-100 hover:bg-gray-200 font-medium text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="w-full py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium transition-colors shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[120px]">
          <MiniStat label="Total Agents" value={totalAgents} />
        </div>
        <div className="flex-1 min-w-[120px]">
          <MiniStat label="Active" value={activeAgents} />
        </div>
        <div className="flex-1 min-w-[120px]">
          <MiniStat label="Applications Today" value={todayApps} />
        </div>
        <div className="flex-1 min-w-[120px]">
          <MiniStat label="Total Applied" value={totalApplied} />
        </div>
        <div className="flex-1 min-w-[120px]">
          <MiniStat label="Success Rate" value={`${avgSuccess}%`} />
        </div>
      </div>

      {/* Agents List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b bg-gray-50 flex justify-between items-center">
          <h2 className="text-gray-800 font-bold text-lg">Your Agents</h2>
          <span className="text-xs font-medium px-2 py-1 bg-gray-200 rounded-full text-gray-600">
            {list.length} Total
          </span>
        </div>

        <div className="p-4 space-y-3">
          {list.length === 0 ? (
            <EmptyState nextStep={nextStep} />
          ) : (
            list.map((agent, index) => (
              <AgentRow
                // Fallback to index if IDs are missing, but prefer _id or agentId
                key={agent._id || agent.agentId || index}
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
  <div className="flex flex-col bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-all">
    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
      {label}
    </span>
    <span className="font-bold text-gray-800 text-2xl">{value}</span>
  </div>
);

const EmptyState = ({ nextStep }) => (
  <div className="py-16 text-center text-gray-500 flex flex-col items-center">
    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 shadow-inner">
      <Bot className="w-8 h-8 text-gray-400" />
    </div>
    <p className="font-semibold text-gray-700 text-lg">No agents created yet</p>
    <p className="text-sm mt-1 max-w-xs mx-auto opacity-80 mb-6">
      Set up an AI agent to automatically find and apply to jobs for you.
    </p>
    <button
      onClick={nextStep}
      className="px-5 py-2.5 rounded-lg bg-buttonPrimary text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
    >
      <Plus className="w-4 h-4" /> Create First Agent
    </button>
  </div>
);

const AgentRow = ({ agent, onEdit, onDelete }) => {
  const id = agent.agentId;

  return (
    <div className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all shadow-sm hover:shadow-md bg-white">
      {/* Left Section: Icon + Text */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-700 font-bold text-lg shadow-inner border border-white">
          {(agent.agentName && agent.agentName.charAt(0).toUpperCase()) || 'A'}
        </div>

        <div className="min-w-0">
          <p className="text-base font-bold text-gray-800 truncate">
            {agent.agentName || 'Untitled Agent'}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium text-gray-600">
              {agent.jobTitle || 'General'}
            </span>
            {agent.country && (
              <span className="text-xs text-gray-400">• {agent.country}</span>
            )}
          </div>
        </div>
      </div>

      {/* Right Section: Stats + Buttons */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 mt-1 sm:mt-0">
        {/* Applications Counter */}
        <div className="text-right">
          <p className="font-bold text-gray-800 text-sm">
            {agent.applicationsToday || 0}{' '}
            <span className="text-gray-400 font-normal">
              / {agent.maxApplications || agent.agentDailyLimit || 5}
            </span>
          </p>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
            Today
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(id)}
            className="p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
            title="Edit Agent"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(id)}
            className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
            title="Delete Agent"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step0_SimpleIntroSlim;
