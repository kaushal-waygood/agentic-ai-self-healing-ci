'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Minus, Plus, Sparkles, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import apiInstance from '@/services/api';

export interface SpendItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  benefit?: string;
  badge?: string;
}

export interface CartItem {
  id: string;
  quantity: number;
}

interface SpendCreditsSectionProps {
  balance: number;
  loading?: boolean;
  onCheckout: (items: CartItem[], totalCost: number) => void;
}

const CATALOG: SpendItem[] = [
  {
    id: 'CV_GENERATION',
    name: 'Generate CV',
    description: 'Your CV appears higher to recruiters.',
    cost: 10,
    benefit: 'ATS Boost',
    badge: 'Popular',
  },
  {
    id: 'COVER_LETTER',
    name: 'Generate Cover Letter',
    description: 'Generate or enhance up to 3 cover letters.',
    cost: 10,
    benefit: '+3 Cover Letters',
  },
  {
    id: 'JOB_MATCH_SCORE',
    name: 'Generate AI Job Match Score',
    description:
      'Get a job match score based on your resume and job description.',
    cost: 10,
    benefit: 'Job Match Score',
  },
  {
    id: 'AUTO_APPLY',
    name: 'AI Auto Application',
    description: 'Auto apply to jobs using AI.',
    cost: 10,
    benefit: 'Auto Apply',
  },
  {
    id: 'CV_ATS_SCORE',
    name: 'ATS Score',
    description: 'Check ATS compatibility of CV.',
    cost: 10,
    benefit: 'ATS Score',
  },
  {
    id: 'AUTO_APPLY_DAILY_LIMIT',
    name: 'Auto Apply Daily Limit',
    description: 'Increase daily auto apply limit.',
    cost: 10,
    benefit: 'Daily Limit Boost',
  },
  {
    // ✅ FIXED: Changed 'AI_TAILOR_APPLICATION' to 'AI_TAILORED_APPLICATION' to match Backend
    id: 'AI_TAILORED_APPLICATION',
    name: 'AI Tailored Application',
    description: 'AI Tailored Application',
    cost: 10,
    benefit: 'Tailored Application',
  },
];

const WEEKLY_ALLOWED_IDS = [
  'AUTO_APPLY',
  'CV_ATS_SCORE',
  'JOB_MATCH_SCORE',
  'AUTO_APPLY_DAILY_LIMIT',
];

export function SpendCreditsSection({
  balance,
  loading,
  onCheckout,
}: SpendCreditsSectionProps) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const router = useRouter();
  const [openHelp, setOpenHelp] = useState(false);

  // Logic State: Plan Details
  const [planDetails, setPlanDetails] = useState<any>(null);

  // --- Logic: Fetch Plan Details ---
  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        const planResponse = await apiInstance.get('/plan/get-user-plan-type');
        if (planResponse.data.success) {
          setPlanDetails(planResponse.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch plan details:', error);
      }
    };
    fetchPlanDetails();
  }, []);

  // --- Logic: Filter Catalog based on Plan ---
  const filteredCatalog = useMemo(() => {
    if (!planDetails?.planType) return CATALOG;

    if (planDetails.planType === 'Free') {
      return CATALOG;
    }

    if (planDetails.planType === 'Weekly') {
      return CATALOG.filter((item) => WEEKLY_ALLOWED_IDS.includes(item.id));
    }

    if (planDetails.planType === 'Monthly') {
      return [];
    }

    return CATALOG;
  }, [planDetails]);

  // --- Logic: Calculate Costs ---
  const totalCost = useMemo(
    () =>
      Object.entries(cart).reduce((sum, [id, qty]) => {
        const item = CATALOG.find((x) => x.id === id);
        if (!item) return sum;
        return sum + item.cost * qty;
      }, 0),
    [cart],
  );

  const remainingBalance = Math.max(0, balance - totalCost);
  const hasItems = totalCost > 0;
  const exceedsBalance = totalCost > balance;

  // --- Handlers ---
  const handleAdd = (id: string) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleRemove = (id: string) => {
    setCart((prev) => {
      const current = prev[id] || 0;
      if (current <= 1) {
        const clone = { ...prev };
        delete clone[id];
        return clone;
      }
      return { ...prev, [id]: current - 1 };
    });
  };

  const handleCheckoutClick = () => {
    if (!hasItems || exceedsBalance || loading) return;
    const items: CartItem[] = Object.entries(cart).map(([id, qty]) => ({
      id,
      quantity: qty,
    }));
    onCheckout(items, totalCost);
  };

  const handleGetUnlimitedClick = () => {
    router.push('/dashboard/subscriptions');
  };

  // --- UI Render (Using the design from the second block) ---
  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <span className="p-2 rounded-lg bg-blue-100">
            <Sparkles className="w-4 h-4 text-blue-500" />
          </span>
          Spend Credits
        </h2>

        <div className="flex items-center gap-4">
          <div className="text-xl font-semibold text-gray-600">
            Balance:{' '}
            <span className="font-bold text-2xl text-blue-700">{balance}</span>
          </div>

          <button
            onClick={() => setOpenHelp(true)}
            className="px-3 py-1.5 text-sm rounded-lg bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition"
          >
            How it works?
          </button>
        </div>
      </div>

      {/* Summary / Action Footer (UI Block 2 Design) */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col justify-between sm:flex-row sm:items-center gap-4 mb-4">
        {/* Left: Totals */}
        <div className="text-sm text-gray-700 flex-shrink-0">
          Selected:{' '}
          <span className="font-semibold">
            {hasItems ? `${totalCost} credits` : '0 credits'}
          </span>
          <div className="text-xs text-gray-500 mt-1">
            Remaining:{' '}
            <span
              className={`font-semibold ${
                exceedsBalance ? 'text-red-600' : 'text-green-700'
              }`}
            >
              {remainingBalance}
            </span>
          </div>
          {exceedsBalance && (
            <div className="text-[11px] text-red-500 mt-1 font-medium">
              Not enough credits.
            </div>
          )}
        </div>

        {/* Right: Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Standard Redeem Button */}
          <button
            onClick={handleCheckoutClick}
            disabled={!hasItems || exceedsBalance || loading}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center transition flex-1 sm:flex-initial ${
              !hasItems || exceedsBalance || loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            <Check className="w-4 h-4 mr-2" />
            {loading ? 'Processing...' : 'Redeem Credits'}
          </button>

          {/* Premium / Unlimited Button - Highlighted */}
          <button
            onClick={handleGetUnlimitedClick}
            className="group relative overflow-hidden px-5 py-2.5 rounded-lg text-sm font-bold text-white shadow-md transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center flex-1 sm:flex-initial
            bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600"
          >
            {/* Crown Icon */}
            <Crown className="w-4 h-4 mr-2 text-yellow-100 fill-yellow-100/50 animate-pulse" />

            <span className="relative z-10">Get Unlimited Generation</span>

            {/* Subtle Shine Effect Overlay */}
            <div className="absolute inset-0 bg-white/20 translate-y-full rotate-45 group-hover:translate-y-[-100%] transition-transform duration-700 ease-in-out" />
          </button>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* LOGIC FIX: Using filteredCatalog instead of CATALOG */}
        {filteredCatalog.map((item) => {
          const qty = cart[item.id] || 0;
          const lineTotal = item.cost * qty;

          return (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 flex flex-row justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {item.name}
                  </h3>
                  {item.badge && (
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 border border-blue-100">
                      {item.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-600 mb-2">{item.description}</p>

                <p className="text-xs text-green-700 font-medium mb-3">
                  🛠 {item.benefit}
                </p>

                <div className="text-md font-semibold text-gray-800">
                  {item.cost} credits
                </div>
              </div>

              <div className="flex items-center flex-col justify-between">
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={qty === 0}
                    className={`h-8 w-8 flex items-center justify-center rounded-full border text-xs transition ${
                      qty === 0
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  <span className="min-w-[2ch] text-center text-md font-medium text-gray-800">
                    {qty}
                  </span>

                  <button
                    onClick={() => handleAdd(item.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-300 text-xs text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {qty > 0 && (
                  <div className="text-right text-md text-gray-600">
                    <div className="font-semibold text-gray-900">
                      {lineTotal} credits
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {qty} item{qty > 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Modal */}
      {openHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpenHelp(false)}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                How to Spend Credits
              </h3>
              <button
                onClick={() => setOpenHelp(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {[
                'Select an item you want to redeem',
                'Increase quantity using + button',
                'Check remaining credits at the top',
                'Click "Redeem Credits" to confirm',
                'Credits will be deducted instantly',
              ].map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-gray-700">{step}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setOpenHelp(false)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
