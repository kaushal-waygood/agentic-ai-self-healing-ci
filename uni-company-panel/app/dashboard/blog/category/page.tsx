// import CategoryPage from '@/components/blogs/Category';

// const page = () => {
//   return (
//     <div>
//       <CategoryPage />
//     </div>
//   );
// };

// export default page;

import { Suspense } from 'react';
import CategoryPage from '@/components/blogs/Category';

export const metadata = {
  title: 'Category | Dashboard',
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
          <CategoryPage />
        </Suspense>
      </div>
    </main>
  );
};

export default Page;
