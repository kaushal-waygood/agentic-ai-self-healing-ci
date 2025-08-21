'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  Search,
  Loader2,
  Trash2,
  MailOpen,
  RefreshCw,
  TrendingUp,
  Star,
  MoreHorizontal,
  Building2,
  Calendar,
  Filter,
} from 'lucide-react';

// UI Components from shadcn/ui
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Hooks & Utilities
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/formatDate';
import apiInstance from '@/services/api';

// AI & Mock Data Imports (as in your original code)
import { processIncomingEmail } from '@/ai/flows/process-incoming-email-flow';
import { mockUserProfile } from '@/lib/data/user'; // Used in handleSyncInbox
import type { MockApplication } from '@/lib/data/applications'; // Assuming this type is defined

// --- Enhanced Configuration for Statuses ---
const statusConfig: {
  [key: string]: {
    bgColor: string;
    textColor: string;
    borderColor: string;
    icon: string;
  };
} = {
  Applied: {
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
    icon: '📧',
  },
  'AI-Drafted': {
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-300',
    icon: '🤖',
  },
  Sent: {
    bgColor: 'bg-primary/10',
    textColor: 'text-primary',
    borderColor: 'border-primary/30',
    icon: '✈️',
  },
  Viewed: {
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300',
    icon: '👀',
  },
  Interviewing: {
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-300',
    icon: '🎯',
  },
  'Offer Extended': {
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-300',
    icon: '🎉',
  },
  Rejected: {
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-300',
    icon: '❌',
  },
  Draft: {
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
    icon: '📝',
  },
  Error: {
    bgColor: 'bg-destructive/10',
    textColor: 'text-destructive',
    borderColor: 'border-destructive/30',
    icon: '⚠️',
  },
};

const applicationStatuses = Object.keys(
  statusConfig,
) as MockApplication['status'][];

// --- Sub-components for a Cleaner Structure ---

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) => (
  <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300">
    <CardContent className="p-4 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className={cn('p-3 rounded-lg', `bg-${color}-100`)}>
        <Icon className={cn('h-6 w-6', `text-${color}-600`)} />
      </div>
    </CardContent>
  </Card>
);

const ApplicationCard = ({
  app,
  isSelected,
  onSelect,
  onStatusChange,
}: {
  app: MockApplication;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onStatusChange: (appId: string, newStatus: MockApplication['status']) => void;
}) => {
  // --- FIX 1: Add a fallback for the config ---
  // If app.status is not found in statusConfig, it will default to the 'Error' style.
  // This prevents the 'config' variable from ever being undefined.
  const config = statusConfig[app.status] || statusConfig['Error'];

  return (
    <Card
      className={cn(
        'group relative rounded-xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
        isSelected
          ? 'border-primary shadow-lg bg-primary/5'
          : 'border-border hover:border-muted-foreground/30',
      )}
    >
      <div className="p-5">
        <div className="absolute top-4 left-4 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(app.id, !!checked)}
            aria-label={`Select application for ${app.job.title}`}
          />
        </div>

        <div className="mb-4 pt-6">
          <div className="flex items-center gap-2 mb-1 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>{app.job.company}</span>
          </div>
          <h3 className="font-bold text-lg text-card-foreground group-hover:text-primary transition-colors duration-200">
            {app.job.title}
          </h3>
        </div>

        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Applied: {formatDate(app.appliedAt)}</span>
        </div>

        <div className="mb-4">
          <Select
            value={app.status}
            onValueChange={(newStatus) =>
              onStatusChange(app.id, newStatus as MockApplication['status'])
            }
          >
            <SelectTrigger
              className={cn(
                'w-full focus:ring-2 focus:ring-offset-2 font-semibold text-xs h-9 px-3',
                config.bgColor,
                config.textColor,
                config.borderColor,
              )}
            >
              <div className="flex items-center gap-2">
                <span>{config.icon}</span>
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {applicationStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  <div className="flex items-center gap-2">
                    <span>{statusConfig[status].icon}</span>
                    <span>{status}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {app.notes && app.notes.length > 0 && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-2 mb-1">
              <MailOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Latest Update
              </span>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {app.notes[app.notes.length - 1]}
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t">
          <Button
            className="flex-1"
            variant="default"
            size="sm"
            asChild
            disabled={app.status === 'Draft' || app.status === 'Error'}
          >
            <Link href={`/applications/${app.id}`}>View / Edit</Link>
          </Button>
          <Button variant="outline" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<MockApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      try {
        const response = await apiInstance.get('/students/job/applications');
        setApplications(response.data.appliedJobs || []);
      } catch (error) {
        console.error('Failed to fetch applications:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch your applications.',
        });
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplications();
  }, [toast]);

  const filteredApplications = useMemo(() => {
    let filtered = applications;

    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.job.title.toLowerCase().includes(lowercasedSearchTerm) ||
          app.job.company.toLowerCase().includes(lowercasedSearchTerm),
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    return filtered;
  }, [applications, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = applications.length;
    const interviewing = applications.filter(
      (app) => app.status === 'Interviewing',
    ).length;
    const offers = applications.filter(
      (app) => app.status === 'Offer Extended',
    ).length;
    return { total, interviewing, offers };
  }, [applications]);

  const handleSelectAll = (checked: boolean | string) => {
    setSelectedIds(checked ? filteredApplications.map((app) => app.id) : []);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((rowId) => rowId !== id),
    );
  };

  const handleStatusChange = (
    appId: string,
    newStatus: MockApplication['status'],
  ) => {
    setApplications((prevApps) => {
      const newApps = [...prevApps];
      const appIndex = newApps.findIndex((a) => a.id === appId);
      if (appIndex === -1) return prevApps;

      const oldStatus = newApps[appIndex].status;

      if (newStatus === 'Interviewing' && oldStatus !== 'Interviewing') {
        mockUserProfile.careerXp = (mockUserProfile.careerXp || 0) + 100;
        toast({
          title: '+100 Career XP!',
          description: 'Great work on securing an interview!',
        });
      }
      if (newStatus === 'Offer Extended' && oldStatus !== 'Offer Extended') {
        mockUserProfile.careerXp = (mockUserProfile.careerXp || 0) + 500;
        toast({
          title: '+500 Career XP! 🎉',
          description: 'Congratulations on the offer!',
        });
      }

      newApps[appIndex].status = newStatus;
      if (!newApps[appIndex].notes) {
        newApps[appIndex].notes = [];
      }
      newApps[appIndex].notes!.push(
        `Status manually changed to "${newStatus}".`,
      );

      toast({
        title: 'Status Updated',
        description: `Application status changed to "${newStatus}".`,
      });

      return newApps;
    });
  };

  const handleDeleteSelected = () => {
    setApplications((prev) =>
      prev.filter((app) => !selectedIds.includes(app.id)),
    );
    toast({
      title: 'Applications Deleted',
      description: `${selectedIds.length} application(s) have been removed.`,
    });
    setSelectedIds([]);
  };

  const handleSyncInbox = async () => {
    setIsSyncing(true);
    toast({
      title: 'Syncing Inbox...',
      description: 'Checking for new replies to your applications.',
    });

    const appliedApp = applications.find(
      (app) => app.status === 'Applied' || app.status === 'Sent',
    );

    if (!appliedApp) {
      toast({
        title: 'No Pending Applications',
        description: 'No applications to check for replies right now.',
        variant: 'default',
      });
      setIsSyncing(false);
      return;
    }

    const isPositiveReply = Math.random() > 0.5;
    const fakeEmailContent = isPositiveReply
      ? `From: recruiter@${appliedApp.job.company
          .toLowerCase()
          .replace(/\s/g, '')}.com\nSubject: Re: Your Application for ${
          appliedApp.job.title
        }\n\nHi ${
          mockUserProfile.fullName
        },\n\nWe were impressed and would like to schedule a call.`
      : `From: no-reply@${appliedApp.job.company
          .toLowerCase()
          .replace(
            /\s/g,
            '',
          )}.com\nSubject: An update on your application for ${
          appliedApp.job.title
        }\n\nDear ${
          mockUserProfile.fullName
        },\n\nAfter careful consideration, we have decided to move forward with other candidates.`;

    try {
      const result = await processIncomingEmail({
        emailContent: fakeEmailContent,
        userApplications: applications.map((a) => ({
          id: a.id,
          jobTitle: a.job.title,
          company: a.job.company,
        })),
      });

      if (result.isRelevant && result.applicationId && result.summary) {
        if (result.newStatus) {
          handleStatusChange(result.applicationId, result.newStatus);
        }
        setApplications((prevApps) => {
          const newApps = [...prevApps];
          const appIndex = newApps.findIndex(
            (a) => a.id === result.applicationId,
          );
          if (appIndex > -1) {
            if (!newApps[appIndex].notes) {
              newApps[appIndex].notes = [];
            }
            newApps[appIndex].notes!.push(result.summary);
          }
          return newApps;
        });

        mockUserProfile.actionItems.unshift({
          id: `action-${Date.now()}`,
          applicationId: result.applicationId,
          summary: result.summary,
          date: new Date().toISOString(),
          isRead: false,
        });

        toast({ title: 'New Reply Found!', description: result.summary });
      } else {
        toast({ title: 'No new relevant emails found.' });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Sync Failed',
        description: 'Could not process inbox updates.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="My Applications"
          description="Track and manage your entire job application journey from one place."
          icon={FileCheck2}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            label="Total Applications"
            value={stats.total}
            icon={FileCheck2}
            color="blue"
          />
          <StatCard
            label="Active Interviews"
            value={stats.interviewing}
            icon={TrendingUp}
            color="yellow"
          />
          <StatCard
            label="Offers Received"
            value={stats.offers}
            icon={Star}
            color="green"
          />
        </div>

        <Card className="shadow-lg mb-6">
          <CardContent className="p-4 flex flex-col lg:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full lg:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by job title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 w-full lg:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {applicationStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleSyncInbox}
                disabled={isSyncing}
                variant="outline"
              >
                {isSyncing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Sync
              </Button>
              {selectedIds.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />({selectedIds.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete {selectedIds.length}{' '}
                        application(s). This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteSelected}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : filteredApplications.length > 0 ? (
          <>
            <div className="mb-4 flex items-center p-3 bg-card border rounded-lg">
              <Checkbox
                id="select-all"
                checked={
                  selectedIds.length > 0 &&
                  selectedIds.length === filteredApplications.length
                }
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="ml-3 text-sm font-medium">
                Select All ({filteredApplications.length})
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredApplications.map((app) => (
                // --- FIX 2: Use app.id as the key ---
                // This ensures React can efficiently and correctly update the list.
                <ApplicationCard
                  key={app.id}
                  app={app}
                  isSelected={selectedIds.includes(app.id)}
                  onSelect={handleSelectRow}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16 px-6 bg-card rounded-xl border-2 border-dashed">
            <FileCheck2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">
              No Applications Found
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchTerm || statusFilter !== 'all'
                ? "Your search or filter criteria didn't match any applications."
                : "It looks like you haven't applied for any jobs yet. Let's get started!"}
            </p>
            <Button className="mt-6" asChild>
              <Link href="/search-jobs">Find Your Next Job</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
