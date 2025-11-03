'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { CheckCircle, AlertTriangle, Loader } from 'lucide-react';

// --- Stripe Loader ---
// It's best practice to call loadStripe outside of a component's render.
const stripePromise = loadStripe(
  'pk_live_51P9LpzRk1I3BflpJZwwqZtdVW5cJmdivnzPqu6vtSosnfTO44dZhve6DOdtNfupRR247b18tSTU3Ziszq8Yr2Duo00XmtGeZzC',
);

function StatusComponent() {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    stripePromise.then(setStripe);
  }, []);

  useEffect(() => {
    if (!stripe) {
      return; // Stripe.js has not yet loaded.
    }

    const clientSecret = searchParams.get('payment_intent_client_secret');

    if (!clientSecret) {
      setStatus('error');
      setMessage('Could not process payment. Please try again.');
      return;
    }

    // Retrieve the PaymentIntent to check its status.
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case 'succeeded':
          setStatus('success');
          setMessage('Payment successful! Your plan is now active.');
          break;
        case 'processing':
          setStatus('loading');
          setMessage(
            "Your payment is processing. We'll update you when it's received.",
          );
          break;
        case 'requires_payment_method':
          setStatus('error');
          setMessage('Payment failed. Please try another payment method.');
          break;
        default:
          setStatus('error');
          setMessage('Something went wrong. Please contact support.');
          break;
      }
    });
  }, [stripe, searchParams]);

  const renderIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader className="w-16 h-16 text-purple-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-16 h-16 text-red-500" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full">
        <div className="mb-6">{renderIcon()}</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {status === 'loading' && 'Processing Your Payment'}
          {status === 'success' && 'Payment Complete'}
          {status === 'error' && 'Payment Failed'}
        </h1>
        <p className="text-gray-600 mb-8">{message}</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

// Wrap the component in Suspense to handle the useSearchParams hook correctly.
export default function CheckoutStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="w-12 h-12 text-purple-600 animate-spin" />
        </div>
      }
    >
      <StatusComponent />
    </Suspense>
  );
}
