'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  Users,
  Target,
  MousePointerClick,
  Zap,
  TrendingUp,
  Briefcase,
  Cpu,
  Activity,
  Database,
  UserCheck,
  Share2,
  Clock,
  Calendar,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { useAnalyticsStore } from '@/store/analytics.store';

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
];

export default function FullDashboard() {
  const {
    analytics,
    userAnalytics,
    geminiAnalytics,
    loading,
    fetchAnalytics,
    fetchUserAnalytics,
    fetchGeminiAnalytics,
  } = useAnalyticsStore();

  const [activeTab, setActiveTab] = useState('jobs');

  // Helper to format date as YYYY-MM-DD
  const formatDate = (date) => date.toISOString().split('T')[0];

  // Initialize state with last 7 days
  const [dateRange, setDateRange] = useState({
    from: formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
    to: formatDate(new Date()),
  });

  // Fetch Job Analytics whenever the date range changes
  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      fetchAnalytics(dateRange);
    }
  }, [dateRange, fetchAnalytics]);

  // Fetch static analytics on mount
  useEffect(() => {
    fetchUserAnalytics();
    fetchGeminiAnalytics();
  }, [fetchUserAnalytics, fetchGeminiAnalytics]);

  // Logic for the Preset Dropdown
  const handlePresetChange = (e) => {
    const val = e.target.value;
    if (val === 'custom') return;

    const days = parseInt(val);
    const newFrom = formatDate(
      new Date(Date.now() - days * 24 * 60 * 60 * 1000),
    );
    const newTo = formatDate(new Date());

    setDateRange({ from: newFrom, to: newTo });
  };

  // Logic for manual date input change
  const handleManualDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  if (loading && !analytics) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header Area */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Platform Insights
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-4">
            {/* Styled Preset Dropdown */}
            <div className="relative">
              <select
                onChange={handlePresetChange}
                className="appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-4 pr-10 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer shadow-sm hover:border-slate-300 transition-all"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="custom">Custom Range</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={16}
              />
            </div>

            {/* From/To Date Inputs */}
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl shadow-sm px-4 py-2 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" />
                <input
                  type="date"
                  name="from"
                  value={dateRange.from}
                  onChange={handleManualDateChange}
                  className="bg-transparent border-none text-sm font-bold text-slate-700 focus:outline-none cursor-pointer"
                />
              </div>

              <ArrowRight size={14} className="mx-3 text-slate-300" />

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  name="to"
                  value={dateRange.to}
                  onChange={handleManualDateChange}
                  className="bg-transparent border-none text-sm font-bold text-slate-700 focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            <p className="text-slate-500 text-sm font-medium">
              Real-time performance metrics
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-200/60 p-1.5 rounded-2xl backdrop-blur-sm">
          <TabButton
            active={activeTab === 'jobs'}
            onClick={() => setActiveTab('jobs')}
            icon={<Briefcase size={16} />}
            label="Job Stats"
          />
          <TabButton
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
            icon={<Users size={16} />}
            label="User Growth"
          />
          <TabButton
            active={activeTab === 'ai'}
            onClick={() => setActiveTab('ai')}
            icon={<Cpu size={16} />}
            label="AI Engine"
          />
        </div>
      </div>

      <main className="max-w-7xl mx-auto">
        {activeTab === 'jobs' && <JobView data={analytics} />}
        {activeTab === 'users' && <UserView data={userAnalytics} />}
        {activeTab === 'ai' && <AiView data={geminiAnalytics} />}
      </main>
    </div>
  );
}

/** --- SUB-VIEWS --- **/

function JobView({ data }) {
  if (!data) return null;
  const funnelData = data.funnel7d.labels.map((l, i) => ({
    name: l,
    count: data.funnel7d.series[i],
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Interactions"
          value={data.kpis.totalInteractions.toLocaleString()}
          icon={<MousePointerClick />}
          color="blue"
        />
        <StatCard
          title="Total Applications"
          value={data.kpis.totalApplications}
          icon={<Briefcase />}
          color="green"
        />
        <StatCard
          title="Conv. Rate"
          value={`${data.kpis.conversionRate}%`}
          icon={<Target />}
          color="amber"
        />
        <StatCard
          title="Range Volume"
          value={data.kpis.applicationsRange}
          icon={<TrendingUp />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Activity className="text-blue-500" size={20} /> Conversion Funnel
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={funnelData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                }}
              />
              <Bar
                dataKey="count"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
                barSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6">Top Performing Jobs</h3>
          <div className="space-y-4">
            {data.topJobs.slice(0, 6).map((job) => (
              <div
                key={job.jobId}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50"
              >
                <div className="overflow-hidden">
                  <p className="text-[10px] font-mono text-slate-400 uppercase">
                    ID: {job.jobId.slice(-6)}
                  </p>
                  <p className="font-bold text-slate-700">{job.views} Views</p>
                </div>
                <div className="text-right">
                  <span className="text-green-600 font-black text-lg">
                    {job.applies}
                  </span>
                  <p className="text-[10px] uppercase font-bold text-slate-400">
                    Applies
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserView({ data }) {
  if (!data) return null;
  const featureData = data.distributions.featureUsage.labels.map((l, i) => ({
    name: l,
    value: data.distributions.featureUsage.series[i],
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Registered"
          value={data.kpis.totalUsers}
          icon={<Users />}
          color="blue"
        />
        <StatCard
          title="Onboarding Rate"
          value={`${data.kpis.onboardingRate}%`}
          icon={<UserCheck />}
          color="green"
        />
        <StatCard
          title="Referral Count"
          value={data.kpis.referralUsers}
          icon={<Share2 />}
          color="amber"
        />
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-8">Feature Popularity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 items-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={featureData}
                innerRadius={80}
                outerRadius={110}
                paddingAngle={8}
                dataKey="value"
              >
                {featureData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-4">
            {featureData.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-slate-600 font-medium">{f.name}:</span>
                <span className="font-bold text-slate-900">
                  {f.value} Actions
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AiView({ data }) {
  if (!data) return null;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="API Invocations"
          value={data.kpis.totalCalls}
          icon={<Zap />}
          color="amber"
        />
        <StatCard
          title="Total Tokens"
          value={`${(data.kpis.totalTokens / 1000000).toFixed(1)}M`}
          icon={<Database />}
          color="blue"
        />
        <StatCard
          title="Avg Latency"
          value={`${(data.kpis.avgLatencyMs / 1000).toFixed(1)}s`}
          icon={<Clock />}
          color="purple"
        />
        <StatCard
          title="Success Rate"
          value="99.2%"
          icon={<Activity />}
          color="green"
        />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Top Power Users</h3>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Token Consumption
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase tracking-widest bg-slate-50/50">
                <th className="px-6 py-4 font-semibold">Rank</th>
                <th className="px-6 py-4 font-semibold">Identifier</th>
                <th className="px-6 py-4 font-semibold">Total Calls</th>
                <th className="px-6 py-4 font-semibold text-right">Usage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.tables.topUsers.rows.slice(0, 10).map((row) => (
                <tr
                  key={row.userId}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-slate-400">
                    #{row.rank}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-600">
                    {row.userId}
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-medium">
                    {row.calls}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold text-xs">
                      {(row.totalTokens / 1000).toFixed(0)}k tkn
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/** --- ATOMS --- **/

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
        active
          ? 'bg-white text-blue-600 shadow-lg'
          : 'text-slate-500 hover:text-slate-800'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function StatCard({ title, value, icon, color }) {
  const variants = {
    blue: 'bg-blue-500 text-white shadow-blue-200',
    green: 'bg-emerald-500 text-white shadow-emerald-200',
    amber: 'bg-amber-500 text-white shadow-amber-200',
    purple: 'bg-violet-500 text-white shadow-violet-200',
  };
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-start transition-transform hover:scale-[1.02]">
      <div className={`p-2.5 rounded-2xl mb-4 shadow-lg ${variants[color]}`}>
        {React.cloneElement(icon, { size: 22 })}
      </div>
      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
        {title}
      </p>
      <h4 className="text-3xl font-black text-slate-800 mt-1">{value}</h4>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-gray-500 font-medium animate-pulse">
          Syncing data...
        </p>
      </div>
    </div>
  );
}
