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
  FileText,
  LayoutDashboard,
  Send,
  Bot,
  FilePlus2,
  Wand2,
  Search,
  MailWarning,
  Bell,
  Award,
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
import { BarChart, Bar, XAxis, YAxis } from 'recharts';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

import {
  StatCard,
  ToolkitButton,
  UsageTracker,
  ChecklistItem,
  ProfileReadinessCard,
  UsageAndLimitsCard,
} from './UtilsComp';
import { useDispatch } from 'react-redux';
import { getProfileRequest } from '@/redux/reducers/authReducer';
import { useSelector } from 'react-redux';
import apiInstance from '@/services/api';

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [effectivePlan, setEffectivePlan] = useState<
    SubscriptionPlan | undefined
  >(undefined);

  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state: any) => state.auth);

  useEffect(() => {
    dispatch(getProfileRequest());

    const role = authUser?.role;
    setUser(authUser);
  }, [dispatch]);

  // --- Start of the moved useEffect hook ---
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiInstance.get('/students/jobs/stats');
        setStats(response.data.data);
      } catch (error) {}
    };

    fetchStats();
  }, []);
  // --- End of the moved useEffect hook ---

  // State for calculated values to prevent hydration errors
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

  useEffect(() => {
    // This effect runs only on the client, after the initial render, preventing hydration mismatches.
    const currentUser = mockUserProfile;

    // --- Simulate background tasks to generate notifications ---
    const existingIds = new Set(currentUser.actionItems.map((item) => item.id));

    // 1. Check for stale applications
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

    // 2. Check for Career XP milestones
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

    // 3. Simulate finding new matching jobs
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

    // Determine the user's effective plan
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

    const statusCounts = mockApplications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setStatusChartData(
      Object.keys(statusCounts).map((status) => ({
        status: status,
        applications: statusCounts[status],
      })),
    );

    // Calculate profile readiness score on the client
    let score = 0;
    let checks = {
      core: false,
      experience: false,
      education: false,
      skills: false,
      narratives: false,
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
    if (
      currentUser.narratives &&
      currentUser.narratives.challenges &&
      currentUser.narratives.achievements &&
      currentUser.narratives.appreciation
    ) {
      score += 20;
      checks.narratives = true;
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

  const chartConfig = {
    applications: {
      label: 'Applications',
      color: 'hsl(var(--primary))',
    },
  } satisfies ChartConfig;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your job application progress."
        icon={LayoutDashboard}
      />

      <div className="grid gap-8 lg:grid-cols-3 mb-8">
        <div className="lg:col-span-2 space-y-8">
          <ProfileReadinessCard
            score={profileReadiness.score}
            checks={profileReadiness.checks}
          />
          <UsageAndLimitsCard user={user} plan={effectivePlan} />
        </div>
        <div className="space-y-8">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="font-headline">Core AI Toolkit</CardTitle>
              <CardDescription>
                Your essential tools for a smarter job search.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              <ToolkitButton
                href="/search-jobs"
                icon={Search}
                title="Search & Apply"
                description="Find your next job opportunity."
              />
              <ToolkitButton
                href="/apply"
                icon={Wand2}
                title="Application Wizard"
                description="Tailor docs for a specific job."
              />
              <ToolkitButton
                href="/cv-generator"
                icon={FilePlus2}
                title="AI CV Generator"
                description="Craft a standout CV from scratch."
              />
              <ToolkitButton
                href="/ai-auto-apply"
                icon={Bot}
                title="AI Auto-Apply Agents"
                description="Automate your job search."
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Applications Tracked"
          value={stats.applicationsSent.toString()}
          icon={Send}
          description="Total applications in pipeline"
          actionLink="/applications"
          actionText="View Applications"
        />
        <StatCard
          title="Saved CVs"
          value={stats.cvsGenerated.toString()}
          icon={FileText}
          description="Total CVs generated"
          actionLink="/cv-generator"
          actionText="Manage CVs"
        />
        <StatCard
          title="Career XP"
          value={stats.careerXp}
          icon={Award}
          description="Points for career-building actions"
        />
        <StatCard
          title="Cover Letters Prepared"
          value={stats.coverLettersGenerated}
          icon={Bot}
          description="Agents preparing drafts"
          actionLink="/ai-auto-apply"
          actionText="Configure Agents"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="font-headline">
                Application Status Overview
              </CardTitle>
              <CardDescription>
                A summary of your application pipeline.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statusChartData.length > 0 ? (
                <ChartContainer
                  config={chartConfig}
                  className="h-[250px] w-full"
                >
                  <BarChart
                    data={statusChartData}
                    layout="vertical"
                    margin={{ left: 10 }}
                  >
                    <XAxis type="number" dataKey="applications" hide />
                    <YAxis
                      dataKey="status"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                      width={110}
                    />
                    <ChartTooltip
                      cursor={{ fill: 'hsl(var(--muted))' }}
                      content={<ChartTooltipContent />}
                    />
                    <Bar
                      dataKey="applications"
                      fill="var(--color-applications)"
                      radius={4}
                    />
                  </BarChart>
                </ChartContainer>
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
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="shadow-sm" id="action-items">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <MailWarning className="h-6 w-6 text-primary" />
                Action Items & Notifications
              </CardTitle>
              <CardDescription>
                AI-flagged tasks and important updates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {actionItems.length > 0 ? (
                <ul className="space-y-4">
                  {actionItems.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className={cn(
                          'block border-l-4 p-3 rounded-r-md hover:bg-muted/50',
                          item.isRead
                            ? 'border-transparent'
                            : 'border-primary bg-primary/5',
                        )}
                        onClick={() => handleMarkAsRead(item.id)}
                      >
                        <p
                          className={cn(
                            'text-sm font-semibold',
                            item.isRead && 'text-muted-foreground font-normal',
                          )}
                        >
                          {item.summary}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(item.date).toLocaleString()}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium">You're all caught up!</p>
                  <p className="text-sm">Important updates will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
