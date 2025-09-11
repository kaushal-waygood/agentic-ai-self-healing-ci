'use client';

import React, { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { pricingData } from './data/solution';

export function Pricing() {
  const [customerType, setCustomerType] = useState('individual'); // 'individual' or 'enterprise'
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'weekly' or 'monthly' for individual
  const [frequency, setFrequency] = useState('monthly'); // 'monthly', 'quarterly', etc. for long-term
  const [currency, setCurrency] = useState('usd'); // 'usd' or 'inr'

  const currentData =
    customerType === 'individual'
      ? pricingData.individual[billingCycle]
      : pricingData.enterprise;

  const frequencyOptions = [
    { id: 'monthly', label: 'Monthly' },
    { id: 'quarterly', label: 'Quarterly', discount: '20%' },
    { id: 'halfYearly', label: 'Half Yearly', discount: '30%' },
    { id: 'annual', label: 'Annual', discount: '40%' },
  ];

  const getPrice = (plan) => {
    if (billingCycle === 'weekly') {
      return currency === 'usd' ? `$${plan.prices.usd}` : `₹${plan.prices.inr}`;
    }
    const priceData = plan.prices[frequency];
    if (!priceData) return 'N/A';
    return currency === 'usd' ? `$${priceData.usd}` : `₹${priceData.inr}`;
  };

  const PlanCard = ({ plan }) => {
    const IconComponent = plan.icon;
    return (
      <div
        className={`w-full max-w-sm rounded-2xl border-2 transition-all duration-300 ${
          plan.popular
            ? 'border-purple-500 shadow-2xl scale-105'
            : 'border-gray-200 shadow-lg'
        } bg-white`}
      >
        <div
          className={`p-6 rounded-t-xl ${
            plan.popular ? 'bg-purple-50' : 'bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-${plan.color}-500 to-${plan.color}-600 text-white`}
            >
              <IconComponent className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{plan.name}</h3>
          </div>
          <div className="text-4xl font-black text-gray-900">
            {getPrice(plan)}
            {billingCycle === 'weekly' && (
              <span className="text-base font-medium text-gray-500">
                /weekly
              </span>
            )}
          </div>
        </div>
        <div className="p-6">
          <ul className="space-y-4">
            {plan.features.map((feature) => (
              <li
                key={feature.name}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-gray-600">{feature.name}</span>
                <span className="font-bold text-gray-800">{feature.value}</span>
              </li>
            ))}
          </ul>
          <button
            className={`w-full mt-8 py-3 px-6 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
              plan.popular
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white'
            }`}
          >
            Choose Plan <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="py-20 bg-gray-50" id="pricing">
      <div className="container mx-auto px-6">
        <header className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-800 mb-4">
            Find the Perfect Plan for You
          </h2>
          <p className="text-lg text-gray-600">
            Whether you're an individual or an enterprise, we have a plan that
            fits your needs.
          </p>
        </header>

        {/* Toggles Section */}
        <div className="flex flex-col items-center gap-6 mb-12">
          {/* Customer Type Toggle */}
          <div className="flex bg-gray-200 p-1 rounded-lg">
            <button
              onClick={() => setCustomerType('individual')}
              className={`px-6 py-2 text-sm font-semibold rounded-md transition-colors ${
                customerType === 'individual'
                  ? 'bg-white text-purple-600 shadow'
                  : 'text-gray-600'
              }`}
            >
              Individual Customer
            </button>
            <button
              onClick={() => setCustomerType('enterprise')}
              className={`px-6 py-2 text-sm font-semibold rounded-md transition-colors ${
                customerType === 'enterprise'
                  ? 'bg-white text-purple-600 shadow'
                  : 'text-gray-600'
              }`}
            >
              Enterprise Customer
            </button>
          </div>

          {/* Individual Billing Cycle Toggle */}
          {customerType === 'individual' && (
            <div className="flex bg-gray-200 p-1 rounded-lg">
              <button
                onClick={() => setBillingCycle('weekly')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  billingCycle === 'weekly'
                    ? 'bg-white text-gray-800 shadow'
                    : 'text-gray-500'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-800 shadow'
                    : 'text-gray-500'
                }`}
              >
                Monthly Quota
              </button>
            </div>
          )}

          {/* Long-term Frequency & Currency Toggles */}
          {(customerType === 'enterprise' ||
            (customerType === 'individual' && billingCycle === 'monthly')) && (
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex flex-wrap justify-center bg-gray-200 p-1 rounded-lg">
                {frequencyOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFrequency(opt.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors relative ${
                      frequency === opt.id
                        ? 'bg-white text-gray-800 shadow'
                        : 'text-gray-500'
                    }`}
                  >
                    {opt.label}
                    {opt.discount && (
                      <span className="absolute -top-2 -right-2 text-xxs bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                        {opt.discount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex bg-gray-200 p-1 rounded-lg">
                <button
                  onClick={() => setCurrency('usd')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md ${
                    currency === 'usd'
                      ? 'bg-white shadow text-gray-800'
                      : 'text-gray-500'
                  }`}
                >
                  $ USD
                </button>
                <button
                  onClick={() => setCurrency('inr')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md ${
                    currency === 'inr'
                      ? 'bg-white shadow text-gray-800'
                      : 'text-gray-500'
                  }`}
                >
                  ₹ INR
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="flex flex-wrap justify-center items-start gap-8">
          {currentData.plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
