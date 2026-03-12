// src/components/dashboard/UtilsComp.tsx

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { BarChart3, CheckCircle, Star, Target } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthState } from '@/redux/types/authType';

import useProfileCompletion from '@/hooks/useProfileCompletion';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  description?: string;
  actionLink?: string;
  actionText?: string;
}

type ChecklistItemProps = {
  isComplete: boolean;
  text: string;
  link: string;
};

// =========================================================
// Utility Components
// =========================================================

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  actionLink,
  actionText,
}: StatCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-xl p-6 border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between space-x-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
          <p className="text-3xl font-bold mt-2 font-headline">{value}</p>
        </div>
        <Icon className="h-6 w-6 text-primary" />
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      )}
      {actionLink && actionText && (
        <Button
          variant="link"
          size="sm"
          className="px-0 pt-2 text-primary"
          asChild
        >
          <Link href={actionLink} prefetch={false}>
            {actionText}
          </Link>
        </Button>
      )}
    </div>
  );
}

export function ToolkitButton({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Button
      asChild
      variant="outline"
      className="h-auto p-5 text-left justify-start items-start space-x-4 border-0 hover:bg-primary/5 hover:border-primary/20 transition-all hover:text-foreground"
    >
      <Link href={href} prefetch={false}>
        <Icon className="h-7 w-7 text-primary shrink-0 mt-1" />
        <div>
          <p className="font-semibold text-lg">{title}</p>
          <p className="text-sm text-muted-foreground font-normal">
            {description}
          </p>
        </div>
      </Link>
    </Button>
  );
}

export function UsageTracker({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const usedNum = Number.isFinite(Number(used)) ? Number(used) : 0;
  const limitNum = Number.isFinite(Number(limit)) ? Number(limit) : 0;
  const rawPct = limitNum > 0 ? (usedNum / limitNum) * 100 : 0;
  const percentage = Number.isFinite(rawPct) ? rawPct : 0;
  const isUnlimited = limit === -1;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-sm text-muted-foreground">
          {isUnlimited ? 'Unlimited' : `${usedNum} / ${limitNum}`}
        </p>
      </div>
      {!isUnlimited && <Progress value={percentage} />}
    </div>
  );
}

export function UsageAndLimitsCard({
  user,
  plan,
}: {
  user: AuthState['user'] | null;
  plan: any;
}) {
  if (!plan || !user)
    return (
      <Card className="shadow-none border-dashed border-2">
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </CardContent>
      </Card>
    );

  return (
    <Card className="shadow-none border-dashed border-2 p-6">
      <div className="flex items-center gap-4 border-b pb-4 mb-4">
        <BarChart3 className="h-8 w-8 text-primary" />
        <div>
          <CardTitle className="font-semibold text-xl font-headline">
            Usage & Limits
          </CardTitle>
          <CardDescription>
            Your current usage on the{' '}
            <span className="font-semibold text-primary">{plan.name}</span>{' '}
            plan.
          </CardDescription>
        </div>
      </div>

      <div className="mt-6">
        <Button
          variant="outline"
          className="w-full h-12 text-md font-semibold"
          asChild
        >
          <Link href="/subscriptions" prefetch={false}>
            <Star className="mr-2 h-4 w-4" /> View & Upgrade Plans
          </Link>
        </Button>
      </div>
    </Card>
  );
}

export const ChecklistItem = ({
  isComplete,
  text,
  link,
}: ChecklistItemProps) => (
  <Link
    href={link}
    prefetch={false}
    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors"
  >
    <div
      className={`h-5 w-5 rounded-full flex items-center justify-center ${
        isComplete ? 'bg-green-500' : 'bg-muted-foreground/30'
      }`}
    >
      {isComplete && <CheckCircle className="h-4 w-4 text-white" />}
    </div>
    <span
      className={`text-sm ${
        isComplete ? 'text-muted-foreground line-through' : 'text-foreground'
      }`}
    >
      {text}
    </span>
  </Link>
);

export function ProfileReadinessCard() {
  const { data, isLoading, error } = useProfileCompletion();

  if (isLoading) {
    return (
      <Card className="shadow-none border-dashed border-2">
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-none border-dashed border-2">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Failed to load profile readiness data. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="shadow-none border-dashed border-2">
        <CardHeader>
          <CardTitle>No Profile Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p>We couldn't find your profile data. Please try refreshing.</p>
        </CardContent>
      </Card>
    );
  }

  const score = data.percentage;
  const categories = data.categories;
  const breakdown = data.breakdown;

  const profileChecks = [
    {
      text: 'Complete core profile',
      link: '/profile#personal-info',
      isComplete: categories.coreProfile,
    },
    {
      text: 'Add work experience',
      link: '/profile#experience',
      isComplete: categories.workExperience,
    },
    {
      text: 'Add education history',
      link: '/profile#education',
      isComplete: categories.education,
    },
    {
      text: 'Add at least 10 skills',
      link: '/profile#skills-section',
      isComplete: categories.skills,
    },
    {
      text: 'Fill out personal narratives',
      link: '/profile#narratives',
      isComplete: categories.coverLetter,
    },
    {
      text: 'Upload a resume',
      link: '/profile#resume',
      isComplete: categories.resume,
    },
    {
      text: 'Set job preferences',
      link: '/profile#job-preferences',
      isComplete: categories.jobPreferences,
    },
    {
      text: 'Add project experience',
      link: '/profile#projects',
      isComplete: categories.projects,
    },
  ];

  return (
    <Card className="shadow-none border-dashed border-2 p-6">
      <div className="flex items-center gap-4 border-b pb-4 mb-4">
        <Target className="h-8 w-8 text-primary" />
        <div>
          <CardTitle className="font-semibold text-xl font-headline">
            Profile Readiness
          </CardTitle>
          <CardDescription>
            Complete your profile to unlock the full power of zobsai.
          </CardDescription>
        </div>
      </div>
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-28 w-28">
            <svg className="h-full w-full" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeDasharray={`${score}, 100`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold font-headline">{score}%</span>
            </div>
          </div>
          <div className="w-full space-y-2">
            <h4 className="font-semibold">
              Your Progress: {breakdown.completed}/{breakdown.total}
            </h4>
            {profileChecks.map((item, index) => (
              <ChecklistItem
                key={index}
                isComplete={item.isComplete}
                text={item.text}
                link={item.link}
              />
            ))}
            {score === 100 && (
              <div className="text-sm font-medium text-green-600 flex items-center gap-2 mt-4">
                <CheckCircle className="h-4 w-4" /> Your profile is ready for
                AI!
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
