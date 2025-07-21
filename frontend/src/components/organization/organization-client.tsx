'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  AlertTriangle,
  Briefcase,
  Copy,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockOrganizations, mockUsers } from '@/lib/data/user';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '../ui/textarea';
import { mockJobListings, JobListing, JobStatus } from '@/lib/data/jobs';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllOrganizationMemberRequest,
  addOrganizationMemberRequest,
  deleteOrganizationMemberRequest,
  filterOrganizationMemberRequest,
  getAllOrgMembersUniqueDepartmentsRequest,
  getAllOrgMembersUniqueCourseRequest,
} from '@/redux/reducers/organizationsReducer';
import { RootState } from '@/redux/rootReducer';
import UpdateMemberForm, { UpdateJobStatus } from './UpdateMemberForm';
import { useRouter } from 'next/navigation';
import {
  getAllJobPostsByOrgAdminRequest,
  updateJobStatusRequest,
} from '@/redux/reducers/jobReducer';
import { formatDate } from '@/utils/formatDate';
import { set } from 'date-fns';

interface OrganizationClientProps {
  organization: Organization;
  initialMembers: UserProfile[];
  initialJobs: JobListing[];
}

const memberFormSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email.'),
  role: z.enum(['admin', 'member']), // Changed from OrgMember/member to be consistent
  department: z.string().optional(),
  course: z.string().optional(),
});
type MemberFormValues = z.infer<typeof memberFormSchema>;

const postJobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  location: z.string().min(1, 'Location is required'),
  description: z.string().min(1, 'Description is required'),
  jobUrl: z.string().url('A valid job URL is required'),
  employmentType: z
    .enum(['FULLTIME', 'PARTTIME', 'CONTRACT', 'INTERN'])
    .optional(),
  salary: z.string().optional(),
});
type PostJobValues = z.infer<typeof postJobSchema>;

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

const statusConfig: Record<JobStatus, { color: string; text: string }> = {
  pending_review: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    text: 'Pending Review',
  },
  published: {
    color: 'bg-green-100 text-green-800 border-green-300',
    text: 'Published',
  },
  rejected: {
    color: 'bg-red-100 text-red-800 border-red-300',
    text: 'Rejected',
  },
  archived: {
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    text: 'Archived',
  },
  draft: { color: 'bg-blue-100 text-blue-800 border-blue-300', text: 'Draft' },
};

type memberRole = 'admin' | 'member';

export type membersType = {
  id: string;
  fullName: string;
  email: string;
  role: memberRole;
  department: string;
  course: string;
  _id: string;
};

export function OrganizationClient({
  organization: initialOrganization,
  initialMembers,
  initialJobs,
}: OrganizationClientProps) {
  const { toast } = useToast();

  const router = useRouter();
  const [organization, setOrganization] = useState(initialOrganization);
  const [members, setMembers] = useState(initialMembers);
  const [jobs, setJobs] = useState(initialJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<UserProfile | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [toggleJobStatus, setToggleJobStatus] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const csvImportRef = useRef<HTMLInputElement>(null);
  const isPendingVerification =
    organization.isEmailVerified === 'pending_verification';

  const dispatch = useDispatch();

  const {
    members: membersList,
    departments: uniqueDepartments,
    courses: uniqueCourses,
    loading,
    error,
  } = useSelector((state: RootState) => state.organizations);

  const { jobs: jobsList } = useSelector((state: RootState) => state.jobs);

  const openEditDialog = (member: membersType) => {
    setEditingMember(member);
    setIsEditMemberOpen(true);
  };

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

  const handleGenerateApiKey = () => {
    const newKey = `sk_${organization.name.slice(0, 5).toLowerCase()}_${[
      ...Array(32),
    ]
      .map(() => Math.random().toString(36)[2])
      .join('')}`;
    const orgIndex = mockOrganizations.findIndex(
      (o) => o.id === organization.id,
    );
    if (orgIndex > -1) {
      mockOrganizations[orgIndex].apiKey = newKey;
      setOrganization({ ...mockOrganizations[orgIndex] });
      toast({
        title: 'New API Key Generated',
        description: 'Your old key has been invalidated.',
      });
    }
  };

  const copyApiKey = () => {
    if (organization.apiKey) {
      navigator.clipboard.writeText(organization.apiKey);
      toast({ title: 'API Key Copied' });
    }
  };

  const handleDelete = (memberId: string) => {
    try {
      dispatch(deleteOrganizationMemberRequest({ id: memberId }));
      toast({ title: 'Member Deleted' });
    } catch (error) {
      console.error('Error deleting member:', error);
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'An error occurred while deleting the member.',
      });
    }
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

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        dispatch(getAllOrganizationMemberRequest());
      } catch (error) {
        console.error('Error fetching members:', error);
      }
    };

    const fetchUniqueDepartments = async () => {
      try {
        dispatch(getAllOrgMembersUniqueDepartmentsRequest());
      } catch (error) {
        console.error('Error fetching unique departments:', error);
      }
    };

    const fetchUniqueCourses = async () => {
      try {
        dispatch(getAllOrgMembersUniqueCourseRequest());
      } catch (error) {
        console.error('Error  ');
      }
    };
    const fetchJobs = async () => {
      try {
        dispatch(getAllJobPostsByOrgAdminRequest());
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };

    fetchMembers();
    fetchUniqueDepartments();
    fetchUniqueCourses();
    fetchJobs();
  }, [dispatch]);

  const [filters, setFilters] = useState({
    fullName: '', // Initialize with empty string
    email: '',
    department: 'all',
    course: 'all',
  });

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      const { fullName, email, department, course } = filters;

      const query = new URLSearchParams();
      if (fullName) query.append('search', fullName);
      if (email) query.append('search', email);
      if (department !== 'all') query.append('department', department);
      if (course !== 'all') query.append('course', course);

      dispatch(
        filterOrganizationMemberRequest({
          fullName: filters.fullName,
          email: filters.email,
          department: filters.department !== 'all' ? filters.department : '',
          course: filters.course !== 'all' ? filters.course : '',
          limit: 10,
        }),
      );
    }, 300); // 300ms debounce

    return () => clearTimeout(timeout);
  }, [filters]);

  const handleToggleJobStatus = (id: string) => {
    setSelectedJobId(id);
    setToggleJobStatus(true);
  };

  const handleConfirmStatusUpdate = () => {
    if (!selectedJobId) return;
    dispatch(updateJobStatusRequest(selectedJobId));
    setToggleJobStatus(false);
  };
  return (
    <div className="">
      {isPendingVerification && (
        <Alert
          variant="destructive"
          className="border-yellow-400 bg-yellow-50 text-yellow-800"
        >
          <AlertTriangle className="h-4 w-4 !text-yellow-600" />
          <AlertTitle>Account Pending Verification</AlertTitle>
          <AlertDescription>
            Your institution's account is currently under review by our team.
            You will be notified once it has been verified. Some features, like
            adding members, are disabled until verification is complete.
          </AlertDescription>
        </Alert>
      )}
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members">
            <Users className="mr-2 h-4 w-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="jobs">
            <Briefcase className="mr-2 h-4 w-4" />
            Job Postings
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            API & Integrations
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
                  placeholder="Search by name"
                  className="flex-grow"
                  value={filters.fullName}
                  onChange={(e) =>
                    handleFilterChange('fullName', e.target.value)
                  }
                />

                <Input
                  type="search"
                  placeholder="Search by email..."
                  className="flex-grow"
                  value={filters.email}
                  onChange={(e) => handleFilterChange('email', e.target.value)}
                />

                <Select
                  value={filters.department}
                  onValueChange={(val) => handleFilterChange('department', val)}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {uniqueDepartments.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.course}
                  onValueChange={(val) => handleFilterChange('course', val)}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {uniqueCourses.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
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
                      <Button
                        disabled={seatLimitReached || isPendingVerification}
                        onClick={() => setIsAddMemberOpen(true)}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Member
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                  <Button
                    variant="outline"
                    onClick={() => csvImportRef.current?.click()}
                    disabled={
                      isImporting || seatLimitReached || isPendingVerification
                    }
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
              {seatLimitReached && !isPendingVerification && (
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
                  {membersList.map((member) => (
                    <TableRow
                      key={member._id}
                      data-state={
                        selectedIds.includes(member._id) && 'selected'
                      }
                    >
                      <TableCell>
                        <Checkbox
                          onCheckedChange={(checked) =>
                            handleSelectRow(member._id, checked)
                          }
                          checked={selectedIds.includes(member._id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>{member.name}</div>
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
                            member.role === 'admin' ? 'default' : 'secondary'
                          }
                        >
                          {member.role === 'admin' ? 'Admin' : 'Member'}
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
                                    Delete {member.name}?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently remove the member from
                                    the organization.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(member._id)}
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
              {membersList.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  No members found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="jobs" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Your Job Postings</CardTitle>
                  <CardDescription>
                    Manage jobs your institution has submitted.
                  </CardDescription>
                </div>
                <div>
                  <Button onClick={() => router.push('/organization/new-job')}>
                    Post a New Job
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Date Posted</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobsList.length > 0 ? (
                    jobsList.map((job) => (
                      <TableRow key={job._id}>
                        <TableCell className="font-medium">
                          {job.title}
                        </TableCell>
                        <TableCell>{job.location.city}</TableCell>
                        <TableCell>{formatDate(job.createdAt)}</TableCell>
                        <TableCell>
                          <Badge>{job.isActive ? 'Active' : 'Inactive'}</Badge>
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
                                onSelect={() => handleToggleJobStatus(job._id)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                {job.isActive ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => openEditDialog(job)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Job
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        You haven't posted any jobs yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>API & Integrations</CardTitle>
              <CardDescription>
                Manage your API key for programmatic job posting.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="api-key">Your API Key</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="api-key"
                    type="password"
                    readOnly
                    value={organization.apiKey || 'No key generated yet'}
                    className="font-mono bg-muted"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyApiKey}
                    disabled={!organization.apiKey}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This key is required to post jobs via the API endpoint.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="secondary" disabled={isPendingVerification}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate New API Key
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Generating a new API key will invalidate the old one
                      immediately. Any systems using the old key will stop
                      working.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleGenerateApiKey}>
                      Yes, Generate New Key
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
            <CardFooter>
              <Alert>
                <Briefcase className="h-4 w-4" />
                <AlertTitle>API Endpoint Information</AlertTitle>
                <AlertDescription>
                  <p>Send a POST request to:</p>
                  <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                    /api/v1/jobs/post
                  </code>
                  <p className="mt-2">
                    Include the API key in the Authorization header as a Bearer
                    token.
                  </p>
                </AlertDescription>
              </Alert>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {toggleJobStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col gap-6 bg-white rounded-lg p-6 shadow-lg w-[90%] max-w-sm">
            <h2 className="text-xl font-semibold text-gray-800">
              Update Job Status
            </h2>
            <p className="text-sm text-gray-600">
              Are you sure you want to update this job’s status?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => handleConfirmStatusUpdate(selectedJobId)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Yes
              </button>
              <button
                onClick={() => setToggleJobStatus(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditMemberOpen && (
        <div className="fixed h-screen w-screen top-0 left-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <UpdateMemberForm
            onClose={() => setIsEditMemberOpen(false)}
            member={editingMember}
            op="edit"
          />
        </div>
      )}

      {isAddMemberOpen && (
        <div className="fixed h-screen w-screen top-0 left-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <UpdateMemberForm
            onClose={() => setIsAddMemberOpen(false)} // ✅ Fix this too
            op="add"
          />
        </div>
      )}
    </div>
  );
}
