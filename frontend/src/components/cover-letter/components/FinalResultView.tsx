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
  incompleteProfile?: string | null;
};

export default function FinalResultView({
  cvlink,
  rateLimited,
  rateLimitMessage = null,
  planPath = '/dashboard/plans',
  title,
  targetLink,
  incompleteProfile,
}: Props) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If profile is incomplete, stop spinner immediately
    if (incompleteProfile) {
      setIsGenerating(false);
      setShowNotification(false);
      return;
    }

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
  }, [rateLimited, incompleteProfile]);

  const handleRedirectDocs = () => {
    if (typeof targetLink === 'string' && targetLink.length > 0) {
      router.push(targetLink);
    } else {
      router.push('/dashboard/my-docs');
    }
  };

  const handleGoToPlans = () => {
    router.push(planPath);
  };

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          {/* RATE LIMIT */}
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
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-lg"
                >
                  View Plans & Purchase
                </button>

                <button
                  onClick={handleRedirectDocs}
                  className="w-full border border-gray-200 bg-white text-gray-700 font-medium py-3 px-6 rounded-lg"
                >
                  View Doc Status
                </button>
              </div>
            </>
          ) : incompleteProfile ? (
            /* PROFILE INCOMPLETE */
            <>
              <div className="mb-6">
                <FileText className="w-20 h-20 text-red-500 mx-auto" />
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Complete your profile
              </h2>

              <p className="text-gray-600 mb-3">
                We need a few more details before generating your {title}.
              </p>

              <p className="text-sm text-red-600 mb-6">{incompleteProfile}</p>

              <div className="flex gap-3 flex-col">
                <button
                  onClick={() => router.push('/dashboard/profile')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg"
                >
                  Complete Profile
                </button>

                <button
                  onClick={handleRedirectDocs}
                  className="w-full border border-gray-200 bg-white text-gray-700 font-medium py-3 px-6 rounded-lg"
                >
                  View Documents
                </button>
              </div>
            </>
          ) : isGenerating ? (
            /* GENERATING */
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
            </>
          ) : (
            /* SUCCESS */
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
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg"
                >
                  View {title}
                </button>

                {cvlink && (
                  <button
                    onClick={() => window.open(cvlink, '_blank')}
                    className="w-full border border-gray-200 bg-white text-gray-700 font-medium py-3 px-6 rounded-lg"
                  >
                    Open Document
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
