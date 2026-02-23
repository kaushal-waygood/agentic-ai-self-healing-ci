'use client';

import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

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
  ArrowUpRight,
  ArrowRightSquare,
  MoveRight,
  Sparkles,
  CalendarClock,
  MousePointerClick,
  ScanSearch,
} from 'lucide-react';
import Link from 'next/link';

import { mockUserProfile, ActionItem } from '@/lib/data/user';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfileRequest } from '@/redux/reducers/authReducer';
import apiInstance from '@/services/api';
import useProfileCompletion from '@/hooks/useProfileCompletion';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import CompletionModal from './CompletionModel';
import { startDashboardTour } from './dashboardDriver';
import { SpendCreditsSection } from '@/components/credits/SpendCreditsSection';
import { useCredits } from '@/hooks/useCredits';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import OnboardingExperienceFeedback from '../onboarding-tour/OnboardingExperienceFeedback';
import { RootState } from '@/redux/rootReducer';
import { getStudentStatsRequest } from '@/redux/reducers/studentReducer';
import { Loader } from '@/components/Loader';

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
    <div className="group relative overflow-hidden rounded-lg bg-white border  transition-all duration-300 transform hover:-translate-y-1">
      <div
        className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${colorClasses[color]}`}
      ></div>
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]} text-white `}
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
              prefetch={false}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center group-hover:underline"
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
  comingSoon = false, // ⬅️ NEW
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
    <Link href={href} passHref prefetch={false}>
      <button
        className={cn(
          'relative w-full p-4 rounded-lg border-2 border-dashed transition-all duration-200 hover:border-solid group',
          colorClasses[color],
          comingSoon && 'opacity-60 cursor-not-allowed',
        )}
        disabled={comingSoon}
      >
        {/* 🔥 Coming Soon Badge */}
        {comingSoon && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
            Coming Soon
          </span>
        )}

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

          <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
        </div>
      </button>
    </Link>
  );
}

export function ProfileReadinessCard() {
  const { data, isLoading, error } = useProfileCompletion();

  const router = useRouter();

  if (isLoading || !data) {
    return <Loader imageClassName="w-6 h-6" textClassName="text-sm" />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6">
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

  if (score === 100) {
    return (
      <div className="bg-white relative overflow-hidden rounded-lg border border-gray-200 p-4 ">
        <div
          className="relative z-10 flex flex-col sm:flex-row 
                      items-start sm:items-center 
                      justify-between gap-4"
        >
          {/* Left */}
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center">
              <div
                className="relative flex h-12 w-12 items-center 
                            justify-center rounded-full bg-green-100"
              >
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Profile Complete
              </h3>
              <p className="text-sm text-gray-600">
                Your profile is 100% ready to go 🎉
              </p>
            </div>
          </div>

          {/* Right */}
          <Button
            asChild
            className="group bg-buttonPrimary hover:bg-blue-700 
                     text-white flex items-center gap-2"
          >
            <Link href="/dashboard/profile" prefetch={false}>
              View Profile
              <ArrowRight
                className="h-4 w-4 transition-transform 
                                  group-hover:translate-x-1"
              />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  /* =========================
     🔁 EXISTING ANALYTICS UI
     ========================= */

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
    <div className="bg-white border rounded-lg p-6 transition-shadow duration-300">
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
              className={`w-5 h-5 ${
                checks?.[key] ? 'text-green-600' : 'text-gray-300'
              }`}
            />
            <span
              className={`text-sm ${
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
            className="bg-buttonPrimary hover:bg-blue-700 text-white"
          >
            <Link href="/dashboard/profile" prefetch={false}>
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
    <Link href={item.href} passHref prefetch={false}>
      <div
        className={cn(
          'p-4 rounded-r-xl border-l-4 cursor-pointer transition-all duration-200 hover:',
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
    return 'bg-blue-500';
  };

  const formatUsageKey = (key) => {
    const map = {
      cvCreation: 'AI CV Creation',
      coverLetter: 'AI Cover Letter',
      aiApplication: 'AI Tailored Application',
      aiAutoApply: 'AI Auto Application',
      aiAutoApplyDailyLimit: 'Auto-Apply Daily limit',
      atsScore: ' AI ATS Score',
      jobMatching: 'AI Job Match Score',
      aiMannualApplication: 'AI Manual Applications',
    };

    return map[key] || key;
  };

  // Helper to get a relevant icon for each usage type
  const getUsageIcon = (key: any) => {
    const iconMap: any = {
      cvCreation: <FileText className="w-5 h-5 text-blue-500" />,

      coverLetter: <Send className="w-5 h-5 text-cyan-500" />,

      aiApplication: <Sparkles className="w-5 h-5 text-purple-500" />,

      aiAutoApply: <Bot className="w-5 h-5 text-yellow-500" />,

      aiAutoApplyDailyLimit: (
        <CalendarClock className="w-5 h-5 text-orange-500" />
      ),

      atsScore: <ScanSearch className="w-5 h-5 text-red-500" />,

      jobMatching: <Briefcase className="w-5 h-5 text-indigo-500" />,
      aiMannualApplication: (
        <MousePointerClick className="w-5 h-5 text-green-500" />
      ),
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
            {used} / {isUnlimited ? 'Unlimited' : limit}
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

function RecentActivityRow({
  icon: Icon,
  title,
  subtitle,
  time,
  href,
  id,
  type,
}) {
  const getDocumentUrl = () => {
    if (!id) return href;

    switch (type) {
      case 'cv':
        return `/dashboard/my-docs/cv/${id}`;
      case 'coverLetter':
        return `/dashboard/my-docs/cl/${id}`;
      case 'tailoredApplication':
        return `/dashboard/my-docs/application/${id}`;
      default:
        return href;
    }
  };

  return (
    <Link
      href={getDocumentUrl()}
      prefetch={false}
      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition"
    >
      <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>

      <div className="text-xs text-gray-400 whitespace-nowrap">
        {new Date(time).toLocaleDateString()}
      </div>

      <ArrowRight className="w-4 h-4 text-gray-400" />
    </Link>
  );
}

export function SubscriptionStatusCard({ plan }: any) {
  const pathname = usePathname();
  if (!plan || !plan.isActive) {
    return (
      <div className="bg-white border rounded-lg  p-6  transition-shadow duration-300">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Plan</h3>
        <p className="text-gray-600 text-sm mb-4">
          You do not have an active subscription.
        </p>
        <Button asChild className="w-full bg-buttonPrimary hover:bg-blue-700">
          <Link href="/dashboard/subscriptions" prefetch={false}>
            View Plans
          </Link>
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
    <div className="bg-white rounded-lg border  p-6  transition-shadow duration-300">
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
        {Object.keys(plan?.usageData || {}).map((key) =>
          key !== 'lastReset' ? (
            <UsageMeter
              key={key}
              label={key}
              used={plan?.usageData?.[key] ?? 0}
              limit={plan?.usageLimits?.[key] ?? 0}
            />
          ) : null,
        )}
      </div>

      {pathname === '/dashboard' && (
        <Button variant="outline" className="w-full" asChild>
          <Link href="/dashboard/billing" prefetch={false}>
            Manage Subscription
          </Link>
        </Button>
      )}
    </div>
  );
}

function TopJobCard({ job }: { job: TopJob }) {
  return (
    <Link
      href={`/jobs/${job.slug}`}
      prefetch={false}
      className="group block bg-white border rounded-lg p-4 hover:shadow-md transition"
    >
      <div className="flex gap-4">
        {job.logo ? (
          <div className="w-14 h-14 overflow-hidden ring-purple-100 group-hover:ring-purple-300 transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:scale-110 transform">
            <Image
              src={job.logo}
              alt={job.company || 'Company Logo'}
              className="w-full h-full object-contain p-1"
              width={100}
              height={100}
            />
          </div>
        ) : (
          <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-cyan-100 ring-purple-100 group-hover:ring-purple-300 transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:scale-110 transform">
            <Image
              src="/logo.png"
              alt={job.company || 'Company Logo'}
              className="w-full h-full object-contain bg-white p-1"
              width={100}
              height={100}
            />
          </div>
        )}
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 group-hover:text-purple-700 line-clamp-1">
            {job.title}
          </h4>

          <p className="text-sm text-gray-600">
            {job.company}
            {job.location?.city && (
              <>
                {' '}
                · {job.location.city}, {job.location.state}
              </>
            )}
          </p>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">{job.jobPosted}</span>

            <span className="text-xs font-semibold text-green-600">
              Match {(job.finalScore * 100).toFixed(0)}%
            </span>
          </div>
        </div>
        <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const [recentAI, setRecentAI] = useState<any>(null);
  const [billingData, setBillingData] = useState<any[]>([]);
  const { balance, spending, checkout } = useCredits();
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  const searchParams = useSearchParams();
  const fromOnboarding = searchParams.get('from') === 'onboarding';
  const [showFeedback, setShowFeedback] = useState(false);
  useEffect(() => {
    if (!fromOnboarding) return;
    setShowFeedback(true);
  }, [fromOnboarding]);

  const { stats } = useSelector((state: RootState) => state.student);

  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { planType, isActive, usageData, usageLimits } = useSelector(
    (state: RootState) => state.plan,
  );
  const { user: authUser } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const res = await apiInstance.get('/plan/perchased');
        if (res.data.success) {
          setBillingData(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching billing data:', error);
      }
    };

    if (authUser) {
      fetchBillingData();
    }
  }, [authUser]);

  const activeRecord = billingData.find((record) => record.isActive);

  const planDetails = {
    planType,
    isActive,
    usageData,
    usageLimits,
    user: authUser,
    endDate: activeRecord?.endDate,
  };
  // const [planDetails, setPlanDetails] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getStudentStatsRequest());
    if (!authUser) {
      dispatch(getProfileRequest());
    }
  }, [dispatch, authUser]);

  const handleMarkAsRead = (id: string) => {
    setActionItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, isRead: true } : item,
      ),
    );
  };

  const [showCompletionModal, setShowCompletionModal] =
    useState<boolean>(false);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await apiInstance.get('/students/details');
        const hasCompleted = res.data.studentDetails?.hasCompletedOnboarding;

        if (hasCompleted) {
          // Auto-start tour if onboarding already completed
          // handleStartTour();
        }
      } catch (e) {
        console.error('Error fetching:', e);
      }
    };

    run();
  }, []);

  useEffect(() => {
    const btn = document.getElementById('start-tour-btn');
    if (!btn) return;

    btn.addEventListener('click', handleStartTour);

    return () => {
      btn.removeEventListener('click', handleStartTour);
    };
  }, []);

  const fireConfetti = () => {
    const end = Date.now() + 1000;

    (function frame() {
      confetti({
        particleCount: 4,
        startVelocity: 25,
        spread: 360,
        ticks: 60,
        scalar: 1.2,
        origin: {
          x: Math.random(),
          y: Math.random() - 0.2,
        },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  const handleStartTour = () => {
    startDashboardTour({
      fireConfetti,
      setShowCompletionModal,
    });
  };

  const handleSearch = () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    const encodedQuery = encodeURIComponent(trimmed.replace(/\s+/g, '+'));
    router.push(`/dashboard/search-jobs?q=${encodedQuery}`);
  };

  useEffect(() => {
    const fetchRecentAI = async () => {
      try {
        const res = await apiInstance.get('/students/ai-activity');
        if (res.data.success) {
          setRecentAI(res.data.data);
        }
      } catch (e) {
        console.error('Failed to load recent AI activity', e);
      }
    };

    if (authUser) {
      fetchRecentAI();
    }
  }, [authUser]);

  type TopJob = {
    _id: string;
    title: string;
    company: string;
    location?: {
      city?: string;
      state?: string;
    };
    jobPosted: string;
    logo?: string;
    finalScore: number;
    slug: string;
  };

  const [topJobsRecommendations, setTopJobsRecommendations] = useState<
    TopJob[]
  >([]);

  useEffect(() => {
    if (!authUser) return;

    const fetchTopJobs = async () => {
      try {
        const res = await apiInstance.get('/jobs/dashboard/top-jobs');
        if (res.data?.jobs) {
          setTopJobsRecommendations(res.data.jobs);
        }
      } catch (e) {
        console.error('Top jobs fetch failed', e);
      }
    };

    fetchTopJobs();
  }, [authUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-6">
      <div id="dashboard-scroll" className="max-w-7xl mx-auto space-y-8">
        {showFeedback && (
          <OnboardingExperienceFeedback
            onClose={() => {
              setShowFeedback(false);
              router.replace('/dashboard');
            }}
          />
        )}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <LayoutDashboard className="w-8 h-8 mr-3 text-headingTextPrimary" />
            ZobsAI Dashboard
            <button
              id="start-tour-btn"
              className=" mx-5 border hidden md:block rounded-lg px-2 text-white bg-buttonPrimary hover:bg-blue-800"
            >
              <p className="text-2xl ">Start Tour</p>
            </button>
          </h1>

          {/* MODIFIED: Use `authUser` directly from Redux */}
          <p className="text-gray-600 mt-1">
            Welcome back, {authUser?.fullName || 'User'}! Here's your job
            application progress.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 mb-8">
          <div className="lg:col-span-2 space-y-8">
            <div id="profile-readiness">
              <ProfileReadinessCard />
            </div>

            <div className="flex gap-2 border border-slate-300 rounded-lg p-2 bg-white focus-within:ring-2 focus-within:ring-blue-400 transition">
              <Input
                placeholder="Search applications"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                className="w-full border-none focus-visible:ring-0 text-gray-800 placeholder:text-gray-400"
              />

              <Button
                onClick={handleSearch}
                className="bg-buttonPrimary hover:bg-blue-700 text-white px-4"
              >
                <MoveRight className="w-5 h-5" />
              </Button>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                AI Tools
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Smart tools powered by AI to speed up your job search.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* AI CV Generator */}
                <div
                  className="group bg-white border rounded-lg p-5 
                  flex flex-col h-full
                  transition-all hover:shadow-md hover:border-blue-300"
                >
                  {/* Content */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="p-2 rounded-lg bg-purple-100 text-purple-600 
                        group-hover:bg-purple-600 group-hover:text-white transition"
                      >
                        <FileText className="w-5 h-5" />
                      </div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-purple-700 transition">
                        AI CV Generator
                      </h4>
                    </div>

                    <p className="text-sm text-gray-600 mb-5">
                      Generate an ATS-friendly CV tailored to your skills,
                      experience, and job role.
                    </p>
                  </div>

                  {/* Button pinned bottom */}
                  <div className="mt-auto">
                    <Link href="/dashboard/cv-generator" prefetch={false}>
                      <Button className="w-full bg-buttonPrimary hover:bg-blue-700">
                        Generate CV
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* AI Cover Letter Generator */}
                <div
                  className="group bg-white border rounded-lg p-5 
                  flex flex-col h-full
                  transition-all hover:shadow-md hover:border-blue-300"
                >
                  {/* Content */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="p-2 rounded-lg bg-blue-100 text-blue-600 
                        group-hover:bg-blue-600 group-hover:text-white transition"
                      >
                        <Send className="w-5 h-5" />
                      </div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition">
                        AI Cover Letter Generator
                      </h4>
                    </div>

                    <p className="text-sm text-gray-600 mb-5">
                      Create job-specific cover letters in seconds using
                      AI-powered insights.
                    </p>
                  </div>

                  {/* Button pinned bottom */}
                  <div className="mt-auto">
                    <Link
                      href="/dashboard/cover-letter-generator"
                      prefetch={false}
                    >
                      <Button className="w-full bg-buttonPrimary hover:bg-blue-700">
                        Generate Cover Letter
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Application Wizard */}
                <div
                  className="group bg-white border rounded-lg p-5 
                  flex flex-col h-full
                  transition-all hover:shadow-md hover:border-blue-300"
                >
                  {/* Content */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="p-2 rounded-lg bg-cyan-100 text-cyan-600 
                        group-hover:bg-cyan-600 group-hover:text-white transition"
                      >
                        <Wand2 className="w-5 h-5" />
                      </div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-cyan-700 transition">
                        Application Wizard
                      </h4>
                    </div>

                    <p className="text-sm text-gray-600 mb-5">
                      Auto-optimize your CV and cover letter for a specific job
                      in one click.
                    </p>
                  </div>

                  {/* Button pinned bottom */}
                  <div className="mt-auto">
                    <Link href="/dashboard/apply" prefetch={false}>
                      <Button className="w-full bg-buttonPrimary hover:bg-blue-700">
                        Start Application
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* 🚀 APPLICATIONS SECTION */}
            <div id="my-docsx">
              <h2 className="text-xl font-semibold mt-8 mb-4 text-slate-800 dark:text-white">
                My Documents
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                  title="Applications Tracked"
                  value={stats?.tailoredApplications || 0}
                  icon={Send}
                  description="Total job applications currently in your pipeline."
                  color="cyan"
                  actionText="View Applications"
                  actionLink="/dashboard/my-docs?tab=applications"
                />
                <StatCard
                  title="Saved CVs"
                  value={stats?.cvsGenerated || 0}
                  icon={FileText}
                  description="AI-generated CVs you’ve saved for future use."
                  color="purple"
                  actionText="Manage CVs"
                  actionLink="/dashboard/my-docs?tab=cvs"
                />
                <StatCard
                  title="Cover Letters"
                  value={stats?.coverLettersGenerated || 0}
                  icon={Bot}
                  description="Personalized cover letters created using AI."
                  color="blue"
                  actionText="Create More"
                  actionLink="/dashboard/my-docs?tab=cover-letters"
                />
              </div>
            </div>
            {planDetails?.planType === 'Free' && (
              <div>
                <SpendCreditsSection
                  balance={balance}
                  loading={spending}
                  onCheckout={checkout}
                />
              </div>
            )}

            <div id="my-applications">
              <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">
                My Applications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <StatCard
                  title="Saved Jobs"
                  value={stats?.savedJobsCount || 0}
                  icon={Bookmark}
                  description="Job opportunities you’ve bookmarked for later."
                  color="cyan"
                  actionText="View Saved Jobs"
                  actionLink="/dashboard/applications?status=Saved"
                />
                <StatCard
                  title="Viewed Jobs"
                  value={stats?.jobsViewed || 0}
                  icon={Eye}
                  description="Jobs you’ve recently explored on the platform."
                  color="purple"
                  actionText="View Viewed Jobs"
                  actionLink="/dashboard/applications?status=Viewed"
                />
                <StatCard
                  title="Visited Jobs"
                  value={stats?.jobsVisited || 0}
                  icon={Globe}
                  description="Job listings you’ve opened but not saved or applied to."
                  color="blue"
                  actionText="View Visited Jobs"
                  actionLink="/dashboard/applications?status=Visited"
                />
                <StatCard
                  title="Applied Jobs"
                  value={stats?.appliedJobsCount || 0}
                  icon={Briefcase}
                  description="Jobs you’ve officially applied for through the platform."
                  color="green"
                  actionText="View Applied Jobs"
                  actionLink="/dashboard/applications?status=Applied"
                />
              </div>
            </div>

            {/* 🎁 OTHERS SECTION */}
            <div id="other-driver">
              <h2 className="text-xl font-semibold mt-8 mb-4 text-slate-800 dark:text-white">
                Others
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                  title="Referral Count"
                  value={stats?.referralCount || 0}
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
            <div id="plan-driver">
              <SubscriptionStatusCard plan={planDetails} />
            </div>

            {topJobsRecommendations.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Top Jobs for You
                  </h3>
                  <Link
                    href="/dashboard/search-jobs"
                    prefetch={false}
                    className="text-sm font-medium text-purple-600 hover:underline"
                  >
                    View all
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  {topJobsRecommendations.slice(0, 4).map((job) => (
                    <TopJobCard key={job._id} job={job} />
                  ))}
                </div>
              </div>
            )}

            {recentAI && (
              <div className="mt-8 bg-white border rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent AI Activity
                </h3>

                <div className="space-y-2">
                  {recentAI.cv && (
                    <RecentActivityRow
                      icon={FileText}
                      title="CV Generated"
                      subtitle={recentAI.cv.title}
                      time={recentAI.cv.completedAt}
                      id={recentAI.cv.id || recentAI.cv._id}
                      type="cv"
                      href="/dashboard/my-docs?tab=cvs"
                    />
                  )}

                  {recentAI.coverLetter && (
                    <RecentActivityRow
                      icon={Send}
                      title="Cover Letter Generated"
                      subtitle={recentAI.coverLetter.title}
                      time={recentAI.coverLetter.completedAt}
                      id={recentAI.coverLetter.id || recentAI.coverLetter._id}
                      type="coverLetter"
                      href="/dashboard/my-docs?tab=cover-letters"
                    />
                  )}

                  {recentAI.tailoredApplication && (
                    <RecentActivityRow
                      icon={Wand2}
                      title="Tailored Application Ready"
                      subtitle={`${recentAI.tailoredApplication.jobTitle} · ${recentAI.tailoredApplication.companyName}`}
                      time={recentAI.tailoredApplication.completedAt}
                      id={
                        recentAI.tailoredApplication.id ||
                        recentAI.tailoredApplication._id
                      }
                      type="tailoredApplication"
                      href="/dashboard/my-docs?tab=applications"
                    />
                  )}

                  {!recentAI.cv &&
                    !recentAI.coverLetter &&
                    !recentAI.tailoredApplication && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No completed AI activity yet.
                      </p>
                    )}
                </div>
              </div>
            )}

            <div
              id="coreToolkit-driver"
              className="bg-white border rounded-lg  p-6  transition-shadow duration-300"
            >
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
                  title="AI Auto-Application"
                  description="Automate your job search."
                  color="green"
                  comingSoon={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <CompletionModal
        open={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
      />
    </div>
  );
}
