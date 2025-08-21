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
import { type ChartConfig } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfileRequest } from '@/redux/reducers/authReducer';
import apiInstance from '@/services/api';

// Import new design components
import {
  StatCard,
  ToolkitButton,
  ProfileReadinessCard,
  ActionItemCard,
} from './DashboardDesign'; // Update this path if you place the file elsewhere

// Recharts imports from the new design code
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [effectivePlan, setEffectivePlan] = useState<
    SubscriptionPlan | undefined
  >(undefined);
  const [stats, setStats] = useState({
    applicationsSent: 0,
    cvsGenerated: 0,
    coverLettersGenerated: 0,
    activeAgents: 0,
    careerXp: 0,
  });
  const [statusChartData, setStatusChartData] = useState<any[]>([]);
  const [profileReadiness, setProfileReadiness] = useState<{
    score: number | null;
    checks: ProfileReadinessChecks | null;
  }>({ score: null, checks: null });

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
        setStats((prev) => ({
          applicationsSent: 0,
          cvsGenerated: 0,
          coverLettersGenerated: 0,
          activeAgents: 0,
          careerXp: 0,
          ...response.data.data,
        }));

        // Calculate application status for the chart
        const statusCounts = response.data.data.applicationStats.reduce(
          (acc, stat) => {
            acc[stat.status] = stat.count;
            return acc;
          },
          {},
        );

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
  }, []);

  // Use a separate effect for client-side calculations and mock data
  useEffect(() => {
    const currentUser = mockUserProfile;
    const existingIds = new Set(currentUser.actionItems.map((item) => item.id));

    // Simulate background tasks to generate notifications
    mockApplications.forEach((app) => {
      const appId = `stale-${app.id}`;
      if (!existingIds.has(appId) && app.status === 'Sent') {
        const daysSinceApplied =
          (new Date().getTime() - new Date(app.dateApplied).getTime()) /
          (1000 * 3600 * 24);
        if (daysSinceApplied > 7) {
          currentUser.actionItems.unshift({
            id: appId,
            href: `/applications/${app.id}`,
            summary: `Consider following up on your application for ${app.jobTitle}.`,
            date: new Date().toISOString(),
            isRead: false,
            type: 'recommendation',
            iconName: 'CalendarCheck2',
          });
        }
      }
    });

    const xp = currentUser.careerXp || 0;
    const xpMilestoneId = 'xp-milestone-500';
    if (!existingIds.has(xpMilestoneId) && xp >= 500) {
      currentUser.actionItems.unshift({
        id: xpMilestoneId,
        href: `/profile`,
        summary: `Congrats on reaching ${xp} Career XP! You've earned the "Pro Job Hunter" badge.`,
        date: new Date().toISOString(),
        isRead: false,
        type: 'reward',
        iconName: 'Award',
      });
    }

    const newJobsId = 'new-jobs-rec';
    if (!existingIds.has(newJobsId)) {
      currentUser.actionItems.unshift({
        id: newJobsId,
        href: `/search-jobs`,
        summary: `We've found 5 new jobs matching your profile.`,
        date: new Date().toISOString(),
        isRead: false,
        type: 'recommendation',
        iconName: 'Briefcase',
      });
    }

    setActionItems(currentUser.actionItems || []);

    const org = currentUser.organizationId
      ? mockOrganizations.find((o) => o.id === currentUser.organizationId)
      : null;
    let basePlanId = currentUser.currentPlanId;
    if (currentUser.role === 'OrgMember' && org) {
      basePlanId = org.planId;
    }
    let finalPlanId = basePlanId;
    if (
      currentUser.personalPlanId &&
      planTierOrder[currentUser.personalPlanId] > planTierOrder[basePlanId]
    ) {
      finalPlanId = currentUser.personalPlanId;
    }
    setEffectivePlan(
      mockSubscriptionPlans.find((p) => p.id === finalPlanId) || undefined,
    );

    let score = 0;
    let checks = {
      core: false,
      experience: false,
      education: false,
      skills: false,
    };
    if (currentUser.fullName && currentUser.jobPreference) {
      score += 25;
      checks.core = true;
    }
    if (currentUser.experience && currentUser.experience.length > 0) {
      score += 25;
      checks.experience = true;
    }
    if (currentUser.education && currentUser.education.length > 0) {
      score += 15;
      checks.education = true;
    }
    if (currentUser.skills && currentUser.skills.length >= 10) {
      score += 15;
      checks.skills = true;
    }
    setProfileReadiness({ score: Math.min(score, 100), checks });
  }, []);

  const handleMarkAsRead = (id: string) => {
    const itemIndex = mockUserProfile.actionItems.findIndex((a) => a.id === id);
    if (itemIndex > -1 && !mockUserProfile.actionItems[itemIndex].isRead) {
      mockUserProfile.actionItems[itemIndex].isRead = true;
      setActionItems([...mockUserProfile.actionItems]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <LayoutDashboard className="w-8 h-8 mr-3 text-purple-600" />
              Job Search Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's your job application progress.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 mb-8">
          <div className="lg:col-span-2 space-y-8">
            <ProfileReadinessCard
              score={profileReadiness.score}
              checks={profileReadiness.checks}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard
                title="Applications Tracked"
                value={stats.applicationsSent.toString()}
                icon={Send}
                description="Total applications in pipeline"
                color="purple"
                actionText="View Applications"
                actionLink="/applications"
              />
              <StatCard
                title="Saved CVs"
                value={stats.cvsGenerated.toString()}
                icon={FileText}
                description="Total CVs generated"
                color="blue"
                actionText="Manage CVs"
                actionLink="/cv-generator"
              />
              <StatCard
                title="Career XP"
                value={stats.careerXp}
                icon={Award}
                description="Points for career-building actions"
                color="cyan"
              />
              <StatCard
                title="Cover Letters Prepared"
                value={stats.coverLettersGenerated}
                icon={Bot}
                description="Documents prepared with AI"
                color="green"
                actionText="Configure Agents"
                actionLink="/ai-auto-apply"
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
                  href="/search-jobs"
                  icon={Search}
                  title="Search & Apply"
                  description="Find your next job opportunity."
                  color="purple"
                />
                <ToolkitButton
                  href="/apply"
                  icon={Wand2}
                  title="Application Wizard"
                  description="Tailor docs for a specific job."
                  color="blue"
                />
                <ToolkitButton
                  href="/cv-generator"
                  icon={FilePlus2}
                  title="AI CV Generator"
                  description="Craft a standout CV from scratch."
                  color="cyan"
                />
                <ToolkitButton
                  href="/ai-auto-apply"
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

              {statusChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusChartData} margin={{ left: 20 }}>
                    <XAxis dataKey="status" axisLine={false} tickLine={false} />
                    <YAxis
                      dataKey="applications"
                      axisLine={false}
                      tickLine={false}
                    />
                    <Bar dataKey="applications" radius={8}>
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[250px] text-center text-muted-foreground border-2 border-dashed rounded-lg">
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
                    <Link href="/search-jobs">Find a Job</Link>
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
                    <MailWarning className="h-6 w-6 text-primary" />
                    Action Items & Notifications
                  </h3>
                  <p className="text-gray-600 text-sm">
                    AI-flagged tasks and important updates.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {actionItems.length > 0 ? (
                  actionItems.map((item) => (
                    <ActionItemCard
                      key={item.id}
                      item={item}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-medium">You're all caught up!</p>
                    <p className="text-sm">
                      Important updates will appear here.
                    </p>
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
