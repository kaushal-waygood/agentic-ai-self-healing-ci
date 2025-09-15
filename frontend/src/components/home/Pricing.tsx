'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  ArrowRight,
  Check,
  Crown,
  Building2,
  Star,
  X,
  Zap,
} from 'lucide-react';
import apiInstance from '@/services/api';
import PlanCard from './PlanCard';

export function Pricing() {
  const frequencyOptions = [
    { id: 'Weekly', label: 'Weekly', discount: '10%', icon: '🌟' },
    { id: 'Monthly', label: 'Monthly', icon: '📅' },
    { id: 'Quarterly', label: 'Quarterly', discount: '20%', icon: '🌟' },
    { id: 'HalfYearly', label: 'Half Yearly', discount: '30%', icon: '🚀' },
    { id: 'Annual', label: 'Annual', discount: '40%', icon: '👑' },
  ];

  const [frequency, setFrequency] = useState('Monthly');
  const [currency, setCurrency] = useState('usd');
  const [pricingData, setPricingData] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const pathname = usePathname();
  const isSubscriptionPage = pathname.includes('/subscriptions'); // Made this more robust

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await apiInstance.get('/plan');
        const data = response.data;
        if (data && data.success && data.data) {
          setPricingData(data.data);
        } else {
          console.error('Unexpected API response structure:', data);
          setPricingData([]);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
        setPricingData([]);
      }
    };

    fetchPlan();
  }, []);

  useEffect(() => {
    if (isSubscriptionPage && selectedPlan) {
      setShowPurchaseModal(true);
    }
  }, [selectedPlan, isSubscriptionPage]);

  const handlePlanSelect = (plan: any) => {
    setSelectedPlan(plan);
  };

  const handlePurchase = async () => {
    try {
      console.log(
        'Purchasing plan:',
        selectedPlan,
        'with frequency:',
        frequency,
      );

      const response = await apiInstance.post('/plan/perchase', {
        planId: selectedPlan._id,
        period: frequency,
      });

      console.log('Purchase response:', response.data);
      setShowPurchaseModal(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Error purchasing plan:', error);
    }
  };

  const PurchaseModal = () => {
    if (!selectedPlan) return null;
    const variant = (selectedPlan as any).billingVariants?.find(
      (v: any) => v.period.toLowerCase() === frequency.toLowerCase(),
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Purchase Plan</h3>
            <button
              onClick={() => setShowPurchaseModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">
              {(selectedPlan as any).planType} Plan
            </h4>
            <p className="text-gray-600 mb-4">{frequency} billing</p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Price:</span>
                <span className="text-2xl font-bold">
                  {currency === 'usd'
                    ? `$${variant?.price.usd}`
                    : `₹${variant?.price.inr}`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Billing Cycle:</span>
                <span className="font-medium">{frequency}</span>
              </div>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Select Payment Method
            </label>
            <select className="w-full p-3 border border-gray-300 rounded-lg">
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="paypal">PayPal</option>
              <option value="stripe">Stripe</option>
            </select>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowPurchaseModal(false)}
              className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700"
            >
              Confirm Purchase
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      className="py-24 md:py-32 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 overflow-hidden"
      id="pricing"
    >
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-purple-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-cyan-200/20 to-emerald-200/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>
      <div className="container mx-auto px-6 relative z-10">
        <header className="text-center mb-16 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-4xl lg:text-5xl font-black mb-6 leading-tight">
            <span className="text-gray-900">Choose Your</span>{' '}
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-medium">
            Whether you're starting your career or scaling your business,{' '}
            <span className="text-purple-600 font-bold">
              we've got you covered
            </span>{' '}
            with pricing that grows with you.
          </p>
        </header>
        <div className="flex flex-col items-center gap-6 mb-16">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex flex-wrap justify-center bg-white/80 backdrop-blur-lg p-2 rounded-2xl border border-gray-200 shadow-lg">
              {frequencyOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setFrequency(opt.id)}
                  className={`relative px-6 py-3 text-sm font-bold rounded-xl transition-all duration-300 flex items-center gap-2 ${
                    frequency === opt.id
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg scale-105'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                  {opt.discount && (
                    <span className="absolute -top-2 -right-2 text-xs bg-gradient-to-r from-orange-400 to-red-400 text-white font-black px-2 py-1 rounded-full shadow-md">
                      -{opt.discount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-center items-start gap-8 lg:gap-12">
          {pricingData.map((plan, index) => (
            <PlanCard
              key={`${(plan as any).planType}-${frequency}`}
              plan={plan}
              index={index}
              frequency={frequency}
              currency={currency}
              handlePlanSelect={handlePlanSelect}
              isSubscriptionPage={isSubscriptionPage}
            />
          ))}
        </div>
      </div>
      {showPurchaseModal && <PurchaseModal />}
    </section>
  );
}
