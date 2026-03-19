'use client';

import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Calendar,
  ArrowUpRight,
  Sparkles,
  RefreshCcw,
} from 'lucide-react';

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
  }, [page, tagFilter, categoryFilter]); // Added filters to dependency array for instant loading

  const loadBlogs = (pageNumber = 1) => {
    getWebsiteBlogs(12, pageNumber - 1, search || '', {
      ...(tagFilter !== 'all' && { tag: tagFilter }),
      ...(categoryFilter !== 'all' && { category: categoryFilter }),
      isActive: true,
    });
  };

  const handleSearchClick = () => {
    setPage(1);
    loadBlogs(1);
  };

  const resetFilters = () => {
    setSearch('');
    setTagFilter('all');
    setCategoryFilter('all');
    setPage(1);
  };

  const trimDescription = (html: string) => {
    if (!html) return '';
    const text = html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
    return text.length <= 80 ? text : text.substring(0, 80) + '...';
  };

  const totalPages = blogPaginator?.pageCount || 1;

  console.log('blog details ', blogListdata);

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-indigo-100 selection:text-indigo-700">
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[30%] h-[30%] rounded-full bg-indigo-50/50 blur-[100px]" />
        <div className="absolute top-[20%] -right-[5%] w-[20%] h-[20%] rounded-full bg-sky-50/50 blur-[80px]" />
      </div>

      {/* HERO SECTION */}
      <header className="relative pt-16 pb-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-slate-200 shadow-sm mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              The Editorial
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4 bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-700">
            Insights for the modern builder.
          </h1>
          <p className="text-base text-slate-500 max-w-lg mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Technical deep-dives, industry trends, and practical guides.
          </p>
        </div>
      </header>

      {/* COMPACT FLOATING FILTER BAR */}
      <nav className="sticky top-4 z-50 px-4 mb-10">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-xl p-2 flex flex-col md:flex-row gap-2 transition-all">
            {/* Search Input */}
            <div className="relative flex-grow group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                className="w-full h-10 pl-9 pr-4 rounded-lg bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-sm placeholder:text-slate-400"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
              />
            </div>

            {/* Dropdowns & Button (Grid on Mobile to save vertical space) */}
            <div className="grid grid-cols-2 md:flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[130px] h-10 border-slate-100 bg-slate-50 rounded-lg text-sm focus:ring-indigo-500/20">
                  <SelectValue placeholder="Categories" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-slate-100">
                  <SelectItem value="all">All Categories</SelectItem>
                  {websiteBlogCategoryFilterList?.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger className="w-full md:w-[130px] h-10 border-slate-100 bg-slate-50 rounded-lg text-sm focus:ring-indigo-500/20">
                  <SelectValue placeholder="Tags" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-slate-100">
                  <SelectItem value="all">All Tags</SelectItem>
                  {websiteBlogTagFilterList?.map((tag) => (
                    <SelectItem key={tag._id} value={tag._id}>
                      {tag.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={handleSearchClick}
                className="col-span-2 md:col-span-1 h-10 px-6 rounded-lg bg-slate-900 hover:bg-indigo-600 active:scale-95 text-white transition-all text-sm font-medium"
              >
                Explore
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 pb-20 max-w-7xl">
        {/* SKELETON LOADING STATE */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col w-full bg-white rounded-2xl border border-slate-100 overflow-hidden h-[340px]"
              >
                <div className="aspect-video bg-slate-100 animate-pulse" />
                <div className="p-5 flex flex-col gap-3 flex-grow">
                  <div className="flex gap-2 mb-2">
                    <div className="h-4 w-12 bg-slate-100 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-full bg-slate-100 rounded animate-pulse" />
                  <div className="h-6 w-2/3 bg-slate-100 rounded animate-pulse" />
                  <div className="mt-auto h-4 w-full bg-slate-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : blogListdata?.length === 0 ? (
          /* EMPTY STATE */
          <div className="py-24 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
            <div className="h-16 w-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No articles found
            </h3>
            <p className="text-slate-500 mb-6 max-w-sm">
              We couldn't find any articles matching your current filters. Try
              adjusting your search.
            </p>
            <Button
              variant="outline"
              onClick={resetFilters}
              className="gap-2 text-slate-600 rounded-xl"
            >
              <RefreshCcw className="h-4 w-4" /> Clear all filters
            </Button>
          </div>
        ) : (
          /* BLOG GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
            {blogListdata?.map((blog) => (
              <Link
                key={blog._id}
                href={`/blog/${blog.slug}`}
                className="group relative flex h-full outline-none"
              >
                <article className="flex flex-col w-full bg-white rounded-2xl border border-slate-300 overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 group-focus-visible:ring-2 group-focus-visible:ring-indigo-500 group-focus-visible:ring-offset-2">
                  {/* Card Image Container */}
                  <div className="relative aspect-video bg-slate-50 flex items-center justify-center overflow-hidden border-b border-slate-50">
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 transition-transform duration-500 group-hover:scale-105">
                      <span className="text-5xl font-bold text-slate-400 select-none group-hover:text-slate-900 transition-colors duration-300">
                        {blog.title ? blog.title.charAt(0).toUpperCase() : 'B'}
                      </span>
                    </div>

                    <div className="absolute z-30 bottom-3 left-3 right-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                      <span className="inline-flex items-center text-white text-[10px] font-bold uppercase tracking-widest bg-slate-900/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 shadow-sm">
                        Read Article <ArrowUpRight className="ml-1 h-3 w-3" />
                      </span>
                    </div>

                    {blog.thumbnailImageUrl && (
                      <img
                        src={blog.thumbnailImageUrl}
                        alt={blog.title}
                        className="absolute inset-0 z-10 object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {blog?.category?.[0]?.title || 'Tech'}
                        </span>
                      </span>
                      <div className="h-1 w-1 rounded-full bg-slate-200" />
                      <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                        {dayjs(blog.createdAt).format('MMM DD, YYYY')}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors duration-200 mb-2 line-clamp-2">
                      {blog.title}
                    </h3>

                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4">
                      {trimDescription(blog.shortDescription)}
                    </p>

                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex gap-1.5 overflow-hidden">
                        {blog.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-medium text-slate-400 truncate"
                          >
                            #{tag.title}
                          </span>
                        ))}
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-2">
            <button
              onClick={() => page > 1 && setPage(page - 1)}
              className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-40 disabled:active:scale-100 focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
              disabled={page === 1}
            >
              <ArrowUpRight className="h-4 w-4 rotate-[225deg] text-slate-700" />
            </button>

            <div className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 shadow-sm">
              {page} <span className="text-slate-300 mx-1">/</span> {totalPages}
            </div>

            <button
              onClick={() => page < totalPages && setPage(page + 1)}
              className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-40 disabled:active:scale-100 focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
              disabled={page === totalPages}
            >
              <ArrowUpRight className="h-4 w-4 rotate-45 text-slate-700" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
