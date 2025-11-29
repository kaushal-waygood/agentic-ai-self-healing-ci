'use client';

import { useMemo, useState } from 'react';
import { Check, Minus, Plus, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface SpendItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  benefit?: string; // <-- show user what they get
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
    name: 'Featured Job Application',
    description: 'Your applied job moves to top priority for recruiters.',
    cost: 10,
    benefit: 'Priority Placement',
  },
  {
    id: 'AUTO_APPLY',
    name: 'AI Resume Review',
    description: 'Expert AI-driven resume feedback and improvement.',
    cost: 10,
    benefit: '+1 Resume Credit',
  },
  {
    id: 'AUTOPILOT_AGENT_CREATE',
    name: 'Cover Letter Pack (3)',
    description: 'Generate or enhance up to 3 cover letters.',
    cost: 10,
    benefit: '+3 Cover Letters',
  },
];

export function SpendCreditsSection({
  balance,
  loading,
  onCheckout,
}: SpendCreditsSectionProps) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const rouer = useRouter();

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

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          Spend Credits <Sparkles className="w-4 h-4 text-yellow-500" />
        </h2>
        <div className="text-sm text-gray-600">
          Balance:{' '}
          <span className="font-semibold text-blue-700">{balance}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {CATALOG.map((item) => {
          const qty = cart[item.id] || 0;
          const lineTotal = item.cost * qty;

          return (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
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

                {/* Benefit display */}
                <p className="text-xs text-green-700 font-medium mb-3">
                  🛠 {item.benefit}
                </p>

                <div className="text-sm font-semibold text-gray-800">
                  {item.cost} credits
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
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

                  <span className="min-w-[2ch] text-center text-sm font-medium text-gray-800">
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
                  <div className="text-right text-xs text-gray-600">
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

      {/* Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-sm text-gray-700">
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
            <div className="text-[11px] text-red-500 mt-1">
              Not enough credits.
            </div>
          )}
        </div>

        <div className="flex justify-center gap-2">
          <button
            onClick={handleCheckoutClick}
            disabled={!hasItems || exceedsBalance || loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition ${
              !hasItems || exceedsBalance || loading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Check className="w-4 h-4 mr-2" />
            {loading ? 'Processing...' : 'Redeem Credits'}
          </button>

          <button
            onClick={handleGetUnlimitedClick}
            // disabled={!hasItems || exceedsBalance || loading}
            className="px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition bg-blue-600 text-white hover:bg-blue-700"
          >
            <Check className="w-4 h-4 mr-2" />
            Get Unlimited Generation
          </button>
        </div>
      </div>
    </div>
  );
}
