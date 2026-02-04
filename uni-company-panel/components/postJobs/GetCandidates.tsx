'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useCandidateStore } from '@/store/candidates.store';
import { ColumnDef } from '@tanstack/react-table';

// UI Components
import { DataTable } from '@/components/common/TableData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CandidateModal } from './CandidateModal';
import { ArrowUpDown, Download, Eye, Loader2 } from 'lucide-react';

const GetCandidates = () => {
  const { candidates, getCandidates, loading } = useCandidateStore();

  const { id } = useParams();
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  useEffect(() => {
    if (id) {
      getCandidates(id as string);
    }
  }, [id, getCandidates]);

  const exportToCSV = () => {
    const data = candidates.candidates || [];
    if (data.length === 0) return;

    const headers = ['Name,Email,Phone,Status,Method,Applied On'];
    const rows = data.map(
      (c: any) =>
        `"${c.student?.fullName}","${c.student?.email}","${c.student?.phone || 'N/A'}","${c.status}","${c.applicationMethod}","${new Date(c.appliedAt).toLocaleDateString()}"`,
    );

    const csvContent =
      'data:text/csv;charset=utf-8,' + headers.concat(rows).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `candidates_job_${id}.csv`);
    link.click();
  };

  const columns: ColumnDef<any>[] = useMemo(
    () => [
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
        // Custom ID for searching nested data
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
          <div>
            <div className="font-semibold text-slate-900">
              {row.original.student?.fullName}
            </div>
            <div className="text-xs text-muted-foreground capitalize">
              {row.original.applicationMethod}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'student.email',
        header: 'Email',
        cell: ({ row }) => (
          <div className="text-sm">
            <div>{row.original.student?.email}</div>
          </div>
        ),
      },
      {
        accessorKey: 'student.contact',
        header: 'Contact',
        cell: ({ row }) => (
          <div className="text-sm">
            <div>{row.original.student?.phone}</div>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: () => <div className="text-center">Status</div>,
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
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
        accessorKey: 'appliedAt',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="text-center"
          >
            Applied <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        sortingFn: 'datetime',
        cell: ({ row }) => (
          <span className="text-sm text-slate-600">
            {new Date(row.getValue('appliedAt')).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => {
          const [isOpen, setIsOpen] = useState(false);

          return (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCandidate(row.original)}
                className="flex gap-2 hover:text-blue-500 hover:bg-blue-50"
              >
                <Eye className="h-3.5 w-3.5" /> View
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  console.log('candidates', candidates);

  return (
    <div className="p-4 md:p-6 space-y-6 ">
      <div className="space-y-6">
        {/* Header with Export */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-blue-500">
              Applications
            </h1>
            <p className="text-muted-foreground">
              Reviewing candidates for Job ID:{' '}
              <span className="font-mono">{id}</span>
            </p>
          </div>

          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>

        {/* The Reusable Table Component */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className=" h-8 w-8 text-blue-500 animate-spin " />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={candidates.candidates || []}
            searchKey="candidateName"
            searchPlaceholder="Search by name..."
          />
        )}
      </div>

      {/* Detail Modal */}
      <CandidateModal
        candidate={selectedCandidate}
        open={!!selectedCandidate}
        onOpenChange={(open) => !open && setSelectedCandidate(null)}
      />
    </div>
  );
};

export default GetCandidates;
