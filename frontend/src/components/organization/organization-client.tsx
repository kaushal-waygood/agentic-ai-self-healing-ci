'use client';

import type { Organization, UserProfile } from '@/lib/data/user';
import type { JobListing } from '@/lib/data/jobs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ShieldCheck,
  Users,
  Building,
  Briefcase,
  Settings,
} from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

// Sub-components
import MembersTab from './tabs/MembersTab';
import JobsTab from './tabs/JobsTab';
// import SettingsTab from './tabs/SettingsTab.tsx';

interface OrganizationClientProps {
  organization: Organization;
  initialMembers: UserProfile[];
  initialJobs: JobListing[];
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <Card className="border border-border/60 bg-card/60 shadow-sm backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}

export function OrganizationClient({
  organization,
  initialMembers,
  initialJobs,
}: OrganizationClientProps) {
  // Derived state
  const isPendingVerification =
    organization.isEmailVerified === 'pending_verification';
  const seatsUsed = initialMembers ? initialMembers.length : 0;
  const seatsAvailable = organization.seats - seatsUsed;

  return (
    <div className=" space-y-8">
      {/* Main shell similar to CV generator layout */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {isPendingVerification && (
          <Alert className="border-yellow-300/80 bg-yellow-50/80 text-yellow-900">
            <AlertTriangle className="h-4 w-4 !text-yellow-600" />
            <AlertTitle className="font-semibold">
              Account Pending Verification
            </AlertTitle>
            <AlertDescription className="text-sm">
              Your institution&apos;s account is under review. Some features are
              temporarily limited.
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {organization.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage members, job postings, and integrations for your
              institution.
            </p>
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span className="capitalize">
              {organization.planId.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <MembersTab
          seatsAvailable={seatsAvailable}
          isPendingVerification={isPendingVerification}
          organizationId={organization.id}
          planId={organization.planId}
        />
      </div>
    </div>
  );
}
