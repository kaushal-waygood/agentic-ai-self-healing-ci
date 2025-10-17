'use client';

import React, { useState, useEffect, useMemo, FC } from 'react';
import Link from 'next/link';

// --- Icon Imports ---
import {
  FileCheck2,
  Search,
  Loader2,
  Trash2,
  MailOpen,
  RefreshCw,
  TrendingUp,
  Award,
  MoreHorizontal,
  Building2,
  Calendar,
  Filter,
  Eye,
  Target,
  ArrowRight,
  Sparkles,
  ChevronDown,
  X,
} from 'lucide-react';

// --- UI & Utility Imports ---
import { useToast } from '@/hooks/use-toast';
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
import { getAllSavedJobs } from '@/services/api/student';
import {
  statusConfig,
  applicationStatuses,
  StatCard,
  ApplicationCard,
} from './components/statusConfig';
import { useRouter, useSearchParams } from 'next/navigation';

// --- Type Definitions ---
interface Job {
  title: string;
  company: string;
}

interface Application {
  id: string;
  job: Job;
  status:
    | 'Applied'
    | 'AI-Drafted'
    | 'Sent'
    | 'Viewed'
    | 'Interviewing'
    | 'Offer Extended'
    | 'Rejected'
    | 'Draft'
    | 'Error';
  appliedAt: string;
  notes?: string[];
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  // const [searchTerm, setSearchTerm] = useState('');
  // const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { toast } = useToast();

  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '');
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get('status') || 'all',
  );

  // useEffect(() => {
  //   const fetchApplications = async () => {
  //     setIsLoading(true);
  //     try {
  //       const response = await getAllSavedJobs();
  //       const savedJobsFromApi = response.data.savedJobs || [];

  //       // ***** FIX: Transform API data to match the component's expected structure *****
  //       const formattedApplications = savedJobsFromApi.map((apiJob: any) => ({
  //         id: apiJob._id, // Map _id to id
  //         job: {
  //           title: apiJob.title, // Nest title
  //           company: apiJob.company, // Nest company
  //         },
  //         // Assign a default status, since the API doesn't provide one
  //         status: 'saved',
  //         appliedAt: apiJob.createdAt, // Map createdAt to appliedAt
  //         // Add default notes or an empty array
  //         notes: ['Application saved on ZobsAI'],
  //       }));
  //       console.log('Formatted Applications:', formattedApplications);
  //       setApplications(formattedApplications);
  //     } catch (error) {
  //       console.error('Failed to fetch applications:', error);
  //       toast({
  //         variant: 'destructive',
  //         title: 'Error',
  //         description: 'Could not fetch your applications.',
  //       });
  //       setApplications([]);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   fetchApplications();
  // }, [toast]);
  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      try {
        let response;

        // 👇 choose API based on URL param "status"
        if (statusFilter === 'Applied') {
          // 🔹 Example: call applied jobs API
          response = await getAppliedJobs(); // <-- create this in your service file
        } else {
          // 🔹 Default: call saved jobs API
          response = await getAllSavedJobs();
        }

        const savedJobsFromApi = response.data.savedJobs || [];

        const formattedApplications = savedJobsFromApi.map((apiJob: any) => ({
          id: apiJob._id,
          job: {
            title: apiJob.title,
            company: apiJob.company,
          },
          status: apiJob.status || 'saved',
          appliedAt: apiJob.createdAt,
          notes: ['Application saved on ZobsAI'],
        }));

        setApplications(formattedApplications);
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
  }, [toast, statusFilter]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (searchTerm) params.set('query', searchTerm);
    if (statusFilter && statusFilter !== 'all')
      params.set('status', statusFilter);

    // Replace the current URL without refreshing the page
    router.replace(`${window.location.pathname}?${params.toString()}`);
  }, [searchTerm, statusFilter, router]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (statusFilter !== 'all' && app.status !== statusFilter) {
        return false;
      }
      if (searchTerm) {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        return (
          app.job.title.toLowerCase().includes(lowercasedSearchTerm) ||
          app.job.company.toLowerCase().includes(lowercasedSearchTerm)
        );
      }
      return true;
    });
  }, [applications, searchTerm, statusFilter]);

  const stats = useMemo(
    () => ({
      total: applications.length,
      interviewing: applications.filter((app) => app.status === 'Interviewing')
        .length,
      offers: applications.filter((app) => app.status === 'Offer Extended')
        .length,
      viewed: applications.filter((app) => app.status === 'Viewed').length,
    }),
    [applications],
  );

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredApplications.map((app) => app.id) : []);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((rowId) => rowId !== id),
    );
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

  const handleSyncInbox = () => {
    setIsSyncing(true);
    toast({
      title: 'Syncing Inbox...',
      description: 'Checking for updates...',
    });
    setTimeout(() => {
      setIsSyncing(false);
      toast({ title: 'Sync Complete', description: 'No new updates found.' });
    }, 2000);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  const isSelectAllChecked =
    selectedIds.length > 0 &&
    selectedIds.length === filteredApplications.length &&
    filteredApplications.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/30 dark:to-purple-950/30">
      <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      <div className="relative z-10 p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4 p-3  dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-white/20">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <FileCheck2 className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Applications
              </h1>
              <p className="ttext-gray-600 text-lg max-w-2xl mx-auto">
                Track your career journey
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Total Applications"
            value={stats.total}
            icon={FileCheck2}
            color="from-blue-500 to-blue-600"
            trend={12}
          />
          <StatCard
            label="Active Interviews"
            value={stats.interviewing}
            icon={Target}
            color="from-yellow-500 to-orange-500"
            trend={25}
          />
          <StatCard
            label="Profile Views"
            value={stats.viewed}
            icon={Eye}
            color="from-purple-500 to-pink-500"
            trend={8}
          />
          <StatCard
            label="Offers Received"
            value={stats.offers}
            icon={Award}
            color="from-green-500 to-emerald-500"
            trend={100}
          />
        </div>

        <div className="mb-8 p-4 sm:p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by job title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                {applicationStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSyncInbox}
                disabled={isSyncing}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {isSyncing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <RefreshCw className="h-5 w-5" />
                )}{' '}
                <span className="font-medium">Sync</span>
              </button>
              {(searchTerm || statusFilter !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-300"
                >
                  <X className="h-4 w-4" /> Clear
                </button>
              )}
              {selectedIds.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="flex items-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30 transform hover:scale-105">
                      <Trash2 className="h-4 w-4" /> Delete (
                      {selectedIds.length})
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
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
          </div>
        </div>

        {filteredApplications.length > 0 && (
          <div className="mb-2 flex items-center gap-3 p-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl border border-white/20">
            <div
              className={`relative w-5 h-5 rounded border-2 cursor-pointer transition-all duration-300 ${
                isSelectAllChecked
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
              onClick={() => handleSelectAll(!isSelectAllChecked)}
            >
              {isSelectAllChecked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-sm" />
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select All ({filteredApplications.length})
            </span>
            {selectedIds.length > 0 && (
              <div className="ml-auto flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-600 font-medium">
                  {selectedIds.length} selected
                </span>
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              <div className="absolute inset-0 h-12 w-12 animate-ping border-2 border-blue-500 rounded-full opacity-20" />
            </div>
          </div>
        ) : filteredApplications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredApplications.map((app, index) => (
              <ApplicationCard
                key={app.id}
                app={app}
                isSelected={selectedIds.includes(app.id)}
                onSelect={handleSelectRow}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-6">
            <div className="relative inline-block">
              <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl mb-6">
                <FileCheck2 className="h-16 w-16 text-gray-400 mx-auto" />
              </div>
              <div className="absolute -top-2 -right-2 p-2 bg-blue-500 rounded-full animate-bounce">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Applications Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all'
                ? "Your search didn't match any applications. Try adjusting your filters."
                : "Ready to kickstart your career? Let's find your dream job!"}
            </p>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 transform hover:scale-105"
            >
              <FileCheck2 className="h-5 w-5" /> Find Your Next Job{' '}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
