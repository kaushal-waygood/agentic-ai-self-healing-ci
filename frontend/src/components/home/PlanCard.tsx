'use client';

import { setCheckoutRequest } from '@/redux/actions/checkoutAction';
import apiInstance from '@/services/api';
import { ArrowRight, Building2, Check, Crown, Star, Zap } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation'; // ✅ Added usePathname
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

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
  // ❌ Removed isSubscriptionPage prop (detected automatically now)
}

// --- Component configuration ---
type PlanType = Plan['planType'];
type ColorKey = 'blue' | 'green' | 'purple' | 'indigo' | 'gray';

const planIcons: Record<PlanType, React.ElementType> = {
  Free: Zap,
  Basic: Zap,
  Monthly: Crown,
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
    gray: 'bg-gray-100 text-gray-600',
  },
  button: {
    blue: 'bg-blue-600 text-white hover:bg-blue-700',
    green: 'bg-green-600 text-white hover:bg-green-700',
    purple: 'bg-purple-600 text-white hover:bg-purple-700',
    indigo: 'bg-indigo-600 text-white hover:bg-indigo-700',
    gray: 'bg-gray-400 text-white cursor-not-allowed',
  },
};

const STUDENT_DISCOUNT_PERCENT = 50;

// ✅ Define the Hierarchy of plans
const PLAN_HIERARCHY = ['Free', 'Weekly', 'Monthly', 'Pro', 'Enterprise'];

const PlanCard = ({ plan, currency }: PlanCardProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState(
    () =>
      plan.billingVariants.find((v) => v.period === 'Monthly')?.period ||
      plan.billingVariants[0]?.period,
  );

  const [planDetails, setPlanDetails] = useState<any>(null);

  // --- Fetch Plan Details ---
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

  // ✅ Student discount state
  const [studentDiscount, setStudentDiscount] = useState(false);
  const IconComponent = planIcons[plan.planType];
  const planColor = planColors[plan.planType];
  const isPopular = plan.popular;

  const selectedVariant = plan.billingVariants.find(
    (v) => v.period === selectedPeriod,
  );

  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname(); // ✅ Get current URL path

  // --- LOGIC: Plan Comparison ---
  const userCurrentPlanType = planDetails?.planType || 'Free';

  const userPlanIndex = PLAN_HIERARCHY.indexOf(userCurrentPlanType);
  const cardPlanIndex = PLAN_HIERARCHY.indexOf(plan.planType);

  const isCurrentPlan = userCurrentPlanType === plan.planType;
  const isLowerPlan = userPlanIndex > cardPlanIndex;
  const isMaxPlanUser = userCurrentPlanType === 'Monthly';

  // ✅ AUTO DETECT: Check if we are on the subscription dashboard page
  const isSubscriptionPage = pathname?.includes('/dashboard/subscriptions');

  // ✅ MASTER TOGGLE: Only apply the hierarchy behavior if we are on that specific page
  const applyRestrictions = isSubscriptionPage;

  // 4. Should we fade this card? (Only if restrictions apply)
  const shouldFade =
    applyRestrictions && (isLowerPlan || isCurrentPlan || isMaxPlanUser);

  // 5. Should we show the Monthly Overlay? (Only if restrictions apply)
  const showMonthlyOverlay = applyRestrictions && isMaxPlanUser;

  if (!selectedVariant) return null;

  // ✅ Base price logic
  const basePrice =
    currency === 'usd'
      ? selectedVariant.price.effective.usd
      : selectedVariant.price.effective.inr;

  const effectivePrice = studentDiscount
    ? basePrice - (basePrice * STUDENT_DISCOUNT_PERCENT) / 100
    : basePrice;

  const price = Number(effectivePrice.toFixed(2));
  const displayPrice =
    currency === 'usd' ? `$${price.toFixed(2)}` : `₹${Math.round(price)}`;

  const pricePerDay = () => {
    if (plan.planType === 'Free') return 0;
    const days =
      plan.planType === 'Weekly' ? 7 : plan.planType === 'Monthly' ? 30 : 365;
    return effectivePrice / days;
  };

  const handlePlanSelect = (plan: Plan) => {
    // Prevent action if faded/disabled
    if (shouldFade) return;

    dispatch(
      setCheckoutRequest({
        planId: plan.plan._id,
        planType: plan.plan.planType,
        period: selectedPeriod,
        currency,
        basePrice,
        discountPercent: STUDENT_DISCOUNT_PERCENT,
        discountAmount: studentDiscount
          ? (basePrice * STUDENT_DISCOUNT_PERCENT) / 100
          : 0,
        finalPrice: price,
        studentDiscountApplied: studentDiscount,
      }),
    );

    router.push(
      `/dashboard/checkout?planId=${plan.plan._id}&period=${selectedPeriod}`,
    );
  };

  const ActionButton = ({ children }: { children: React.ReactNode }) => {
    // Only show "Current Plan" static button if restrictions apply (on dashboard/subscriptions)
    if (isCurrentPlan && applyRestrictions) {
      return (
        <div className="w-full py-3 px-6 rounded-lg font-semibold text-base flex items-center justify-center gap-2 bg-gray-200 text-gray-600 cursor-default">
          <span>Current Plan</span>
          <Check className="w-4 h-4" />
        </div>
      );
    }

    return (
      <div
        className={`w-full py-3 px-6 rounded-lg font-semibold text-base flex items-center justify-center gap-2 transition-all duration-300 transform group-hover:scale-105 ${
          isPopular
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
            : shouldFade
            ? colorConfig.button['gray']
            : colorConfig.button[planColor]
        }`}
      >
        <span>{children}</span>
        {!shouldFade && (
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        )}
      </div>
    );
  };

  const isComplexCard = ['Pro', 'Enterprise'].includes(plan.planType);

  return (
    <div
      className={`relative w-full flex flex-col rounded-lg border transition-all duration-300 group
      ${
        isPopular && !shouldFade
          ? 'bg-white border-purple-400 shadow-2xl shadow-purple-500/20 scale-105'
          : 'bg-white border-gray-200 hover:shadow-xl'
      }
      ${
        shouldFade
          ? 'opacity-60 grayscale-[0.8] scale-95 cursor-not-allowed'
          : ''
      }
      `}
    >
      {/* --- OVERLAY FOR MONTHLY USER (Only on subscription page) --- */}
      {showMonthlyOverlay && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-lg">
          <div className="bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold flex items-center gap-2">
            <Crown className="w-4 h-4 fill-current" />
            You are on the Monthly Plan
          </div>
        </div>
      )}

      {isPopular && !shouldFade && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
            <Star className="w-3 h-3 inline-block mr-1" />
            Most Popular
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colorConfig.iconBg[planColor]}`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{plan.planType}</h3>
          </div>

          <div className="text-right">
            <p className="text-2xl font-black text-gray-900 mb-1">
              {currency === 'usd'
                ? `$${pricePerDay().toFixed(2)}`
                : `₹${Math.round(pricePerDay())}`}
              <span>/day</span>
            </p>

            <p className="text-md text-gray-500">{displayPrice} total</p>

            {studentDiscount && (
              <span className="text-xs font-semibold text-green-600">
                🎓 Student discount applied
              </span>
            )}
          </div>
        </div>

        {/* {plan.planType !== 'Free' && !shouldFade && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
            <div className="flex flex-col">
              <p className="text-md font-semibold text-gray-800 flex items-center gap-1">
                🎓 Student Discount
                <span className="text-purple-600 font-bold text-lg">
                  {STUDENT_DISCOUNT_PERCENT}%
                </span>
              </p>
            </div>

            <button
              onClick={() => setStudentDiscount((prev) => !prev)}
              role="switch"
              disabled={shouldFade}
              aria-checked={studentDiscount}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                studentDiscount ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${
                  studentDiscount ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )} */}

        {isComplexCard && (
          <div className="mt-8 mb-4 bg-gray-100 p-1 rounded-lg">
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
                      disabled={shouldFade}
                      onClick={() => setSelectedPeriod(variant.period)}
                      className={`relative w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${
                        isSelected
                          ? 'bg-white shadow text-purple-700'
                          : 'text-gray-500 hover:bg-white/60'
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
        <ul className="space-y-3">
          {selectedVariant.features.map((feature) => (
            <li key={feature.name} className="flex items-start gap-3">
              <Check
                className={`w-4 h-4 mt-1 ${
                  shouldFade ? 'text-gray-400' : 'text-purple-500'
                }`}
              />
              <p className="text-sm text-gray-600">
                <span className="font-bold text-gray-800">
                  {feature.value == -1 ? '♾️' : feature.value}
                </span>{' '}
                {feature.name}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-6 mt-auto">
        <button
          onClick={() =>
            handlePlanSelect({
              plan,
            })
          }
          disabled={shouldFade}
          className="w-full disabled:cursor-not-allowed"
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
