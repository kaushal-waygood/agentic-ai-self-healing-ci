'use client';

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Bot,
  ChevronsRight,
  Loader2,
  Trash2,
  Plus,
  Activity,
  Calendar,
  Target,
  Settings,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  X,
  BarChart3,
  Clock,
} from 'lucide-react';

import apiInstance from '@/services/api';

// Mock UI Components
const Button: React.FC<any> = ({
  children,
  onClick,
  disabled,
  className,
  variant,
  size,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none px-4 py-2 ${className}`}
  >
    {children}
  </button>
);
const Card: React.FC<any> = ({ children, className }) => (
  <div
    className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
  >
    {children}
  </div>
);
const CardHeader: React.FC<any> = ({ children, className }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);
const CardTitle: React.FC<any> = ({ children, className }) => (
  <h3
    className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
  >
    {children}
  </h3>
);
const CardDescription: React.FC<any> = ({ children, className }) => (
  <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
);
const CardContent: React.FC<any> = ({ children, className }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);
const CardFooter: React.FC<any> = ({ children, className }) => (
  <div className={`flex items-center p-6 pt-0 ${className}`}>{children}</div>
);
const Dialog: React.FC<any> = ({ children, open }) =>
  open ? (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      {children}
    </div>
  ) : null;
const DialogContent: React.FC<any> = ({ children, className }) => (
  <div
    className={`bg-white rounded-lg shadow-xl p-6 max-w-lg w-full ${className}`}
  >
    {children}
  </div>
);
const DialogHeader: React.FC<any> = ({ children, className }) => (
  <div
    className={`flex flex-col space-y-2 text-center sm:text-left ${className}`}
  >
    {children}
  </div>
);
const DialogTitle: React.FC<any> = ({ children }) => (
  <h2 className="text-lg font-semibold">{children}</h2>
);
const DialogDescription: React.FC<any> = ({ children }) => (
  <p className="text-sm text-muted-foreground">{children}</p>
);
const DialogFooter: React.FC<any> = ({ children, className }) => (
  <div
    className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4 ${className}`}
  >
    {children}
  </div>
);

// --- INTERFACES ---
interface PilotAgent {
  agentId: string;
  agentName: string;
  jobTitle?: string;
  createdAt?: string;
  autopilotLimit?: number;
  applicationsToday?: number;
  status?: 'active' | 'paused';
  lastActivity?: string;
  successRate?: number;
  totalApplications?: number;
}

interface IntroWizardProps {
  startNewAgentWizard: () => void;
  setView: (view: string) => void;
}

const IntroWizard: React.FC<IntroWizardProps> = ({
  startNewAgentWizard,
  setView,
}) => {
  const [autoPilot, setAutoPilot] = useState<PilotAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<PilotAgent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<PilotAgent | null>(null);
  const [showStats, setShowStats] = useState(true);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchAutoPilot = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiInstance.get('/pilotagent/get');

        if (
          response.data?.success &&
          Array.isArray(response.data.data?.autoPilot)
        ) {
          const agentsWithMockedData = response.data.data.autoPilot.map(
            (agent: PilotAgent) => ({
              ...agent,
              status:
                agent.status || (Math.random() > 0.5 ? 'active' : 'paused'),
              lastActivity:
                agent.lastActivity ||
                `${Math.floor(Math.random() * 24)} hours ago`,
              successRate:
                agent.successRate || Math.floor(70 + Math.random() * 25),
              totalApplications:
                agent.totalApplications || Math.floor(20 + Math.random() * 80),
            }),
          );
          setAutoPilot(agentsWithMockedData);
        } else {
          setError('Failed to load pilot agents');
          setAutoPilot([]);
        }
      } catch (err) {
        console.error('Error fetching pilot agents:', err);
        setError('Error loading pilot agents. Please try again.');
        setAutoPilot([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAutoPilot();
  }, []);

  // --- API & STATE HANDLERS ---
  const handleDelete = async () => {
    if (!agentToDelete) return;
    setIsDeleting(true);
    try {
      await apiInstance.delete(`/pilotagent/delete/${agentToDelete.agentId}`);
      setAutoPilot((prev) =>
        prev.filter((agent) => agent.agentId !== agentToDelete.agentId),
      );
      setAgentToDelete(null);
    } catch (err) {
      console.error('Error deleting agent:', err);
      setError('Failed to delete agent. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleAgentStatus = async (agentId: string) => {
    const agent = autoPilot.find((a) => a.agentId === agentId);
    if (!agent) return;
    const newStatus = agent.status === 'active' ? 'paused' : 'active';
    setAutoPilot((prev) =>
      prev.map((a) =>
        a.agentId === agentId ? { ...a, status: newStatus } : a,
      ),
    );
    // In a real app, you would have an API call here
  };

  // --- HELPER FUNCTIONS ---
  const getTotalStats = () => {
    if (!autoPilot || autoPilot.length === 0) {
      return {
        totalAgents: 0,
        activeAgents: 0,
        todayApplications: 0,
        totalApplications: 0,
        avgSuccessRate: 0,
      };
    }
    return {
      totalAgents: autoPilot.length,
      activeAgents: autoPilot.filter((a) => a.status === 'active').length,
      todayApplications: autoPilot.reduce(
        (sum, a) => sum + (a.applicationsToday || 0),
        0,
      ),
      totalApplications: autoPilot.reduce(
        (sum, a) => sum + (a.totalApplications || 0),
        0,
      ),
      avgSuccessRate:
        autoPilot.reduce((sum, a) => sum + (a.successRate || 0), 0) /
        autoPilot.length,
    };
  };

  const stats = getTotalStats();

  // --- RENDER ---
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              AI Job Agents Dashboard
            </h1>
            <p className="text-xl text-gray-600">
              Automate your job search with intelligent agents
            </p>
          </div>

          {showStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <StatCard
                title="Total Agents"
                value={stats.totalAgents}
                icon={<Bot />}
                color="blue"
              />
              <StatCard
                title="Active Agents"
                value={stats.activeAgents}
                icon={<Activity />}
                color="green"
              />
              <StatCard
                title="Today's Applications"
                value={stats.todayApplications}
                icon={<Calendar />}
                color="purple"
              />
              <StatCard
                title="Total Applied"
                value={stats.totalApplications}
                icon={<TrendingUp />}
                color="indigo"
              />
              <StatCard
                title="Avg. Success"
                value={`${Math.round(stats.avgSuccessRate)}%`}
                icon={<Target />}
                color="orange"
              />
            </div>
          )}

          <Card className="w-full shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Your AI Job Agents</h2>
                  <p className="text-blue-100">
                    Manage and monitor your automated job application agents
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStats(!showStats)}
                  className="bg-white/20 text-white hover:bg-white/30"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {showStats ? 'Hide Stats' : 'Show Stats'}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="text-gray-500">Loading your agents...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3 text-center">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                  <p className="text-red-600 font-medium">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              ) : autoPilot.length > 0 ? (
                autoPilot.map((pilot) => (
                  <AgentCard
                    key={pilot.agentId}
                    pilot={pilot}
                    onStatusToggle={toggleAgentStatus}
                    onDelete={setAgentToDelete}
                    onSettings={setSelectedAgent}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                  <Bot className="h-12 w-12 text-gray-400" />
                  <h3 className="text-xl font-medium">No agents configured</h3>
                  <p className="text-sm text-gray-500 max-w-md">
                    Create your first agent to start automating job
                    applications.
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between border-t pt-6 bg-gray-50">
              <Button
                variant="outline"
                onClick={() => setView('dashboard')}
                disabled={loading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                onClick={startNewAgentWizard}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />{' '}
                {autoPilot.length > 0 ? 'Add New Agent' : 'Create First Agent'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Dialog
        open={!!agentToDelete}
        onOpenChange={(open) => !open && setAgentToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Agent</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the agent "
              {agentToDelete?.agentName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAgentToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// --- SUB-COMPONENTS ---
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 transform hover:scale-105 transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className={`text-2xl font-bold text-gray-800`}>{value}</p>
      </div>
      <div className={`p-3 bg-${color}-100 rounded-lg`}>
        {React.cloneElement(icon as React.ReactElement, {
          className: `w-5 h-5 text-${color}-600`,
        })}
      </div>
    </div>
  </div>
);

const AgentCard: React.FC<{
  pilot: PilotAgent;
  onStatusToggle: (id: string) => void;
  onDelete: (agent: PilotAgent) => void;
  onSettings: (agent: PilotAgent) => void;
}> = ({ pilot, onStatusToggle, onDelete, onSettings }) => {
  const progress = pilot.autopilotLimit
    ? Math.min(
        ((pilot.applicationsToday || 0) / pilot.autopilotLimit) * 100,
        100,
      )
    : 0;

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-white hover:border-blue-500 transition-all duration-300 transform hover:scale-[1.01]">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div
              className={`relative p-3 rounded-xl ${
                pilot.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
              }`}
            >
              <Bot
                className={`w-6 h-6 ${
                  pilot.status === 'active' ? 'text-green-600' : 'text-gray-500'
                }`}
              />
              {pilot.status === 'active' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white"></div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-blue-600">
                  {pilot.agentName}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    pilot.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {pilot.status === 'active' ? 'Active' : 'Paused'}
                </span>
              </div>
              <p className="text-sm text-gray-500 flex items-center mb-2">
                <Target className="w-4 h-4 mr-2" />
                {pilot.jobTitle}
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Created:{' '}
                  {new Date(pilot.createdAt || Date.now()).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {pilot.lastActivity}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onStatusToggle(pilot.agentId)}
              title={pilot.status === 'active' ? 'Pause Agent' : 'Start Agent'}
            >
              {pilot.status === 'active' ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSettings(pilot)}
              title="Configure Agent"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(pilot)}
              className="text-red-500 hover:text-red-600"
              title="Delete Agent"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between mb-1 text-sm">
            <span className="font-medium text-gray-700">Today's Progress</span>
            <span className="text-gray-500">
              {pilot.applicationsToday || 0}/{pilot.autopilotLimit}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-gray-50 rounded-md">
              <p className="text-sm font-bold text-gray-800">
                {pilot.totalApplications}
              </p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="p-2 bg-gray-50 rounded-md">
              <p className="text-sm font-bold text-green-600">
                {pilot.successRate}%
              </p>
              <p className="text-xs text-gray-500">Success</p>
            </div>
            <div className="p-2 bg-gray-50 rounded-md">
              <p className="text-sm font-bold text-blue-600">
                {pilot.autopilotLimit}
              </p>
              <p className="text-xs text-gray-500">Limit</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroWizard;
