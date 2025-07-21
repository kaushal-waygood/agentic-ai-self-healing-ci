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
import { BarChart3, CheckCircle, LucideIcon, Star, Target } from 'lucide-react';
import { Label } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarMenuSkeleton } from '@/components/ui/sidebar';
import { AuthState } from '@/redux/types/authType';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  description?: string;
  actionLink?: string;
  actionText?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  actionLink,
  actionText,
}: StatCardProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-headline">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {actionLink && actionText && (
          <Button variant="link" size="sm" className="px-0 pt-2" asChild>
            <Link href={actionLink}>{actionText}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
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
      className="h-auto p-4 text-left justify-start items-start space-x-4 hover:bg-primary/5 hover:border-primary/50 transition-all hover:text-foreground"
    >
      <Link href={href}>
        <Icon className="h-8 w-8 text-primary shrink-0 mt-1" />
        <div>
          <p className="font-semibold text-base">{title}</p>
          <p className="text-xs text-muted-foreground font-normal">
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
  const percentage = limit > 0 ? (used / limit) * 100 : 0;
  const isUnlimited = limit === -1;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <Label className="text-sm">{label}</Label>
        <p className="text-sm text-muted-foreground">
          {isUnlimited ? 'Unlimited' : `${used} / ${limit}`}
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
      <Card className="shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <SidebarMenuSkeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </CardContent>
      </Card>
    );

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Usage & Limits
        </CardTitle>
        <CardDescription>
          Your current usage for this billing cycle on the{' '}
          <span className="font-semibold text-primary">{plan.name}</span> plan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* <UsageTracker
          label="AI Job Applications"
          used={user.usage.aiJobApply}
          limit={plan.limits.aiJobApply}
        /> */}
        {/* <UsageTracker
          label="AI CV Generations"
          used={user.usage.aiCvGenerator}
          limit={plan.limits.aiCvGenerator}
        /> */}
        {/* <UsageTracker
          label="AI Cover Letters"
          used={user.usage.aiCoverLetterGenerator}
          limit={plan.limits.aiCoverLetterGenerator}
        />
        <UsageTracker
          label="Total Applications Tracked"
          used={user.usage.applications}
          limit={plan.limits.applicationLimit}
        /> */}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/subscriptions">
            <Star className="mr-2 h-4 w-4" /> View & Upgrade Plans
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

type ChecklistItemProps = {
  isComplete: boolean;
  text: string;
  link: string;
};

export const ChecklistItem = ({
  isComplete,
  text,
  link,
}: ChecklistItemProps) => (
  <Link
    href={link}
    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors"
  >
    <div
      className={`h-5 w-5 rounded-full flex items-center justify-center ${
        isComplete ? 'bg-green-500' : 'bg-muted-foreground/30'
      }`}
    >
      {isComplete && <CheckCircle className="h-5 w-5 text-white" />}
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

type ProfileReadinessChecks = {
  core: boolean;
  experience: boolean;
  education: boolean;
  skills: boolean;
  narratives: boolean;
};

export function ProfileReadinessCard({
  score,
  checks,
}: {
  score: number | null;
  checks: ProfileReadinessChecks | null;
}) {
  if (score === null || checks === null) {
    return (
      <Card className="shadow-sm">
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

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" />
          Profile Readiness
        </CardTitle>
        <CardDescription>
          Complete your profile to unlock the full power of CareerPilot's AI.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20">
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
              <span className="text-2xl font-bold font-headline">{score}%</span>
            </div>
          </div>
          <div className="flex-grow space-y-2">
            <h4 className="font-semibold">Next Steps:</h4>
            {!checks.core && (
              <ChecklistItem
                isComplete={false}
                text="Complete core profile"
                link="/profile#personal-info"
              />
            )}
            {!checks.experience && (
              <ChecklistItem
                isComplete={false}
                text="Add work experience"
                link="/profile#experience"
              />
            )}
            {!checks.education && (
              <ChecklistItem
                isComplete={false}
                text="Add education history"
                link="/profile#education"
              />
            )}
            {!checks.skills && (
              <ChecklistItem
                isComplete={false}
                text="Add at least 10 skills"
                link="/profile#skills-section"
              />
            )}
            {!checks.narratives && (
              <ChecklistItem
                isComplete={false}
                text="Fill out personal narratives"
                link="/profile#narratives"
              />
            )}
            {score === 100 && (
              <div className="text-sm font-medium text-green-600 flex items-center gap-2">
                <CheckCircle /> Your profile is ready for AI!
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
