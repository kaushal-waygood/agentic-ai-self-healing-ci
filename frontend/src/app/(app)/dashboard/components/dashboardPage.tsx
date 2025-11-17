'use client';

import { Button } from '@/components/ui/button';

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
  Bookmark,
  Calendar,
  Zap,
  Infinity,
  Briefcase,
  Globe,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import { mockUserProfile, ActionItem } from '@/lib/data/user';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfileRequest } from '@/redux/reducers/authReducer';
import apiInstance from '@/services/api';
import useProfileCompletion from '@/hooks/useProfileCompletion';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { JobCard } from '@/components/jobs/job-card';
import { ApplicationRow } from './applications/components/statusConfig';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

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
    { key: 'coreProfile', label: 'Basic Info' },
    { key: 'workExperience', label: 'Work Experience' },
    { key: 'education', label: 'Education Details' },
    { key: 'skills', label: 'Skills (10+)' },
    { key: 'projects', label: 'Projects' },
    { key: 'jobPreferences', label: 'Job Preferences' },
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

  const tabRoutes = {
    basicInfo: 'education',
    educationDetails: 'education',
    projects: 'project',
    workExperience: 'experience',
    skills: 'skills',
    jobPreferences: 'jobPreferences',
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
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
            onClick={() => {
              const tab = tabRoutes[key] || 'education';
              router.push(`/dashboard/profile?tab=${tab}`);
            }}
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

      {/* --- NEW SECTION: SUGGESTION TO COMPLETE PROFILE --- */}
      {score < 100 && (
        <div className="mt-6 text-center border-t border-gray-200 pt-5">
          <p className="text-sm text-gray-600 mb-4">
            A complete profile gets <strong>5x more views</strong>. Fill out the
            remaining sections to boost your visibility!
          </p>
          <Button
            asChild
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Link href="/dashboard/profile">
              Go to Profile
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export function ActionItemCard({ item, onMarkAsRead }: any) {
  const getTypeIcon = (type: any) => {
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

// A small component to render a single usage meter with a progress bar
function UsageMeter({ label, used, limit }: any) {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);

  const getProgressColor = () => {
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 70) return 'bg-yellow-500';
    return 'bg-purple-500';
  };

  const formatUsageKey = (key) => {
    const map = {
      cvCreation: 'CV Creations',
      coverLetter: 'Cover Letters',
      aiApplication: 'AI Applications',
      autoApply: 'Auto-Apply Credits',
    };
    return map[key] || key;
  };

  // Helper to get a relevant icon for each usage type
  const getUsageIcon = (key: any) => {
    const iconMap: any = {
      cvCreation: <FileText className="w-5 h-5 text-blue-500" />,
      coverLetter: <Send className="w-5 h-5 text-cyan-500" />,
      aiApplication: <Zap className="w-5 h-5 text-yellow-500" />,
      autoApply: <Bot className="w-5 h-5 text-green-500" />,
    };
    return iconMap[key] || <Zap className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0">{getUsageIcon(label)}</div>
      <div className="flex-1">
        <div className="flex justify-between items-baseline mb-1">
          <p className="text-sm font-medium text-gray-700">
            {formatUsageKey(label)}
          </p>
          <p className="text-sm font-semibold text-gray-800">
            {used} /{' '}
            {isUnlimited ? <Infinity className="inline w-4 h-4" /> : limit}
          </p>
        </div>
        {!isUnlimited && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}

export function SubscriptionStatusCard({ plan }: any) {
  // Fallback UI if there's no active plan
  if (!plan || !plan.isActive) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Plan</h3>
        <p className="text-gray-600 text-sm mb-4">
          You do not have an active subscription.
        </p>
        <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
          <Link href="/dashboard/subscriptions">View Plans</Link>
        </Button>
      </div>
    );
  }

  // Helper to calculate days remaining until the plan's end date
  const calculateDaysRemaining = (endDateString) => {
    const end = new Date(endDateString);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    // Ceil to ensure if there's any time left in the last day, it counts as 1 day
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = calculateDaysRemaining(plan.endDate);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Your Plan: <span className="text-purple-600">{plan.planType}</span>
          </h3>
          <p className="text-sm text-gray-500 flex items-center mt-1">
            <Calendar className="w-4 h-4 mr-2" />
            Renews in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
          </p>
        </div>
        <div className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
          ACTIVE
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {/* Render a meter for each usage counter from the API */}
        {Object.keys(plan.usageCounters).map((key) =>
          key !== 'lastReset' ? (
            <UsageMeter
              key={key}
              label={key}
              used={plan.usageCounters[key]}
              limit={plan.usageLimits[key]}
            />
          ) : null,
        )}
      </div>

      <Button variant="outline" className="w-full" asChild>
        <Link href="/dashboard/billing">Manage Subscription</Link>
      </Button>
    </div>
  );
}

export default function DashboardPage() {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [stats, setStats] = useState({
    applicationsSent: 0,
    savedJobsCount: 0,
    cvsGenerated: 0,
    coverLettersGenerated: 0,
    referralCount: 0,
    tailoredApplications: 0,
    jobsViewed: 0,
    appliedJobsCount: 0,

    jobsVisited: 0,
  });
  const [statusChartData, setStatusChartData] = useState<any[]>([]);

  const [savedJobs, setSavedJobs] = useState([]);
  const [cvsGenerated, setCvsGenerated] = useState(0);
  const [coverLettersGenerated, setCoverLettersGenerated] = useState(0);

  const [planDetails, setPlanDetails] = useState(null);

  const dispatch = useDispatch();
  // Use the user from Redux as the single source of truth for authentication
  const { user: authUser } = useSelector((state: any) => state.auth);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch Job Stats
        const statsResponse = await apiInstance.get('/students/jobs/stats');
        const apiData = statsResponse.data;
        console.log('API Data:', apiData);

        setStats({
          applicationsSent: apiData.applicationsSent || 0,
          savedJobsCount: apiData.savedJobsCount || 0,
          cvsGenerated: apiData.cvsGenerated || 0,
          coverLettersGenerated: apiData.coverLettersGenerated || 0,
          referralCount: apiData.referralCount || 0,
          tailoredApplications: apiData.tailoredApplications || 0,
          jobsViewed: apiData.jobsViewed || 0,
          appliedJobsCount: apiData.appliedJobsCount || 0,

          jobsVisited: apiData.jobsVisited || 0,
        });

        const statusCounts = (apiData.applicationStats || []).reduce(
          (acc, stat) => {
            acc[stat.status] = stat.count;
            return acc;
          },
          {},
        );
        setStatusChartData([
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
        ]);

        // --- Fetch Plan Details ---
        const planResponse = await apiInstance.get('/plan/get-user-plan-type');
        if (planResponse.data.success) {
          setPlanDetails(planResponse.data.data);
        }

        // Mock action items
        setActionItems(mockUserProfile.actionItems || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    if (authUser) {
      fetchDashboardData();
    }
  }, [authUser]);

  useEffect(() => {
    if (!authUser) {
      dispatch(getProfileRequest());
    }
  }, [dispatch, authUser]);

  // Effect 2: Fetch dashboard stats, but ONLY after `authUser` is available.
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
          tailoredApplications: apiData.tailoredApplications || 0,
          jobsViewed: apiData.jobsViewed || 0,
          appliedJobsCount: apiData.appliedJobsCount || 0,

          jobsVisited: apiData.jobsVisited || 0,
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

    // This guard clause prevents the API call from being made without authentication.
    if (authUser) {
      fetchStats();
      // Mock action items for demonstration until API is ready
      setActionItems(mockUserProfile.actionItems || []);
    }
  }, [authUser]); // This dependency array solves the race condition.

  const handleMarkAsRead = (id: string) => {
    setActionItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, isRead: true } : item,
      ),
    );
  };

  useEffect(() => {
    const response = async () => {
      const response = await apiInstance.get('/students/jobs/stats');
    };

    response();
  }, []);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const response = await apiInstance.get('/students/jobs/saved-all');
        setSavedJobs(response.data.jobs);
      } catch (error) {
        console.error('Error fetching saved jobs:', error);
      }
    };

    fetchSavedJobs();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <LayoutDashboard className="w-8 h-8 mr-3 text-purple-600" />
            ZOBSAI Dashboard
          </h1>
          {/* MODIFIED: Use `authUser` directly from Redux */}
          <p className="text-gray-600 mt-1">
            Welcome back, {authUser?.fullName || 'User'}! Here's your job
            application progress.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 mb-8">
          {/* <div className="lg:col-span-2 space-y-8">
            <ProfileReadinessCard />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                title="Saved CVs"
                value={stats.cvsGenerated}
                icon={FileText}
                description="Total CVs generated with AI"
                color="blue"
                actionText="Manage CVs"
                actionLink="/dashboard/my-docs?tab=cvs"
              />
              <StatCard
                title="Cover Letters"
                value={stats.coverLettersGenerated}
                icon={Bot}
                description="Documents prepared with AI"
                color="green"
                actionText="Create More"
                actionLink="dashboard/my-docs?tab=cover-letters"
              />
              <StatCard
                title="Applications Tracked"
                value={stats.tailoredApplications}
                icon={Send}
                description="Total applications in your pipeline"
                color="purple"
                actionText="View Applications"
                actionLink="/dashboard/my-docs?tab=applications"
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
                title="Viewed Jobs"
                value={stats.jobsViewed}
                icon={Bookmark}
                description="Jobs you’ve recently viewed"
                color="cyan"
                actionText="View Saved Jobs"
                actionLink="/dashboard/applications?status=Saved"
              />
              <StatCard
                title="Applied Jobs"
                value={stats.appliedJobsCount}
                icon={Bookmark}
                description="Jobs you’ve officially applied for through the platform"
                color="cyan"
                actionText="View Saved Jobs"
                actionLink="/dashboard/applications?status=Saved"
              />
              <StatCard
                title="Visited Jobs"
                value={stats.visitedJobs}
                icon={Bookmark}
                description="Job listings you’ve opened but not saved or applied to"
                color="cyan"
                actionText="View Saved Jobs"
                actionLink="/dashboard/applications?status=Saved"
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
          </div> */}

          <div className="lg:col-span-2 space-y-8">
            <ProfileReadinessCard />
            {/* 🚀 APPLICATIONS SECTION */}
            <div>
              <h2 className="text-xl font-semibold mt-8 mb-4 text-slate-800 dark:text-white">
                My Documents
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                  title="Applications Tracked"
                  value={stats.tailoredApplications}
                  icon={Send}
                  description="Total job applications currently in your pipeline."
                  color="cyan"
                  actionText="View Applications"
                  actionLink="/dashboard/my-docs?tab=applications"
                />
                <StatCard
                  title="Saved CVs"
                  value={stats.cvsGenerated}
                  icon={FileText}
                  description="AI-generated CVs you’ve saved for future use."
                  color="purple"
                  actionText="Manage CVs"
                  actionLink="/dashboard/my-docs?tab=cvs"
                />
                <StatCard
                  title="Cover Letters"
                  value={stats.coverLettersGenerated}
                  icon={Bot}
                  description="Personalized cover letters created using AI."
                  color="blue"
                  actionText="Create More"
                  actionLink="/dashboard/my-docs?tab=cover-letters"
                />
              </div>
            </div>
            {/* 🧩 JOBS SECTION */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">
                My Applications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                  title="Saved Jobs"
                  value={stats.savedJobsCount}
                  icon={Bookmark}
                  description="Job opportunities you’ve bookmarked for later."
                  color="cyan"
                  actionText="View Saved Jobs"
                  actionLink="/dashboard/applications?status=Saved"
                />
                <StatCard
                  title="Viewed Jobs"
                  value={stats.jobsViewed}
                  icon={Eye}
                  description="Jobs you’ve recently explored on the platform."
                  color="purple"
                  actionText="View Viewed Jobs"
                  actionLink="/dashboard/applications?status=Viewed"
                />
                <StatCard
                  title="Visited Jobs"
                  value={stats.jobsVisited}
                  icon={Globe}
                  description="Job listings you’ve opened but not saved or applied to."
                  color="blue"
                  actionText="View Visited Jobs"
                  actionLink="/dashboard/applications?status=Visited"
                />
                <StatCard
                  title="Applied Jobs"
                  value={stats.appliedJobsCount}
                  icon={Briefcase}
                  description="Jobs you’ve officially applied for through the platform."
                  color="green"
                  actionText="View Applied Jobs"
                  actionLink="/dashboard/applications?status=Applied"
                />
              </div>
            </div>

            {/* 🎁 OTHERS SECTION */}
            <div>
              <h2 className="text-xl font-semibold mt-8 mb-4 text-slate-800 dark:text-white">
                Others
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                  title="Referral Count"
                  value={stats.referralCount}
                  icon={Award}
                  description="Successful referrals you’ve made to friends."
                  color="cyan"
                  actionText="Refer Friends"
                  actionLink="/dashboard/referrals"
                />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <SubscriptionStatusCard plan={planDetails} />

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
      </div>
    </div>
  );
}
