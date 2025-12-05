'use client';

import apiInstance from '@/services/api'; // Ensure this path is correct
import { useSearchParams, useRouter } from 'next/navigation';
import React, { useEffect, useState, Suspense } from 'react';
import { Loader2, CheckCircle2, XCircle, Building2 } from 'lucide-react'; // You might need to install lucide-react

const InviteContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State for UI feedback
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setStatus('error');
      setErrorMessage('Invalid or missing invitation token.');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleAcceptInvite = async () => {
    if (!token) return;

    try {
      setStatus('loading');

      // Artificial delay for better UX (optional, prevents flickering)
      // await new Promise(resolve => setTimeout(resolve, 800));

      const res = await apiInstance.post('/organization/member/accept-invite', {
        token,
      });

      console.log('Invite accepted:', res);
      setStatus('success');

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard'); // Change this to your desired path
      }, 2000);
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setErrorMessage(
        error?.response?.data?.message ||
          'Failed to accept invitation. Please try again.',
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-xl ring-1 ring-gray-900/5 transition-all">
        {/* Header Icon */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            {status === 'success' ? (
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            ) : status === 'error' ? (
              <XCircle className="h-8 w-8 text-red-600" />
            ) : (
              <Building2 className="h-8 w-8 text-blue-600" />
            )}
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            {status === 'success' ? 'Welcome Aboard!' : 'Team Invitation'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {status === 'success'
              ? 'You have successfully joined the organization. Redirecting...'
              : status === 'error'
              ? errorMessage
              : 'You have been invited to join an organization. Click below to accept.'}
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-8">
          {status === 'error' ? (
            <button
              onClick={() => router.push('/')}
              className="group relative flex w-full justify-center rounded-md bg-gray-600 px-3 py-3 text-sm font-semibold text-white hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
            >
              Go Home
            </button>
          ) : (
            <button
              onClick={handleAcceptInvite}
              disabled={status === 'loading' || status === 'success'}
              className={`group relative flex w-full justify-center rounded-md px-3 py-3 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all duration-200
                ${
                  status === 'success'
                    ? 'bg-green-600 hover:bg-green-500 focus-visible:outline-green-600'
                    : 'bg-blue-600 hover:bg-blue-500 focus-visible:outline-blue-600 shadow-md hover:shadow-lg hover:-translate-y-0.5'
                }
                ${status === 'loading' ? 'opacity-80 cursor-not-allowed' : ''}
              `}
            >
              <span className="flex items-center gap-2">
                {status === 'loading' && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {status === 'loading'
                  ? 'Processing...'
                  : status === 'success'
                  ? 'Joined Successfully'
                  : 'Accept Invitation'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Wrap in Suspense for Next.js useSearchParams
const InvitePage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <InviteContent />
    </Suspense>
  );
};

export default InvitePage;
