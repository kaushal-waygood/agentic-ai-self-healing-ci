import { Suspense } from 'react';
import EditBlogPage from '@/components/blogs/EditBlog';

export const metadata = {
  title: 'Edit Blog Post | Dashboard',
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
          <EditBlogPage />
        </Suspense>
      </div>
    </main>
  );
};

export default Page;
