import { ArrowRight, Building2, Check, Crown, Star, Zap } from 'lucide-react';
import React, { useState } from 'react';
import Link from 'next/link';

// --- Interfaces for type safety ---
interface Price {
  usd: number;
  inr: number;
}

interface Feature {
  name: string;
  value: string;
}

interface BillingVariant {
  period: string;
  price: Price;
  features: Feature[];
  discountLabel?: string;
}

interface Plan {
  _id: string;
  planType: 'Free' | 'Basic' | 'Pro' | 'Enterprise';
  popular: boolean;
  billingVariants: BillingVariant[];
}

interface PlanCardProps {
  plan: Plan;
  index: number;
  frequency: string;
  currency: string;
  handlePlanSelect: (plan: Plan) => void;
  isSubscriptionPage: boolean;
}

// --- Component configuration ---
// 1. Define the type for our color keys
type ColorKey = 'blue' | 'green' | 'purple' | 'indigo';

// 2. Strongly type the configuration objects
const planIcons: Record<Plan['planType'], React.ElementType> = {
  Free: Zap,
  Basic: Zap,
  Pro: Crown,
  Enterprise: Building2,
};

const planColors: Record<Plan['planType'], ColorKey> = {
  Free: 'blue',
  Basic: 'green',
  Pro: 'purple',
  Enterprise: 'indigo',
};

// 3. Create mapping objects for dynamic Tailwind classes
const hoverBlurClasses: Record<ColorKey, string> = {
  blue: 'bg-gradient-to-br from-blue-400/20 to-blue-600/20',
  green: 'bg-gradient-to-br from-green-400/20 to-green-600/20',
  purple: 'bg-gradient-to-br from-purple-400/20 to-purple-600/20',
  indigo: 'bg-gradient-to-br from-indigo-400/20 to-indigo-600/20',
};

const hoverBorderClasses: Record<ColorKey, string> = {
  blue: 'border-blue-300',
  green: 'border-green-300',
  purple: 'border-purple-300',
  indigo: 'border-indigo-300',
};

const headerBgClasses: Record<ColorKey, string> = {
  blue: 'bg-gradient-to-br from-blue-50 to-white',
  green: 'bg-gradient-to-br from-green-50 to-white',
  purple: 'bg-gradient-to-br from-purple-50 to-white',
  indigo: 'bg-gradient-to-br from-indigo-50 to-white',
};

const iconBgClasses: Record<ColorKey, string> = {
  blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
  green: 'bg-gradient-to-br from-green-500 to-green-600',
  purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
  indigo: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
};

const buttonClasses: Record<ColorKey, string> = {
  blue: 'bg-white border-2 border-blue-200 text-blue-600 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 hover:text-white hover:border-blue-500',
  green:
    'bg-white border-2 border-green-200 text-green-600 hover:bg-gradient-to-r hover:from-green-500 hover:to-green-600 hover:text-white hover:border-green-500',
  purple:
    'bg-white border-2 border-purple-200 text-purple-600 hover:bg-gradient-to-r hover:from-purple-500 hover:to-purple-600 hover:text-white hover:border-purple-500',
  indigo:
    'bg-white border-2 border-indigo-200 text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-indigo-600 hover:text-white hover:border-indigo-500',
};

// --- Main Component ---
const PlanCard = ({
  plan,
  index,
  frequency,
  currency,
  handlePlanSelect,
  isSubscriptionPage,
}: PlanCardProps) => {
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);

  const IconComponent = planIcons[plan.planType];
  const planColor = planColors[plan.planType]; // Now TypeScript knows this is of type 'ColorKey'
  const isHovered = hoveredPlan === index;
  const isPopular = plan.popular;

  const currentVariant = plan.billingVariants?.find(
    (v) => v.period.toLowerCase() === frequency.toLowerCase(),
  );

  if (!currentVariant) {
    return null;
  }

  const price =
    currency === 'usd'
      ? `$${currentVariant.price.usd}`
      : `₹${currentVariant.price.inr}`;

  const ActionButton = ({ children }: { children: React.ReactNode }) => (
    <div
      className={`group relative w-full py-4 px-8 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 overflow-hidden transform hover:-translate-y-1 hover:shadow-2xl ${
        isPopular
          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
          : buttonClasses[planColor]
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      <span className="relative z-10">{children}</span>
      <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
    </div>
  );

  return (
    <div
      className={`relative w-full max-w-sm transition-all duration-500 transform ${
        isHovered ? 'scale-105 -translate-y-2' : ''
      } ${isPopular ? 'scale-105' : ''}`}
      onMouseEnter={() => setHoveredPlan(index)}
      onMouseLeave={() => setHoveredPlan(null)}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
            <Star className="w-4 h-4" />
            Most Popular
          </div>
        </div>
      )}
      <div
        className={`absolute inset-0 rounded-3xl blur-xl transition-all duration-500 ${
          isPopular
            ? 'bg-gradient-to-br from-purple-400/30 to-pink-400/30'
            : isHovered
            ? hoverBlurClasses[planColor]
            : 'bg-transparent'
        }`}
      />
      <div
        className={`relative bg-white/90 backdrop-blur-xl rounded-3xl border-2 transition-all duration-500 shadow-xl hover:shadow-2xl ${
          isPopular
            ? 'border-purple-300 shadow-purple-500/25'
            : isHovered
            ? hoverBorderClasses[planColor]
            : 'border-gray-200'
        }`}
      >
        <div
          className={`p-8 rounded-t-3xl relative overflow-hidden ${
            isPopular
              ? 'bg-gradient-to-br from-purple-50 to-pink-50'
              : headerBgClasses[planColor]
          }`}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 ${
                  isHovered ? 'rotate-12 scale-110' : ''
                } ${
                  isPopular
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                    : iconBgClasses[planColor]
                }`}
              >
                <IconComponent className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">
                  {plan.planType}
                </h3>
                <p className="text-gray-600 font-medium">
                  {plan.planType === 'Free'
                    ? 'For getting started'
                    : 'Perfect for growth'}
                </p>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-gray-900">
                  {price}
                </span>
                {plan.planType !== 'Free' && (
                  <div className="text-gray-500">
                    <div className="text-sm font-medium">/{frequency}</div>
                    {currentVariant.discountLabel && (
                      <div className="text-xs font-bold text-green-600">
                        {currentVariant.discountLabel}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="p-8">
          <ul className="space-y-4 mb-8">
            {currentVariant.features.map((feature) => (
              <li
                key={feature.name}
                className="flex justify-between items-center group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                    {feature.name}
                  </span>
                </div>
                <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full text-sm">
                  {feature.value}
                </span>
              </li>
            ))}
          </ul>
          {isSubscriptionPage ? (
            <button onClick={() => handlePlanSelect(plan)}>
              <ActionButton>
                {plan.planType === 'Free'
                  ? 'Get Started'
                  : `Choose ${plan.planType}`}
              </ActionButton>
            </button>
          ) : (
            <Link
              href={`/dashboard/subscriptions?plan=${plan.planType.toLowerCase()}`}
            >
              <ActionButton>
                {plan.planType === 'Free'
                  ? 'Get Started'
                  : `Choose ${plan.planType}`}
              </ActionButton>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanCard;
