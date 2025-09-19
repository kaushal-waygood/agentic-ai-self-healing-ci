import { Suspense } from 'react';
// Corrected the import path to be a relative path
import CheckoutPage from '../../../../components/home/PurchaseModel';
import { Loader } from 'lucide-react';

// This is the page component that will be rendered for the route.
export default function page() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <div className="relative bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading Checkout...</p>
            </div>
          </div>
        </div>
      }
    >
      <CheckoutPage />
    </Suspense>
  );
}
