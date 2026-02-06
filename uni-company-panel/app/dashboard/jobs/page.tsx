'use client';

import { useEffect, useMemo, useState } from 'react';
import { useJobStore } from '@/store/job.store';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/TableData';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Eye,
  Download,
  Users,
  ArrowUpDown,
  Loader2,
  Trash2,
  Pencil,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { EditJobModal } from '@/components/getjobs/EditJobModal';
import GetSingleJobDetails from '@/components/getjobs/GetSingleJobDetails';

const JobsPage = () => {
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const { jobs, getJobs, deleteJob, bulkDeleteJobs, toggleJobStatus, loading } =
    useJobStore();

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
      },
      {
        id: 'serialNumber',
        header: 'S.No',
        cell: ({ row }) => (
          <span className="text-slate-500 font-medium">
            {parseInt(row.id) + 1}
          </span>
        ),
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
          <div className="font-semibold text-slate-900">
            {row.original.title}
          </div>
        ),
      },
      {
        accessorKey: 'location.city',
        header: 'Location',
        cell: ({ row }) => (
          <div className="text-sm">
            {row.original.location?.city || 'Remote'}
          </div>
        ),
      },
      {
        accessorKey: 'jobTypes',
        header: 'Type',
        cell: ({ row }) => (
          <div className="text-sm capitalize">
            {row.original.jobTypes?.join(', ').replace('_', ' ')}
          </div>
        ),
      },
      {
        accessorKey: 'jobPostedAt',
        header: 'Posted',
        cell: ({ row }) => (
          <span className="text-sm">
            {new Date(row.original.jobPostedAt).toLocaleDateString('en-GB')}
          </span>
        ),
      },
      // {
      //   id: 'stats',
      //   header: 'Engagement',
      //   cell: ({ row }) => (
      //     <div className="text-xs space-y-1">
      //       <div className="flex items-center gap-1">
      //         <Eye className="w-3 h-3" /> {row.original.jobViews}
      //       </div>
      //       <div className="flex items-center gap-1">
      //         <Users className="w-3 h-3" /> {row.original.appliedCount}
      //       </div>
      //     </div>
      //   ),
      // },
      {
        id: 'stats',
        header: 'Engagement',
        cell: ({ row }) => {
          const Stat = ({ icon: Icon, value, label, color }: any) => (
            <div className="flex items-center gap-2">
              <div className={`p-1.5 bg-${color}-50 rounded-md`}>
                <Icon className={`w-3.5 h-3.5 text-${color}-600`} />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">{value}</div>
                <div className="text-[10px] text-slate-500">{label}</div>
              </div>
            </div>
          );

          return (
            <div className="flex items-center justify-center gap-6 px-4">
              <Stat
                icon={Eye}
                value={row.original.jobViews || 0}
                label="Views"
                color="blue"
              />
              <Stat
                icon={Users}
                value={row.original.appliedCount || 0}
                label="Applied"
                color="emerald"
              />
            </div>
          );
        },
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => {
          const [isToggling, setIsToggling] = useState(false);
          const handleToggle = async () => {
            setIsToggling(true);
            const jobId = row.original.id;
            if (!jobId) {
              toast.error('Job ID not found');
              setIsToggling(false);
              return;
            }
            // const success = await toggleJobStatus(row.original.id);
            const success = await toggleJobStatus(jobId);

            if (success) {
              toast.success(
                `Job ${!row.original.isActive ? 'activated' : 'deactivated'}`,
              );
            }
            setIsToggling(false);
          };

          return (
            <button
              onClick={handleToggle}
              disabled={isToggling}
              className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all min-w-[65px]
                ${row.original.isActive ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}
            >
              {isToggling ? (
                <Loader2 className="h-3 w-3 animate-spin mx-auto" />
              ) : row.original.isActive ? (
                'ACTIVE'
              ) : (
                'INACTIVE'
              )}
            </button>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => {
          const [isDelOpen, setIsDelOpen] = useState(false);

          const handleDelete = async () => {
            const jobId = row.original.id;
            if (!jobId) {
              toast.error('Job ID not found');
              return;
            }

            await deleteJob(jobId);
            toast.success('Deleted');
            setIsDelOpen(false);
          };

          return (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedJob(row.original);
                  setIsViewModalOpen(true);
                  // console.log(row.original);
                  console.log('view modal open', isViewModalOpen);
                }}
              >
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSelectedJob(row.original) || setIsEditModalOpen(true)
                }
              >
                <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>

              <Popover open={isDelOpen} onOpenChange={setIsDelOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56 p-4">
                  <p className="text-sm font-bold">Delete this job?</p>
                  <div className="flex justify-end gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsDelOpen(false)}
                    >
                      No
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      // onClick={async () => {
                      //   await deleteJob(row.original.id);
                      //   toast.success('Deleted');
                      // }}
                      onClick={handleDelete}
                    >
                      Yes, Delete
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          );
        },
      },
    ],
    [toggleJobStatus, deleteJob],
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-500">Posted Jobs</h1>
          <p className="text-gray-500">
            Manage and track your active recruitment
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            /* Export Logic */
          }}
        >
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      {/* Stats row can stay as you have it */}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={jobs}
          searchKey="jobTitle"
          bulkDelete={bulkDeleteJobs}
        />
      )}
      {isViewModalOpen && (
        <GetSingleJobDetails
          job={selectedJob}
          open={isViewModalOpen}
          onOpenChange={setIsViewModalOpen}
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
