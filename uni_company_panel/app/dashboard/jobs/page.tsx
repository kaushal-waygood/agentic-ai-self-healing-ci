'use client';

import { useEffect, useMemo, useState } from 'react';
import { useJobStore } from '@/store/job.store';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/common/TableData';
import {
  Eye,
  TrendingUp,
  Download,
  Briefcase,
  Users,
  ArrowUpDown,
} from 'lucide-react';

const JobsPage = () => {
  const router = useRouter();
  const { jobs, getJobs, loading } = useJobStore();

  useEffect(() => {
    getJobs();
  }, [getJobs]);

  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        id: 'jobTitle',
        accessorFn: (row) => row.title,
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Job Title <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-slate-900">
              {row.original.title}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'job.company',
        header: 'Company',
        cell: ({ row }) => (
          <div className="text-sm">
            <div>{row.original.company}</div>
          </div>
        ),
      },
      {
        accessorKey: 'job.location',
        header: 'Location',
        cell: ({ row }) => (
          <div className="text-sm">
            <div>{row.original.location.city}</div>
          </div>
        ),
      },
      {
        accessorKey: 'job.jobTypes',
        header: 'jobTypes',
        cell: ({ row }) => (
          <div className="text-sm">
            <div>{row.original.jobTypes}</div>
          </div>
        ),
      },

      {
        accessorKey: 'jobPostedAt',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="text-center"
          >
            Job Posted <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        sortingFn: 'datetime',
        cell: ({ row }) => (
          <span className="text-sm text-slate-600">
            {new Date(row.getValue('jobPostedAt')).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        ),
      },
      {
        accessorKey: 'job.views',
        header: 'Views',
        cell: ({ row }) => (
          <div className="text-sm">
            <div>{row.original.jobViews}</div>
          </div>
        ),
      },
      {
        accessorKey: 'job.applied',
        header: 'Applied',
        cell: ({ row }) => (
          <div className="text-sm">
            <div>{row.original.appliedCount}</div>
          </div>
        ),
      },

      {
        accessorKey: 'isActive',
        header: () => <div className="text-center">Status</div>,
        cell: ({ row }) => {
          return (
            <div
              className={`${row.original.isActive ? 'text-green-600' : 'text-red-600'}`}
            >
              {row.original.isActive ? 'Active' : 'Inactive'}
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                router.push(`/dashboard/jobs/${row.original._id}`);
              }}
              className="flex gap-2"
            >
              <Eye className="h-3.5 w-3.5" /> View
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  // --- CSV Export Logic ---
  const exportToCSV = () => {
    const data = jobs || [];
    if (data.length === 0) return;

    // 1. Define descriptive headers for the CSV
    const headers = [
      'Job Title',
      'Company',
      'Location',
      'Job Type',
      'Views',
      'Applications',
      'Status',
      'Posted On',
    ];

    // 2. Map the job data to match the headers
    const rows = data.map((job: any) => {
      const title = `"${job.title || 'N/A'}"`;
      const company = `"${job.company || 'N/A'}"`;
      const location = `"${job.location?.city || ''}, ${job.location?.state || ''}"`;
      const type = `"${job.jobTypes?.join(' / ') || 'N/A'}"`;
      const views = job.jobViews ?? 0;
      const applications = job.appliedCount ?? 0;
      const status = job.isActive ? 'Active' : 'Inactive';
      const postedDate = job.jobPostedAt
        ? new Date(job.jobPostedAt).toLocaleDateString()
        : 'N/A';

      return [
        title,
        company,
        location,
        type,
        views,
        applications,
        status,
        postedDate,
      ].join(',');
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));

    const fileName = `posted_jobs_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', fileName);

    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6 ">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-500">Posted Jobs</h1>
          <p className="text-gray-600">
            Manage and track all your job postings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={exportToCSV} className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>

          <Button className="bg-blue-500 hover:bg-blue-700 text-white gap-2">
            <Briefcase className="w-4 h-4" />
            Post New Job
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
        <Card>
          <CardContent className="">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Jobs</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {jobs.length}
                </h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Jobs</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {jobs.filter((j) => j.isActive).length}
                </h3>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {jobs.reduce((sum, j) => sum + (j.jobViews || 0), 0)}
                </h3>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Applications</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {jobs.reduce((sum, j) => sum + (j.appliedCount || 0), 0)}
                </h3>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <DataTable
          columns={columns}
          data={jobs}
          searchKey="jobTitle"
          searchPlaceholder="Search by Job Title..."
        />
      </div>
    </div>
  );
};

export default JobsPage;
