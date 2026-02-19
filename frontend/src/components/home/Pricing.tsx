'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import apiInstance from '@/services/api';
import PlanCard from './PlanCard';
import { ArrowRight, DollarSign, IndianRupee, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useSelector } from 'react-redux';
import state from 'country-state-city/lib/state';
import { RootState } from '@/redux/rootReducer';

interface Plan {
  _id: string;
  planType: 'Free' | 'Pro' | 'Enterprise' | 'Basic' | 'Weekly';
  popular: boolean;
  billingVariants: any[];
  displayOrder: number;
}

export function Pricing() {
  const router = useRouter();
  const [currency, setCurrency] = useState('inr');
  const [pricingData, setPricingData] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const pathname = usePathname();
  const isSubscriptionPage = pathname.includes('/subscriptions');

  useEffect(() => {
    const fetchPlan = async () => {
      setIsLoading(true);
      try {
        const response = await apiInstance.get('/plan');
        const { data, success } = response.data;
        if (success && Array.isArray(data)) {
          const sortedData = data.sort(
            (a, b) => a.displayOrder - b.displayOrder,
          );
          setPricingData(sortedData);
        } else {
          console.error('Unexpected API response structure:', data);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlan();
  }, []);

  const { planType: userPlanType } = useSelector(
    (state: RootState) => state.plan,
  );

  const handleCurrencyChange = (newCurrency: 'usd' | 'inr') => {
    setCurrency(newCurrency);
  };

  return (
    <section
      className="relative pt-16 md:pt-8 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/40 overflow-hidden"
      id="pricing"
    >
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              'radial-gradient(circle, #6366f1 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            animation: 'float 20s ease-in-out infinite',
          }}
        ></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Enhanced Header */}
        <header className="text-center mb-10 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-full px-3 py-3 mb-4 shadow-md">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <span className="text-lg font-bold text-purple-700 uppercase">
              Choose Your Plan
            </span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>

          <h2 className="text-5xl sm:text-6xl lg:text-6xl  font-black  bg-gradient-to-r from-gray-900 via-purple-800 to-indigo-800 bg-clip-text text-transparent leading-tight">
            Find Your Perfect Plan
          </h2>

          <p className="text-sm md:text-lg text-gray-600 mb-4 leading-relaxed">
            Unlock your potential with a plan that grows with you.
          </p>
        </header>

        <div className="flex flex-col justify-center items-center gap-4 mb-10">
          {/* Optional: Floating Badge */}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm animate-bounce">
            Don't Miss Out
          </span>
          <Button
            size="lg"
            onClick={() => router.push('/student-offer')}
            className="group relative h-14 px-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none rounded-2xl shadow-xl shadow-blue-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-300/60 active:scale-95"
          >
            {/* Subtle inner glow effect */}
            <span className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="relative flex items-center gap-3 text-lg   font-semibold tracking-tight">
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              <span>Claim Your Student Offer</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-600 font-semibold">
                    Loading pricing plans...
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start mb-16">
              {pricingData.map((plan, index) => (
                <div
                  key={plan._id}
                  className="transform transition-all duration-500"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <PlanCard
                    plan={plan}
                    currency={currency}
                    isSubscriptionPage={isSubscriptionPage}
                    userPlanType={userPlanType}
                  />
                </div>
              ))}
            </div>

            {isSubscriptionPage ? (
              <div>
                {/* FAQ Teaser */}
                <div className="text-center my-12">
                  <p className="text-gray-600">
                    Have questions? Check our{' '}
                    <Link
                      href="support"
                      className="text-purple-600 font-semibold hover:text-purple-700 underline decoration-purple-300 underline-offset-2"
                    >
                      FAQ section
                    </Link>{' '}
                    or{' '}
                    <a
                      href="/contact-us"
                      className="text-purple-600 font-semibold hover:text-purple-700 underline decoration-purple-300 underline-offset-2"
                    >
                      contact support
                    </a>
                  </p>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(10px, -10px) rotate(1deg);
          }
          66% {
            transform: translate(-5px, 5px) rotate(-1deg);
          }
        }
      `}</style>
    </section>
  );
}
