'use client';

import { useEffect, useMemo, useState } from 'react';
import useBlogStore from '@/store/blog-store';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/TableData';
import { Plus, Loader2, Trash2, Pencil, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

const CategoryPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Correct destructuring to match your blog-store.ts
  const {
    getBlogCategoryList,
    addBlogCategory,
    deleteBlogCategory,
    isLoading,
    blogCategoryListData,
    blogCategoryCounts,
  } = useBlogStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ title: '', slug: '' });

  const currentStatus = searchParams.get('status') || '';
  const currentPage = Math.max(
    1,
    parseInt(searchParams.get('page') || '1', 10),
  );
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const filters: any = {};
    if (currentStatus) filters.isActive = currentStatus;

    // Fetching data with current pagination and filters
    getBlogCategoryList(10, currentPage, searchQuery, filters);
  }, [getBlogCategoryList, currentStatus, currentPage, searchQuery]);

  const handleFilterClick = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status) params.set('status', status);
    else params.delete('status');
    params.set('page', '1');
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addBlogCategory(newCategory);

      setIsCreateOpen(false);
      setNewCategory({ title: '', slug: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create category');
    }
  };

  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        id: 'serialNumber',
        header: 'S.No',
        cell: ({ row }) => (
          <span className="text-slate-500 font-medium">{row.index + 1}</span>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Category Name',
        cell: ({ row }) => (
          <div className="font-semibold text-slate-900">
            {row.original.title}
          </div>
        ),
      },
      {
        accessorKey: 'slug',
        header: 'Slug',
        cell: ({ row }) => (
          <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
            /{row.original.slug}
          </code>
        ),
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => {
          const active = row.original.isActive;
          return (
            <div
              className={`flex items-center gap-1.5 font-bold text-[10px] px-2 py-0.5 rounded-full border inline-block ${
                active
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : 'bg-rose-50 text-rose-600 border-rose-200'
              }`}
            >
              {active ? 'ACTIVE' : 'INACTIVE'}
            </div>
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
              <Button variant="outline" size="sm" className="h-8 px-2">
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
                  <p className="text-sm font-bold">Delete this tag?</p>
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
                        await deleteBlogCategory?.(row.original._id);
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
    [deleteBlogCategory],
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-500 flex items-center gap-2">
            <Tag className="w-8 h-8" /> Category Management
          </h1>
          <p className="text-gray-500">
            Managing {blogCategoryCounts?.all || 0} categories across the blog
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="">
              <Plus className="w-4 h-4 mr-2" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Category Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. University News"
                  value={newCategory.title}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL Path)</Label>
                <Input
                  id="slug"
                  placeholder="e.g. university-news"
                  value={newCategory.slug}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, slug: e.target.value })
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-indigo-600">
                Save Category
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Section using backend counts */}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="">
          <DataTable
            columns={columns}
            data={blogCategoryListData || []}
            searchKey="title"
          />
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon, color, onClick, isActive }: any) => (
  <Card
    className={`border-none shadow-sm cursor-pointer transition-all hover:scale-[1.01] ${
      isActive
        ? 'ring-2 ring-indigo-500 bg-indigo-50'
        : 'bg-white hover:bg-gray-50'
    }`}
    onClick={onClick}
  >
    <CardContent className="p-4 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      </div>
      <div
        className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}
      >
        {icon}
      </div>
    </CardContent>
  </Card>
);

export default CategoryPage;
