// import Tags from '@/components/blogs/tags';

// const page = () => {
//   return (
//     <div>
//       <Tags />
//     </div>
//   );
// };

// export default page;

import React, { Suspense } from 'react';
import Tags from '@/components/blogs/tags';

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
        <Tags />
      </Suspense>
    </div>
  );
};

export default Page;
