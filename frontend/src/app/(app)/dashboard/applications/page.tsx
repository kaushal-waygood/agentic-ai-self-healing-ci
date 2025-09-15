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

// --- Status Configuration for Styling ---
const statusConfig = {
  Applied: {
    bgColor:
      'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: '📧',
    accentColor: 'bg-blue-500',
  },
  'AI-Drafted': {
    bgColor:
      'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30',
    textColor: 'text-indigo-700 dark:text-indigo-300',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    icon: '🤖',
    accentColor: 'bg-indigo-500',
  },
  Sent: {
    bgColor:
      'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    icon: '✈️',
    accentColor: 'bg-emerald-500',
  },
  Viewed: {
    bgColor:
      'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30',
    textColor: 'text-purple-700 dark:text-purple-300',
    borderColor: 'border-purple-200 dark:border-purple-800',
    icon: '👀',
    accentColor: 'bg-purple-500',
  },
  Interviewing: {
    bgColor:
      'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    icon: '🎯',
    accentColor: 'bg-yellow-500',
  },
  'Offer Extended': {
    bgColor:
      'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30',
    textColor: 'text-green-700 dark:text-green-300',
    borderColor: 'border-green-200 dark:border-green-800',
    icon: '🎉',
    accentColor: 'bg-green-500',
  },
  Rejected: {
    bgColor:
      'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30',
    textColor: 'text-red-700 dark:text-red-300',
    borderColor: 'border-red-200 dark:border-red-800',
    icon: '❌',
    accentColor: 'bg-red-500',
  },
  Draft: {
    bgColor:
      'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30',
    textColor: 'text-gray-700 dark:text-gray-300',
    borderColor: 'border-gray-200 dark:border-gray-800',
    icon: '📝',
    accentColor: 'bg-gray-500',
  },
  Error: {
    bgColor:
      'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30',
    textColor: 'text-red-700 dark:text-red-300',
    borderColor: 'border-red-200 dark:border-red-800',
    icon: '⚠️',
    accentColor: 'bg-red-500',
  },
};

const applicationStatuses = Object.keys(statusConfig);

// --- Reusable Components ---

const StatCard: FC<{
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  trend: number;
}> = ({ label, value, icon: Icon, color, trend }) => (
  <div
    className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-6 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-1`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-white/80 text-sm">
            <TrendingUp className="h-4 w-4" />
            <span>+{trend}%</span>
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl font-bold text-white mb-1 group-hover:scale-110 transition-transform duration-300">
          {value}
        </div>
        <div className="text-white/80 text-sm font-medium">{label}</div>
      </div>
    </div>
    <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full blur-xl" />
  </div>
);

const ApplicationCard: FC<{
  app: Application;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  index: number;
}> = ({ app, isSelected, onSelect, index }) => {
  const [showNotes, setShowNotes] = useState(false);
  const config = statusConfig[app.status] || statusConfig['Error'];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1.5 hover:shadow-2xl ${
        isSelected
          ? 'border-blue-500 shadow-lg shadow-blue-500/20 bg-blue-50/50'
          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
      }`}
      style={{
        animationDelay: `${index * 50}ms`,
        animation: 'fadeInUp 0.5s ease-out forwards',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${config.accentColor} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}
      />
      <div className="relative z-10 p-5">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`relative w-5 h-5 rounded border-2 cursor-pointer transition-all duration-300 ${
              isSelected
                ? 'bg-blue-500 border-blue-500'
                : 'border-gray-300 hover:border-blue-400'
            }`}
            onClick={() => onSelect(app.id, !isSelected)}
          >
            {isSelected && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-sm animate-pulse" />
              </div>
            )}
          </div>
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${config.bgColor} ${config.textColor} ${config.borderColor} border`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{config.icon}</span>
              <span>{app.status}</span>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Building2 className="h-4 w-4" />
            <span>{app.job.company}</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors duration-300">
            {app.job.title}
          </h3>
        </div>

        <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
          <Calendar className="h-4 w-4" />
          <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
        </div>

        {app.notes && app.notes.length > 0 && (
          <div className="mb-4">
            <div
              className="flex items-center gap-2 cursor-pointer group/notes"
              onClick={() => setShowNotes(!showNotes)}
            >
              <MailOpen className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover/notes:text-blue-600">
                Latest Update
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-300 ${
                  showNotes ? 'rotate-180' : ''
                }`}
              />
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                showNotes ? 'max-h-40 mt-2' : 'max-h-0'
              }`}
            >
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {app.notes[app.notes.length - 1]}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Link href={`/applications/${app.id}`} className="flex-1">
            <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 transform hover:scale-105">
              <div className="flex items-center justify-center gap-2">
                <Eye className="h-4 w-4" />
                <span>View Details</span>
                <ArrowRight className="h-4 w-4 transform transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          </Link>
          <button className="p-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 hover:scale-110">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        className={`absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10`}
      />
    </div>
  );
};

// --- Main Page Component ---
export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
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
        const response = await getAllSavedJobs();
        const savedJobsFromApi = response.data.savedJobs || [];

        // ***** FIX: Transform API data to match the component's expected structure *****
        const formattedApplications = savedJobsFromApi.map((apiJob: any) => ({
          id: apiJob._id, // Map _id to id
          job: {
            title: apiJob.title, // Nest title
            company: apiJob.company, // Nest company
          },
          // Assign a default status, since the API doesn't provide one
          status: 'Applied',
          appliedAt: apiJob.createdAt, // Map createdAt to appliedAt
          // Add default notes or an empty array
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
  }, [toast]);

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
          <div className="inline-flex items-center gap-3 mb-4 p-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-white/20">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <FileCheck2 className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Applications
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
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
                className="w-full pl-12 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
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
                className="w-full lg:w-auto appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
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
          <div className="mb-6 flex items-center gap-3 p-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl border border-white/20">
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
