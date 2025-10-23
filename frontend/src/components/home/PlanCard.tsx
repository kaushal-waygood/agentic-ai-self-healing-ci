'use client';

import {
  ArrowRight,
  Building2,
  Check,
  Clock,
  Crown,
  Repeat,
  Star,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

// --- Interfaces for type safety ---
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
  planType: 'Free' | 'Basic' | 'Pro' | 'Monthly' | 'Enterprise' | 'Weekly';
  popular: boolean;
  billingVariants: BillingVariant[];
}

interface PlanCardProps {
  plan: Plan;
  currency: string;
  handlePlanSelect: (details: { plan: Plan; period: string }) => void;
  isSubscriptionPage: boolean;
}

// --- Component configuration ---
type PlanType = Plan['planType'];
type ColorKey = 'blue' | 'green' | 'purple' | 'indigo';

const planIcons: Record<PlanType, React.ElementType> = {
  Free: Zap,
  Basic: Zap,
  Monthly: Zap,
  Weekly: Zap,
  Pro: Crown,
  Enterprise: Building2,
};

const planColors: Record<PlanType, ColorKey> = {
  Free: 'blue',
  Basic: 'green',
  Monthly: 'purple',
  Weekly: 'green',
  Pro: 'purple',
  Enterprise: 'indigo',
};

const colorConfig = {
  iconBg: {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  },
  button: {
    blue: 'bg-blue-600 text-white hover:bg-blue-700',
    green: 'bg-green-600 text-white hover:bg-green-700',
    purple: 'bg-purple-600 text-white hover:bg-purple-700',
    indigo: 'bg-indigo-600 text-white hover:bg-indigo-700',
  },
};

const PlanCard = ({
  plan,
  currency,
  handlePlanSelect,
  isSubscriptionPage,
}: PlanCardProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState(
    () =>
      plan.billingVariants.find((v) => v.period === 'Monthly')?.period ||
      plan.billingVariants[0]?.period,
  );

  const IconComponent = planIcons[plan.planType];
  const planColor = planColors[plan.planType];
  const isPopular = plan.popular;

  // This is now the single source of truth for the card's state.
  const selectedVariant = plan.billingVariants.find(
    (v) => v.period === selectedPeriod,
  );

  const isComplexCard = ['Pro', 'Enterprise'].includes(plan.planType);

  if (!selectedVariant) return null;

  // The main price display is now ALWAYS tied to the selectedVariant.
  const displayPrice =
    currency === 'usd'
      ? `$${selectedVariant.price.effective.usd}`
      : `₹${selectedVariant.price.effective.inr}`;

  const pricePerDay = () => {
    if (plan.planType === 'Free') {
      return 0;
    } else if (plan.planType === 'Weekly') {
      return currency === 'usd'
        ? selectedVariant.price.effective.usd / 7
        : selectedVariant.price.effective.inr / 7;
    } else if (plan.planType === 'Monthly') {
      return currency === 'usd'
        ? selectedVariant.price.effective.usd / 30
        : selectedVariant.price.effective.inr / 30;
    } else {
      return currency === 'usd'
        ? selectedVariant.price.effective.usd / 365
        : selectedVariant.price.effective.inr / 365;
    }
  };
  const ActionButton = ({ children }: { children: React.ReactNode }) => (
    <div
      className={`w-full py-3 px-6 rounded-lg font-semibold text-base flex items-center justify-center gap-2 transition-all duration-300 transform group-hover:scale-105 ${
        isPopular
          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
          : colorConfig.button[planColor]
      }`}
    >
      <span>{children}</span>
      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
    </div>
  );

  return (
    <div
      className={`relative w-full flex flex-col rounded-2xl border transition-all duration-300 group ${
        isPopular
          ? 'bg-white border-purple-400 shadow-2xl shadow-purple-500/20 scale-105'
          : 'bg-white border-gray-200 hover:shadow-xl'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
            <Star className="w-3 h-3 inline-block mr-1" />
            Most Popular
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colorConfig.iconBg[planColor]}`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{plan.planType}</h3>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-gray-900 mb-1">
              {/* <span>
                {currency === 'usd'
                  ? `$${pricePerDay().toFixed(2)}`
                  : `₹${pricePerDay().toFixed(2)}`}
              </span> */}
              <span>
                {currency === 'usd'
                  ? `$${pricePerDay().toFixed(2)}`
                  : `₹${Math.round(pricePerDay())}`}
              </span>

              <span className="">/day </span>
            </p>
            <p className="text-md  text-gray-500 ">
              <span>{displayPrice} </span>
              <span className=""> total </span>
            </p>

            {/* --- FIX: Safely render the actual price; fallback to period --- */}
            {/* {selectedVariant.price.actual ? (
              <p className="text-md font-semibold text-gray-400 line-through">
                {currency === 'usd'
                  ? `$${selectedVariant.price.actual.usd}`
                  : `₹${selectedVariant.price.actual.inr}`}
              </p>
            ) : (
              <p className="text-xs text-gray-500">/{selectedVariant.period}</p>
            )} */}
          </div>
        </div>

        {/* --- Interactive Button Group Design --- */}
        {isComplexCard && (
          <div className="mt-8 mb-4 bg-gray-100 p-1 rounded-xl">
            <div className="flex items-center justify-center gap-1">
              {plan.billingVariants
                .filter((v) =>
                  ['Quarterly', 'HalfYearly', 'Annual'].includes(v.period),
                )
                .map((variant) => {
                  const isSelected = selectedPeriod === variant.period;
                  return (
                    <button
                      key={variant.period}
                      onClick={() => setSelectedPeriod(variant.period)}
                      className={`relative w-full py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
                        isSelected
                          ? 'bg-white shadow text-purple-700'
                          : 'bg-transparent text-gray-500 hover:bg-white/60'
                      }`}
                    >
                      {variant.period === 'HalfYearly'
                        ? 'Half Yearly'
                        : variant.period}
                      {variant.discountLabel && (
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs bg-red-500 text-white font-semibold px-2 py-0.5 rounded-full">
                          {variant.discountLabel.replace('Save ', '-')}
                        </div>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      <div className="px-6 flex-grow">
        <div className="h-px bg-gray-200 my-4"></div>
        <ul className="space-y-3">
          {selectedVariant.features.map((feature: any) => (
            <li key={feature.name} className="flex items-start gap-3">
              <Check className="w-4 h-4 text-purple-500 flex-shrink-0 mt-1" />
              <p className="text-sm text-gray-600">
                <span className="font-bold text-gray-800">{feature.value}</span>{' '}
                {feature.name}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-6 pt-6 mt-auto">
        <button
          onClick={() => handlePlanSelect({ plan, period: selectedPeriod })}
          className="w-full"
        >
          <ActionButton>
            {plan.planType === 'Free'
              ? 'Get Started'
              : `Choose ${plan.planType}`}
          </ActionButton>
        </button>
      </div>
    </div>
  );
};

export default PlanCard;
