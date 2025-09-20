'use client';

import React, { useEffect, useState, Suspense } from 'react';

// Mock API instance for demo
const apiInstance = {
  get: async (url) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Mock response - you can change this to test different states
    return { data: { status: 'completed' } };
  },
};

const CheckCircle = () => (
  <div className="relative">
    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
      <svg
        className="w-10 h-10 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </div>
    <div className="absolute inset-0 w-20 h-20 bg-green-400 rounded-full animate-ping opacity-20"></div>
  </div>
);

const AlertTriangle = () => (
  <div className="relative">
    <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg">
      <svg
        className="w-10 h-10 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    </div>
    <div className="absolute inset-0 w-20 h-20 bg-red-400 rounded-full animate-pulse opacity-30"></div>
  </div>
);

const Loader = () => (
  <div className="relative">
    <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
    <div className="absolute inset-0 w-20 h-20 bg-purple-400 rounded-full animate-pulse opacity-20"></div>
  </div>
);

const Clock = () => (
  <div className="relative">
    <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
      <svg
        className="w-10 h-10 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <div className="absolute inset-0 w-20 h-20 bg-blue-400 rounded-full animate-pulse opacity-25"></div>
  </div>
);

function StatusComponent() {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState(
    'Verifying your payment, please wait...',
  );
  const [searchParams, setSearchParams] = useState(null);

  useEffect(() => {
    setSearchParams(new URLSearchParams(window.location.search));
  }, []);

  useEffect(() => {
    if (!searchParams) {
      return;
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

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'from-purple-500 to-purple-700';
      case 'success':
        return 'from-green-500 to-emerald-700';
      case 'error':
        return 'from-red-500 to-red-700';
      case 'timeout':
        return 'from-blue-500 to-blue-700';
      default:
        return 'from-purple-500 to-purple-700';
    }
  };

  const getBgPattern = () => {
    switch (status) {
      case 'success':
        return 'bg-gradient-to-br from-green-50 to-emerald-50';
      case 'error':
        return 'bg-gradient-to-br from-red-50 to-red-50';
      case 'timeout':
        return 'bg-gradient-to-br from-blue-50 to-blue-50';
      default:
        return 'bg-gradient-to-br from-purple-50 to-indigo-50';
    }
  };

  return (
    <div
      className={`min-h-screen flex items-start justify-center p-4 transition-colors duration-500 ${getBgPattern()}`}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Main card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header with gradient */}
          <div className={`h-2 bg-gradient-to-r ${getStatusColor()}`}></div>

          <div className="p-8 text-center">
            {/* Icon container */}
            <div className="mb-8 flex justify-center">
              <div className="transform transition-all duration-500 hover:scale-105">
                {renderIcon()}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-800 mb-4 tracking-tight">
              {renderTitle()}
            </h1>

            {/* Message */}
            <div className="mb-8">
              <p className="text-gray-600 text-lg leading-relaxed">{message}</p>

              {/* Loading dots animation for loading state */}
              {status === 'loading' && (
                <div className="flex justify-center mt-4 space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
              )}
            </div>

            {/* Button */}
            <button
              onClick={() => (window.location.href = '/dashboard')}
              className={`w-full bg-gradient-to-r ${getStatusColor()} text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-purple-300/50`}
            >
              <span className="flex items-center justify-center space-x-2">
                <span>Return to Dashboard</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            </button>
          </div>
        </div>

        {/* Subtle glow effect */}
        <div
          className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${getStatusColor()} opacity-5 -z-10 blur-xl transform scale-105`}
        ></div>
      </div>
    </div>
  );
}

export default function CheckoutStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 text-lg">Loading payment status...</p>
          </div>
        </div>
      }
    >
      <StatusComponent />
    </Suspense>
  );
}
