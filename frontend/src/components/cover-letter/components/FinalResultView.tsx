'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, FileText, Loader2, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import apiInstance from '@/services/api';

type Props = {
  cvlink?: string;
  rateLimited?: boolean;
  rateLimitMessage?: string | null;
  planPath?: string;
  title?: string;
  targetLink?: string;
  incompleteProfile?: string | null;
  documentId?: string;
  documentType?: 'cv' | 'cl' | 'application';
  onStatusCompleted?: () => void;
  showSendEmail?: boolean;
  onSendEmail?: (documentId?: string) => Promise<void>;
};

export default function FinalResultView({
  cvlink,
  rateLimited,
  rateLimitMessage = null,
  planPath = '/dashboard/plans',
  title,
  targetLink,
  incompleteProfile,
  documentId,
  documentType = 'cv',
  onStatusCompleted,
  showSendEmail = false,
  onSendEmail,
}: Props) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [statusCompleted, setStatusCompleted] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (incompleteProfile) {
      setIsGenerating(false);
      setShowNotification(false);
      return;
    }

    if (rateLimited) {
      setIsGenerating(false);
      setShowNotification(false);
      return;
    }

    if (documentId) return;

    const t = setTimeout(() => {
      setIsGenerating(false);
      setShowNotification(true);
    }, 1800);
    return () => clearTimeout(t);
  }, [rateLimited, incompleteProfile, documentId]);

  // Poll status API when documentId is provided; stop when status is completed
  useEffect(() => {
    if (!documentId || rateLimited || incompleteProfile || statusCompleted) return;

    const getEndpoint = () => {
      switch (documentType) {
        case 'cv':
          return `/students/status/cv/${documentId}`;
        case 'cl':
          return `/students/status/cl/${documentId}`;
        case 'application':
          return `/students/status/tailored/${documentId}`;
        default:
          return `/students/status/cv/${documentId}`;
      }
    };

    const checkStatus = async () => {
      try {
        const { data } = await apiInstance.get(getEndpoint());
        const status = data?.item?.status ?? data?.document?.status;
        if (status === 'completed' || status === 'new') {
          setStatusCompleted(true);
          setIsGenerating(false);
          setShowNotification(true);
          onStatusCompleted?.();
          // Trigger notification refresh so bell updates instantly (ZOB-116)
          window.dispatchEvent(new CustomEvent('document-generation-complete'));
        }
      } catch (error) {
        console.error('Error polling document status:', error);
      }
    };

    const timer = setTimeout(checkStatus, 1000);
    const interval = setInterval(checkStatus, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [documentId, documentType, rateLimited, incompleteProfile, statusCompleted]);

  const handleRedirectDocs = () => {
    if (typeof targetLink === 'string' && targetLink.length > 0) {
      router.push(targetLink);
    } else {
      router.push('/dashboard/my-docs');
    }
  };

  const handleGoToPlans = () => {
    // router.push(planPath);
    router.replace(planPath);
  };

  const handleSendEmailClick = async () => {
    if (!onSendEmail) return;
    setIsSendingEmail(true);
    try {
      await onSendEmail(documentId);
    } finally {
      setIsSendingEmail(false);
    }
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
          ) : (
            <>
              <div className="mb-8 relative flex items-center justify-center h-32">
                <div className="relative group">
                  <div className="absolute inset-0 bg-indigo-200 rounded-2xl blur-xl opacity-20 animate-pulse"></div>

                  <div className="relative p-6 bg-white border border-indigo-50 rounded-2xl shadow-sm z-10">
                    <FileText className="w-12 h-12 text-indigo-500" />

                    <div className="absolute -top-2 -right-2 bg-indigo-600 rounded-full p-1.5 shadow-lg border-2 border-white">
                      {statusCompleted ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      )}
                    </div>
                  </div>

                  <div className="absolute top-2 -left-4 w-12 h-12 bg-gray-100 rounded-lg -z-10 rotate-[-10deg] border border-gray-200 opacity-50"></div>
                  <div className="absolute top-4 -left-2 w-12 h-12 bg-gray-50 rounded-lg -z-10 rotate-[-5deg] border border-gray-200 opacity-80"></div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {statusCompleted ? 'Document ready!' : 'Document is being generated'}
              </h2>

              <div className="flex flex-col gap-4 mb-8 max-w-xs mx-auto text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle className="h-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Request received
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${statusCompleted ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    {statusCompleted ? (
                      <CheckCircle className="h-4 h-4" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${statusCompleted ? 'text-gray-700' : 'font-bold text-indigo-600'}`}>
                    {statusCompleted ? 'Processing complete' : 'Added to queue & processing'}
                  </span>
                </div>

                <div className={`flex items-center gap-3 ${statusCompleted ? '' : 'opacity-40'}`}>
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${statusCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {statusCompleted ? (
                      <CheckCircle className="h-4 h-4" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-gray-400" />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${statusCompleted ? 'text-gray-700' : 'text-gray-500'}`}>
                    Document ready
                  </span>
                </div>
              </div>

              <div className="bg-indigo-50/50 rounded-xl p-4 mb-8 border border-indigo-100/50">
                <p className="text-sm text-indigo-800 leading-relaxed">
                  {statusCompleted
                    ? 'Your document is ready. Click below to view it in your documents.'
                    : "Your document is in safe hands. You can continue with other operations; we'll notify you when it's done."}
                </p>
              </div>

              <div className="flex gap-3 flex-col">
                {showSendEmail && statusCompleted && onSendEmail && (
                  <button
                    onClick={handleSendEmailClick}
                    disabled={isSendingEmail}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSendingEmail ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        Send Email (Draft + CV & Cover Letter PDFs)
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={handleRedirectDocs}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!statusCompleted && !!documentId}
                >
                  {statusCompleted ? 'View Document' : 'View Live Status'}
                </button>

                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-white border border-gray-200 text-gray-700 font-semibold py-3.5 px-6 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Continue Other Operations
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
