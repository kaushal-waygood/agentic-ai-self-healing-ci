'use client';

import React, { useState, useEffect } from 'react';
import {
  Check,
  Star,
  Zap,
  Crown,
  Rocket,
  Shield,
  ArrowRight,
  Sparkles,
  Users,
  TrendingUp,
} from 'lucide-react';
import { plans } from './data/solution';

export function Pricing() {
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [isYearly, setIsYearly] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimationPhase(1), 300);
    return () => clearTimeout(timer);
  }, []);

  const getColorClasses = (color, type = 'primary') => {
    const colors = {
      blue: {
        primary: 'from-blue-500 to-blue-600',
        light: 'from-blue-50 to-blue-100',
        border: 'border-blue-200',
        text: 'text-blue-600',
        glow: 'shadow-blue-200/50',
      },
      purple: {
        primary: 'from-purple-500 to-purple-600',
        light: 'from-purple-50 to-purple-100',
        border: 'border-purple-200',
        text: 'text-purple-600',
        glow: 'shadow-purple-200/50',
      },
      emerald: {
        primary: 'from-emerald-500 to-emerald-600',
        light: 'from-emerald-50 to-emerald-100',
        border: 'border-emerald-200',
        text: 'text-emerald-600',
        glow: 'shadow-emerald-200/50',
      },
    };
    return colors[color][type];
  };

  const PricingCard = ({ plan, index }) => {
    const isHovered = hoveredPlan === index;
    const IconComponent = plan.icon;

    return (
      <div
        className={`relative group transition-all duration-700 transform ${
          plan.popular ? 'scale-110 z-10' : 'hover:scale-105'
        } ${isHovered ? '-translate-y-4' : 'hover:-translate-y-2'}`}
        style={{
          transform: `translateY(${animationPhase ? 0 : 50}px) scale(${
            animationPhase ? (plan.popular ? 1.1 : 1) : 0.9
          })`,
          opacity: animationPhase ? 1 : 0,
          transitionDelay: `${index * 200}ms`,
        }}
        onMouseEnter={() => setHoveredPlan(index)}
        onMouseLeave={() => setHoveredPlan(null)}
        id="pricing"
      >
        {/* Popular Glow Effect */}
        {plan.popular && (
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
        )}

        {/* Main Card */}
        <div
          className={`relative bg-white/95 backdrop-blur-sm border-2 rounded-3xl overflow-hidden transition-all duration-500 ${
            plan.popular
              ? `${getColorClasses(
                  plan.color,
                  'border',
                )} shadow-2xl hover:shadow-purple-300/30`
              : `border-gray-200 shadow-lg hover:shadow-xl hover:${getColorClasses(
                  plan.color,
                  'glow',
                )}`
          }`}
        >
          {/* Animated Header Background */}
          <div
            className={`h-32 bg-gradient-to-br ${getColorClasses(
              plan.color,
              'light',
            )} relative overflow-hidden`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${getColorClasses(
                plan.color,
                'primary',
              )} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
            />

            {/* Floating particles */}
            <div className="absolute top-4 right-4 w-2 h-2 bg-white/40 rounded-full animate-pulse" />
            <div
              className="absolute top-8 left-6 w-1 h-1 bg-white/60 rounded-full animate-pulse"
              style={{ animationDelay: '1s' }}
            />
            <div
              className="absolute bottom-6 right-8 w-1.5 h-1.5 bg-white/50 rounded-full animate-pulse"
              style={{ animationDelay: '0.5s' }}
            />
          </div>

          <div className="p-8 -mt-16 relative z-10">
            {/* Icon */}
            <div
              className={`w-16 h-16 bg-gradient-to-br ${getColorClasses(
                plan.color,
                'primary',
              )} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 mx-auto`}
            >
              <IconComponent className="w-8 h-8 text-white" />
            </div>

            {/* Plan Details */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {plan.description}
              </p>

              {/* Price Display */}
              <div className="mb-4">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-black">
                    ${isYearly ? Math.round(plan.price * 0.8) : plan.price}
                  </span>
                  <span className="text-gray-500 text-lg">{plan.period}</span>
                </div>
                {isYearly && (
                  <div className="text-sm text-emerald-600 font-semibold mt-1">
                    Save 20% annually
                  </div>
                )}
              </div>

              {/* Applications Limit */}
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getColorClasses(
                  plan.color,
                  'light',
                )} ${getColorClasses(plan.color, 'border')} border`}
              >
                <Zap
                  className={`w-4 h-4 ${getColorClasses(plan.color, 'text')}`}
                />
                <span
                  className={`text-sm font-semibold ${getColorClasses(
                    plan.color,
                    'text',
                  )}`}
                >
                  {plan.applications}
                </span>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              {plan.features.map((feature, featureIndex) => (
                <div
                  key={featureIndex}
                  className="flex items-start gap-3 group/feature hover:bg-gray-50/50 rounded-lg p-2 -m-2 transition-all duration-300"
                  style={{
                    opacity: isHovered ? 1 : 0.8,
                    transform: isHovered ? 'translateX(8px)' : 'translateX(0)',
                    transitionDelay: `${featureIndex * 50}ms`,
                  }}
                >
                  <div
                    className={`p-1 rounded-full bg-gradient-to-r ${getColorClasses(
                      plan.color,
                      'primary',
                    )} group-hover/feature:scale-110 transition-transform duration-300`}
                  >
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover/feature:text-gray-900 transition-colors duration-300">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-500 transform relative overflow-hidden group/btn ${
                plan.popular
                  ? `bg-gradient-to-r ${getColorClasses(
                      plan.color,
                      'primary',
                    )} text-white shadow-lg hover:shadow-xl hover:scale-105`
                  : `border-2 ${getColorClasses(
                      plan.color,
                      'border',
                    )} ${getColorClasses(
                      plan.color,
                      'text',
                    )} hover:bg-gradient-to-r hover:${getColorClasses(
                      plan.color,
                      'primary',
                    )} hover:text-white hover:border-transparent`
              }`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {plan.popular ? 'Start Free Trial' : 'Get Started'}
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
              </span>

              {/* Button glow effect */}
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="relative py-20">
      {/* Billing Toggle */}
      <div className="flex justify-center mb-16">
        <div className="relative bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-2 shadow-lg flex">
          <div
            className={`absolute top-2 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl transition-all duration-500 ease-out ${
              isYearly ? 'left-32 w-24' : 'left-2 w-28'
            }`}
          />
          <button
            onClick={() => setIsYearly(false)}
            className={`relative z-10 px-6 py-2 rounded-xl font-semibold transition-colors duration-300 ${
              !isYearly ? 'text-white' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`relative z-10 px-6 py-2 rounded-xl font-semibold transition-colors duration-300 flex items-center gap-2 ${
              isYearly ? 'text-white' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Yearly
            <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
              20% off
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
        {plans.map((plan, index) => (
          <PricingCard key={index} plan={plan} index={index} />
        ))}
      </div>

      {/* Floating background elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-32 right-20 w-80 h-80 bg-gradient-to-r from-emerald-400/5 to-blue-400/5 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '2s' }}
      />
    </section>
  );
}
