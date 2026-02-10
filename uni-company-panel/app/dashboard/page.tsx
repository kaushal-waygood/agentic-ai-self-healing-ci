'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Briefcase,
  FileText,
  Users,
  Building2,
  LayoutDashboard,
  Calendar,
  ArrowRight,
  Target,
  MousePointerClick,
  Zap,
  Database,
  Clock,
  UserCheck,
  Share2,
  PieChart as PieChartIcon,
  DollarSign,
  BarChart as BarChartIcon,
  LineChart,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  Filter,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
];

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  // ========== OVERVIEW TAB DATA ==========
  const overviewStats = [
    {
      title: 'Total Jobs Posted',
      value: '247',
      change: '+12.5%',
      trending: 'up',
      icon: Briefcase,
      color: 'blue',
    },
    {
      title: 'Active Candidates',
      value: '1,856',
      change: '+8.2%',
      trending: 'up',
      icon: Users,
      color: 'green',
    },
    {
      title: 'Companies',
      value: '89',
      change: '+5.1%',
      trending: 'up',
      icon: Building2,
      color: 'purple',
    },
    {
      title: 'Applications',
      value: '3,247',
      change: '+18.7%',
      trending: 'up',
      icon: FileText,
      color: 'amber',
    },
  ];

  const pendingActions = [
    {
      title: 'New Job Applications',
      count: 45,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'Pending Approvals',
      count: 12,
      color: 'bg-yellow-100 text-yellow-700',
    },
    {
      title: 'Profile Reviews',
      count: 23,
      color: 'bg-purple-100 text-purple-700',
    },
    { title: 'Messages', count: 8, color: 'bg-green-100 text-green-700' },
  ];

  const recentActivities = [
    {
      company: 'Google Inc.',
      action: 'posted Software Engineer position',
      time: '5 min ago',
      type: 'job',
      status: 'success',
    },
    {
      candidate: 'John Doe',
      action: 'applied for Frontend Developer',
      time: '15 min ago',
      type: 'application',
      status: 'success',
    },
    {
      company: 'Microsoft Corp.',
      action: 'updated company profile',
      time: '1 hour ago',
      type: 'company',
      status: 'success',
    },
    {
      candidate: 'Sarah Wilson',
      action: 'completed profile verification',
      time: '2 hours ago',
      type: 'candidate',
      status: 'pending',
    },
    {
      company: 'Amazon',
      action: 'posted Product Manager role',
      time: '3 hours ago',
      type: 'job',
      status: 'success',
    },
  ];

  const topCategories = [
    { name: 'Software Development', jobs: 84, percentage: 100 },
    { name: 'Product Management', jobs: 62, percentage: 74 },
    { name: 'Data Science', jobs: 45, percentage: 54 },
    { name: 'UI/UX Design', jobs: 38, percentage: 45 },
    { name: 'DevOps', jobs: 28, percentage: 33 },
  ];

  const quickActions = [
    {
      label: 'Post a Job',
      icon: Briefcase,
      color: 'blue',
      onClick: () => router.push('/dashboard/post-job'),
    },
    {
      label: 'View Candidates',
      icon: Users,
      color: 'green',
      onClick: () => router.push('/dashboard/candidates'),
    },
    {
      label: 'Manage Companies',
      icon: Building2,
      color: 'purple',
      onClick: () => router.push('/dashboard/companies'),
    },
    {
      label: 'Generate Report',
      icon: FileText,
      color: 'orange',
      onClick: () => console.log('Generate Report'),
    },
  ];

  // ========== ANALYTICS TAB DATA ==========
  const analyticsStats = [
    {
      title: 'Conversion Rate',
      value: '24.8%',
      change: '+3.2%',
      trending: 'up',
      icon: Target,
      color: 'green',
    },
    {
      title: 'Avg Time to Hire',
      value: '18.5 days',
      change: '-2.1 days',
      trending: 'down',
      icon: Clock,
      color: 'blue',
    },
    {
      title: 'Candidate Quality',
      value: '8.7/10',
      change: '+0.4',
      trending: 'up',
      icon: UserCheck,
      color: 'purple',
    },
  ];

  const performanceTrends = [
    { month: 'Jan', applications: 2800, hires: 45 },
    { month: 'Feb', applications: 2950, hires: 52 },
    { month: 'Mar', applications: 3100, hires: 58 },
    { month: 'Apr', applications: 3247, hires: 64 },
  ];

  const conversionData = [
    { stage: 'Applications', count: 3247, percentage: 100 },
    { stage: 'Screened', count: 2598, percentage: 80 },
    { stage: 'Interviewed', count: 1299, percentage: 40 },
    { stage: 'Offered', count: 779, percentage: 24 },
    { stage: 'Hired', count: 649, percentage: 20 },
  ];

  const sourceData = [
    { name: 'LinkedIn', value: 45, color: '#3b82f6' },
    { name: 'Company Website', value: 25, color: '#10b981' },
    { name: 'Job Portals', value: 18, color: '#f59e0b' },
    { name: 'Referrals', value: 12, color: '#ef4444' },
  ];

  // ========== ACTIVITY TAB DATA ==========
  const activityMetrics = [
    {
      title: 'Active Sessions',
      value: '247',
      change: '+15.3%',
      trending: 'up',
      icon: Activity,
      color: 'blue',
    },
    {
      title: 'API Requests',
      value: '15.2k',
      change: '+28.7%',
      trending: 'up',
      icon: Zap,
      color: 'amber',
    },
    {
      title: 'Avg Response Time',
      value: '142ms',
      change: '-12.4%',
      trending: 'down',
      icon: Clock,
      color: 'green',
    },
    {
      title: 'Error Rate',
      value: '0.42%',
      change: '-0.08%',
      trending: 'down',
      icon: AlertCircle,
      color: 'purple',
    },
  ];

  const systemLogs = [
    {
      id: 1,
      user: 'admin@company.com',
      action: 'Updated job posting settings',
      time: 'Just now',
      type: 'system',
      status: 'info',
    },
    {
      id: 2,
      user: 'john@google.com',
      action: 'Posted new job: Senior Backend Engineer',
      time: '5 min ago',
      type: 'job',
      status: 'success',
    },
    {
      id: 3,
      user: 'sarah@microsoft.com',
      action: 'Failed login attempt - wrong password',
      time: '15 min ago',
      type: 'security',
      status: 'warning',
    },
    {
      id: 4,
      user: 'System',
      action: 'Database backup completed successfully',
      time: '1 hour ago',
      type: 'system',
      status: 'success',
    },
    {
      id: 5,
      user: 'candidate-12345',
      action: 'Completed profile verification',
      time: '2 hours ago',
      type: 'candidate',
      status: 'success',
    },
    {
      id: 6,
      user: 'admin@company.com',
      action: 'Exported analytics report',
      time: '3 hours ago',
      type: 'report',
      status: 'info',
    },
  ];

  const userEngagement = [
    { hour: '9 AM', users: 45, sessions: 67 },
    { hour: '10 AM', users: 89, sessions: 124 },
    { hour: '11 AM', users: 112, sessions: 167 },
    { hour: '12 PM', users: 98, sessions: 145 },
    { hour: '1 PM', users: 76, sessions: 112 },
    { hour: '2 PM', users: 105, sessions: 158 },
    { hour: '3 PM', users: 134, sessions: 201 },
    { hour: '4 PM', users: 121, sessions: 182 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header Area */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Admin Dashboard
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-4">
            {/* Date Range Selector */}
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl shadow-sm px-4 py-2 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-700">
                  Today
                </span>
              </div>
              <ArrowRight size={14} className="mx-3 text-slate-300" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-700">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>

            <p className="text-slate-500 text-sm font-medium">
              Real-time platform overview
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-200/60 p-1.5 rounded-2xl backdrop-blur-sm">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon={<LayoutDashboard size={16} />}
            label="Overview"
          />
          <TabButton
            active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
            icon={<BarChart3 size={16} />}
            label="Analytics"
          />
          <TabButton
            active={activeTab === 'activity'}
            onClick={() => setActiveTab('activity')}
            icon={<Activity size={16} />}
            label="Activity"
          />
        </div>
      </div>

      <main className="max-w-7xl mx-auto">
        {activeTab === 'overview' && (
          <OverviewView 
            stats={overviewStats}
            recentActivities={recentActivities}
            topCategories={topCategories}
            pendingActions={pendingActions}
            quickActions={quickActions}
          />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsView 
            analyticsStats={analyticsStats}
            performanceTrends={performanceTrends}
            conversionData={conversionData}
            sourceData={sourceData}
          />
        )}
        {activeTab === 'activity' && (
          <ActivityView 
            activityMetrics={activityMetrics}
            systemLogs={systemLogs}
            userEngagement={userEngagement}
          />
        )}
      </main>
    </div>
  );
}

/** --- SUB-VIEWS --- **/

function OverviewView({ stats, recentActivities, topCategories, pendingActions, quickActions }) {
  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            trending={stat.trending}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Pending Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {pendingActions.map((action, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">
                {action.title}
              </span>
              <span
                className={`${action.color} px-3 py-1 rounded-full text-sm font-semibold`}
              >
                {action.count}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Activity className="text-blue-500" size={20} /> Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0 hover:bg-slate-50 -mx-2 px-2 py-2 rounded-xl transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'job'
                      ? 'bg-blue-100'
                      : activity.type === 'application'
                        ? 'bg-green-100'
                        : activity.type === 'company'
                          ? 'bg-purple-100'
                          : activity.type === 'candidate'
                          ? 'bg-orange-100'
                          : 'bg-gray-100'
                  }`}
                >
                  {activity.type === 'job' ? (
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  ) : activity.type === 'application' ? (
                    <FileText className="w-5 h-5 text-green-600" />
                  ) : activity.type === 'company' ? (
                    <Building2 className="w-5 h-5 text-purple-600" />
                  ) : (
                    <Users className="w-5 h-5 text-orange-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">
                      {activity.company || activity.candidate}
                    </p>
                    {activity.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{activity.action}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 className="text-blue-500" size={20} /> Top Job Categories
          </h3>
          <div className="space-y-5">
            {topCategories.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">
                    {category.name}
                  </span>
                  <span className="text-sm font-semibold text-slate-600">
                    {category.jobs}
                  </span>
                </div>
                <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 hover:shadow-md transition-all hover:scale-[1.02]"
            >
              <div className={`p-3 rounded-xl ${getColorClass(action.color, 'bg')}`}>
                {React.createElement(action.icon, { className: `${getColorClass(action.color, 'text')} w-6 h-6` })}
              </div>
              <span className="text-sm font-bold text-slate-700">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsView({ analyticsStats, performanceTrends, conversionData, sourceData }) {
  return (
    <div className="space-y-6">
      {/* Analytics Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {analyticsStats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            trending={stat.trending}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <LineChart className="text-blue-500" size={20} /> Performance Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={performanceTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                }}
              />
              <Line
                type="monotone"
                dataKey="applications"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="hires"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Target className="text-blue-500" size={20} /> Conversion Funnel
          </h3>
          <div className="space-y-4">
            {conversionData.map((stage, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">
                    {stage.stage}
                  </span>
                  <div className="text-right">
                    <span className="text-slate-700 font-bold">{stage.count}</span>
                    <span className="text-slate-500 text-sm ml-2">
                      ({stage.percentage}%)
                    </span>
                  </div>
                </div>
                <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${stage.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Source Distribution */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-8">Candidate Sources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 items-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sourceData}
                innerRadius={80}
                outerRadius={110}
                paddingAngle={8}
                dataKey="value"
              >
                {sourceData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-4">
            {sourceData.map((source, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-slate-600 font-medium">{source.name}:</span>
                <span className="font-bold text-slate-900">
                  {source.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityView({ activityMetrics, systemLogs, userEngagement }) {
  return (
    <div className="space-y-6">
      {/* Activity Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {activityMetrics.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            trending={stat.trending}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Logs */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Activity className="text-blue-500" size={20} /> System Logs
            </h3>
            <button className="text-xs font-bold text-blue-600 hover:text-blue-800">
              View All →
            </button>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {systemLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start space-x-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  log.status === 'success' ? 'bg-green-100' :
                  log.status === 'warning' ? 'bg-yellow-100' :
                  log.status === 'info' ? 'bg-blue-100' : 'bg-red-100'
                }`}>
                  {log.status === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : log.status === 'warning' ? (
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                  ) : (
                    <Activity className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">{log.user}</p>
                    <p className="text-xs text-slate-500">{log.time}</p>
                  </div>
                  <p className="text-sm text-slate-600">{log.action}</p>
                  <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                    log.type === 'system' ? 'bg-blue-50 text-blue-700' :
                    log.type === 'job' ? 'bg-green-50 text-green-700' :
                    log.type === 'security' ? 'bg-red-50 text-red-700' :
                    'bg-purple-50 text-purple-700'
                  }`}>
                    {log.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Engagement Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Users className="text-blue-500" size={20} /> User Engagement
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={userEngagement}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hour" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                }}
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="sessions"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-slate-600">Active Users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-slate-600">Total Sessions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export & Actions */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Data Management</h3>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">
              <Filter size={16} /> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors">
              <Download size={16} /> Export Data
            </button>
          </div>
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

function StatCard({ title, value, change, trending, icon, color }) {
  const variants = {
    blue: 'bg-blue-500 text-white shadow-blue-200',
    green: 'bg-emerald-500 text-white shadow-emerald-200',
    amber: 'bg-amber-500 text-white shadow-amber-200',
    purple: 'bg-violet-500 text-white shadow-violet-200',
  };
  
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-start transition-transform hover:scale-[1.02]">
      <div className={`p-2.5 rounded-2xl mb-4 shadow-lg ${variants[color]}`}>
        {React.createElement(icon, { size: 22 })}
      </div>
      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
        {title}
      </p>
      <h4 className="text-3xl font-black text-slate-800 mt-1">{value}</h4>
      {change && trending && (
        <div className="flex items-center mt-3">
          {trending === 'up' ? (
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          ) : trending === 'down' ? (
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
          ) : null}
          <span
            className={`text-sm font-bold ${
              trending === 'up' ? 'text-green-600' : 
              trending === 'down' ? 'text-red-600' : 'text-slate-600'
            }`}
          >
            {change}
          </span>
          <span className="text-xs text-slate-500 ml-1">
            {trending === 'up' ? 'increase' : trending === 'down' ? 'decrease' : 'change'}
          </span>
        </div>
      )}
    </div>
  );
}

// Helper function for dynamic color classes
function getColorClass(color, type) {
  const colorMap = {
    blue: type === 'bg' ? 'bg-blue-100' : 'text-blue-600',
    green: type === 'bg' ? 'bg-green-100' : 'text-green-600',
    purple: type === 'bg' ? 'bg-purple-100' : 'text-purple-600',
    orange: type === 'bg' ? 'bg-orange-100' : 'text-orange-600',
  };
  return colorMap[color] || colorMap.blue;
}