'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useCandidateStore } from '@/store/candidates.store';
import { ColumnDef } from '@tanstack/react-table';

import { DataTable } from '@/components/common/TableData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CandidateModal } from './CandidateModal';
import {
  ArrowUpDown,
  Download,
  Eye,
  Loader2,
  Copy,
  Users,
  UserCheck,
  UserPlus,
  UserMinus,
} from 'lucide-react';
import { toast } from 'sonner';
import apiInstance from '@/services/api';

const STATUS_CONFIG: Record<string, { label: string; variant: any }> = {
  APPLIED: { label: 'Applied', variant: 'secondary' },
  SHORTLISTED: { label: 'Shortlisted', variant: 'default' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  INTERVIEW: { label: 'Interview', variant: 'warning' },
  HIRED: { label: 'Hired', variant: 'outline' },
  SELECTED: { label: 'Selected', variant: 'success' },
};

// --- Sub-component for Stats ---
const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-lg ${colorClass}`}>
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

const GetCandidates = () => {
  const {
    candidates,
    getCandidates,
    loading,
    candidatesStats,
    getCandidateStats,
  } = useCandidateStore();
  const { id } = useParams();
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  useEffect(() => {
    if (id) getCandidates(id as string);
  }, [id, getCandidates]);

  useEffect(() => {
    console.log(id);
    getCandidateStats(id as string);
  }, [id, getCandidateStats]);

  console.log(candidatesStats);

  // --- Calculate Stats ---
  const stats = useMemo(() => {
    const data = candidates || [];
    return {
      total: data.length,
      shortlisted: data.filter((c: any) => c.status === 'SHORTLISTED').length,
      selected: data.filter((c: any) =>
        ['SELECTED', 'HIRED'].includes(c.status),
      ).length,
      rejected: data.filter((c: any) => c.status === 'REJECTED').length,
    };
  }, [candidates]);

  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        id: 'serialNumber',
        header: 'S.No',
        cell: ({ row }) => (
          <span className="font-medium text-slate-500">{row.index + 1}</span>
        ),
      },
      {
        id: 'candidateName',
        accessorFn: (row) => row.student?.fullName,
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
          <div className="flex flex-col text-left">
            <span className="font-semibold text-slate-900">
              {row.original.student?.fullName || 'Unknown'}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              {row.original.applicationMethod}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'student.email',
        header: 'Contact Info',
        cell: ({ row }) => {
          const email = row.original.student?.email;
          return (
            <div className="group flex flex-col gap-1 items-center md:items-start">
              <div className="flex items-center gap-2">
                <span className="text-sm">{email}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(email);
                    toast.success('Email copied');
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Copy className="h-3 w-3 text-slate-400 hover:text-blue-500" />
                </button>
              </div>
              <div className="text-xs text-slate-500">
                {row.original.student?.phone}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: () => <div className="text-center">Status</div>,
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          const config = STATUS_CONFIG[status] || {
            label: status,
            variant: 'outline',
          };
          return (
            <div className="flex justify-center">
              <Badge variant={config.variant} className="capitalize">
                {config.label.toLowerCase()}
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              Applied <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ),
        sortingFn: 'datetime',
        cell: ({ row }) => (
          <div className="text-center text-sm text-slate-600">
            {new Date(row.getValue('createdAt')).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCandidate(row.original)}
              className="flex gap-2 hover:text-blue-600 hover:bg-blue-50 border-slate-200"
            >
              <Eye className="h-3.5 w-3.5" /> View
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="p-4 md:p-6 space-y-8 bg-slate-50/50 min-h-screen">
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Applications
          </h1>
          <p className="text-muted-foreground mt-1">
            Job ID:{' '}
            <span className="font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-sm font-semibold">
              {id}
            </span>
          </p>
        </div>

        <Button
          variant="default"
          disabled={!candidates?.length}
          className="shadow-sm bg-blue-600 hover:bg-blue-700"
        >
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* --- Stats Grid --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Candidates"
          value={stats.total}
          icon={Users}
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Shortlisted"
          value={stats.shortlisted}
          icon={UserPlus}
          colorClass="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Selected"
          value={stats.selected}
          icon={UserCheck}
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={UserMinus}
          colorClass="bg-rose-50 text-rose-600"
        />
      </div>

      {/* --- Table Section --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
          <p className="text-slate-500 animate-pulse">
            Loading candidate roster...
          </p>
        </div>
      ) : (
        <div className="rounded-xl bg-white overflow-hidden">
          <DataTable
            columns={columns}
            data={candidates || []}
            searchKey="candidateName"
            searchPlaceholder="Search by name..."
          />
        </div>
      )}

      <CandidateModal
        candidate={selectedCandidate}
        open={!!selectedCandidate}
        onOpenChange={(open) => !open && setSelectedCandidate(null)}
      />
    </div>
  );
};

export default GetCandidates;
