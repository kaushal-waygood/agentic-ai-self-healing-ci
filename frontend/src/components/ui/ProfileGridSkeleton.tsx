import React from 'react';

interface Props {
  count?: number;
}

export const ProfileGridSkeleton = ({ count = 4 }: Props) => {
  // Create an array of length 'count' to map over
  const skeletons = Array.from({ length: count });

  return (
    <>
      {skeletons.map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg p-4 border animate-pulse h-full"
        >
          <div className="flex justify-between mb-4">
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/3 mt-2"></div>
            </div>

            <div className="flex gap-2">
              <div className="h-9 w-9 bg-gray-200 rounded-md"></div>
              <div className="h-9 w-9 bg-gray-200 rounded-md"></div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex gap-4 mt-auto">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </>
  );
};
