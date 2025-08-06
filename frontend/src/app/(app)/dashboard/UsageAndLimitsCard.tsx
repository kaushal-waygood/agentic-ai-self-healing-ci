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
import {
  BarChart3,
  CheckCircle,
  LucideIcon,
  Star,
  Target,
  Circle,
} from 'lucide-react';
import { Label } from '@/components/ui/label'; // Corrected import path for Label
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarMenuSkeleton } from '@/components/ui/sidebar'; // Assuming this exists
import { AuthState } from '@/redux/types/authType';

// Define the props for the components
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
// StatCard Component
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

// =========================================================
// ToolkitButton Component
// =========================================================
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

// =========================================================
// UsageTracker Component
// =========================================================
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

// =========================================================
// ChecklistItem Component
// =========================================================
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
