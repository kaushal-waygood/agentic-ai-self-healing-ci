'use client';

import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Loader2 } from 'lucide-react';

// Shadcn UI Components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

import useBlogs from '@/hooks/useBlogs';

export default function ViewAllBlogs() {
  const {
    getWebsiteBlogs,
    blogListdata,
    blogPaginator,
    isLoading,
    getWebsiteBlogCategoryFilters,
    getWebsiteBlogTagFilters,
    websiteBlogCategoryFilterList,
    websiteBlogTagFilterList,
  } = useBlogs();

  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    getWebsiteBlogCategoryFilters();
    getWebsiteBlogTagFilters();
  }, []);

  useEffect(() => {
    loadBlogs(page);
  }, [page]);

  const loadBlogs = (pageNumber = 1) => {
    getWebsiteBlogs(9, pageNumber - 1, search || '', {
      ...(tagFilter !== 'all' && { tag: tagFilter }),
      ...(categoryFilter !== 'all' && { category: categoryFilter }),
      isActive: true,
    });
  };

  const handleSearchClick = () => {
    setPage(1);
    loadBlogs(1);
  };

  const trimDescription = (html: string) => {
    if (!html) return '';
    const text = html.replace(/<[^>]+>/g, '');
    return text.length <= 120 ? text : text.substring(0, 120) + '...';
  };

  // Pagination Logic for Shadcn
  const totalPages = blogPaginator?.pageCount || 1;
  const currentPage = blogPaginator?.currentPage + 1 || page;

  return (
    <div className="w-full">
      {/* HEADER */}
      <header className="py-16 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold tracking-tight">All Blogs</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 mb-24 max-w-7xl">
        {/* FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-10">
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search blogs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="md:col-span-3">
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {websiteBlogTagFilterList?.map((tag) => (
                  <SelectItem key={tag._id} value={tag._id}>
                    {tag.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {websiteBlogCategoryFilterList?.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Button className="w-full h-10" onClick={handleSearchClick}>
              Search
            </Button>
          </div>
        </div>

        {/* BLOG GRID */}
        {isLoading ? (
          <div className="py-32 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogListdata?.map((blog) => (
              <Link
                key={blog._id}
                href={`/blog/${blog.slug}`}
                className="group"
              >
                <Card className="h-[450px] overflow-hidden border border-border transition-all duration-300 hover:-translate-y-2 hover:shadow-lg flex flex-col">
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={blog.thumbnailImageUrl || '/logo/logo.png'}
                      alt={blog.title}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <CardHeader className="p-4 pb-2">
                    <h3 className="font-bold text-lg line-clamp-2">
                      {blog.title}
                    </h3>
                  </CardHeader>

                  <CardContent className="p-4 pt-0 flex-grow">
                    <p className="text-sm text-muted-foreground mb-4">
                      {trimDescription(blog.shortDescription)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {dayjs(blog.createdAt).format('MMM D, YYYY')}
                    </p>
                  </CardContent>

                  <CardFooter className="p-4 pt-0 gap-2 flex-wrap">
                    {blog.tags?.slice(0, 2).map((tag, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="font-normal text-[10px]"
                      >
                        {tag?.title}
                      </Badge>
                    ))}
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        <div className="mt-12 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) setPage(page - 1);
                  }}
                  className={
                    page === 1
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>

              {/* Basic numeric display - for a full numeric spread, additional logic is needed */}
              <PaginationItem>
                <span className="text-sm px-4">
                  Page {currentPage} of {totalPages}
                </span>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) setPage(page + 1);
                  }}
                  className={
                    page === totalPages
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </main>
    </div>
  );
}
