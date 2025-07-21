'use client';

import { useMemo } from 'react';
import type { UserProfile, Organization } from '@/lib/data/user';
import type { SubscriptionPlan } from '@/lib/data/subscriptions';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import { Users, Building, DollarSign, Wand2 } from 'lucide-react';

interface AdminDashboardClientProps {
  users: UserProfile[];
  organizations: Organization[];
  plans: SubscriptionPlan[];
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminDashboardClient({
  users,
  organizations,
  plans,
}: AdminDashboardClientProps) {
  const totalUsers = users.length;
  const activeOrgs = organizations.filter((o) => o.status === 'active').length;

  const totalMonthlyRevenue = users.reduce((acc, user) => {
    const plan = plans.find((p) => p.id === user.currentPlanId);
    if (
      plan &&
      typeof plan.priceMonthly === 'number' &&
      user.role === 'Individual'
    ) {
      return acc + plan.priceMonthly;
    }
    return acc;
  }, 0);

  const totalAiApplications = users.reduce(
    (acc, user) => acc + (user.usage?.aiJobApply || 0),
    0,
  );
  const totalAiCvs = users.reduce(
    (acc, user) => acc + (user.usage?.aiCvGenerator || 0),
    0,
  );
  const totalAiCoverLetters = users.reduce(
    (acc, user) => acc + (user.usage?.aiCoverLetterGenerator || 0),
    0,
  );

  const newSignupsData = useMemo(() => {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const sixMonthsAgo = new Date();
    // Set to the first day of the month, 5 months ago, to get a 6-month window.
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // Initialize map for the last 6 months in order
    const signupsByMonth = new Map<string, number>();
    const monthOrder: string[] = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date(sixMonthsAgo);
      date.setMonth(date.getMonth() + i);
      const monthKey = monthNames[date.getMonth()];
      signupsByMonth.set(monthKey, 0);
      if (!monthOrder.includes(monthKey)) {
        monthOrder.push(monthKey);
      }
    }

    // Process users
    users.forEach((user) => {
      if (user.createdAt) {
        const signupDate = new Date(user.createdAt);
        if (signupDate >= sixMonthsAgo) {
          const monthKey = monthNames[signupDate.getMonth()];
          if (signupsByMonth.has(monthKey)) {
            signupsByMonth.set(monthKey, signupsByMonth.get(monthKey)! + 1);
          }
        }
      }
    });

    // Convert map to array for the chart, respecting the order
    return monthOrder.map((month) => ({
      month,
      signups: signupsByMonth.get(month) || 0,
    }));
  }, [users]);

  const planDistribution = users.reduce((acc, user) => {
    const planName =
      plans.find((p) => p.id === user.currentPlanId)?.name || 'Unknown';
    acc[planName] = (acc[planName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const planDistributionData = Object.entries(planDistribution).map(
    ([name, value]) => ({ name, value }),
  );

  const PIE_COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  const barChartConfig = {
    signups: { label: 'New Signups', color: 'hsl(var(--chart-1))' },
  } satisfies ChartConfig;

  const aiUsageData = [
    {
      name: 'AI Applications',
      count: totalAiApplications,
      fill: 'hsl(var(--chart-1))',
    },
    { name: 'AI CVs', count: totalAiCvs, fill: 'hsl(var(--chart-2))' },
    {
      name: 'AI Cover Letters',
      count: totalAiCoverLetters,
      fill: 'hsl(var(--chart-3))',
    },
  ];

  const aiUsageChartConfig = {
    count: { label: 'Count' },
  } satisfies ChartConfig;

  const pieChartConfig = planDistributionData.reduce((acc, entry, index) => {
    acc[entry.name] = {
      label: entry.name,
      color: PIE_COLORS[index % PIE_COLORS.length],
    };
    return acc;
  }, {} as ChartConfig);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          description="All individual & org members"
        />
        <StatCard
          title="Active Organizations"
          value={activeOrgs}
          icon={Building}
          description={`${organizations.length} total organizations`}
        />
        <StatCard
          title="Estimated MRR"
          value={`$${totalMonthlyRevenue.toFixed(2)}`}
          icon={DollarSign}
          description="From individual plans"
        />
        <StatCard
          title="AI Applications Used"
          value={totalAiApplications}
          icon={Wand2}
          description="Total uses this month"
        />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New Signups Overview</CardTitle>
            <CardDescription>New users in the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={barChartConfig}
              className="h-[250px] w-full"
            >
              <BarChart data={newSignupsData} accessibilityLayer>
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="signups" fill="var(--color-signups)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan Distribution</CardTitle>
            <CardDescription>
              Breakdown of users by their active plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer
              config={pieChartConfig}
              className="h-[250px] w-full"
            >
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="value" hideLabel />}
                />
                <Pie
                  data={planDistributionData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                >
                  {planDistributionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>AI Feature Usage</CardTitle>
            <CardDescription>
              Total usage of core AI features across all users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={aiUsageChartConfig}
              className="h-[250px] w-full"
            >
              <BarChart
                data={aiUsageData}
                layout="vertical"
                accessibilityLayer
                margin={{ left: 20 }}
              >
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <XAxis type="number" hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={5}>
                  {aiUsageData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
