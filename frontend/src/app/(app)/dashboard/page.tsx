'use client';

import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  LayoutDashboard,
  Send,
  Bot,
  FilePlus2,
  Wand2,
  Search,
  MailWarning,
  Bell,
  Award,
  FileText,
  Filter,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Target,
  Play,
  Bookmark, // Icon for Saved Jobs
} from 'lucide-react';
import Link from 'next/link';
import { mockApplications } from '@/lib/data/applications';
import {
  mockUserProfile,
  UserProfile,
  ActionItem,
  mockOrganizations,
  planTierOrder,
} from '@/lib/data/user';
import {
  mockSubscriptionPlans,
  SubscriptionPlan,
} from '@/lib/data/subscriptions';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfileRequest } from '@/redux/reducers/authReducer';
import apiInstance from '@/services/api';
import useProfileCompletion from '@/hooks/useProfileCompletion';

// Recharts imports
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// --- Reusable Dashboard Components ---

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  color = 'purple',
  actionText,
  actionLink,
}: any) {
  const colorClasses = {
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    cyan: 'from-cyan-500 to-cyan-600',
    green: 'from-green-500 to-green-600',
  };

  return (
    <div className="group relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div
        className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${colorClasses[color]}`}
      ></div>
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]} text-white shadow-lg`}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{value}</div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          <p className="text-sm text-gray-500 min-h-[40px] mb-4">
            {description}
          </p>
          {actionLink && (
            <Link
              href={actionLink}
              className="text-sm font-semibold text-purple-600 hover:text-purple-800 flex items-center group-hover:underline"
            >
              {actionText}
              <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function ToolkitButton({
  icon: Icon,
  title,
  description,
  href,
  color = 'purple',
}: any) {
  const colorClasses = {
    purple: 'hover:bg-purple-50 border-purple-200 text-purple-700',
    blue: 'hover:bg-blue-50 border-blue-200 text-blue-700',
    cyan: 'hover:bg-cyan-50 border-cyan-200 text-cyan-700',
    green: 'hover:bg-green-50 border-green-200 text-green-700',
  };
  const iconBgClasses = {
    purple: 'from-purple-100 to-purple-200',
    blue: 'from-blue-100 to-blue-200',
    cyan: 'from-cyan-100 to-cyan-200',
    green: 'from-green-100 to-green-200',
  };

  return (
    <Link href={href} passHref>
      <button
        className={cn(
          'w-full p-4 rounded-xl border-2 border-dashed transition-all duration-200 hover:border-solid hover:shadow-md group',
          colorClasses[color],
        )}
      >
        <div className="flex items-start space-x-3">
          <div
            className={cn(
              'p-2 rounded-lg bg-gradient-to-r',
              iconBgClasses[color],
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 text-left">
            <h4 className="font-semibold text-gray-900 group-hover:text-purple-700">
              {title}
            </h4>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
          <Play className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
        </div>
      </button>
    </Link>
  );
}

export function ProfileReadinessCard() {
  const { data, isLoading, error } = useProfileCompletion();

  if (isLoading || !data) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col items-center justify-center h-[200px] text-center text-gray-500 border-2 border-dashed rounded-lg">
          <p className="font-medium">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col items-center justify-center h-[200px] text-center text-red-500 border-2 border-dashed border-red-200 rounded-lg">
          <p className="font-medium">Error loading data</p>
        </div>
      </div>
    );
  }

  const checklistItems = [
    { key: 'coreProfile', label: 'Basic Info & Preferences' },
    { key: 'workExperience', label: 'Work Experience' },
    { key: 'education', label: 'Education Details' },
    { key: 'skills', label: 'Skills (10+ recommended)' },
  ];

  const score = data.percentage;
  const checks = data.categories;

  const getScoreColor = (scoreValue) => {
    if (scoreValue >= 80) return 'text-green-600';
    if (scoreValue >= 60) return 'text-yellow-600';
    return 'text-red-500';
  };

  const getProgressColor = (scoreValue) => {
    if (scoreValue >= 80) return 'from-green-400 to-green-600';
    if (scoreValue >= 60) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Profile Readiness
          </h3>
          <p className="text-gray-600 text-sm">
            Complete your profile to attract more opportunities
          </p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
            {score}%
          </div>
          <p className="text-sm text-gray-500">Complete</p>
        </div>
      </div>

      <div className="relative w-full h-3 bg-gray-200 rounded-full mb-6 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getProgressColor(
            score,
          )} transition-all duration-1000 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {checklistItems.map(({ key, label }) => (
          <div
            key={key}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
          >
            <CheckCircle2
              className={`w-5 h-5 transition-colors duration-300 ${
                checks?.[key] ? 'text-green-600' : 'text-gray-300'
              }`}
            />
            <span
              className={`text-sm transition-colors duration-300 ${
                checks?.[key] ? 'text-gray-900 font-medium' : 'text-gray-500'
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActionItemCard({ item, onMarkAsRead }) {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'reward':
        return <Award className="w-5 h-5 text-yellow-500" />;
      case 'recommendation':
        return <Target className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'reward':
        return 'border-l-yellow-400 bg-yellow-50';
      case 'recommendation':
        return 'border-l-blue-400 bg-blue-50';
      default:
        return 'border-l-gray-400 bg-gray-50';
    }
  };

  return (
    <Link href={item.href} passHref>
      <div
        className={cn(
          'p-4 rounded-r-xl border-l-4 cursor-pointer transition-all duration-200 hover:shadow-md',
          item.isRead
            ? 'border-l-gray-200 bg-gray-50 opacity-60'
            : getTypeColor(item.type),
        )}
        onClick={() => onMarkAsRead(item.id)}
      >
        <div className="flex items-start space-x-3">
          {getTypeIcon(item.type)}
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${
                item.isRead ? 'text-gray-500' : 'text-gray-900'
              }`}
            >
              {item.summary}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(item.date).toLocaleDateString()}
            </p>
          </div>
          {!item.isRead && (
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-1"></div>
          )}
        </div>
      </div>
    </Link>
  );
}

// --- Main Dashboard Page Component ---

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [stats, setStats] = useState({
    applicationsSent: 0,
    savedJobsCount: 0,
    cvsGenerated: 0,
    coverLettersGenerated: 0,
    referralCount: 0,
  });
  const [statusChartData, setStatusChartData] = useState<any[]>([]);

  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state: any) => state.auth);

  useEffect(() => {
    dispatch(getProfileRequest());
    setUser(authUser);
  }, [dispatch]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiInstance.get('/students/jobs/stats');
        const apiData = response.data;

        setStats({
          applicationsSent: apiData.applicationsSent || 0,
          savedJobsCount: apiData.savedJobsCount || 0,
          cvsGenerated: apiData.cvsGenerated || 0,
          coverLettersGenerated: apiData.coverLettersGenerated || 0,
          referralCount: apiData.referralCount || 0,
        });

        const applicationStats = apiData.applicationStats || [];
        const statusCounts = applicationStats.reduce((acc, stat) => {
          acc[stat.status] = stat.count;
          return acc;
        }, {});

        const chartData = [
          {
            status: 'Sent',
            applications: statusCounts['Sent'] || 0,
            color: '#8b5cf6',
          },
          {
            status: 'Reviewed',
            applications: statusCounts['Reviewed'] || 0,
            color: '#3b82f6',
          },
          {
            status: 'Interview',
            applications: statusCounts['Interview'] || 0,
            color: '#06b6d4',
          },
          {
            status: 'Rejected',
            applications: statusCounts['Rejected'] || 0,
            color: '#ef4444',
          },
        ];
        setStatusChartData(chartData);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
    // Mock action items for demonstration until API is ready
    setActionItems(mockUserProfile.actionItems || []);
  }, []);

  const handleMarkAsRead = (id: string) => {
    setActionItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, isRead: true } : item,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <LayoutDashboard className="w-8 h-8 mr-3 text-purple-600" />
              Job Search Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.fullName || 'User'}! Here's your job
              application progress.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 mb-8">
          <div className="lg:col-span-2 space-y-8">
            <ProfileReadinessCard />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                title="Applications Tracked"
                value={stats.applicationsSent}
                icon={Send}
                description="Total applications in your pipeline"
                color="purple"
                actionText="View Applications"
                actionLink="/dashboard/applications"
              />
              <StatCard
                title="Saved CVs"
                value={stats.cvsGenerated}
                icon={FileText}
                description="Total CVs generated with AI"
                color="blue"
                actionText="Manage CVs"
                actionLink="/dashboard/cv-generator"
              />
              <StatCard
                title="Saved Jobs"
                value={stats.savedJobsCount}
                icon={Bookmark}
                description="Opportunities you are watching"
                color="cyan"
                actionText="View Saved Jobs"
                actionLink="/dashboard/applications?status=Saved"
              />
              <StatCard
                title="Cover Letters"
                value={stats.coverLettersGenerated}
                icon={Bot}
                description="Documents prepared with AI"
                color="green"
                actionText="Create More"
                actionLink="/dashboard/cover-letter-generator"
              />
              <StatCard
                title="Referral Count"
                value={stats.referralCount}
                icon={Award}
                description="Successful referrals made"
                color="purple"
                actionText="Refer Friends"
                actionLink="/dashboard/referrals"
              />
            </div>
          </div>
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Core AI Toolkit
                </h3>
                <p className="text-gray-600 text-sm">
                  Your essential tools for a smarter job search.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <ToolkitButton
                  href="/dashboard/search-jobs"
                  icon={Search}
                  title="Search & Apply"
                  description="Find your next job opportunity."
                  color="purple"
                />
                <ToolkitButton
                  href="/dashboard/apply"
                  icon={Wand2}
                  title="Application Wizard"
                  description="Tailor docs for a specific job."
                  color="blue"
                />
                <ToolkitButton
                  href="/dashboard/cv-generator"
                  icon={FilePlus2}
                  title="AI CV Generator"
                  description="Craft a standout CV from scratch."
                  color="cyan"
                />
                <ToolkitButton
                  href="/dashboard/ai-auto-apply"
                  icon={Bot}
                  title="AI Auto-Apply Agents"
                  description="Automate your job search."
                  color="green"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Application Pipeline
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Track your application progress
                  </p>
                </div>
                <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
              {statusChartData.some((d) => d.applications > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusChartData} margin={{ left: -20 }}>
                    <XAxis
                      dataKey="status"
                      axisLine={false}
                      tickLine={false}
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis
                      dataKey="applications"
                      axisLine={false}
                      tickLine={false}
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <Bar dataKey="applications" radius={[8, 8, 0, 0]}>
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[250px] text-center text-gray-500 border-2 border-dashed rounded-lg">
                  <p className="font-medium">No application data yet.</p>
                  <p className="text-sm">
                    Apply for jobs to see your stats here.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                    asChild
                  >
                    <Link href="/dashboard/search-jobs">Find a Job</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-8">
            <div
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              id="action-items"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MailWarning className="h-6 w-6 text-purple-600" />
                    Action Items
                  </h3>
                  <p className="text-gray-600 text-sm">
                    AI-flagged tasks and important updates.
                  </p>
                </div>
              </div>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {actionItems.length > 0 ? (
                  actionItems.map((item) => (
                    <ActionItemCard
                      key={item.id}
                      item={item}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-medium">You're all caught up!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
