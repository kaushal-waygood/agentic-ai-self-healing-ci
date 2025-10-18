'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileCheck2, Loader2, Filter, Bookmark, Send, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAllSavedJobs, getAppliedJobs } from '@/services/api/student';
import { ApplicationRow, StatCard } from './components/statusConfig';
import { useRouter, useSearchParams } from 'next/navigation';
import apiInstance from '@/services/api';

interface Application {
  id: string;
  job: {
    title: string;
    company: string;
  };
  status: string;
  appliedAt: string;
}

const extendedApplicationStatuses = ['Saved', 'Applied', 'Visited', 'Viewed'];

export default function ApplicationsPage() {
  // --- STATE MANAGEMENT ---
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [jobStats, setJobStats] = useState({
    savedJobsCount: 0,
    viewedJobsCount: 0,
    visitedJobsCount: 0,
    appliedJobsCount: 0,
  });

  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get('status') || 'Saved',
  );

  // --- EFFECT FOR STATS ---
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiInstance.get(`/students/job/stats`);
        setJobStats(response.data.statCounts);
      } catch (error) {
        console.error('Failed to fetch job stats:', error);
      }
    };
    fetchStats();
  }, []);

  // --- EFFECT FOR FILTERED LIST ---
  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      try {
        let response;
        let rawData = [];
        let statusLabel = 'Saved';

        // ✅ FIX: Corrected API calls and data keys for each filter
        switch (statusFilter) {
          case 'Applied':
            response = await getAppliedJobs();
            rawData = response.data.appliedJobs || [];
            statusLabel = 'Applied';
            break;
          case 'Visited':
            response = await apiInstance.get(`/students/jobs/visited-all`);
            rawData = response.data.jobs || [];
            statusLabel = 'Visited';
            break;
          case 'Viewed':
            response = await apiInstance.get(`/students/jobs/viewed-all`);
            rawData = response.data.jobs || [];
            statusLabel = 'Viewed';
            break;
          case 'Saved':
          default:
            response = await apiInstance.get(`/students/jobs/saved-all`);
            rawData = response.data.jobs || [];
            statusLabel = 'Saved';
            break;
        }

        const formattedApplications = rawData.map((apiJob: any) => ({
          id: apiJob.job._id,
          job: {
            title: apiJob.job.title,
            company: apiJob.job.company,
          },
          status: apiJob.status || statusLabel,
          appliedAt:
            apiJob.savedAt ||
            apiJob.appliedAt ||
            apiJob.viewedAt ||
            apiJob.visitedAt ||
            apiJob.job.createdAt,
        }));

        setApplications(formattedApplications);
      } catch (error) {
        console.error(`Failed to fetch ${statusFilter} applications:`, error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch the application list.',
        });
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplications();
  }, [statusFilter, toast]);

  // --- URL SYNC EFFECT ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('status', statusFilter);
    router.replace(`${window.location.pathname}?${params.toString()}`);
  }, [statusFilter, router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div className="relative z-10 p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            My Applications
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Track your career journey
          </p>
        </div>

        {/* ✅ FIX: Added the `href` prop to each StatCard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Applied Jobs"
            value={jobStats.appliedJobsCount}
            icon={Send}
            color="from-yellow-500 to-orange-500"
          />
          <StatCard
            label="Saved Jobs"
            value={jobStats.savedJobsCount}
            icon={Bookmark}
            color="from-purple-500 to-pink-500"
          />
          <StatCard
            label="Viewed Jobs"
            value={jobStats.viewedJobsCount}
            icon={Eye}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            label="Visited Links"
            value={jobStats.visitedJobsCount}
            icon={Link}
            color="from-green-500 to-emerald-500"
          />
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-gray-600 dark:text-gray-400 font-bold">
              Filter by status: {statusFilter}
            </p>
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full lg:w-auto appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              {extendedApplicationStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            </div>
          ) : applications.length > 0 ? (
            <div className="space-y-2">
              {applications.map((app, index) => (
                <ApplicationRow
                  key={app.id}
                  app={app}
                  isSelected={false}
                  onSelect={() => {}}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No Applications Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                There are no jobs with the status "{statusFilter}".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
