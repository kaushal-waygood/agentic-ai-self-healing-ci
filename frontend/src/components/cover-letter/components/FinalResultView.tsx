'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, FileText, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Props = {
  cvlink?: string;
  rateLimited?: boolean;
  rateLimitMessage?: string | null;
  planPath?: string;
  title?: string;
  targetLink?: string;
};

export default function FinalResultView({
  cvlink,
  rateLimited = false,
  rateLimitMessage = null,
  planPath = '/dashboard/plans',
  title,
  targetLink,
}: Props) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!rateLimited) {
      const t = setTimeout(() => {
        setIsGenerating(false);
        setShowNotification(true);
      }, 1800);
      return () => clearTimeout(t);
    } else {
      setIsGenerating(false);
      setShowNotification(false);
    }
  }, [rateLimited]);

  const handleRedirectDocs = () => {
    if (typeof targetLink === 'string' && targetLink.length > 0) {
      router.push(targetLink);
    } else {
      // Fallback route when no targetLink was provided
      alert('please provide a target link');
      router.push('/dashboard/my-docs');
    }
  };

  const handleGoToPlans = () => {
    router.push(planPath);
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {rateLimited ? (
            <>
              <div className="mb-6">
                <FileText className="w-20 h-20 text-amber-600 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Upgrade Required
              </h2>
              <p className="text-gray-600 mb-4">
                {rateLimitMessage ||
                  'You have hit your cover-letter generation limit for your current plan.'}
              </p>

              <div className="flex gap-3 flex-col">
                <button
                  onClick={handleGoToPlans}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  View Plans & Purchase
                </button>

                <button
                  onClick={handleRedirectDocs}
                  className="w-full border border-gray-200 bg-white text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  View Doc Status
                </button>
              </div>
            </>
          ) : isGenerating ? (
            <>
              <div className="mb-6">
                <div className="relative inline-block">
                  <FileText className="w-20 h-20 text-indigo-600 mx-auto" />
                  <Loader2 className="w-8 h-8 text-indigo-600 absolute -top-2 -right-2 animate-spin" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Generating Your {title}...
              </h2>
              <p className="text-gray-600 mb-6">
                Running in the background. This may take a few moments.
              </p>

              <div className="flex justify-center gap-2">
                <div
                  className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <div
                  className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <div
                  className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
              <button
                onClick={handleRedirectDocs}
                className="w-full mt-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                View Doc Status
              </button>
            </>
          ) : (
            <>
              <div className="mb-6">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {title} Ready!
              </h2>
              <p className="text-gray-600 mb-8">
                Your {title} has been successfully generated and is ready to
                view.
              </p>
              <div className="flex gap-3 flex-col">
                <button
                  onClick={handleRedirectDocs}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  View {title}
                </button>
                <button
                  onClick={() => cvlink && window.open(cvlink, '_blank')}
                  className="w-full border border-gray-200 bg-white text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Open Document
                </button>
              </div>
            </>
          )}
        </div>

        {showNotification && !rateLimited && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 animate-slide-up">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800">
                Generation Complete!
              </p>
              <p className="text-sm text-green-700">
                Your {title} is now available to view.
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
