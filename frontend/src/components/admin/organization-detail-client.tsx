'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Papa from 'papaparse';
import Link from 'next/link';
import type { Organization, UserProfile } from '@/lib/data/user';
import { mockOrganizations, mockUsers } from '@/lib/data/user';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface OrganizationDetailClientProps {
  organization: Organization;
  initialMembers: UserProfile[];
}

const memberFormSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email.'),
  role: z.enum(['OrgMember', 'OrgAdmin']),
  department: z.string().optional().default(''),
  course: z.string().optional().default(''),
});
type MemberFormValues = z.infer<typeof memberFormSchema>;

const createNewMemberProfile = (
  values: MemberFormValues,
  organizationId: string,
): UserProfile => ({
  id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  ...values,
  createdAt: new Date().toISOString(),
  organizationId: organizationId,
  currentPlanId: mockOrganizations.find((o) => o.id === organizationId)
    ?.planId as string,
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
  department: values.department || '',
  course: values.course || '',
});

function useOrganizationData(
  initialOrganization: Organization,
  initialMembers: UserProfile[],
) {
  const { toast } = useToast();
  const [organization, setOrganization] = useState(initialOrganization);
  const [members, setMembers] = useState(initialMembers);

  const updateOrganizationSettings = useCallback(
    (key: keyof Organization, value: any) => {
      const orgIndex = mockOrganizations.findIndex(
        (o) => o.id === organization.id,
      );
      if (orgIndex > -1) {
        (mockOrganizations[orgIndex] as any)[key] = value;
      }
      setOrganization((prev) => ({ ...prev, [key]: value } as Organization));
    },
    [organization.id],
  );

  const addMember = useCallback(
    (values: MemberFormValues) => {
      const newMember = createNewMemberProfile(values, organization.id);
      mockUsers.push(newMember);
      setMembers((prev) => [...prev, newMember]);
      toast({
        title: 'Member Added Successfully',
        description: `${values.fullName} can now log in with the password 'Student@123'.`,
      });
    },
    [organization.id, toast],
  );

  const updateMember = useCallback(
    (id: string, values: MemberFormValues) => {
      setMembers((prev) => {
        const updatedMembers = prev.map((m) =>
          m.id === id ? { ...m, ...values } : m,
        );
        // Update mock data array
        const userIndex = mockUsers.findIndex((u) => u.id === id);
        if (userIndex > -1)
          mockUsers[userIndex] = updatedMembers.find(
            (m) => m.id === id,
          ) as UserProfile;
        return updatedMembers;
      });
      toast({
        title: 'Member Updated',
        description: `${values.fullName}'s details have been saved.`,
      });
    },
    [toast],
  );

  const deleteMembers = useCallback(
    (ids: string[]) => {
      setMembers((prev) => prev.filter((m) => !ids.includes(m.id)));
      // Update mock data array
      const updatedMockUsers = mockUsers.filter((u) => !ids.includes(u.id));
      mockUsers.length = 0; // Clear the array
      Array.prototype.push.apply(mockUsers, updatedMockUsers); // Repopulate
      toast({ title: `${ids.length} member(s) deleted.` });
    },
    [toast],
  );

  const importMembers = useCallback(
    (newMembersData: MemberFormValues[]) => {
      const newMembers: UserProfile[] = newMembersData.map((data, index) =>
        createNewMemberProfile(data, organization.id),
      );

      mockUsers.push(...newMembers);
      setMembers((prev) => [...prev, ...newMembers]);
      return newMembers.length;
    },
    [organization.id],
  );

  return {
    organization,
    members,
    updateOrganizationSettings,
    addMember,
    updateMember,
    deleteMembers,
    importMembers,
  };
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

interface AddEditMemberDialogProps {
  memberForm: ReturnType<typeof useForm<MemberFormValues>>;
  onSubmit: (values: MemberFormValues) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingMember: UserProfile | null;
}

function AddEditMemberDialog({
  memberForm,
  onSubmit,
  isOpen,
  onOpenChange,
  editingMember,
}: AddEditMemberDialogProps) {
  const isEditing = !!editingMember;

  // Determine if the form is currently submitting
  const isSubmitting = memberForm.formState.isSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Member' : 'Add New Member'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Update the details for ${editingMember?.fullName}.`
              : "Fill in the details to add a new member. Their default password will be 'Student@123'."}
          </DialogDescription>
        </DialogHeader>
        <Form {...memberForm}>
          <form
            onSubmit={memberForm.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={memberForm.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Mohd Arsalan" />
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
                    <Input
                      type="email"
                      {...field}
                      readOnly={isEditing} // Email should ideally be readOnly when editing
                      placeholder="e.g., mohd.arsalan@example.com"
                    />
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
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder="e.g., Engineering"
                    />
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
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder="e.g., Computer Science"
                    />
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
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="OrgMember">Student Member</SelectItem>
                      <SelectItem value="OrgAdmin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              {/* Button uses the default primary style, removing the inconsistent bg-black. 
                  Added 'disabled' and 'isSubmitting' for better user experience. */}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? isEditing
                    ? 'Saving...'
                    : 'Adding...'
                  : isEditing
                  ? 'Save Changes'
                  : 'Add Member'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function OrganizationDetailClient({
  organization: initialOrganization,
  initialMembers,
}: OrganizationDetailClientProps) {
  const { toast } = useToast();
  const {
    organization,
    members,
    addMember,
    updateMember,
    deleteMembers,
    importMembers,
  } = useOrganizationData(initialOrganization, initialMembers);

  // --- Filtering and State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<UserProfile | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const csvImportRef = useRef<HTMLInputElement>(null);

  // --- Derived State ---
  const seatsUsed = members.length;
  const seatsAvailable = organization.seats - seatsUsed;
  const seatLimitReached = seatsAvailable <= 0;

  // --- Memoized Filter Options ---
  const uniqueDepartments = useMemo(() => {
    return [
      'all',
      ...Array.from(new Set(members.map((m) => m.department).filter(Boolean))),
    ];
  }, [members]);

  const uniqueCourses = useMemo(() => {
    const courses = members
      .filter(
        (m) =>
          selectedDepartment === 'all' || m.department === selectedDepartment,
      )
      .map((m) => m.course)
      .filter(Boolean);
    return ['all', ...Array.from(new Set(courses))];
  }, [members, selectedDepartment]);

  // --- Memoized Filtered Members ---
  const filteredMembers = useMemo(() => {
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

  // --- Form Hooks and Handlers ---
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

  const openAddDialog = () => {
    memberForm.reset({
      fullName: '',
      email: '',
      role: 'OrgMember',
      department: '',
      course: '',
    });
    setEditingMember(null);
    setIsAddMemberOpen(true);
  };

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

  const onMemberSubmit = (values: MemberFormValues) => {
    if (editingMember) {
      updateMember(editingMember.id, values);
      setIsEditMemberOpen(false);
      setEditingMember(null);
    } else {
      addMember(values);
      setIsAddMemberOpen(false);
    }
    memberForm.reset();
  };

  const handleDeleteSelected = () => {
    deleteMembers(selectedIds);
    setSelectedIds([]);
  };

  // --- Table Selection Handlers ---
  const handleSelectAll = (checked: boolean | string) => {
    setSelectedIds(checked ? filteredMembers.map((m) => m.id) : []);
  };

  const handleSelectRow = (id: string, checked: boolean | string) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((rowId) => rowId !== id),
    );
  };

  // --- CSV Handlers ---
  const handleDownloadTemplate = () => {
    const csvContent =
      'fullName,email,role,department,course\nJohn Student,john.s@example.com,OrgMember,Engineering,Computer Science';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'member_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    toast({ title: 'Importing Members...', description: 'Parsing CSV file.' });

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        let importedCount = 0;
        let errorCount = 0;
        const membersToImport: MemberFormValues[] = [];
        const availableSeatsForImport = organization.seats - members.length;
        const rowsToProcess = results.data.slice(0, availableSeatsForImport);
        const skippedRowCount = results.data.length - rowsToProcess.length;

        rowsToProcess.forEach((row: any) => {
          // Normalize role value for validation
          if (row.role) {
            row.role = row.role.toLowerCase().includes('admin')
              ? 'OrgAdmin'
              : 'OrgMember';
          }
          const result = memberFormSchema.safeParse(row);

          if (result.success) {
            // Check for duplicate email (simple client-side check)
            if (
              members.some(
                (m) =>
                  m.email.toLowerCase() === result.data.email.toLowerCase(),
              )
            ) {
              errorCount++;
              console.warn(`Skipping duplicate email: ${result.data.email}`);
              return;
            }
            membersToImport.push(result.data);
            importedCount++;
          } else {
            console.warn('CSV Row validation error:', result.error);
            errorCount++;
          }
        });

        if (membersToImport.length > 0) {
          importMembers(membersToImport); // State update handled in custom hook
        }

        toast({
          title: 'Import Complete',
          description: `${importedCount} members imported successfully. ${
            errorCount > 0 ? `${errorCount} rows had errors/duplicates. ` : ''
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

  // --- Analytics Data Memo ---
  const analyticsData = useMemo(() => {
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

  // --- MemberTable Subcomponent ---
  const MemberTable = () => (
    <>
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
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
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
          <Button onClick={openAddDialog} disabled={seatLimitReached}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
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
            key={isImporting ? 'uploading' : 'ready'} // Reset input after use
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
                  This action will permanently delete {selectedIds.length}{' '}
                  member(s).
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
            You have used all {organization.seats} of your purchased seats. To
            add more members, please upgrade your plan.
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

      <div className="mt-6">
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
                  <div>{member.department || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground">
                    {member.course || 'N/A'}
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
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => openEditDialog(member)}>
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
                              This will permanently remove the member from the
                              organization.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMembers([member.id])}
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
            No members found matching your filters.
          </div>
        )}
      </div>
    </>
  );

  // --- AnalyticsTab Subcomponent ---
  const AnalyticsTab = () => (
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
  );

  // --- SettingsTab Subcomponent ---
  const SettingsTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>Subscription & Feature Settings</CardTitle>
        <CardDescription>
          Control how your members interact with plans and features.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Click the button below to go to the subscriptions page where you can
          change your plan or purchase more seats for your members.
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
  );

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
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

      {/* Tabs */}
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
            </CardHeader>
            <CardContent>
              <MemberTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="mt-4">
          <AnalyticsTab />
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <SettingsTab />
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <AddEditMemberDialog
        memberForm={memberForm}
        onSubmit={onMemberSubmit}
        isOpen={isAddMemberOpen || isEditMemberOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddMemberOpen(false);
            setIsEditMemberOpen(false);
            setEditingMember(null);
          }
        }}
        editingMember={editingMember}
      />
    </div>
  );
}
