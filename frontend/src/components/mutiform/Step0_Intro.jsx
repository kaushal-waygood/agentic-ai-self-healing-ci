import React, { useState } from 'react';

const Step0_Intro = ({ nextStep, agents }) => {
  const [showStats, setShowStats] = useState(true);
  const hasAgents = agents && agents.length > 0;
  const totalAgents = agents.length;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header with gradient */}
      <header className="text-center mb-8 animate-fade-in">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent mb-3">
          AI Job Agents Dashboard
        </h1>
        <p className="text-gray-600 text-lg">
          Automate your job search with intelligent agents
        </p>
      </header>

      {/* Stats Grid with hover effects */}
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-slide-up">
          {[
            {
              label: 'Total Agents',
              value: totalAgents,
              gradient: 'from-blue-500 to-cyan-500',
            },
            {
              label: 'Active Agents',
              value: totalAgents,
              gradient: 'from-green-500 to-emerald-500',
            },
            {
              label: "Today's Applications",
              value: 0,
              gradient: 'from-purple-500 to-pink-500',
            },
            {
              label: 'Total Applied',
              value: 0,
              gradient: 'from-orange-500 to-red-500',
            },
            {
              label: 'Avg. Success',
              value: '0%',
              gradient: 'from-indigo-500 to-purple-500',
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
            >
              <div className="text-sm text-gray-500 mb-2">{stat.label}</div>
              <div
                className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Agent Panel */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 animate-fade-in">
        {/* Panel Header with glassmorphism effect */}
        <div className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 p-8 text-white">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">Your AI Job Agents</h2>
            <p className="text-white/90">
              Manage and monitor your automated job application agents
            </p>
          </div>
          <button
            onClick={() => setShowStats(!showStats)}
            className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
          >
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </button>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Panel Body */}
        <div className="p-8">
          {!hasAgents ? (
            // Empty state with animation
            <div className="text-center py-16 animate-fade-in">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-6 animate-bounce-slow">
                <span className="text-5xl">🤖</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                No agents configured
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                Create your first agent to start automating job applications and
                land your dream role faster.
              </p>
            </div>
          ) : (
            // Agent list with enhanced design
            <div className="space-y-4 animate-slide-up">
              <div className="flex justify-between items-center px-4 pb-3 border-b border-gray-200">
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Agent Name
                </span>
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Target Role
                </span>
              </div>
              <ul className="space-y-3">
                {agents.map((agent, idx) => (
                  <li
                    key={agent.id}
                    className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-200 group"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {agent.agentName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                        {agent.agentName}
                      </span>
                    </div>
                    <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-lg text-sm font-medium">
                      {agent.jobTitle}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={nextStep}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>
                  {hasAgents ? '+ Create New Agent' : '+ Create First Agent'}
                </span>
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Step0_Intro;
