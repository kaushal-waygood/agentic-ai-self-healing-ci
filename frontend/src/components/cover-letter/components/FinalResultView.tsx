'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, FileText, Loader2, Router } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FinalResultView({ cvlink }: { cvlink?: string }) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const router = useRouter();

  //   useEffect(() => {
  //     // Simulate cover letter generation (replace with your actual generation logic)
  //     const timer = setTimeout(() => {
  //       setIsGenerating(false);
  //       setShowNotification(true);

  //       // Auto-hide notification after 5 seconds
  //       setTimeout(() => {
  //         setShowNotification(false);
  //       }, 5000);
  //     }, 3000);

  //     return () => clearTimeout(timer);
  //   }, []);

  const handleRedirect = () => {
    // Replace with your actual redirect URL

    router.push('/dashboard/my-docs');
  };

  return (
    <div className="  flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {isGenerating ? (
            <>
              <div className="mb-6">
                <div className="relative inline-block">
                  <FileText className="w-20 h-20 text-indigo-600 mx-auto" />
                  {/* <Loader2 className="w-8 h-8 text-indigo-600 absolute -top-2 -right-2 animate-spin" /> */}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Generating Your Doc...
              </h2>
              {/* <p className="text-gray-600 mb-6">
                Please wait while we craft the perfect doc for you...
              </p> */}
              <p className="text-gray-600 mb-6">
                Running in the background. This may take a few moments.
              </p>

              <div className="flex justify-center gap-2">
                <div
                  className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                ></div>
                <div
                  className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                ></div>
                <div
                  className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                ></div>
              </div>
              <button
                onClick={handleRedirect}
                className="w-full mt-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                View Doc Status
              </button>
            </>
          ) : (
            <>
              <div className="mb-6">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Cover Letter Ready!
              </h2>
              <p className="text-gray-600 mb-8">
                Your cover letter has been successfully generated and is ready
                to view.
              </p>
              <button
                onClick={handleRedirect}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                View Cover Letter
              </button>
            </>
          )}
        </div>

        {/* Success Notification */}
        {showNotification && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 animate-slide-up">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800">
                Generation Complete!
              </p>
              <p className="text-sm text-green-700">
                Your cover letter is now available to view.
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
