'use client';

import apiInstance from '@/services/api';
import React, { useEffect, useState, Suspense } from 'react';

const CheckCircle = () => <div className="w-16 h-16 text-green-500">✅</div>;
const AlertTriangle = () => <div className="w-16 h-16 text-red-500">⚠️</div>;
const Loader = () => (
  <div className="w-16 h-16 text-purple-600 animate-spin">🔄</div>
);
const Clock = () => <div className="w-16 h-16 text-blue-500">⏰</div>;

function StatusComponent() {
  const [status, setStatus] = useState<
    'loading' | 'success' | 'error' | 'timeout'
  >('loading');
  const [message, setMessage] = useState<string | null>(
    'Verifying your payment, please wait...',
  );

  // Replicating Next.js hooks with browser APIs
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(
    null,
  );

  useEffect(() => {
    setSearchParams(new URLSearchParams(window.location.search));
  }, []);

  useEffect(() => {
    if (!searchParams) {
      return; // Wait for searchParams to be set
    }
    const paymentIntentId = searchParams.get('payment_intent');
    const redirectStatus = searchParams.get('redirect_status');

    if (!paymentIntentId) {
      setStatus('error');
      setMessage(
        'Payment details are missing. Please return to the dashboard.',
      );
      return;
    }

    if (redirectStatus === 'failed') {
      setStatus('error');
      setMessage('Your payment could not be processed. Please try again.');
      return;
    }

    // --- Polling Logic ---
    let attempts = 0;
    const maxAttempts = 15;

    const intervalId = setInterval(async () => {
      try {
        attempts++;

        const response = await apiInstance.get(
          `/plan/payment/status/${paymentIntentId}`,
        );

        const backendStatus = response.data.status;

        if (backendStatus === 'completed') {
          setStatus('success');
          setMessage('Payment successful! Your plan has been activated.');
          clearInterval(intervalId);
        } else if (backendStatus === 'failed') {
          setStatus('error');
          setMessage(
            'Your payment failed after processing. Please contact support.',
          );
          clearInterval(intervalId);
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
        setStatus('error');
        setMessage(
          'An error occurred while verifying your payment. Please contact support.',
        );
        clearInterval(intervalId);
      }

      if (attempts >= maxAttempts) {
        setStatus('timeout');
        setMessage(
          "We're still confirming your payment. Your plan will be updated shortly. Please check your dashboard in a moment.",
        );
        clearInterval(intervalId);
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, [searchParams]);

  const renderIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader />;
      case 'success':
        return <CheckCircle />;
      case 'error':
        return <AlertTriangle />;
      case 'timeout':
        return <Clock />;
    }
  };

  const renderTitle = () => {
    switch (status) {
      case 'loading':
        return 'Processing Your Payment';
      case 'success':
        return 'Payment Complete!';
      case 'error':
        return 'Payment Failed';
      case 'timeout':
        return 'Verification Taking Longer Than Usual';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full">
        <div className="mb-6 flex justify-center">{renderIcon()}</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {renderTitle()}
        </h1>
        <p className="text-gray-600 mb-8">{message}</p>
        <button
          onClick={() => (window.location.href = '/dashboard')}
          className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

// Wrap the main component in Suspense to handle the useSearchParams hook correctly.
export default function CheckoutStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-12 h-12 text-purple-600 animate-spin">🔄</div>
        </div>
      }
    >
      <StatusComponent />
    </Suspense>
  );
}
