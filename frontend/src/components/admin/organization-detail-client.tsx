'use client';

import { useState, useMemo, useRef } from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Papa from 'papaparse';
import Link from 'next/link';
import type {
  Organization,
  UserProfile,
  RecentActivity,
} from '@/lib/data/user';
import { mockSubscriptionPlans } from '@/lib/data/subscriptions';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Check,
  ShieldCheck,
  Building,
  Users,
  UserPlus,
  MoreHorizontal,
  Trash2,
  Download,
  Upload,
  Edit,
  BarChart2,
  Settings,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockOrganizations, mockUsers } from '@/lib/data/user';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface OrganizationDetailClientProps {
  organization: Organization;
  initialMembers: UserProfile[];
}

const memberFormSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email.'),
  role: z.enum(['OrgMember', 'OrgAdmin']),
  department: z.string().optional(),
  course: z.string().optional(),
});
type MemberFormValues = z.infer<typeof memberFormSchema>;

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export function OrganizationDetailClient({
  organization: initialOrganization,
  initialMembers,
}: OrganizationDetailClientProps) {
  const { toast } = useToast();

  const [organization, setOrganization] = useState(initialOrganization);
  const [members, setMembers] = useState(initialMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<UserProfile | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const csvImportRef = useRef<HTMLInputElement>(null);

  const memberForm = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      role: 'OrgMember',
      department: '',
      course: '',
    },
  });

  const openEditDialog = (member: UserProfile) => {
    setEditingMember(member);
    memberForm.reset({
      fullName: member.fullName,
      email: member.email,
      role: member.role === 'OrgAdmin' ? 'OrgAdmin' : 'OrgMember',
      department: member.department,
      course: member.course,
    });
    setIsEditMemberOpen(true);
  };

  const uniqueDepartments = useMemo(() => {
    if (!members) return ['all'];
    return [
      'all',
      ...Array.from(new Set(members.map((m) => m.department).filter(Boolean))),
    ];
  }, [members]);

  const uniqueCourses = useMemo(() => {
    if (!members) return ['all'];
    const courses = members
      .filter(
        (m) =>
          selectedDepartment === 'all' || m.department === selectedDepartment,
      )
      .map((m) => m.course)
      .filter(Boolean);
    return ['all', ...Array.from(new Set(courses))];
  }, [members, selectedDepartment]);

  const filteredMembers = useMemo(() => {
    if (!members) return [];
    return members.filter((member) => {
      const searchMatch =
        searchTerm === '' ||
        member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase());
      const departmentMatch =
        selectedDepartment === 'all' ||
        member.department === selectedDepartment;
      const courseMatch =
        selectedCourse === 'all' || member.course === selectedCourse;
      return searchMatch && departmentMatch && courseMatch;
    });
  }, [members, searchTerm, selectedDepartment, selectedCourse]);

  const seatsUsed = members ? members.length : 0;
  const seatsAvailable = organization.seats - seatsUsed;
  const seatLimitReached = seatsAvailable <= 0;

  const handleToggleBetaFeatures = (enabled: boolean) => {
    const orgIndex = mockOrganizations.findIndex(
      (o) => o.id === organization.id,
    );
    if (orgIndex > -1)
      mockOrganizations[orgIndex].betaFeaturesEnabled = enabled;
    setOrganization({ ...organization, betaFeaturesEnabled: enabled });
    toast({
      title: 'Settings Updated',
      description: `Beta features are now ${enabled ? 'enabled' : 'disabled'}.`,
    });
  };

  const onMemberSubmit = (values: MemberFormValues) => {
    if (editingMember) {
      // Edit existing member
      const updatedMember = { ...editingMember, ...values };
      const updatedMembers = members.map((m) =>
        m.id === editingMember.id ? updatedMember : m,
      );
      const userIndex = mockUsers.findIndex((u) => u.id === editingMember.id);
      if (userIndex > -1) mockUsers[userIndex] = updatedMember;

      setMembers(updatedMembers);
      toast({
        title: 'Member Updated',
        description: `${values.fullName}'s details have been saved.`,
      });
      setIsEditMemberOpen(false);
      setEditingMember(null);
    } else {
      // Add new member
      const newMember: UserProfile = {
        id: `user-${Date.now()}`,
        ...values,
        createdAt: new Date().toISOString(),
        organizationId: organization.id,
        currentPlanId: organization.planId,
        jobPreference: 'Not specified',
        narratives: { challenges: '', achievements: '', appreciation: '' },
        education: [],
        experience: [],
        projects: [],
        skills: [],
        referralCode: `USR${Date.now()}`,
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
        autoApplyAgents: [],
        savedCvs: [],
        savedCoverLetters: [],
        actionItems: [],
        role: values.role,
      };

      mockUsers.push(newMember);
      setMembers([...members, newMember]);

      toast({
        title: 'Member Added Successfully',
        description: `${values.fullName} can now log in with the password 'Student@123'.`,
      });
      setIsAddMemberOpen(false);
    }
    memberForm.reset();
  };

  const handleDelete = (userId: string) => {
    const updatedMembers = members.filter((m) => m.id !== userId);
    const updatedMockUsers = mockUsers.filter((u) => u.id !== userId);
    mockUsers.length = 0;
    Array.prototype.push.apply(mockUsers, updatedMockUsers);

    setMembers(updatedMembers);
    setSelectedIds((prev) => prev.filter((id) => id !== userId));
    toast({ title: 'Member Deleted' });
  };

  const handleDeleteSelected = () => {
    const updatedMembers = members.filter((m) => !selectedIds.includes(m.id));
    const updatedMockUsers = mockUsers.filter(
      (u) => !selectedIds.includes(u.id),
    );
    mockUsers.length = 0;
    Array.prototype.push.apply(mockUsers, updatedMockUsers);

    setMembers(updatedMembers);
    toast({ title: `${selectedIds.length} members deleted.` });
    setSelectedIds([]);
  };

  const handleSelectAll = (checked: boolean | string) => {
    setSelectedIds(checked ? filteredMembers.map((m) => m.id) : []);
  };

  const handleSelectRow = (id: string, checked: boolean | string) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((rowId) => rowId !== id),
    );
  };

  const handleDownloadTemplate = () => {
    const csvHeader = 'fullName,email,role,department,course\n';
    const csvExample =
      'John Student,john.s@example.com,OrgMember,Engineering,Computer Science';
    const csvContent = csvHeader + csvExample;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'member_import_template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    toast({ title: 'Importing Members...', description: 'Parsing CSV file.' });

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        let importedCount = 0;
        let errorCount = 0;
        const newMembers: UserProfile[] = [];
        const availableSeatsForImport =
          organization.seats - (members ? members.length : 0);

        const rowsToProcess = results.data.slice(0, availableSeatsForImport);
        const skippedRowCount = results.data.length - rowsToProcess.length;

        rowsToProcess.forEach((row: any) => {
          const result = memberFormSchema.safeParse(row);
          if (result.success) {
            const newMember: UserProfile = {
              id: `user-${Date.now()}-${importedCount}`,
              ...result.data,
              createdAt: new Date().toISOString(),
              organizationId: organization.id,
              currentPlanId: organization.planId,
              jobPreference: 'Not specified',
              narratives: {
                challenges: '',
                achievements: '',
                appreciation: '',
              },
              education: [],
              experience: [],
              projects: [],
              skills: [],
              referralCode: `USR${Date.now()}`,
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
              autoApplyAgents: [],
              savedCvs: [],
              savedCoverLetters: [],
              actionItems: [],
              role: result.data.role,
            };
            newMembers.push(newMember);
            importedCount++;
          } else {
            console.warn('CSV Row validation error:', result.error);
            errorCount++;
          }
        });

        if (newMembers.length > 0) {
          mockUsers.push(...newMembers);
          setMembers((prev) => [...(prev || []), ...newMembers]);
        }

        toast({
          title: 'Import Complete',
          description: `${importedCount} members imported successfully. ${
            errorCount > 0 ? `${errorCount} rows had errors. ` : ''
          }${
            skippedRowCount > 0
              ? `${skippedRowCount} rows were skipped due to seat limits.`
              : ''
          }`,
        });
        setIsImporting(false);
      },
      error: (error) => {
        toast({
          variant: 'destructive',
          title: 'Import Failed',
          description: error.message,
        });
        setIsImporting(false);
      },
    });

    if (csvImportRef.current) {
      csvImportRef.current.value = '';
    }
  };

  const analyticsData = useMemo(() => {
    if (!members)
      return {
        usage: { applications: 0, cvs: 0, coverLetters: 0 },
        chartData: [],
      };
    const usage = members.reduce(
      (acc, member) => {
        acc.applications += member.usage.applications;
        acc.cvs += member.usage.aiCvGenerator;
        acc.coverLetters += member.usage.aiCoverLetterGenerator;
        return acc;
      },
      { applications: 0, cvs: 0, coverLetters: 0 },
    );

    const chartData = [
      { name: 'Applications', value: usage.applications },
      { name: 'Generated CVs', value: usage.cvs },
      { name: 'Generated CLs', value: usage.coverLetters },
    ];
    return { usage, chartData };
  }, [members]);

  const chartConfig = {
    value: { label: 'Count', color: 'hsl(var(--chart-1))' },
  } satisfies ChartConfig;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Plan"
          value={organization.planId
            .replace('_', ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase())}
          icon={ShieldCheck}
        />
        <StatCard title="Seats Used" value={seatsUsed} icon={Users} />
        <StatCard
          title="Seats Available"
          value={seatsAvailable}
          icon={Building}
        />
      </div>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">
            <Users className="mr-2 h-4 w-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart2 className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="members" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Member Management</CardTitle>
              <CardDescription>
                Invite, view, and manage members of this organization.
              </CardDescription>

              <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
                <Input
                  type="search"
                  placeholder="Search by name or email..."
                  className="flex-grow"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select
                  value={selectedDepartment}
                  onValueChange={setSelectedDepartment}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueDepartments.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d === 'all' ? 'All Departments' : d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedCourse}
                  onValueChange={setSelectedCourse}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueCourses.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c === 'all' ? 'All Courses' : c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <Dialog
                    open={isAddMemberOpen}
                    onOpenChange={setIsAddMemberOpen}
                  >
                    <DialogTrigger asChild>
                      <Button disabled={seatLimitReached}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add New Member</DialogTitle>
                        <DialogDescription>
                          Fill in the details to add a new member. Their default
                          password will be 'Student@123'.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...memberForm}>
                        <form
                          onSubmit={memberForm.handleSubmit(onMemberSubmit)}
                          className="space-y-4 py-4"
                        >
                          <FormField
                            control={memberForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={memberForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={memberForm.control}
                            name="department"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Department (Optional)</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={memberForm.control}
                            name="course"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Course / Specialization (Optional)
                                </FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={memberForm.control}
                            name="role"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="OrgMember">
                                      Student Member
                                    </SelectItem>
                                    <SelectItem value="OrgAdmin">
                                      Admin
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <DialogFooter>
                            <Button type="submit">Add Member</Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    onClick={() => csvImportRef.current?.click()}
                    disabled={isImporting || seatLimitReached}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Import from CSV
                  </Button>
                  <input
                    type="file"
                    ref={csvImportRef}
                    onChange={handleFileImport}
                    className="hidden"
                    accept=".csv"
                  />
                </div>
                {selectedIds.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Selected ({selectedIds.length})
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will permanently delete{' '}
                          {selectedIds.length} member(s).
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteSelected}>
                          Confirm Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              <div className="mt-2 flex justify-start">
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  className="p-0 h-auto"
                >
                  <Download className="mr-1 h-3 w-3" />
                  Download CSV Template
                </Button>
              </div>
              {seatLimitReached && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Seat Limit Reached</AlertTitle>
                  <AlertDescription>
                    You have used all {organization.seats} of your purchased
                    seats. To add more members, please upgrade your plan.
                    <Button
                      asChild
                      variant="link"
                      className="p-0 h-auto ml-1 font-semibold"
                    >
                      <Link href="/subscriptions">Manage Subscription</Link>
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        onCheckedChange={handleSelectAll}
                        checked={
                          selectedIds.length > 0 &&
                          selectedIds.length === filteredMembers.length &&
                          filteredMembers.length > 0
                        }
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow
                      key={member.id}
                      data-state={selectedIds.includes(member.id) && 'selected'}
                    >
                      <TableCell>
                        <Checkbox
                          onCheckedChange={(checked) =>
                            handleSelectRow(member.id, checked)
                          }
                          checked={selectedIds.includes(member.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>{member.fullName}</div>
                        <div className="text-xs text-muted-foreground">
                          {member.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{member.department}</div>
                        <div className="text-xs text-muted-foreground">
                          {member.course}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            member.role === 'OrgAdmin' ? 'default' : 'secondary'
                          }
                        >
                          {member.role === 'OrgAdmin' ? 'Admin' : 'Member'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-300 bg-green-50"
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() => openEditDialog(member)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Member
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/primary-admin/users/${member.id}`}>
                                <DollarSign className="mr-2 h-4 w-4" />
                                Manage Subscription
                              </Link>
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Member
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete {member.fullName}?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently remove the member from
                                    the organization.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(member.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Confirm Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredMembers.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  No members found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Analytics</CardTitle>
              <CardDescription>
                An overview of your organization's platform usage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                  title="Total Applications"
                  value={analyticsData.usage.applications}
                  icon={Users}
                />
                <StatCard
                  title="AI CVs Generated"
                  value={analyticsData.usage.cvs}
                  icon={Users}
                />
                <StatCard
                  title="AI Cover Letters"
                  value={analyticsData.usage.coverLetters}
                  icon={Users}
                />
              </div>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart data={analyticsData.chartData} accessibilityLayer>
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription & Feature Settings</CardTitle>
              <CardDescription>
                Control how your members interact with plans and features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Click the button below to go to the subscriptions page where you
                can change your plan or purchase more seats for your members.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/subscriptions">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Manage Plan & Seats
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- Edit Member Dialog --- */}
      <Dialog open={isEditMemberOpen} onOpenChange={setIsEditMemberOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>
              Update the details for {editingMember?.fullName}.
            </DialogDescription>
          </DialogHeader>
          <Form {...memberForm}>
            <form
              onSubmit={memberForm.handleSubmit(onMemberSubmit)}
              className="space-y-4 py-4"
            >
              <FormField
                control={memberForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={memberForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={memberForm.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={memberForm.control}
                name="course"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course / Specialization (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={memberForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="OrgMember">
                          Student Member
                        </SelectItem>
                        <SelectItem value="OrgAdmin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
