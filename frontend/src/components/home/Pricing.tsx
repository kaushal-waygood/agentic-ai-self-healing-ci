// 'use client';

// import React, { useEffect, useState } from 'react';
// import { usePathname, useRouter } from 'next/navigation';
// import apiInstance from '@/services/api';
// import PlanCard from './PlanCard';
// import {
//   DollarSign,
//   IndianRupee,
//   Sparkles,
//   Shield,
//   Zap,
//   TrendingUp,
// } from 'lucide-react';
// import Link from 'next/link';
// import { useDispatch } from 'react-redux';
// import { setCheckoutRequest } from '@/redux/actions/checkoutAction';

// interface Plan {
//   _id: string;
//   planType: 'Free' | 'Pro' | 'Enterprise' | 'Basic' | 'Weekly';
//   popular: boolean;
//   billingVariants: any[];
//   displayOrder: number;
// }

// export function Pricing() {
//   const [currency, setCurrency] = useState('usd');
//   const [pricingData, setPricingData] = useState<Plan[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const router = useRouter();
//   const pathname = usePathname();
//   const isSubscriptionPage = pathname.includes('/subscriptions');

//   useEffect(() => {
//     const fetchPlan = async () => {
//       setIsLoading(true);
//       try {
//         const response = await apiInstance.get('/plan');
//         const { data, success } = response.data;
//         if (success && Array.isArray(data)) {
//           const sortedData = data.sort(
//             (a, b) => a.displayOrder - b.displayOrder,
//           );
//           setPricingData(sortedData);
//         } else {
//           console.error('Unexpected API response structure:', data);
//         }
//       } catch (error) {
//         console.error('Error fetching plans:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchPlan();
//   }, []);

//   // --- UPDATED: Navigates to the checkout page ---
//   // const handlePlanSelect = (details: {
//   //   plan: Plan;
//   //   period: string;
//   //   studentDiscount: number;
//   // }) => {
//   //   console.log('details', details);
//   //   const { plan, period } = details;
//   //   router.push(`/dashboard/checkout?planId=${plan._id}&period=${period}`);
//   // };

//   // Currency toggle handler
//   const handleCurrencyChange = (newCurrency: 'usd' | 'inr') => {
//     setCurrency(newCurrency);
//   };

//   const handlePlanSelect = (details: {
//     plan: Plan;
//     period: string;
//     studentDiscountApplied: boolean;
//     discountPercent: number;
//     discountAmount: number;
//     finalPrice: number;
//     currency: 'usd' | 'inr';
//   }) => {
//     const {
//       plan,
//       period,
//       studentDiscountApplied,
//       discountPercent,
//       discountAmount,
//       finalPrice,
//       currency,
//     } = details;

//     // ✅ Save to sessionStorage
//     const checkoutPayload = {
//       planId: plan._id,
//       planType: plan.planType,
//       period,
//       currency,
//       basePrice:
//         currency === 'usd'
//           ? plan.billingVariants[0].price.effective.usd
//           : plan.billingVariants[0].price.effective.inr,
//       studentDiscountApplied,
//       discountPercent,
//       discountAmount,
//       finalPrice,
//     };

//     sessionStorage.setItem('checkout_plan', JSON.stringify(checkoutPayload));

//     // ✅ Navigate
//     router.push(`/dashboard/checkout?planId=${plan._id}&period=${period}`);
//   };

//   return (
//     <section
//       className="relative pt-16 md:pt-8 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/40 overflow-hidden"
//       id="pricing"
//     >
//       {/* Animated Grid Pattern */}
//       <div className="absolute inset-0 opacity-[0.02]">
//         <div
//           className="w-full h-full"
//           style={{
//             backgroundImage:
//               'radial-gradient(circle, #6366f1 1px, transparent 1px)',
//             backgroundSize: '40px 40px',
//             animation: 'float 20s ease-in-out infinite',
//           }}
//         ></div>
//       </div>

//       <div className="container mx-auto px-6 relative z-10">
//         {/* Enhanced Header */}
//         <header className="text-center mb-10 max-w-5xl mx-auto">
//           <div className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-full px-3 py-3 mb-4 shadow-md">
//             <Sparkles className="w-6 h-6 text-purple-600" />
//             <span className="text-lg font-bold text-purple-700 uppercase">
//               Choose Your Plan
//             </span>
//             <Sparkles className="w-4 h-4 text-purple-600" />
//           </div>

//           <h2 className="text-5xl sm:text-6xl lg:text-6xl  font-black  bg-gradient-to-r from-gray-900 via-purple-800 to-indigo-800 bg-clip-text text-transparent leading-tight">
//             Find Your Perfect Plan
//           </h2>

//           <p className="text-sm md:text-lg text-gray-600 mb-4 leading-relaxed">
//             Unlock your potential with a plan that grows with you.
//             <br />
//             {/* <span className="text-purple-600 font-semibold">
//               Simple, transparent, and powerful.
//             </span> */}
//           </p>

//           {/* Currency Selector */}
//           <div className="flex items-center justify-center mb-4">
//             <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-1 shadow-lg">
//               <div className="flex items-center gap-1">
//                 <button
//                   onClick={() => handleCurrencyChange('usd')}
//                   className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
//                     currency === 'usd'
//                       ? 'bg-purple-600 text-white shadow-md transform scale-105'
//                       : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
//                   }`}
//                 >
//                   <DollarSign className="w-4 h-4" />
//                   USD
//                 </button>
//                 <button
//                   onClick={() => handleCurrencyChange('inr')}
//                   className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
//                     currency === 'inr'
//                       ? 'bg-purple-600 text-white shadow-md transform scale-105'
//                       : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
//                   }`}
//                 >
//                   <IndianRupee className="w-4 h-4" />
//                   INR
//                 </button>
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Loading State */}
//         {isLoading ? (
//           <div className="flex items-center justify-center py-20">
//             <div className="relative">
//               <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
//               <div className="relative bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
//                 <div className="flex items-center gap-4">
//                   <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
//                   <p className="text-gray-600 font-semibold">
//                     Loading pricing plans...
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <>
//             {/* Plans Grid */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start mb-16">
//               {pricingData.map((plan, index) => (
//                 <div
//                   key={plan._id}
//                   className="transform transition-all duration-500"
//                   style={{
//                     animationDelay: `${index * 100}ms`,
//                   }}
//                 >
//                   <PlanCard
//                     plan={plan}
//                     currency={currency}
//                     handlePlanSelect={handlePlanSelect}
//                     isSubscriptionPage={isSubscriptionPage}
//                   />
//                 </div>
//               ))}
//             </div>

//             {isSubscriptionPage ? (
//               <div>
//                 {/* FAQ Teaser */}
//                 <div className="text-center my-12">
//                   <p className="text-gray-600">
//                     Have questions? Check our{' '}
//                     <Link
//                       href="support"
//                       className="text-purple-600 font-semibold hover:text-purple-700 underline decoration-purple-300 underline-offset-2"
//                     >
//                       FAQ section
//                     </Link>{' '}
//                     or{' '}
//                     <a
//                       href="/contact-us"
//                       className="text-purple-600 font-semibold hover:text-purple-700 underline decoration-purple-300 underline-offset-2"
//                     >
//                       contact support
//                     </a>
//                   </p>
//                 </div>
//               </div>
//             ) : null}
//           </>
//         )}
//       </div>

//       <style jsx>{`
//         @keyframes float {
//           0%,
//           100% {
//             transform: translate(0, 0) rotate(0deg);
//           }
//           33% {
//             transform: translate(10px, -10px) rotate(1deg);
//           }
//           66% {
//             transform: translate(-5px, 5px) rotate(-1deg);
//           }
//         }
//       `}</style>
//     </section>
//   );
// }

'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import apiInstance from '@/services/api';
import PlanCard from './PlanCard';
import {
  DollarSign,
  IndianRupee,
  Sparkles,
  Shield,
  Zap,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { setCheckoutRequest } from '@/redux/actions/checkoutAction';

interface Plan {
  _id: string;
  planType: 'Free' | 'Pro' | 'Enterprise' | 'Basic' | 'Weekly';
  popular: boolean;
  billingVariants: any[];
  displayOrder: number;
}

export function Pricing() {
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

  // Currency toggle handler
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
            <br />
            {/* <span className="text-purple-600 font-semibold">
              Simple, transparent, and powerful.
            </span> */}
          </p>

          {/* Currency Selector */}
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-1 shadow-lg">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCurrencyChange('usd')}
                  disabled={currency === 'inr'}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 cursor-not-allowed ${
                    currency === 'usd'
                      ? 'bg-purple-600 text-white shadow-md transform scale-105'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  USD
                </button>
                <button
                  onClick={() => handleCurrencyChange('inr')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
                    currency === 'inr'
                      ? 'bg-purple-600 text-white shadow-md transform scale-105'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <IndianRupee className="w-4 h-4" />
                  INR
                </button>
              </div>
            </div>
          </div>
        </header>

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
                    // handlePlanSelect={handlePlanSelect}
                    isSubscriptionPage={isSubscriptionPage}
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
