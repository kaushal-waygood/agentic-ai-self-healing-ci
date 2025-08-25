'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Zap,
  Building,
  School,
  Mail,
  Star,
  Gem,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Copy,
  Crown,
  Rocket,
  Users,
  TrendingUp,
  Award,
  Lock,
  Unlock,
  ArrowRight,
  Check,
  X,
} from 'lucide-react';

// Mock data for demonstration
const mockSubscriptionPlans = [
  {
    id: 'basic',
    name: 'Basic',
    basePriceMonthly: 0,
    icon: 'Zap',
    iconColor: 'text-blue-500',
    borderColor: 'border-blue-200',
    isPopular: false,
    limits: {
      applicationLimit: 5,
      aiJobApply: 2,
      aiCvGenerator: 3,
      aiCoverLetterGenerator: 3,
      autoApplyAgents: 0,
    },
    referralBonus: 5,
    displayFeatures: ['Basic templates', 'Email support'],
    quarterlyDiscountPercent: 0,
    halfYearlyDiscountPercent: 0,
  },
  {
    id: 'plus',
    name: 'Plus',
    basePriceMonthly: 19.99,
    icon: 'Star',
    iconColor: 'text-purple-500',
    borderColor: 'border-purple-200',
    isPopular: true,
    limits: {
      applicationLimit: 50,
      aiJobApply: 25,
      aiCvGenerator: 15,
      aiCoverLetterGenerator: 15,
      autoApplyAgents: 2,
    },
    displayFeatures: [
      'Premium templates',
      'Priority support',
      'Advanced analytics',
    ],
    quarterlyDiscountPercent: 10,
    halfYearlyDiscountPercent: 20,
  },
  {
    id: 'pro',
    name: 'Pro',
    basePriceMonthly: 39.99,
    icon: 'Gem',
    iconColor: 'text-amber-500',
    borderColor: 'border-amber-200',
    isPopular: false,
    limits: {
      applicationLimit: -1,
      aiJobApply: 100,
      aiCvGenerator: 50,
      aiCoverLetterGenerator: 50,
      autoApplyAgents: 5,
    },
    displayFeatures: ['All premium features', 'Custom branding', 'API access'],
    quarterlyDiscountPercent: 15,
    halfYearlyDiscountPercent: 25,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    basePriceMonthly: 99.99,
    icon: 'ShieldCheck',
    iconColor: 'text-green-500',
    borderColor: 'border-green-200',
    isPopular: false,
    limits: {
      applicationLimit: -1,
      aiJobApply: -1,
      aiCvGenerator: -1,
      aiCoverLetterGenerator: -1,
      autoApplyAgents: -1,
    },
    displayFeatures: [
      'White-label solution',
      'Dedicated support',
      'Custom integrations',
    ],
    quarterlyDiscountPercent: 20,
    halfYearlyDiscountPercent: 30,
  },
];

const iconMap = {
  Zap,
  Star,
  Gem,
  ShieldCheck,
  Building,
  School,
};

const PricingTable = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('plus');
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    setIsAnimated(true);
  }, []);

  const calculatePrice = (plan, cycle) => {
    let basePrice = plan.basePriceMonthly;
    let price, periodMonths, discountPercent;

    switch (cycle) {
      case 'quarterly':
        periodMonths = 3;
        discountPercent = plan.quarterlyDiscountPercent || 0;
        break;
      case 'halfYearly':
        periodMonths = 6;
        discountPercent = plan.halfYearlyDiscountPercent || 0;
        break;
      default:
        periodMonths = 1;
        discountPercent = 0;
        break;
    }

    price = basePrice * periodMonths * (1 - discountPercent / 100);
    const perMonthPrice = price / periodMonths;

    return { totalPrice: price, perMonthPrice, periodMonths, discountPercent };
  };

  const renderLimit = (label, limit, unit) => {
    if (limit === 0 && label !== 'AI application credits') return null;
    let text = '';

    if (label === 'AI application credits') {
      text = `Earn ${limit} ${label} per successful referral`;
      return (
        <li className="flex items-start group">
          <div className="relative">
            <Star className="h-5 w-5 text-yellow-500 mr-3 shrink-0 mt-0.5 transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-yellow-400 rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
          </div>
          <span className="text-slate-700 group-hover:text-slate-900 transition-colors duration-300">
            {text}
          </span>
        </li>
      );
    }

    text =
      limit === -1 ? `Unlimited ${label}` : `Up to ${limit} ${label} ${unit}`;

    return (
      <li className="flex items-start group">
        <div className="relative">
          <CheckCircle className="h-5 w-5 text-green-500 mr-3 shrink-0 mt-0.5 transition-transform duration-300 group-hover:scale-110" />
          <div className="absolute inset-0 bg-green-400 rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
        </div>
        <span className="text-slate-700 group-hover:text-slate-900 transition-colors duration-300">
          {text}
        </span>
      </li>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-gradient-to-br from-green-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-sm font-medium mb-4 animate-bounce">
          <Sparkles className="w-4 h-4" />
          Choose Your Career Acceleration Plan
        </div>
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent mb-4">
          Pricing that scales with your{' '}
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            ambitions
          </span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          From getting started to landing your dream job, we have the perfect
          plan for your career journey
        </p>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center mb-12">
        <div className="relative backdrop-blur-sm bg-white/80 p-2 rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center space-x-1">
            {['monthly', 'quarterly', 'halfYearly'].map((cycle) => (
              <button
                key={cycle}
                onClick={() => setBillingCycle(cycle)}
                className={`relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                  billingCycle === cycle
                    ? 'text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {billingCycle === cycle && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg"></div>
                )}
                <span className="relative flex items-center gap-2">
                  {cycle === 'monthly' && 'Monthly'}
                  {cycle === 'quarterly' && (
                    <>
                      Quarterly
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                        Save 10%
                      </span>
                    </>
                  )}
                  {cycle === 'halfYearly' && (
                    <>
                      Half-Yearly
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                        Save 25%
                      </span>
                    </>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
        {mockSubscriptionPlans.map((plan, index) => {
          const Icon = plan.icon ? iconMap[plan.icon] : null;
          const { totalPrice, perMonthPrice, periodMonths, discountPercent } =
            calculatePrice(plan, billingCycle);
          const isSelected = selectedPlan === plan.id;
          const isHovered = hoveredPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative group transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
                isAnimated ? 'animate-slideInUp' : ''
              }`}
              style={{
                animationDelay: `${index * 150}ms`,
              }}
              onMouseEnter={() => setHoveredPlan(plan.id)}
              onMouseLeave={() => setHoveredPlan(null)}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {/* Popular badge */}
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <div className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold shadow-lg animate-pulse">
                    <Crown className="w-3 h-3" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Glow effect */}
              {(isHovered || isSelected) && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-xl -z-10 animate-pulse"></div>
              )}

              {/* Main card */}
              <div
                className={`relative h-full backdrop-blur-sm bg-white/90 rounded-3xl shadow-xl border-2 transition-all duration-500 overflow-hidden ${
                  isSelected
                    ? 'border-purple-500 shadow-2xl shadow-purple-200'
                    : plan.isPopular
                    ? 'border-purple-300 shadow-xl'
                    : 'border-slate-200 hover:border-purple-300'
                }`}
              >
                {/* Gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br opacity-5 ${
                    plan.id === 'basic'
                      ? 'from-blue-500 to-cyan-500'
                      : plan.id === 'plus'
                      ? 'from-purple-500 to-pink-500'
                      : plan.id === 'pro'
                      ? 'from-amber-500 to-orange-500'
                      : 'from-green-500 to-emerald-500'
                  } transition-opacity duration-300 ${
                    isHovered ? 'opacity-10' : ''
                  }`}
                ></div>

                {/* Header */}
                <div className="relative p-8 text-center">
                  {/* Icon with animation */}
                  <div className="relative mb-4">
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl transition-all duration-500 ${
                        plan.id === 'basic'
                          ? 'bg-blue-50 group-hover:bg-blue-100'
                          : plan.id === 'plus'
                          ? 'bg-purple-50 group-hover:bg-purple-100'
                          : plan.id === 'pro'
                          ? 'bg-amber-50 group-hover:bg-amber-100'
                          : 'bg-green-50 group-hover:bg-green-100'
                      } ${isHovered ? 'scale-110 rotate-6' : ''}`}
                    >
                      {Icon && (
                        <Icon
                          className={`w-8 h-8 ${
                            plan.iconColor
                          } transition-transform duration-500 ${
                            isHovered ? 'scale-110' : ''
                          }`}
                        />
                      )}
                    </div>

                    {/* Floating particles around icon */}
                    {isHovered && (
                      <>
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                        <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-blue-400 rounded-full animate-bounce delay-300"></div>
                        <div className="absolute top-1/2 -left-2 w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce delay-500"></div>
                      </>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-slate-600 mb-6 min-h-[48px]">
                    {plan.id === 'basic' &&
                      'Perfect for getting started with job applications'}
                    {plan.id === 'plus' &&
                      'Ideal for serious job seekers and career changers'}
                    {plan.id === 'pro' &&
                      'For professionals who want unlimited access'}
                    {plan.id === 'enterprise' &&
                      'Complete solution for organizations'}
                  </p>

                  {/* Pricing */}
                  <div className="space-y-2">
                    {totalPrice === 0 ? (
                      <div className="text-4xl font-bold text-slate-900">
                        Free
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-4xl font-bold text-slate-900">
                            ${perMonthPrice.toFixed(2)}
                          </span>
                          {discountPercent > 0 && (
                            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-semibold animate-pulse">
                              -{discountPercent}%
                            </span>
                          )}
                        </div>
                        <div className="text-slate-600 text-sm">
                          per month
                          {billingCycle !== 'monthly' && (
                            <div className="text-xs mt-1">
                              Billed as ${totalPrice.toFixed(2)} every{' '}
                              {periodMonths} months
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Student offer for Plus plan */}
                  {plan.id === 'plus' && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-center gap-2 text-blue-700 text-sm font-medium">
                        <School className="w-4 h-4" />
                        Students get this FREE!
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="px-8 pb-8 flex-grow">
                  <ul className="space-y-3">
                    {renderLimit(
                      'Total Applications',
                      plan.limits?.applicationLimit ?? 0,
                      'per month',
                    )}
                    {renderLimit(
                      'AI Applications',
                      plan.limits?.aiJobApply ?? 0,
                      'per month',
                    )}
                    {renderLimit(
                      'AI CV Generations',
                      plan.limits?.aiCvGenerator ?? 0,
                      'per month',
                    )}
                    {renderLimit(
                      'AI Cover Letters',
                      plan.limits?.aiCoverLetterGenerator ?? 0,
                      'per month',
                    )}
                    {renderLimit(
                      'Auto-Apply Agents',
                      plan.limits?.autoApplyAgents ?? 0,
                      '',
                    )}

                    {plan.id === 'basic' &&
                      renderLimit(
                        'AI application credits',
                        plan.referralBonus ?? 0,
                        'per successful referral',
                      )}

                    {(plan.displayFeatures || []).map((feature, idx) => (
                      <li key={idx} className="flex items-start group">
                        <div className="relative">
                          <Sparkles className="h-5 w-5 text-purple-500 mr-3 shrink-0 mt-0.5 transition-transform duration-300 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-purple-400 rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                        </div>
                        <span className="text-slate-700 group-hover:text-slate-900 transition-colors duration-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <div className="p-8 pt-0">
                  <button
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                      plan.isPopular
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-purple-200'
                        : isSelected
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg'
                        : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {isSelected ? (
                        <>
                          <Check className="w-4 h-4" />
                          Current Plan
                        </>
                      ) : plan.id === 'basic' ? (
                        <>
                          Get Started Free
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </>
                      ) : (
                        <>
                          Choose {plan.name}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Free Enterprise Offer */}
      <div className="mt-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 md:p-12 text-white">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse"></div>
          <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-300"></div>
          <div className="absolute top-8 right-12 w-1 h-1 bg-purple-400 rounded-full animate-bounce delay-700"></div>
          <div className="absolute bottom-8 left-8 w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce delay-1000"></div>

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-blue-200 text-sm font-medium mb-6">
              <Building className="w-4 h-4" />
              For Students & Universities
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Get Premium Access{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Absolutely FREE
              </span>
            </h2>

            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Ask your university or bootcamp to sponsor free premium access to
              CareerPilot for all students. Zero cost to you, zero cost to them.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">For Everyone</h3>
                <p className="text-sm text-blue-200">
                  Every student gets Plus plan features
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                <Award className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Zero Cost</h3>
                <p className="text-sm text-blue-200">
                  Completely free for educational institutions
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Better Outcomes</h3>
                <p className="text-sm text-blue-200">
                  Give students a competitive advantage
                </p>
              </div>
            </div>

            <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-200">
              <Mail className="w-5 h-5" />
              Request Free Access for Your School
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideInUp {
          animation: slideInUp 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export { PricingTable };
