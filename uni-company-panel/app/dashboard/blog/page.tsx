import React, { Suspense } from 'react';
import GetBlogs from '@/components/blogs/GetBlogs';

// Standard practice for dashboard pages
export const metadata = {
  title: 'Blog Management | Dashboard',
};

const Page = () => {
  return (
    <div className="p-4">
      {/* Suspense is mandatory here because GetBlogs (or its children) 
          uses useSearchParams() 
      */}
      <Suspense
        fallback={
          <div className="w-full h-72 flex items-center justify-center bg-slate-50 rounded-lg animate-pulse">
            <p className="text-slate-400">Loading blogs...</p>
          </div>
        }
      >
        <GetBlogs />
      </Suspense>
    </div>
  );
};

export default Page;
