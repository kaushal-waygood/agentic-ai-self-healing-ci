'use client';

import { useEffect, useMemo, useState } from 'react';
import useBlogStore from '@/store/blog-store';
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
  MessageSquare,
  ArrowUpDown,
  Loader2,
  Trash2,
  Pencil,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter, useSearchParams } from 'next/navigation';

const BlogsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Destructure from store correctly
  const {
    blogListdata,
    blogPaginator,
    getBlogList,
    deleteBlog,
    bulkDeleteBlogs,
    getDeleteBlog,
    isBlogStatusLoading,
    updatingBlogId,
    updateBlogStatus,
    isLoading,
  } = useBlogStore();

  // URL State Management
  const currentStatus = searchParams.get('status') || '';
  const currentPage = Math.max(
    1,
    parseInt(searchParams.get('page') || '1', 10),
  );
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    // Create a clean filters object to avoid 'undefined' in the URL string
    const filters: any = {};
    if (currentStatus) {
      filters.publishStatus = currentStatus;
    }

    getBlogList(10, currentPage, searchQuery, filters);
  }, [getBlogList, currentStatus, currentPage, searchQuery]);

  const handleFilterClick = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status) params.set('status', status);
    else params.delete('status');
    params.set('page', '1');
    router.push(`?${params.toString()}`, { scroll: false });
  };

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
          <span className="text-slate-500 font-medium">{row.index + 1}</span>
        ),
      },
      {
        accessorKey: 'title',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Blog Title <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-left">
            <div className="font-semibold text-slate-900 line-clamp-1">
              {row.original.title}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              /{row.original.slug}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'publishStatus',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.publishStatus;
          const styles: any = {
            published: 'bg-emerald-50 text-emerald-600 border-emerald-200',
            draft: 'bg-slate-50 text-slate-600 border-slate-200',
            scheduled: 'bg-blue-50 text-blue-600 border-blue-200',
          };
          return (
            <div
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block uppercase ${styles[status] || styles.draft}`}
            >
              {status}
            </div>
          );
        },
      },
      {
        id: 'engagement',
        header: 'Engagement',
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-sm font-medium">
                {row.original.views || 0}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-sm font-medium">
                {row.original.commentsCount || 0}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'isActive',
        header: 'Visibility',
        cell: ({ row }) => {
          // Check if this specific row is the one being updated
          const isThisRowLoading =
            isBlogStatusLoading && updatingBlogId === row.original._id;

          return (
            <Button
              variant="ghost" // Using ghost or similar for a cleaner look
              disabled={isThisRowLoading}
              className={`text-[10px] font-bold min-w-[70px] ${
                row.original.isActive ? 'text-indigo-600' : 'text-slate-400'
              }`}
              onClick={() => {
                updateBlogStatus(row.original._id, {
                  isActive: !row.original.isActive,
                });
              }}
            >
              {isThisRowLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : row.original.isActive ? (
                'PUBLIC'
              ) : (
                'HIDDEN'
              )}
            </Button>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => {
          const [isDelOpen, setIsDelOpen] = useState(false);
          return (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(`/dashboard/blog/edit/${row.original._id}`)
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
                  <p className="text-sm font-bold">Delete this post?</p>
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
                      onClick={async () => {
                        await getDeleteBlog(row.original._id);
                        toast.success('Deleted');
                        setIsDelOpen(false);
                      }}
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
    [router, deleteBlog],
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-indigo-600">
            Blog Management
          </h1>
          <p className="text-gray-500">
            Managing {blogPaginator?.itemCount || 0} articles across the
            platform
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => router.push('/dashboard/blog/tags')}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Tags
          </Button>
          <Button
            onClick={() => router.push('/dashboard/blog/category')}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Category
          </Button>
          <Button
            onClick={() => router.push('/dashboard/blog/post')}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Create Post
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Posts"
          value={blogPaginator?.itemCount || 0}
          icon={<FileText className="text-blue-600" />}
          color="bg-blue-100"
          onClick={() => handleFilterClick('')}
          isActive={currentStatus === ''}
        />
        <StatCard
          label="Published"
          value={
            blogListdata?.filter((b: any) => b.publishStatus === 'published')
              .length || 0
          }
          icon={<CheckCircle2 className="text-emerald-600" />}
          color="bg-emerald-100"
          onClick={() => handleFilterClick('published')}
          isActive={currentStatus === 'published'}
        />
        <StatCard
          label="Drafts"
          value={
            blogListdata?.filter((b: any) => b.publishStatus === 'draft')
              .length || 0
          }
          icon={<Clock className="text-amber-600" />}
          color="bg-amber-100"
          onClick={() => handleFilterClick('draft')}
          isActive={currentStatus === 'draft'}
        />
        <StatCard
          label="Scheduled"
          value={
            blogListdata?.filter((b: any) => b.publishStatus === 'scheduled')
              .length || 0
          }
          icon={<AlertCircle className="text-blue-600" />}
          color="bg-blue-100"
          onClick={() => handleFilterClick('scheduled')}
          isActive={currentStatus === 'scheduled'}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <DataTable
            columns={columns}
            data={blogListdata || []}
            searchKey="title"
            bulkDelete={bulkDeleteBlogs}
          />
        </div>
      )}
    </div>
  );
};

const StatCard = ({
  label,
  value,
  icon,
  color,
  onClick,
  isActive = false,
}: any) => (
  <Card
    className={`border-none shadow-sm cursor-pointer transition-all hover:scale-[1.02] ${
      isActive
        ? 'ring-2 ring-indigo-500 bg-indigo-50'
        : 'bg-white hover:bg-gray-50'
    }`}
    onClick={onClick}
  >
    <CardContent className="p-4">
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

export default BlogsPage;
