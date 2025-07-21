'use client';

import { useState, useEffect } from 'react';
import type {
  UserProfile,
  Organization,
  PlanId,
  UserRole,
} from '@/lib/data/user';
import type { SubscriptionPlan } from '@/lib/data/subscriptions';
import { mockUsers } from '@/lib/data/user';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import {
  User,
  Shield,
  Briefcase,
  Building,
  Activity,
  Wand2,
  KeyRound,
  LogIn,
  Save,
} from 'lucide-react';
import Link from 'next/link';
import { logAdminAction } from '@/lib/data/audit-logs';

interface UserDetailClientProps {
  user: UserProfile;
  organization: Organization | null;
  plan?: SubscriptionPlan;
  allPlans: SubscriptionPlan[];
  allOrganizations: Organization[];
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border p-3">
      <div className="bg-muted p-2 rounded-md">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-base font-semibold">{value}</p>
      </div>
    </div>
  );
}

function UsageTracker({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  if (limit === 0) return null;
  const isUnlimited = limit === -1;
  const percentage = !isUnlimited && limit > 0 ? (used / limit) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <Label className="text-sm">{label}</Label>
        <p className="text-sm text-muted-foreground">
          {isUnlimited ? 'Unlimited' : `${used} / ${limit}`}
        </p>
      </div>
      {!isUnlimited && <Progress value={percentage} className="h-2" />}
    </div>
  );
}

export function UserDetailClient({
  user: initialUser,
  organization: initialOrganization,
  plan,
  allPlans,
  allOrganizations,
}: UserDetailClientProps) {
  const [user, setUser] = useState(initialUser);
  const [organization, setOrganization] = useState(initialOrganization);

  const [selectedRole, setSelectedRole] = useState<UserRole>(initialUser.role);
  const [selectedOrgId, setSelectedOrgId] = useState<string | undefined>(
    initialUser.organizationId,
  );

  const { toast } = useToast();

  useEffect(() => {
    setUser(initialUser);
    setOrganization(initialOrganization);
    setSelectedRole(initialUser.role);
    setSelectedOrgId(initialUser.organizationId);
  }, [initialUser, initialOrganization]);

  const handlePlanChange = (newPlanId: PlanId) => {
    const userIndex = mockUsers.findIndex((u) => u.id === user.id);
    if (userIndex > -1) {
      const oldPlanId = mockUsers[userIndex].currentPlanId;
      mockUsers[userIndex].currentPlanId = newPlanId;
      mockUsers[userIndex].usage = {
        aiJobApply: 0,
        aiCvGenerator: 0,
        aiCoverLetterGenerator: 0,
        applications: 0,
      };

      logAdminAction(
        'PLAN_CHANGE',
        user.id,
        `Changed plan for ${user.fullName} from ${oldPlanId} to ${newPlanId}.`,
      );

      setUser({ ...mockUsers[userIndex] });
      toast({
        title: 'Plan Updated',
        description: `${user.fullName}'s plan has been changed.`,
      });
    }
  };

  const handleResetPassword = () => {
    logAdminAction(
      'USER_UPDATE',
      user.id,
      `Initiated password reset for user ${user.fullName}.`,
    );
    toast({
      title: 'Password Reset Sent (Simulation)',
      description: `In a real application, a password reset link would have been sent to ${user.email}.`,
    });
  };

  const handleImpersonate = () => {
    logAdminAction(
      'LOGIN_ACTION',
      user.id,
      `Impersonated user ${user.fullName}.`,
    );
    toast({
      title: 'Impersonation Mode (Simulation)',
      description: `In a real application, you would be redirected and logged in as ${user.fullName}. All actions would be performed on their behalf.`,
    });
  };

  const handleResetUsage = () => {
    const userIndex = mockUsers.findIndex((u) => u.id === user.id);
    if (userIndex > -1) {
      mockUsers[userIndex].usage = {
        aiJobApply: 0,
        aiCvGenerator: 0,
        aiCoverLetterGenerator: 0,
        applications: 0,
      };

      logAdminAction(
        'USER_UPDATE',
        user.id,
        `Reset usage counters for ${user.fullName}.`,
      );

      setUser({ ...mockUsers[userIndex] });
      toast({
        title: 'Usage Reset',
        description: `Usage counters for ${user.fullName} have been reset.`,
      });
    }
  };

  const handleSaveRole = () => {
    const userIndex = mockUsers.findIndex((u) => u.id === user.id);
    if (userIndex > -1) {
      const oldRole = mockUsers[userIndex].role;
      const newOrg = allOrganizations.find((o) => o.id === selectedOrgId);

      mockUsers[userIndex].role = selectedRole;

      if (selectedRole === 'Individual') {
        mockUsers[userIndex].organizationId = undefined;
        // Optionally revert to a default individual plan, e.g., 'basic'
        // mockUsers[userIndex].currentPlanId = 'basic';
      } else {
        mockUsers[userIndex].organizationId = selectedOrgId;
        // Also update their plan to the org's plan if they are now part of an org
        if (newOrg) {
          mockUsers[userIndex].currentPlanId = newOrg.planId;
        }
      }

      logAdminAction(
        'USER_UPDATE',
        user.id,
        `Changed role for ${
          user.fullName
        } from ${oldRole} to ${selectedRole}. Org: ${newOrg?.name || 'N/A'}`,
      );

      const updatedUser = { ...mockUsers[userIndex] };
      setUser(updatedUser);
      setOrganization(newOrg || null); // Update local organization state as well

      toast({
        title: 'User Role Updated',
        description: `${user.fullName}'s role has been changed to ${selectedRole}.`,
      });
    }
  };

  const isRoleUnchanged =
    selectedRole === user.role && selectedOrgId === user.organizationId;
  const isRoleSelectionInvalid =
    (selectedRole === 'OrgMember' || selectedRole === 'OrgAdmin') &&
    !selectedOrgId;

  if (!plan) {
    return (
      <Card>
        <CardContent>
          <p>Subscription plan details could not be loaded for this user.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>User Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard title="Role" value={user.role} icon={Shield} />
            <StatCard title="Subscription" value={plan.name} icon={Briefcase} />
            {organization && (
              <StatCard
                title="Organization"
                value={organization.name}
                icon={Building}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription & Usage</CardTitle>
            <CardDescription>
              Current monthly usage based on the {plan.name} plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <UsageTracker
              label="AI Job Applications"
              used={user.usage.aiJobApply}
              limit={plan.limits.aiJobApply}
            />
            <UsageTracker
              label="AI CV Generations"
              used={user.usage.aiCvGenerator}
              limit={plan.limits.aiCvGenerator}
            />
            <UsageTracker
              label="AI Cover Letters"
              used={user.usage.aiCoverLetterGenerator}
              limit={plan.limits.aiCoverLetterGenerator}
            />
            <UsageTracker
              label="Total Applications Tracked"
              used={user.usage.applications}
              limit={plan.limits.applicationLimit}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.recentActivity?.length ? (
                  user.recentActivity.map((act) => (
                    <TableRow key={act.timestamp}>
                      <TableCell>
                        {new Date(act.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{act.activity}</Badge>
                      </TableCell>
                      <TableCell>{act.details || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No recent activity found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="change-plan">Change Subscription Plan</Label>
              <Select
                onValueChange={(value) => handlePlanChange(value as PlanId)}
                defaultValue={user.currentPlanId}
              >
                <SelectTrigger id="change-plan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allPlans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResetUsage}
            >
              <Wand2 className="mr-2 h-4 w-4" /> Reset Usage Counters
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResetPassword}
            >
              <KeyRound className="mr-2 h-4 w-4" /> Reset Password
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleImpersonate}
            >
              <LogIn className="mr-2 h-4 w-4" /> Impersonate User
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Management</CardTitle>
            <CardDescription>
              Change the user's role and organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="change-role">User Role</Label>
              <Select
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value as UserRole)}
              >
                <SelectTrigger id="change-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Individual">Individual</SelectItem>
                  <SelectItem value="OrgMember">Organization Member</SelectItem>
                  <SelectItem value="OrgAdmin">Organization Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(selectedRole === 'OrgMember' || selectedRole === 'OrgAdmin') && (
              <div>
                <Label htmlFor="change-org">Organization</Label>
                <Select
                  value={selectedOrgId || ''}
                  onValueChange={(value) => setSelectedOrgId(value)}
                >
                  <SelectTrigger id="change-org">
                    <SelectValue placeholder="Select an organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {allOrganizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button
              className="w-full"
              onClick={handleSaveRole}
              disabled={isRoleUnchanged || isRoleSelectionInvalid}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Role Change
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
