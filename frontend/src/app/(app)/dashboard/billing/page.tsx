'use client';

import React from 'react';
import { PackageX } from 'lucide-react';

export default function PlansPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="flex flex-col items-center justify-center space-y-4">
        <PackageX className="w-12 h-12 text-gray-400" />
        <h1 className="text-2xl font-semibold text-gray-800">
          Currently, we don’t have any plans
        </h1>
        <p className="text-gray-500 text-sm max-w-md">
          We’re working on exciting new subscription plans. Stay tuned for
          updates!
        </p>
      </div>
    </div>
  );
}
