'use client';

import { useState, useMemo } from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PlusCircle, Edit, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  mockOrganizations,
  Organization,
  UserProfile,
  mockUsers,
} from '@/lib/data/user';
import { mockSubscriptionPlans } from '@/lib/data/subscriptions';
import { logAdminAction } from '@/lib/data/audit-logs';
import { Separator } from '../ui/separator';

interface OrganizationClientProps {
  initialOrganizations: Organization[];
  users: UserProfile[];
}

const enterprisePlans = mockSubscriptionPlans.filter((p) =>
  p.id.startsWith('enterprise'),
);
const enterprisePlanIds = enterprisePlans.map((p) => p.id) as [
  string,
  ...string[],
];

const orgFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Organization name is required.'),
  planId: z.enum(enterprisePlanIds),
  seats: z.preprocess(
    (val) => Number(val),
    z.number().min(1, 'At least one seat is required.'),
  ),
  allowStudentUpgrades: z.boolean(),
  adminFullName: z.string().optional(),
  adminEmail: z.string().email('A valid email is required.').optional(),
});
type OrgFormValues = z.infer<typeof orgFormSchema>;

const getPlanDisplayName = (planId?: string) => {
  if (!planId) return 'Unknown Plan';
  return planId.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const getStatusBadge = (status?: Organization['status']) => {
  switch (status) {
    case 'active':
      return (
        <Badge
          variant="outline"
          className="text-green-600 border-green-300 bg-green-50"
        >
          <CheckCircle className="mr-1 h-3 w-3" />
          Active
        </Badge>
      );
    case 'disabled':
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          Disabled
        </Badge>
      );
    case 'pending_verification':
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-800 border-yellow-300"
        >
          <CheckCircle className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export function OrganizationClient({
  initialOrganizations = [],
  users: initialUsers = [],
}: OrganizationClientProps) {
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState(initialOrganizations);
  const [users, setUsers] = useState(initialUsers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<OrgFormValues>({
    resolver: zodResolver(orgFormSchema),
    defaultValues: {
      planId: 'enterprise_pro',
      seats: 10,
      allowStudentUpgrades: true,
    },
  });

  const memberCounts = useMemo(() => {
    return initialUsers.reduce((acc, user) => {
      if (user.organizationId) {
        acc[user.organizationId] = (acc[user.organizationId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
  }, [initialUsers]);

  const getOrgAdmin = (orgId: string): UserProfile | undefined => {
    return users.find(
      (user) => user.organizationId === orgId && user.role === 'OrgAdmin',
    );
  };

  const openAddDialog = () => {
    setEditingOrg(null);
    form.reset({
      name: '',
      planId: 'enterprise_pro',
      seats: 100,
      allowStudentUpgrades: true,
      adminFullName: '',
      adminEmail: '',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (org: Organization) => {
    setEditingOrg(org);
    form.reset({
      id: org.id,
      name: org.name,
      planId: org.planId,
      seats: org.seats,
      allowStudentUpgrades: org.allowStudentUpgrades,
    });
    setIsDialogOpen(true);
  };

  const handleToggleStatus = (
    orgId: string,
    currentStatus: Organization['status'],
  ) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    const orgIndex = organizations.findIndex((o) => o.id === orgId);

    if (orgIndex > -1) {
      logAdminAction(
        'ORG_UPDATE',
        orgId,
        `Set organization status to '${newStatus}'.`,
      );

      const updatedOrgs = [...organizations];
      updatedOrgs[orgIndex] = {
        ...updatedOrgs[orgIndex],
        status: newStatus,
      };
      setOrganizations(updatedOrgs);

      toast({
        title: 'Status Updated',
        description: `Organization has been ${newStatus}.`,
      });
    }
  };

  const handleVerify = (orgId: string) => {
    const orgIndex = organizations.findIndex((o) => o.id === orgId);
    if (orgIndex > -1) {
      const updatedOrgs = [...organizations];
      updatedOrgs[orgIndex] = {
        ...updatedOrgs[orgIndex],
        status: 'active',
      };
      setOrganizations(updatedOrgs);

      toast({
        title: 'Organization Verified',
        description: 'The organization is now active.',
      });
    }
  };

  const onSubmit = async (values: OrgFormValues) => {
    try {
      if (editingOrg) {
        // Update existing organization
        const orgIndex = organizations.findIndex((o) => o.id === editingOrg.id);
        if (orgIndex > -1) {
          const updatedOrg = { ...organizations[orgIndex], ...values };
          const updatedOrgs = [...organizations];
          updatedOrgs[orgIndex] = updatedOrg;
          setOrganizations(updatedOrgs);

          toast({ title: 'Organization Updated' });
        }
      } else {
        // Add new organization and its admin
        if (!values.adminFullName || !values.adminEmail) {
          toast({
            variant: 'destructive',
            title: 'Admin Required',
            description:
              'Please provide details for the initial organization admin.',
          });
          return;
        }

        // Create new Organization
        const newOrg: Organization = {
          id: `org-${Date.now()}`,
          status: 'active',
          name: values.name || 'New Organization',
          planId: values.planId || 'enterprise_pro',
          seats: values.seats || 10,
          allowStudentUpgrades: values.allowStudentUpgrades !== false,
        };

        setOrganizations([...organizations, newOrg]);

        // Create new OrgAdmin user
        const newAdmin: UserProfile = {
          id: `user-admin-${Date.now()}`,
          fullName: values.adminFullName || 'Organization Admin',
          email: values.adminEmail || '',
          role: 'OrgAdmin',
          organizationId: newOrg.id,
          currentPlanId: newOrg.planId,
          createdAt: new Date().toISOString(),
          jobPreference: 'Organization Management',
          narratives: { challenges: '', achievements: '', appreciation: '' },
          education: [],
          experience: [],
          projects: [],
          skills: [],
          referralCode: `ADMIN${Date.now()}`,
          referralsMade: 0,
          earnedApplicationCredits: 0,
          usage: {
            aiJobApply: 0,
            aiCvGenerator: 0,
            aiCoverLetterGenerator: 0,
            applications: 0,
          },
          lastApplicationDate: '',
          isEmailLinked: false,
          linkedEmailProvider: '',
        };

        setUsers([...users, newAdmin]);

        toast({
          title: 'Organization & Admin Added',
          description: `Default password for ${newAdmin.fullName} is 'Admin@123'.`,
        });
      }
      setIsDialogOpen(false);
    } catch (err) {
      setError('Failed to save organization. Please try again.');
      console.error('Error saving organization:', err);
    }
  };

  return (
    <>
      {error && (
        <div className="text-red-500 p-4 border rounded-md bg-red-50 mb-4">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Organizations</CardTitle>
            <Button onClick={openAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Organization
            </Button>
          </div>
          <CardDescription>
            View, edit, and manage all B2B partner organizations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization Name</TableHead>
                <TableHead>Admin User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.length > 0 ? (
                organizations.map((org) => {
                  const admin = getOrgAdmin(org.id);
                  return (
                    <TableRow key={org.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/primary-admin/organizations/${org.id}`}
                          className="hover:underline text-primary"
                        >
                          {org.name || 'Unnamed Organization'}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {admin ? (
                          <div>
                            <div>{admin.fullName || 'Unnamed Admin'}</div>
                            <div className="text-xs text-muted-foreground">
                              {admin.email || 'No email'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No Admin Assigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {getPlanDisplayName(org.planId)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {memberCounts[org.id] || 0} / {org.seats || 0}
                      </TableCell>
                      <TableCell>{getStatusBadge(org.status)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {org.status === 'pending_verification' ? (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleVerify(org.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" /> Verify
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(org)}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </Button>
                            <Button
                              variant={
                                org.status === 'active'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                              size="sm"
                              onClick={() =>
                                handleToggleStatus(
                                  org.id,
                                  org.status || 'active',
                                )
                              }
                            >
                              {org.status === 'active' ? (
                                <XCircle className="mr-2 h-4 w-4" />
                              ) : (
                                <CheckCircle className="mr-2 h-4 w-4" />
                              )}
                              {org.status === 'active' ? 'Disable' : 'Enable'}
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No organizations found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingOrg ? 'Edit Organization' : 'Add New Organization'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="planId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subscription Plan</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select plan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {enterprisePlans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Seats</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="allowStudentUpgrades"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Allow Student Upgrades</FormLabel>
                      <FormDescription>
                        Can members purchase personal plan add-ons?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {!editingOrg && (
                <>
                  <Separator />
                  <h3 className="text-md font-medium pt-2">
                    Initial Organization Admin
                  </h3>
                  <FormField
                    control={form.control}
                    name="adminFullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="adminEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormDescription>
                          The admin will use this email to log in. Default
                          password is 'Admin@123'.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingOrg ? 'Save Changes' : 'Create Organization'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
