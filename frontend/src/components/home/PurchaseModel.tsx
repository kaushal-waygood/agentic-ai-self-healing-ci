'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import apiInstance from '@/services/api';
import {
  Check,
  AlertTriangle,
  Loader,
  Crown,
  Zap,
  Building2,
  Shield,
  Lock,
  Trash2,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// --- Type Definitions ---
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

// put near top (outside component)
type CouponShape = {
  _id?: string;
  code: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number | null; // percentage (0-100) or fixed amount
  discountAmount?: number | null; // optional explicit per-currency fixed amount
};

function computeLocalPricing(
  basePriceUsd: number,
  coupon: CouponShape | null,
): PricingResponse {
  const currency = 'usd';
  const original = { [currency]: +basePriceUsd.toFixed(2) };

  if (!coupon) {
    return {
      period: '', // caller can set
      original,
      discounted: { [currency]: +basePriceUsd.toFixed(2) },
      discountAmount: { [currency]: 0 },
      appliedCoupon: null,
    };
  }

  let discountAmt = 0;

  if (coupon.discountType === 'percentage' && coupon.discountValue != null) {
    discountAmt = (basePriceUsd * coupon.discountValue) / 100;
  } else if (coupon.discountType === 'fixed' && coupon.discountValue != null) {
    // coupon.discountValue treated as USD fixed amount
    discountAmt = coupon.discountValue;
  } else if (coupon.discountAmount != null) {
    // explicit discount amount sent by server
    discountAmt = coupon.discountAmount;
  }

  // clamp
  if (discountAmt < 0) discountAmt = 0;
  if (discountAmt > basePriceUsd) discountAmt = basePriceUsd;

  const final = +(basePriceUsd - discountAmt).toFixed(2);

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
  'pk_live_51P9LpzRk1I3BflpJZwwqZtdVW5cJmdivnzPqu6vtSosnfTO44dZhve6DOdtNfupRR247b18tSTU3Ziszq8Yr2Duo00XmtGeZzC', // fallback - replace in env for prod
);

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const planId = searchParams.get('planId');
  const initialPeriod = searchParams.get('period');
  const currency = 'usd';

  const [plan, setPlan] = useState<Plan | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(
    initialPeriod,
  );
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // coupon states
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedPricing, setAppliedPricing] = useState<PricingResponse | null>(
    null,
  );
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Helper to pick endpoint based on env (kept your original logic)
  const pickCreateIntentEndpoint = useCallback(() => {
    if (process.env.NEXT_PUBLIC_NODE_ENV === 'production') {
      return '/plan/payment/create-intent';
    } else if (
      process.env.NEXT_PUBLIC_NODE_ENV === 'development' ||
      process.env.NEXT_PUBLIC_NODE_ENV === 'local'
    ) {
      return '/plan/payment/create-intent-test';
    }
    return null;
  }, []);

  // --- Data Fetching and Intent Creation ---
  useEffect(() => {
    let mounted = true;
    if (!planId || !selectedPeriod) {
      if (mounted) {
        setError('Plan information is missing. Please select a plan again.');
        setIsLoading(false);
      }
      return;
    }

    const fetchDetailsAndCreateIntent = async (opts?: { coupon?: string }) => {
      const showLoader = clientSecret === null;
      if (showLoader) setIsLoading(true);
      else setIsUpdating(true);

      try {
        if (!plan) {
          const planResponse = await apiInstance.get(`/plan/${planId}`);
          if (!planResponse.data.success) throw new Error('Plan not found.');
          setPlan(planResponse.data.data);
        }

        const endpoint = pickCreateIntentEndpoint();
        if (!endpoint) {
          toast({
            title: 'Error',
            description: 'Invalid environment.',
            variant: 'destructive',
          });
          throw new Error('Invalid environment.');
        }

        const body: any = { planId, period: selectedPeriod, currency };
        if (opts && opts.coupon) body.couponCode = opts.coupon;

        const intentResponse = await apiInstance.post(endpoint, body);

        if (!intentResponse.data.success) {
          throw new Error(
            intentResponse.data.error ||
              intentResponse.data.message ||
              'Could not initialize payment.',
          );
        }

        if (!mounted) return;

        setClientSecret(intentResponse.data.clientSecret || null);
        setAppliedPricing(intentResponse.data.pricing || null);
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        if (!mounted) return;
        if (showLoader) setIsLoading(false);
        else setIsUpdating(false);
        setIsApplyingCoupon(false);
      }
    };

    fetchDetailsAndCreateIntent({ coupon: couponCode || undefined });

    return () => {
      mounted = false;
    };
  }, [planId, selectedPeriod]);

  // Replace your current handleApplyCoupon function with this:

  const handleApplyCoupon = async () => {
    if (!couponCode || !plan || !selectedPeriod) {
      toast({
        title: 'Invalid',
        description: 'Enter coupon and select a plan/period first.',
        variant: 'destructive',
      });
      return;
    }

    setIsApplyingCoupon(true);
    setError(null);

    try {
      // call your coupon validation endpoint — this should return coupon metadata (discountType/value/etc)
      const resp = await apiInstance.post('/coupons/redeem-coupon', {
        code: couponCode.trim().toUpperCase(),
      });

      if (!resp.data.success) {
        toast({
          title: 'Coupon failed',
          description: resp.data.message || 'Could not apply coupon.',
          variant: 'destructive',
        });
      }

      const couponFromServer: CouponShape = resp.data.data;

      // compute local pricing preview using the plan price for selected period
      const activeVariant = plan.billingVariants.find(
        (v) => v.period === selectedPeriod,
      );
      if (!activeVariant) throw new Error('Selected billing period not found.');

      const baseUsd = activeVariant.price.effective.usd;
      const preview = computeLocalPricing(baseUsd, couponFromServer);
      preview.period = selectedPeriod;

      // set preview pricing locally — do NOT call create-intent here
      setAppliedPricing(preview);

      toast({
        title: 'Coupon preview ready',
        description: `Applied ${couponFromServer.code} — preview only.`,
        variant: 'default',
      });
    } catch (err: any) {
      console.error('apply coupon error', err);
      toast({
        title: 'Coupon failed',
        description: err.message || 'Could not apply coupon.',
        variant: 'destructive',
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setCouponCode('');
    setAppliedPricing(null);
    toast({
      title: 'Coupon removed',
      description: 'Preview cleared.',
      variant: 'default',
    });
  };

  // --- Render Logic ---
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <div className="relative bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">
              Preparing your secure checkout...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 max-w-md mx-auto text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!clientSecret || !plan) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header Section */}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Plan Details Section (left) */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <PlanDetails
              plan={plan}
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
              isLoading={isUpdating || isApplyingCoupon}
              pricing={appliedPricing ?? undefined}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
            />
          </div>

          {/* Payment Section (right) */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Payment Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Payment Details
                    </h2>
                    <p className="text-purple-100">
                      Powered by Stripe - Bank-level security
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div className="p-8">
                <Elements
                  key={clientSecret}
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#7c3aed',
                        colorBackground: '#ffffff',
                        colorText: '#374151',
                        colorDanger: '#ef4444',
                        fontFamily: 'system-ui, sans-serif',
                        borderRadius: '8px',
                        spacingUnit: '4px',
                      },
                    },
                  }}
                >
                  <PaymentForm />
                </Elements>

                {/* Pricing summary on right (keeps showing the same pricing) */}
                <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">Original</div>
                    <div className="text-sm text-gray-900">
                      $
                      {(
                        appliedPricing?.original?.usd ??
                        plan.billingVariants.find(
                          (v) => v.period === selectedPeriod,
                        )?.price.effective.usd ??
                        0
                      ).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm text-gray-600">Discount</div>
                    <div className="text-sm text-green-600">
                      - ${(appliedPricing?.discountAmount?.usd ?? 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="text-lg font-semibold text-gray-900">
                      You Pay
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      $
                      {(
                        appliedPricing?.discounted?.usd ??
                        plan.billingVariants.find(
                          (v) => v.period === selectedPeriod,
                        )?.price.effective.usd ??
                        0
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- PlanDetails (left column) ---------- */

const planIcons: Record<string, React.ElementType> = {
  Free: Zap,
  Weekly: Zap,
  Pro: Crown,
  Enterprise: Building2,
};

const planColors: Record<string, string> = {
  Free: 'from-green-500 to-emerald-600',
  Weekly: 'from-blue-500 to-cyan-600',
  Pro: 'from-purple-500 to-violet-600',
  Enterprise: 'from-gray-700 to-slate-800',
};

function PlanDetails({
  plan,
  selectedPeriod,
  onPeriodChange,
  isLoading,
  pricing,
  couponCode,
  setCouponCode,
  onApplyCoupon,
  onRemoveCoupon,
}: {
  plan: Plan;
  selectedPeriod: string | null;
  onPeriodChange: (newPeriod: string) => void;
  isLoading: boolean;
  pricing?: PricingResponse;
  couponCode?: string;
  setCouponCode?: (c: string) => void;
  onApplyCoupon?: () => void;
  onRemoveCoupon?: () => void;
}) {
  const Icon = planIcons[plan.planType] || Zap;
  const colorGradient =
    planColors[plan.planType] || 'from-purple-500 to-violet-600';
  const activeVariant = plan.billingVariants.find(
    (v) => v.period === selectedPeriod,
  );

  if (!activeVariant) return null;

  // fallback prices if no pricing object (no coupon)
  const orig = pricing?.original?.usd ?? activeVariant.price.effective.usd;
  const discountAmt = pricing?.discountAmount?.usd ?? 0;
  const youPay = pricing?.discounted?.usd ?? activeVariant.price.effective.usd;

  function formatFeatureValue(v: string | number | null | undefined) {
    if (v === null || v === undefined) return '—';
    // handle numeric -1 or string "-1" (trim for safety)
    if (v === -1) return 'Unlimited';
    if (typeof v === 'string' && v.trim() === '-1') return 'Unlimited';
    return String(v);
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 h-full relative overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="bg-white p-4 rounded-xl shadow-lg">
            <Loader className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Updating...</p>
          </div>
        </div>
      )}

      {/* Plan Header */}
      <div className={`bg-gradient-to-r ${colorGradient} px-8 py-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {plan.planType} Plan
              </h2>
              {plan.popular && (
                <span className="inline-block bg-white/20 text-white text-xs px-3 py-1 rounded-full mt-1">
                  Most Popular
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Coupon Input (moved left) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Coupon
          </label>
          <div className="flex items-center flex-col gap-3">
            <input
              value={couponCode ?? ''}
              onChange={(e) => setCouponCode && setCouponCode(e.target.value)}
              placeholder="Enter coupon code"
              className="flex-1 border border-gray-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onApplyCoupon && onApplyCoupon();
                }
              }}
            />
            {pricing?.appliedCoupon ? (
              <button
                onClick={onRemoveCoupon}
                className="bg-white border border-green-200 text-green-700 px-4 py-2 w-full rounded-lg font-medium hover:bg-green-50"
              >
                Remove
              </button>
            ) : (
              <button
                onClick={onApplyCoupon}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium w-full hover:bg-purple-700 disabled:opacity-50"
              >
                Apply
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Coupons are validated at checkout. Not applied until server
            confirms.
          </p>
        </div>

        <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Original</div>
            <div className="text-sm text-gray-900">${orig.toFixed(2)}</div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm text-gray-600">Discount</div>
            <div className="text-sm text-green-600">
              - ${discountAmt.toFixed(2)}
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="text-lg font-semibold text-gray-900">You Pay</div>
            <div className="text-lg font-bold text-gray-900">
              ${youPay.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Billing Cycle Selection
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            Choose Billing Cycle
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              Save more with longer plans
            </span>
          </h3>
          <div className="space-y-3">
            {plan.billingVariants
              .filter((v) =>
                ['Monthly', 'Quarterly', 'HalfYearly', 'Annual'].includes(
                  v.period,
                ),
              )
              .map((variant) => {
                const isSelected = selectedPeriod === variant.period;
                const hasDiscount = variant.discountLabel;

                return (
                  <div
                    key={variant.period}
                    onClick={() => onPeriodChange(variant.period)}
                    className={`group relative flex items-center justify-between p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 hover:shadow-md ${
                      isSelected
                        ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    {hasDiscount && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {variant.discountLabel}
                      </div>
                    )}

                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${
                          isSelected
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-gray-300 group-hover:border-purple-400'
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800">
                          {variant.period}
                        </span>
                        {variant.price.actual &&
                          variant.price.actual.usd >
                            variant.price.effective.usd && (
                            <div className="text-xs text-gray-500">
                              <span className="line-through">
                                ${variant.price.actual.usd}
                              </span>
                              <span className="ml-1 text-green-600 font-medium">
                                Save $
                                {variant.price.actual.usd -
                                  variant.price.effective.usd}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">
                        ${variant.price.effective.usd}
                      </div>
                      <div className="text-xs text-gray-500">
                        per {variant.period.toLowerCase()}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div> */}

        {/* Features List */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            Everything included
          </h3>
          <div className="space-y-4">
            {activeVariant.features.map((feature: any) => (
              <div key={feature.name} className="flex items-start gap-3 group">
                <div className="bg-green-100 p-1 rounded-full flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-700 leading-relaxed">
                    <span className="font-semibold text-gray-900">
                      {formatFeatureValue(feature.value)}
                    </span>{' '}
                    {feature.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary on left */}
      </div>
    </div>
  );
}

/* ---------- PaymentForm (keeps original behavior) ---------- */

function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

    if (error) {
      if (
        (error as any).type === 'card_error' ||
        (error as any).type === 'validation_error'
      ) {
        setMessage(error.message || 'An unexpected error occurred.');
      } else {
        setMessage('An unexpected error occurred.');
      }
    } else {
      setMessage(null);
    }

    setIsProcessing(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 rounded-xl p-6">
        <PaymentElement
          id="payment-element"
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                name: '',
                email: '',
              },
            },
          }}
        />
      </div>

      <button
        disabled={isProcessing || !stripe || !elements}
        id="submit"
        className="w-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-violet-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        <span
          id="button-text"
          className="relative z-10 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader className="w-6 h-6 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Complete Secure Payment
            </>
          )}
        </span>
      </button>

      {message && (
        <div
          id="payment-message"
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm">{message}</p>
        </div>
      )}

      <div className="text-center text-xs text-gray-500">
        By completing this payment, you agree to our Terms of Service and
        Privacy Policy. Your subscription will automatically renew unless
        cancelled.
      </div>
    </form>
  );
}
