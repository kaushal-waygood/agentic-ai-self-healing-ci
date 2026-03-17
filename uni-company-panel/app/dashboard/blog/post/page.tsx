import { Suspense } from 'react';
import CreateBlogForm from '@/components/blogs/PostBlog';

export const metadata = {
  title: 'Create New Post | Dashboard',
};

const Page = () => {
  return (
    <main className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Suspense is required here to prevent the CSR bailout error during build */}
        <Suspense
          fallback={
            <div className="space-y-4 animate-pulse">
              <div className="h-8 bg-muted rounded w-1/4" />
              <div className="h-[400px] bg-muted rounded w-full" />
            </div>
          }
        >
          <CreateBlogForm />
        </Suspense>
      </div>
    </main>
  );
};

export default Page;
