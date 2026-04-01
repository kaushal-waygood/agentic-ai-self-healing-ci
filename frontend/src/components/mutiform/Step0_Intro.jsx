// import React, { useEffect, useState } from 'react';
// import {
//   Bot,
//   Plus,
//   Trash2,
//   Zap,
//   Clock,
//   Briefcase,
//   Activity,
// } from 'lucide-react';
// import apiInstance from '@/services/api';
// import { toast } from '@/hooks/use-toast';
// import AgentRow from './AgentRow';

// /* ─── Step0_Intro ─── */
// const Step0_Intro = ({
//   nextStep = () => {},
//   agents = [],
//   onEdit = () => {},
//   onDelete = () => {},
//   deletePopup = { open: false, agentId: null },
//   confirmDelete = () => {},
//   cancelDelete = () => {},
// }) => {
//   const [autopilotEnabled, setAutopilotEnabled] = useState(false);

//   const getAgentList = () => {
//     if (Array.isArray(agents)) return agents;
//     if (Array.isArray(agents?.agents)) return agents.agents;
//     if (Array.isArray(agents?.autopilot)) return agents.autopilot;
//     if (Array.isArray(agents?.autoPilot)) return agents.autoPilot;
//     return [];
//   };

//   const list = getAgentList();
//   const planUsage = agents?.planUsage ?? null;

//   const totalAgents = list.length;
//   const activeAgents = list.filter(
//     (a) => a?.status?.toLowerCase() === 'active' || a?.isAgentActive,
//   ).length;
//   const todayApps = planUsage
//     ? Number(planUsage.applicationsToday) || 0
//     : list.reduce((s, a) => s + (Number(a.applicationsToday) || 0), 0);
//   const dailyLimit = planUsage?.dailyLimit ?? 5;

//   useEffect(() => {
//     const fetchAutoPilotStatus = async () => {
//       try {
//         const response = await apiInstance.get('/students/autopilot/status');
//         if (response?.data)
//           setAutopilotEnabled(!!response.data.autopilotStatus);
//       } catch (error) {
//         console.error('Autopilot status error:', error);
//       }
//     };
//     fetchAutoPilotStatus();
//   }, []);

//   const onToggleAutoPilot = async () => {
//     try {
//       const newState = !autopilotEnabled;
//       const response = await apiInstance.post('/students/autopilot/toggle', {
//         autopilotEnabled: newState,
//       });
//       setAutopilotEnabled(!!response.data.autopilotStatus);
//       toast({ title: `Autopilot ${newState ? 'Enabled' : 'Disabled'}` });
//     } catch (error) {
//       console.error(error);
//       toast({ variant: 'destructive', title: 'Failed to toggle autopilot' });
//     }
//   };

//   return (
//     <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">
//       {/* Hero Header */}
//       <div className="relative overflow-hidden rounded-lg bg-header-gradient-primary text-white p-6 shadow-xl shadow-purple-200">
//         <div className="relative flex flex-wrap items-center justify-between gap-4">
//           <div className="flex items-center gap-4">
//             <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
//               <Bot className="w-6 h-6 text-white" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold tracking-tight">
//                 AI Job Agents
//               </h1>
//               <p className="text-sm text-white/70 mt-0.5">
//                 Automate your job search with intelligent agents
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2">
//               <Zap
//                 className={`w-4 h-4 transition-colors ${autopilotEnabled ? 'text-green-300' : 'text-white/50'}`}
//               />
//               <span className="text-sm font-medium text-white/90">
//                 Autopilot
//               </span>
//               <button
//                 onClick={onToggleAutoPilot}
//                 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
//                   autopilotEnabled ? 'bg-green-400' : 'bg-white/25'
//                 }`}
//               >
//                 <span
//                   className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
//                     autopilotEnabled ? 'translate-x-6' : 'translate-x-1'
//                   }`}
//                 />
//               </button>
//             </div>

//             <button
//               onClick={nextStep}
//               className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-purple-700 font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
//             >
//               <Plus className="w-4 h-4" />
//               New Agent
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Delete Confirmation Modal */}
//       {deletePopup.open && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
//           <div className="bg-white p-6 rounded-2xl shadow-2xl w-[340px] border border-gray-100">
//             <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
//               <Trash2 className="w-5 h-5 text-red-500" />
//             </div>
//             <h2 className="text-lg font-bold text-gray-800 mb-1 text-center">
//               Delete Agent?
//             </h2>
//             <p className="text-sm text-gray-500 text-center mb-6">
//               This action cannot be undone.
//             </p>
//             <div className="flex gap-3">
//               <button
//                 onClick={cancelDelete}
//                 className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 font-medium text-gray-700 text-sm transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmDelete}
//                 className="flex-1 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 font-medium text-sm transition-colors shadow-sm"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Stats Grid */}
//       <div className="grid grid-cols-3 gap-3">
//         <StatCard
//           icon={<Bot className="w-4 h-4" />}
//           label="Total Agents"
//           value={totalAgents}
//           color="violet"
//         />
//         <StatCard
//           icon={<Activity className="w-4 h-4" />}
//           label="Active"
//           value={activeAgents}
//           color="emerald"
//         />
//         <StatCard
//           icon={<Clock className="w-4 h-4" />}
//           label="Today"
//           value={
//             dailyLimit === '∞' || dailyLimit === -1
//               ? `${todayApps}`
//               : `${todayApps}/${dailyLimit}`
//           }
//           color="blue"
//         />
//       </div>

//       {/* Agents List */}
//       <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//         <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60 flex justify-between items-center">
//           <div className="flex items-center gap-2">
//             <Briefcase className="w-4 h-4 text-gray-500" />
//             <h2 className="text-gray-800 font-bold text-base">Your Agents</h2>
//           </div>
//         </div>

//         <div className="p-4 space-y-3">
//           {list.length === 0 ? (
//             <EmptyState nextStep={nextStep} />
//           ) : (
//             list.map((agent, index) => (
//               <AgentRow
//                 key={agent._id || agent.agentId || index}
//                 agent={agent}
//                 onEdit={onEdit}
//                 onDelete={onDelete}
//                 onToggleActive={(agentId, newState) => {
//                   console.log(`Agent ${agentId} toggled to ${newState}`);
//                 }}
//               />
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ─── Stat Card ─── */
// const colorMap = {
//   violet: {
//     bg: 'bg-violet-50',
//     icon: 'text-violet-500',
//     value: 'text-violet-700',
//     border: 'border-violet-100',
//   },
//   emerald: {
//     bg: 'bg-emerald-50',
//     icon: 'text-emerald-500',
//     value: 'text-emerald-700',
//     border: 'border-emerald-100',
//   },
//   blue: {
//     bg: 'bg-blue-50',
//     icon: 'text-blue-500',
//     value: 'text-blue-700',
//     border: 'border-blue-100',
//   },
//   amber: {
//     bg: 'bg-amber-50',
//     icon: 'text-amber-500',
//     value: 'text-amber-700',
//     border: 'border-amber-100',
//   },
// };

// const StatCard = ({ icon, label, value, color }) => {
//   const c = colorMap[color] || colorMap.violet;
//   return (
//     <div
//       className={`flex flex-col gap-2 rounded-xl border ${c.border} ${c.bg} px-4 py-3 hover:shadow-sm transition-shadow`}
//     >
//       <div
//         className={`w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm ${c.icon}`}
//       >
//         {icon}
//       </div>
//       <div>
//         <p className={`text-xl font-bold ${c.value}`}>{value}</p>
//         <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mt-0.5">
//           {label}
//         </p>
//       </div>
//     </div>
//   );
// };

// /* ─── Empty State ─── */
// const EmptyState = ({ nextStep }) => (
//   <div className="py-16 text-center flex flex-col items-center">
//     <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mb-4 shadow-inner">
//       <Bot className="w-10 h-10 text-purple-400" />
//     </div>
//     <p className="font-bold text-gray-700 text-lg">No agents yet</p>
//     <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto mb-6">
//       Create an AI agent to automatically find and apply to jobs that match your
//       profile.
//     </p>
//     <button
//       onClick={nextStep}
//       className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-md shadow-purple-200"
//     >
//       <Plus className="w-4 h-4" /> Create First Agent
//     </button>
//   </div>
// );

// export default Step0_Intro;

import React, { useEffect, useState } from 'react';
import {
  Bot,
  Plus,
  Trash2,
  Zap,
  Clock,
  Briefcase,
  Activity,
  Smile,
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
    <div className="flex flex-1 flex-col overflow-hidden bg-slate-50 font-jakarta text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      <div className="mx-auto flex h-full w-full max-w-[1250px] flex-col">
        <main className="custom-scrollbar relative flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-[1100px] space-y-8">
            {/* Header Row */}
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <h1 className="text-[28px] font-black leading-tight tracking-tight text-slate-900 md:text-[32px]">
                  AI Job Agents
                </h1>
                <p className="mt-1 text-[14px] font-medium text-slate-500">
                  Automate your job search with intelligent, background-running
                  agents.
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Autopilot Toggle */}
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                  <Zap className="h-4 w-4 text-amber-500" strokeWidth={2.5} />
                  <span className="text-[13px] font-extrabold tracking-tight text-slate-700">
                    Autopilot
                  </span>
                  <div className="relative ml-2 inline-block h-5 w-10 align-middle select-none transition duration-200 ease-in">
                    <input
                      type="checkbox"
                      id="autopilot"
                      checked={autopilotEnabled}
                      onChange={onToggleAutoPilot}
                      className={`toggle-checkbox absolute z-10 block h-5 w-5 cursor-pointer appearance-none rounded-full border-4 transition-all duration-300 ${
                        autopilotEnabled
                          ? 'right-0 border-blue-600 bg-white'
                          : 'left-0 border-slate-200 bg-white'
                      }`}
                    />
                    <label
                      htmlFor="autopilot"
                      className={`toggle-label block h-5 cursor-pointer overflow-hidden rounded-full transition-colors duration-300 ${
                        autopilotEnabled ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    ></label>
                  </div>
                </div>

                {/* New Agent Button */}
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-[14px] font-extrabold text-white shadow-[0_4px_16px_rgba(37,99,235,0.25)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                  New Agent
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <StatCard
                label="Total Agents"
                value={totalAgents}
                icon={<Smile className="h-6 w-6" strokeWidth={2} />}
                colorTheme="purple"
              />
              <StatCard
                label="Active"
                value={activeAgents}
                icon={<Zap className="h-6 w-6" strokeWidth={2} />}
                colorTheme="emerald"
              />
              <StatCard
                label="Today's Runs"
                value={
                  <>
                    {todayApps}
                    {dailyLimit !== '∞' && dailyLimit !== -1 && (
                      <span className="text-xl text-slate-300">
                        /{dailyLimit}
                      </span>
                    )}
                  </>
                }
                icon={<Clock className="h-6 w-6" strokeWidth={2} />}
                colorTheme="blue"
              />
            </div>

            {/* Delete Confirmation Modal */}
            {deletePopup.open && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/40 animate-in fade-in duration-200">
                <div className="w-full max-w-[340px] rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                    <Trash2 className="h-5 w-5 text-red-500" strokeWidth={2} />
                  </div>
                  <h2 className="mb-1 text-center text-lg font-bold text-slate-800">
                    Delete Agent?
                  </h2>
                  <p className="mb-6 text-center text-sm font-medium text-slate-500">
                    This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={cancelDelete}
                      className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Agents List Container */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 px-1 mb-1">
                <Briefcase className="h-5 w-5 text-slate-400" strokeWidth={2} />
                <h2 className="text-[18px] font-extrabold tracking-tight text-slate-900">
                  Your Agents
                </h2>
              </div>

              {list.length === 0 ? (
                <EmptyState nextStep={nextStep} />
              ) : (
                <div className="flex flex-col gap-4">
                  {list.map((agent, index) => (
                    <AgentRow
                      key={agent._id || agent.agentId || index}
                      agent={agent}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onToggleActive={(agentId, newState) => {
                        console.log(`Agent ${agentId} toggled to ${newState}`);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

/* ─── Stat Card ─── */
const StatCard = ({ label, value, icon, colorTheme }) => {
  const themeClasses = {
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      hover: 'group-hover:text-purple-500',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      hover: 'group-hover:text-emerald-500',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      hover: 'group-hover:text-blue-500',
    },
  }[colorTheme];

  return (
    <div className="group flex items-start justify-between rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div>
        <div
          className={`mb-1 text-[12px] font-extrabold uppercase tracking-widest text-slate-400 transition-colors ${themeClasses?.hover}`}
        >
          {label}
        </div>
        <div className="text-[32px] font-black leading-none tracking-tight text-slate-900">
          {value}
        </div>
      </div>
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-[14px] shadow-sm ${themeClasses?.bg} ${themeClasses?.text}`}
      >
        {icon}
      </div>
    </div>
  );
};

/* ─── Empty State ─── */
const EmptyState = ({ nextStep }) => (
  <div className="flex flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-slate-200 bg-white py-20 text-center">
    <div className="mb-6 relative inline-block">
      <div className="absolute inset-0 animate-pulse rounded-full bg-blue-500 opacity-20 blur-2xl"></div>
      <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl transition-transform duration-300 hover:scale-110">
        <Bot className="h-10 w-10 text-white" strokeWidth={1.5} />
      </div>
    </div>
    <h3 className="mb-2 text-2xl font-black tracking-tight text-slate-900">
      No Agents Yet
    </h3>
    <p className="mb-6 max-w-sm text-[13.5px] font-medium leading-relaxed text-slate-500">
      Create an AI agent to automatically find and apply to jobs that match your
      profile in the background.
    </p>
    <button
      onClick={nextStep}
      className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-[14px] font-extrabold text-white shadow-[0_4px_16px_rgba(37,99,235,0.25)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
    >
      <Plus className="h-4 w-4" strokeWidth={2.5} />
      Create First Agent
    </button>
  </div>
);

export default Step0_Intro;
