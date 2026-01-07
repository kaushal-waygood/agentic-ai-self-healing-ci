'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import apiInstance from '@/services/api';
import { Check, AlertTriangle, Zap, Building2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import { setCheckoutRequest } from '@/redux/actions/checkoutAction';
import { useDispatch } from 'react-redux';

// --- Types ---

interface Price {
  usd: number;
  inr: number;
}

interface BillingVariant {
  period: string;
  price: {
    effective: Price;
    actual?: Price;
  };
  features: { name: string; value: string }[];
  discountLabel?: string;
}

interface Plan {
  _id: string;
  planType: 'Free' | 'Pro' | 'Enterprise' | 'Weekly';
  popular: boolean;
  billingVariants: BillingVariant[];
}

interface PricingResponse {
  period: string;
  original: { [k: string]: number };
  discounted: { [k: string]: number };
  discountAmount: { [k: string]: number };
  appliedCoupon?: {
    _id: string;
    code: string;
    discountType?: string;
    discountValue?: number | null;
    discountAmount?: any | null;
  } | null;
}

type CouponShape = {
  _id?: string;
  code: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number | null;
  discountAmount?: number | null;
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

// --- Helpers ---

function getCurrencySymbol(currency: string) {
  return currency.toLowerCase() === 'inr' ? '₹' : '$';
}

function computeLocalPricing(
  basePrice: number,
  currency: string,
  coupon: CouponShape | null,
): PricingResponse {
  const original = { [currency]: +basePrice.toFixed(2) };

  if (!coupon) {
    return {
      period: '',
      original,
      discounted: { [currency]: +basePrice.toFixed(2) },
      discountAmount: { [currency]: 0 },
      appliedCoupon: null,
    };
  }

  let discountAmt = 0;

  if (coupon.discountType === 'percentage' && coupon.discountValue != null) {
    discountAmt = (basePrice * coupon.discountValue) / 100;
  } else if (coupon.discountType === 'fixed' && coupon.discountValue != null) {
    // Assuming fixed value matches the currency context or is handled by backend logic
    discountAmt = coupon.discountValue;
  } else if (coupon.discountAmount != null) {
    discountAmt = coupon.discountAmount;
  }

  if (discountAmt < 0) discountAmt = 0;
  if (discountAmt > basePrice) discountAmt = basePrice;

  const final = +(basePrice - discountAmt).toFixed(2);

  return {
    period: '',
    original,
    discounted: { [currency]: final },
    discountAmount: { [currency]: +discountAmt.toFixed(2) },
    appliedCoupon: {
      _id: coupon._id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue ?? null,
      discountAmount: coupon.discountAmount ?? null,
    },
  };
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
);

// --- Main Component ---

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get('planId');
  const initialPeriod = searchParams.get('period');

  const checkout = useSelector((state: RootState) => state.checkout.data);
  useEffect(() => {
    if (!checkout) {
      router.replace('/dashboard/subscriptions');
    }
  }, [checkout, router]);

  // Logic States
  const [gateway, setGateway] = useState<'stripe' | 'razorpay' | null>(null);
  const [currency, setCurrency] = useState<'usd' | 'inr'>('usd');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Data States
  const [plan, setPlan] = useState<Plan | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(
    initialPeriod,
  );

  // Stripe States
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Razorpay States
  const [razorpayLoading, setRazorpayLoading] = useState(false);

  // General UI States
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Coupon States
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedPricing, setAppliedPricing] = useState<PricingResponse | null>(
    null,
  );
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
  }, []);

  // --- Initialization Flow ---
  useEffect(() => {
    let mounted = true;
    if (!planId || !selectedPeriod) {
      if (mounted) {
        setError('Plan information is missing.');
        setIsLoading(false);
      }
      return;
    }

    const initCheckout = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch Plan Data if not present
        let currentPlan = plan;
        if (!currentPlan) {
          const planRes = await apiInstance.get(`/plan/${planId}`);
          if (!planRes.data.success) throw new Error('Plan not found.');
          currentPlan = planRes.data.data;
          if (mounted) setPlan(currentPlan);
        }

        // 2. Decide Gateway (Routing)
        // We use the route endpoint from your commented code
        const routeRes = await apiInstance.post('/plan/payments/route', {
          currency: 'inr', // Default hint, backend should decide based on IP or User
          country: 'IN', // Optional: pass if you have user location
        });

        console.log(routeRes.data);

        const detectedGateway = routeRes.data.gateway || 'stripe'; // Default to stripe if undefined
        console.log(detectedGateway);
        // Determine currency based on gateway for now (or use response from route)
        const detectedCurrency = detectedGateway === 'razorpay' ? 'inr' : 'usd';

        if (mounted) {
          setGateway(detectedGateway);
          setCurrency(detectedCurrency);
        }

        // 3. Prepare Gateway Specifics
        if (detectedGateway === 'stripe') {
          // Create Stripe Intent
          const endpoint = '/plan/payment/create-intent';
          const body: any = {
            planId,
            period: selectedPeriod,
            currency: detectedCurrency,
          };
          if (couponCode) body.couponCode = couponCode;

          const intentRes = await apiInstance.post(endpoint, body);
          if (!intentRes.data.success)
            throw new Error('Could not init Stripe.');

          if (mounted) {
            setClientSecret(intentRes.data.clientSecret);
            setAppliedPricing(intentRes.data.pricing || null);
          }
        } else {
          // Razorpay: Just clear loading, we create order on button click
          if (mounted) {
            // Reset Stripe stuff
            setClientSecret(null);
            // We can optionally calculate local pricing for initial display
            const activeVariant = currentPlan?.billingVariants.find(
              (v) => v.period === selectedPeriod,
            );
            if (activeVariant) {
              const base = activeVariant.price.effective.inr;
              setAppliedPricing(computeLocalPricing(base, 'inr', null));
            }
          }
        }
      } catch (err: any) {
        console.error('Init error', err);
        if (mounted) setError(err.message || 'Failed to load checkout.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initCheckout();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId, selectedPeriod]);

  // --- Actions ---

  const dispatch = useDispatch();
  const handleApplyCoupon = async () => {
    if (!couponCode || !plan || !selectedPeriod) return;
    setIsApplyingCoupon(true);

    try {
      // 1. Validate Coupon
      const resp = await apiInstance.post('/coupons/redeem-coupon', {
        code: couponCode.trim().toUpperCase(),
      });
      if (!resp.data.success) throw new Error(resp.data.message);

      const coupon: CouponShape = resp.data.data;
      const activeVariant = plan.billingVariants.find(
        (v) => v.period === selectedPeriod,
      );
      if (!activeVariant) throw new Error('Variant not found');

      // 2. Compute Preview
      const basePrice =
        currency === 'usd'
          ? activeVariant.price.effective.usd
          : activeVariant.price.effective.inr;
      const preview = computeLocalPricing(basePrice, currency, coupon);

      

      console.log('Preview', preview);

      dispatch(
        setCheckoutRequest({
          ...checkout,
          finalPrice: preview.discounted[currency],
          discountAmount:
            checkout.discountAmount + preview.discountAmount[currency],
          couponCode: coupon.code,
        }),
      );
      preview.period = selectedPeriod;
      setAppliedPricing(preview);

      // 3. If Stripe, we must update the Intent
      if (gateway === 'stripe') {
        setIsUpdating(true);
        const intentRes = await apiInstance.post(
          '/plan/payment/create-intent',
          {
            planId,
            period: selectedPeriod,
            currency,
            couponCode: coupon.code,
          },
        );
        setClientSecret(intentRes.data.clientSecret);
        setAppliedPricing(intentRes.data.pricing); // Use server pricing
        setIsUpdating(false);
      }

      toast({
        title: 'Coupon Applied',
        description: `Code ${coupon.code} active.`,
      });
    } catch (err: any) {
      toast({
        title: 'Coupon Failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // const handleRemoveCoupon = async () => {
  //   setCouponCode('');

  //   // Reset pricing to base
  //   if (plan && selectedPeriod) {
  //     const activeVariant = plan.billingVariants.find(
  //       (v) => v.period === selectedPeriod,
  //     );
  //     if (activeVariant) {
  //       const base =
  //         currency === 'usd'
  //           ? activeVariant.price.effective.usd
  //           : activeVariant.price.effective.inr;
  //       setAppliedPricing(computeLocalPricing(base, currency, null));
  //     }
  //   }

  //   // If Stripe, refresh intent without coupon
  //   if (gateway === 'stripe') {
  //     setIsUpdating(true);
  //     const intentRes = await apiInstance.post('/plan/payment/create-intent', {
  //       planId,
  //       period: selectedPeriod,
  //       currency,
  //     });
  //     setClientSecret(intentRes.data.clientSecret);
  //     setAppliedPricing(intentRes.data.pricing);
  //     setIsUpdating(false);
  //   }

  //   toast({ title: 'Removed', description: 'Coupon removed.' });
  // };

  // --- Razorpay Payment Trigger ---
  const handleRemoveCoupon = async () => {
    setCouponCode('');

    if (!plan || !selectedPeriod || !checkout) return;

    const activeVariant = plan.billingVariants.find(
      (v) => v.period === selectedPeriod,
    );
    if (!activeVariant) return;

    // 🔹 Base price
    const basePrice =
      checkout.currency === 'usd'
        ? activeVariant.price.effective.usd
        : activeVariant.price.effective.inr;

    // 🔹 Student discount only
    const studentDiscountAmount = checkout.studentDiscountApplied
      ? (basePrice * checkout.discountPercent) / 100
      : 0;

    const finalPrice = +(basePrice - studentDiscountAmount).toFixed(2);

    // ✅ UPDATE REDUX (THIS WAS MISSING)
    dispatch(
      setCheckoutRequest({
        ...checkout,
        finalPrice,
        discountAmount: studentDiscountAmount,
        couponCode: null,
      }),
    );

    // 🔹 Update local pricing (optional, for Stripe UI)
    setAppliedPricing(computeLocalPricing(basePrice, checkout.currency, null));

    // 🔹 Refresh Stripe intent (if needed)
    if (gateway === 'stripe') {
      setIsUpdating(true);
      const intentRes = await apiInstance.post('/plan/payment/create-intent', {
        planId,
        period: selectedPeriod,
        currency: checkout.currency,
      });
      setClientSecret(intentRes.data.clientSecret);
      setAppliedPricing(intentRes.data.pricing);
      setIsUpdating(false);
    }

    toast({
      title: 'Coupon removed',
      description: 'Coupon discount has been removed.',
    });
  };

  const handleRazorpayPayment = async () => {
    if (!razorpayLoaded) {
      toast({
        title: 'Error',
        description: 'Payment gateway not loaded.',
        variant: 'destructive',
      });
      return;
    }
    setRazorpayLoading(true);

    try {
      // 1. Create Order
      const { data } = await apiInstance.post('/plan/payment/create-order', {
        planId,
        period: selectedPeriod,
        currency: 'inr',
        couponCode: couponCode || undefined,
        isStudentDiscountApplied: checkout.studentDiscountApplied,
      });

      // 2. Open Gateway
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: 'ZobsAI',
        description: `Subscription - ${plan?.planType}`,
        handler: async (response: any) => {
          try {
            await apiInstance.post('/plan/payment/verify', response);
            router.push(`/dashboard/checkout/status?pid=${data.orderId}`);
          } catch (vErr) {
            console.error(vErr);
            toast({ title: 'Verification Failed', variant: 'destructive' });
          }
        },
        modal: {
          ondismiss: () => {
            setRazorpayLoading(false);
            toast({ title: 'Payment cancelled', variant: 'destructive' });
          },
        },
        prefill: {
          // You can fill user details here if available in context
          // name: user.name,
          // email: user.email
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Payment Init Failed',
        description: err.message,
        variant: 'destructive',
      });
      setRazorpayLoading(false);
    }
  };

  // --- Render ---

  if (isLoading) {
    return (
      <div className="flex items-center flex-col justify-center min-h-screen">
        <Image
          src="/logo.png"
          alt="zobsai logo"
          width={100}
          height={100}
          className="w-10 h-10 animate-bounce"
        />
        <div className="text-lg mt-4">Preparing your secure checkout...</div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="mb-6">{error || 'Plan not found'}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-gray-900 px-6 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Determine values for display
  const activeVariant = plan.billingVariants.find(
    (v) => v.period === selectedPeriod,
  );
  // const displayPrice =
  //   appliedPricing?.discounted?.[currency] ??
  //   (currency === 'usd'
  //     ? activeVariant?.price.effective.usd
  //     : activeVariant?.price.effective.inr) ??
  //   0;

  // const displayOriginal =
  //   appliedPricing?.original?.[currency] ??
  //   (currency === 'usd'
  //     ? activeVariant?.price.effective.usd
  //     : activeVariant?.price.effective.inr) ??
  //   0;

  // const displayDiscount = appliedPricing?.discountAmount?.[currency] ?? 0;
  const displayOriginal = checkout.basePrice;
  const displayDiscount = checkout.discountAmount;
  const displayPrice = checkout.finalPrice;
  const currencySymbol = getCurrencySymbol(checkout.currency);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 ">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: PLAN DETAILS */}
        <div className="lg:col-span-1">
          <PlanDetails
            plan={plan}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            isLoading={isUpdating || isApplyingCoupon}
            pricing={appliedPricing ?? undefined}
            currency={currency}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
          />
        </div>

        {/* RIGHT: PAYMENT */}
        <div className="lg:col-span-2 bg-white/5 rounded-lg p-8  border ">
          <header className="mb-6">
            <h2 className="text-3xl font-semibold mb-1">Secure Checkout</h2>
            <p className="text-sm ">
              Complete your payment using{' '}
              {gateway === 'stripe' ? 'Stripe' : 'Razorpay'}
            </p>
          </header>

          {/* ORDER SUMMARY */}
          <div className="mb-8">
            {/* <div className="rounded-xl p-5 bg-white/5 border border-white/10">
              <div className="flex justify-between mb-2 text-sm ">
                <span>Original Price</span>
                <span>
                  {getCurrencySymbol(currency)}
                  {displayOriginal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between mb-2 text-sm text-green-400">
                <span>Discount Applied</span>
                <span>
                  -{getCurrencySymbol(currency)}
                  {displayDiscount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-white/10 text-lg font-bold">
                <span>Total Payable</span>
                <span className="text-purple-300">
                  {getCurrencySymbol(currency)}
                  {displayPrice.toFixed(2)}
                </span>
              </div>
            </div> */}

            <div className="rounded-xl p-5 bg-white/5 border border-white/10">
              <div className="flex justify-between mb-2 text-sm">
                <span>Original Price</span>
                <span>
                  {currencySymbol}
                  {displayOriginal.toFixed(2)}
                </span>
              </div>

              {checkout.discountAmount > 0 && (
                <div className="flex justify-between mb-2 text-sm text-green-400">
                  <span>
                    {checkout.studentDiscountApplied
                      ? `Student Discount (${checkout.discountPercent}%)`
                      : 'Discount Applied'}
                  </span>
                  <span>
                    -{currencySymbol}
                    {displayDiscount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between pt-3 border-t border-white/10 text-lg font-bold">
                <span>Total Payable</span>
                <span className="text-purple-300">
                  {currencySymbol}
                  {displayPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* STRIPE */}
          {gateway === 'stripe' && clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripePaymentForm />
            </Elements>
          )}

          {/* RAZORPAY */}
          {gateway === 'razorpay' && (
            <div className="space-y-4 mt-6">
              <button
                onClick={handleRazorpayPayment}
                disabled={!razorpayLoaded || razorpayLoading}
                className={`w-full py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg transition hover:opacity-90 ${
                  (!razorpayLoaded || razorpayLoading) && 'opacity-50'
                }`}
              >
                {razorpayLoading
                  ? 'Processing...'
                  : // : `Pay ${getCurrencySymbol(currency)}${displayPrice}`}
                    `Pay ${currencySymbol}${displayPrice.toFixed(2)}`}
              </button>
              <p className="text-xs text-center">
                Transactions secured by Razorpay 🔐
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Sub Components ---------- */

function StripePaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/checkout/status`,
      },
    });

    setMsg(error?.message || null);
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="p-5 rounded-xl bg-white/5 border border-white/10">
        <PaymentElement />
      </div>

      <button
        disabled={!stripe || !elements || isProcessing}
        className="w-full py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-purple-500 to-indigo-700 hover:opacity-90 transition shadow-xl disabled:opacity-40 text-white"
      >
        {isProcessing ? 'Processing...' : 'Pay Securely 🔐'}
      </button>

      {msg && <p className="text-red-400 text-sm">{msg}</p>}
    </form>
  );
}

const planIcons: Record<string, React.ElementType> = {
  Free: Zap,
  Weekly: Zap,
  Monthly: Zap,

  Enterprise: Building2,
};

const planColors: Record<string, string> = {
  Free: 'from-green-500 to-emerald-600',
  Weekly: 'from-green-500 to-green-600',
  Monthly: 'from-purple-500 to-violet-600',
  Enterprise: 'from-gray-700 to-slate-800',
};

// ---------------- CONFIG ----------------

const getCurrencySymbols = (currency: string) =>
  currency === 'usd' ? '$' : '₹';

// ---------------- COMPONENT ----------------

function PlanDetails(props: any) {
  const {
    plan,
    selectedPeriod,
    onPeriodChange,
    pricing,
    currency,
    couponCode,
    setCouponCode,
    onApplyCoupon,
    onRemoveCoupon,
    isLoading,
  } = props;

  const router = useRouter();
  const checkout = useSelector((state: RootState) => state.checkout.data);

  console.log('checkout', checkout);
  useEffect(() => {
    if (!checkout) {
      router.replace('/dashboard/subscriptions');
    }
  }, [checkout, router]);

  if (!checkout) return null;

  const Icon = planIcons[plan.planType] ?? Building2;
  const gradient = planColors[plan.planType];

  // -------- READ SESSION STORAGE --------

  const v = plan.billingVariants.find((v: any) => v.period === selectedPeriod);
  if (!v || !checkout) return null;

  const sym = getCurrencySymbols(checkout.currency);

  console.log('planes ', plan.studentDiscountApplied);

  return (
    <div className="relative bg-white/5  border rounded-lg p-4 border ">
      {/* LOADING OVERLAY */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-md rounded-2xl text-white">
          Updating...
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-start gap-4 mb-6">
        <div
          className={`shrink-0 p-3 rounded-xl bg-gradient-to-r ${gradient} text-white`}
        >
          <Icon className="w-6 h-6" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-bold text-gray-900">
              {plan.planType} Plan
            </h2>

            {checkout.studentDiscountApplied && (
              <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                🎓 Student Discount
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500 mt-1">
            Choose billing period & review pricing
          </p>
        </div>
      </div>

      {/* PERIOD SWITCH */}
      {/* <div className="flex gap-2 mb-6">
        {plan.billingVariants.map((p: any) => (
          <button
            key={p.period}
            onClick={() => onPeriodChange(p.period)}
            className={`px-4 py-2 rounded-lg text-sm border transition ${
              selectedPeriod === p.period
                ? 'bg-purple-600 text-white border-purple-600'
                : 'border-white/20 hover:bg-white/10'
            }`}
          >
            {p.period}
          </button>
        ))}
      </div> */}

      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 space-y-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Base price</span>
          <span className="font-medium">
            {sym}
            {checkout.basePrice.toFixed(2)}
          </span>
        </div>

        {checkout.studentDiscountApplied && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Student Discount ({checkout.discountPercent}%)</span>
            <span className="font-medium">
              -{sym}
              {checkout.discountAmount.toFixed(2)}
            </span>
          </div>
        )}

        <div className="border-t pt-3 flex justify-between items-center">
          <span className="text-base font-semibold text-gray-900">
            Total payable
          </span>
          <span className="text-2xl font-bold text-purple-600">
            {sym}
            {checkout.finalPrice.toFixed(2)}
          </span>
        </div>
      </div>

      {!checkout.studentDiscountApplied && (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode?.(e.target.value)}
              placeholder="Coupon code"
              className="flex-1 h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            {pricing?.appliedCoupon ? (
              <button
                onClick={onRemoveCoupon}
                className="h-10 px-4 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100"
              >
                Remove
              </button>
            ) : (
              <button
                onClick={onApplyCoupon}
                className="h-10 px-4 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-700"
              >
                Apply
              </button>
            )}
          </div>
        </div>
      )}

      {/* FEATURES */}
      <p className="mb-2 text-lg font-semibold">Includes</p>
      <ul className="space-y-2 mt-2">
        {v.features.map((f: any) => (
          <li
            key={f.name}
            className="flex gap-2 items-start text-sm text-gray-700"
          >
            <Check className="text-green-400 w-4 h-4" />
            <span>
              {f.value == -1 ? 'Unlimited' : f.value} {f.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
