'use client';

import { useEffect, useMemo, useState } from 'react';
import { useJobStore } from '@/store/job.store';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/common/TableData';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import {
  Eye,
  TrendingUp,
  Download,
  Briefcase,
  Users,
  ArrowUpDown,
  Loader2,
  Trash2,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { EditJobModal } from '@/components/getjobs/EditJobModal';

const JobsPage = () => {
  const router = useRouter();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { jobs, getJobs, deleteJob, bulkDeleteJobs, toggleJobStatus, loading } =
    useJobStore();

  console.log('jobs', jobs);

  useEffect(() => {
    getJobs();
  }, [getJobs]);

  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <div className="flex justify-center px-1">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate')
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center px-1">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },

      {
        id: 'serialNumber',
        header: 'S.No',
        cell: ({ row }) => {
          return (
            <span className="font-medium text-slate-500">
              {parseInt(row.id) + 1}
            </span>
          );
        },
      },
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
        // header: 'Status',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="text-center"
          >
            Status <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const [isToggling, setIsToggling] = useState(false);
          const isActive = row.original.isActive;

          const handleToggle = async () => {
            setIsToggling(true);
            const success = await toggleJobStatus(row.original._id);

            if (success) {
              toast.success(`Job is now ${!isActive ? 'Active' : 'Inactive'}`);
            } else {
              toast.error('Failed to update status');
            }
            setIsToggling(false);
          };

          return (
            <div className="flex justify-center">
              <button
                onClick={handleToggle}
                disabled={isToggling}
                className={`
            px-3 py-1 rounded-md text-xs font-medium border transition-all
            flex items-center justify-center min-w-[70px]
            ${
              isActive
                ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
            }
            ${isToggling ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
          `}
              >
                {isToggling ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : isActive ? (
                  'Active'
                ) : (
                  'Inactive'
                )}
              </button>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => {
          const [isOpen, setIsOpen] = useState(false);
          const [isDeleting, setIsDeleting] = useState(false);

          const handleDelete = async () => {
            setIsDeleting(true);
            const success = await deleteJob(row.original._id);
            if (success) {
              toast.success('Job deleted successfully');
              setIsOpen(false);
            }
            setIsDeleting(false);
          };

          return (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(`/dashboard/jobs/${row.original._id}`)
                }
                className="hover:text-blue-500 cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" /> View
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  setSelectedJob(row.original);
                  setIsEditModalOpen(true);
                }}
              >
                Edit
              </Button>

              <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:text-red-500 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-60 p-4 shadow-lg border-slate-200"
                >
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-900">
                      Delete this job?
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      This will permanently remove the posting for{' '}
                      <span className="font-bold">"{row.original.title}"</span>.
                    </p>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsOpen(false)}
                        className="h-8 text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleDelete}
                        className="h-8 text-xs bg-red-600 hover:bg-red-700"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          'Delete'
                        )}
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          );
        },
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
          <Button variant="outline" onClick={exportToCSV} className="">
            <Download className="w-4 h-4" />
            Export
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
                  {jobs?.filter((j: any) => j.isActive).length}
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
                  {jobs?.reduce((sum, j) => sum + (j.jobViews || 0), 0)}
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
                  {jobs?.reduce((sum, j) => sum + (j.appliedCount || 0), 0)}
                </h3>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className=" h-8 w-8 text-blue-500 animate-spin " />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={jobs}
          searchKey="jobTitle"
          searchPlaceholder="Search by Job Title..."
          bulkDelete={bulkDeleteJobs}
        />
      )}

      {selectedJob && (
        <EditJobModal
          job={selectedJob}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedJob(null);
          }}
        />
      )}
    </div>
  );
};

export default JobsPage;
