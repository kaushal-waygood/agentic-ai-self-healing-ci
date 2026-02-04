'use client';

import { useEffect, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/common/TableData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

import {
  Eye,
  UserCheck,
  Download,
  Users,
  UserMinus,
  Clock,
  ArrowUpDown,
  Loader2,
  Trash2,
  Mail,
} from 'lucide-react';
import { useCandidateStore } from '@/store/candidates.store';
import { Badge } from '../ui/badge';

const CandidatesPage = () => {
  const {
    candidates,
    orgCandidates,
    loading,
    candidatesStats,
    orgCandidatesStats,
  } = useCandidateStore();

  useEffect(() => {
    orgCandidates();
    orgCandidatesStats();
  }, []);

  console.log('candidatesStats', candidatesStats);

  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <div className="flex justify-center px-1">
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center px-1">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
            />
          </div>
        ),
      },
      {
        id: 'serialNumber',
        header: 'S.No',
        cell: ({ row }) => (
          <span className="text-slate-500">{parseInt(row.id) + 1}</span>
        ),
      },
      {
        id: 'candidateName',
        accessorFn: (row) => row.fullName,
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Candidate <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col justify-center items-center">
            <div className="font-semibold text-slate-900">
              {row.original.fullName}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <Mail className="h-3 w-3" /> {row.original.email}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'jobTitle',
        header: 'Applied Role',
        cell: ({ row }) => {
          return (
            <div className="flex flex-col justify-center items-center">
              <div className="font-semibold text-slate-900">
                {row.original.jobTitle}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'appliedAt',
        header: 'Applied Date',
        cell: ({ row }) => (
          <span className="text-sm text-slate-600">
            {new Date(row.original.appliedAt).toLocaleDateString('en-GB')}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: () => <div className="text-center">Status</div>,

        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <div className="text-center">
              {status === 'APPLIED' && (
                <Badge variant="secondary">{status}</Badge>
              )}
              {status === 'SHORTLISTED' && <Badge>{status}</Badge>}
              {status === 'REJECTED' && (
                <Badge variant="destructive">{status}</Badge>
              )}

              {status === 'INTERVIEW' && (
                <Badge variant={'warning'}>{status}</Badge>
              )}

              {status === 'HIRED' && <Badge variant="outline">{status}</Badge>}

              {status === 'SELECTED' && (
                <Badge variant="success">{status}</Badge>
              )}
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
              className="hover:text-blue-500 h-8"
            >
              <Eye className="h-3.5 w-3.5 mr-1" /> View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-500">Candidates</h1>
          <p className="text-gray-600">
            Managing {candidates.length} total applicants
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Export
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard
          label="Total"
          value={candidatesStats?.data?.TOTAL || 0}
          icon={<Users className="text-blue-600" />}
          color="bg-blue-100"
        />
        <StatCard
          label="Interviews"
          value={candidatesStats?.data?.INTERVIEW || 0}
          icon={<Clock className="text-purple-600" />}
          color="bg-purple-100"
        />
        <StatCard
          label="Shortlisted"
          value={candidatesStats?.data?.ACCEPTED || 0}
          icon={<UserCheck className="text-green-600" />}
          color="bg-green-100"
        />
        <StatCard
          label="Pending"
          value={candidatesStats?.data?.APPLIED || 0}
          icon={<Clock className="text-amber-600" />}
          color="bg-amber-100"
        />
        <StatCard
          label="Rejected"
          value={candidatesStats?.data?.REJECTED || 0}
          icon={<UserMinus className="text-red-600" />}
          color="bg-red-100"
        />
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="">
          <DataTable
            columns={columns}
            data={candidates}
            searchKey="candidateName"
            searchPlaceholder="Search by Name..."
          />
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon, color }: any) => (
  <Card className="border-none shadow-sm bg-white">
    <CardContent className="">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
        <div
          className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}
        >
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default CandidatesPage;
