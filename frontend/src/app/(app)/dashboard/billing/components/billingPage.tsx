'use client';

import React, { useEffect, useState } from 'react';

import {
  CreditCard,
  Calendar,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import apiInstance from '@/services/api';

// Define the types
interface Price {
  usd: number;
  inr: number;
}

interface BillingVariant {
  price: Price;
  period: string;
}

interface Plan {
  _id: string;
  planType: string;
}

interface BillingRecord {
  _id: string;
  user: string;
  plan: Plan;
  billingVariant: BillingVariant;
  amountPaid: number;
  currency: string;
  paymentStatus: string;
  paymentGateway: string;
  paymentId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BillingData {
  success: boolean;
  data: BillingRecord[];
}

export default function BillingPage() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false); // For a sleek loading state example

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const [billingData, setBillingData] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const res = await apiInstance.get<BillingData>('/plan/perchased');
        if (res.data.success) {
          setBillingData(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching billing data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-gray-400" />
    );
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Active' : 'Expired';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50';
  };

  const activeRecord = billingData.find((record) => record.isActive);
  const totalPaid = billingData.reduce(
    (sum, record) => sum + record.amountPaid,
    0,
  );
  const activeSubscriptions = billingData.filter(
    (record) => record.isActive,
  ).length;

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }
  console.log('active :', activeRecord);
  return (
    <div className="min-h-screen bg-gray-100/50 p-2 sm:p-3 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex justify-between flex-wrap items-center  border-b border-gray-200">
          <div className="">
            <div className="flex items-center gap-3 ">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 via-cyan-700 to-blue-500 bg-clip-text text-transparent">
                Billing & Subscriptions
              </h1>
            </div>
            <p className="text-slate-400 text-lg">
              Manage your plans and payment history
            </p>
          </div>
          <button
            onClick={() => setIsLoading(true)} // Example interactive element
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg shadow-sm hover:bg-blue-50 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
        </div>

        {/* Stats Section - Elevated and Modern */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Subscriptions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-start gap-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
            <div className="p-4 rounded-full bg-blue-50">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Total Subscriptions
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {billingData.length}
              </p>
            </div>
          </div>

          {/* Active Subscriptions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-start gap-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
            <div className="p-4 rounded-full bg-green-50">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Active Subscriptions
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {activeSubscriptions}
              </p>
            </div>
          </div>

          {/* Total Paid */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-start gap-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
            <div className="p-4 rounded-full bg-purple-50">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Total Paid
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {formatCurrency(totalPaid, 'usd')}
              </p>
            </div>
          </div>
        </div>

        {/* Current Plan - Card Focus */}
        <div className="bg-white rounded-lg shadow-2xl border border-blue-300/50 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-full w-1/4 bg-blue-50/50 clip-polygon-slant opacity-50 pointer-events-none"></div>
          <div className="flex items-center justify-between flex-wrap gap-6 relative z-10">
            {/* Plan Details */}
            <div className="space-y-3">
              <p className="text-lg font-semibold text-blue-600">
                Your Active Membership
              </p>

              {activeRecord ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <span className="text-3xl font-extrabold text-gray-900">
                    {activeRecord.billingVariant.period} Plan
                  </span>
                  <span className="px-3 py-1 text-sm rounded-full font-semibold bg-green-100 text-green-700 border border-green-300 shadow-sm">
                    <CheckCircle className="w-4 h-4 inline-block mr-1 align-sub" />
                    Active
                  </span>
                </div>
              ) : (
                <p className="text-2xl font-semibold text-gray-500">
                  No active subscription
                </p>
              )}

              <p className="text-gray-500 text-sm">
                Next renewal:{' '}
                {activeRecord ? formatDate(activeRecord.endDate) : 'N/A'}
              </p>
            </div>

            {/* Price and Action */}
            <div className="text-left sm:text-right space-y-2">
              <p className="text-4xl font-extrabold text-blue-700">
                {activeRecord
                  ? formatCurrency(
                      activeRecord.amountPaid,
                      activeRecord.currency,
                    )
                  : 'Free Tier'}
              </p>
              <p className="text-sm text-gray-500 font-medium">
                {activeRecord?.billingVariant.period || 'Access'}
              </p>
              {activeRecord && (
                <button className="flex items-center gap-2 ml-auto text-sm font-semibold text-blue-600 hover:text-blue-800 transition">
                  Manage Subscription
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Billing History - Collapsible/Interactive */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div
            className="px-6 py-5 border-b border-gray-200 flex justify-between items-center cursor-pointer"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          >
            <h2 className="text-2xl font-bold text-gray-900">
              Billing History ({billingData.length})
            </h2>
            <ChevronDown
              className={`w-6 h-6 text-gray-500 transition-transform ${
                isHistoryOpen ? 'transform rotate-180' : ''
              }`}
            />
          </div>

          {isHistoryOpen && (
            <>
              {billingData.length === 0 ? (
                <div className="text-center py-16 bg-gray-50/50">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">
                    No billing history found
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {billingData.map((record) => (
                    <div
                      key={record._id}
                      className="px-6 py-5 flex items-center justify-between flex-wrap gap-4 group hover:bg-blue-50/70 transition-colors duration-200"
                    >
                      <div className="flex items-start gap-4">
                        {getStatusIcon(record.isActive)}

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {record.billingVariant.period} Plan
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                                record.isActive,
                              )}`}
                            >
                              {getStatusText(record.isActive)}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              **Start:** {formatDate(record.startDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              **End:** {formatDate(record.endDate)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            ID: {record.paymentId}
                          </p>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(record.amountPaid, record.currency)}
                        </p>
                        <p className="text-sm text-gray-600 capitalize">
                          <span className="font-medium">
                            {record.paymentStatus}
                          </span>{' '}
                          • {record.paymentGateway}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(record.createdAt)}
                        </p>
                        <button className="text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                          View Receipt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Sleek Loading/Placeholder State (Example) */}
        {isLoading && (
          <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200 animate-pulse">
            <p className="text-yellow-700 font-medium">
              Loading subscription details...
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Old UI
  // return (
  //   <div className="min-h-[80vh] px-4 py-10 bg-gray-50">
  //     <div className="max-w-6xl mx-auto space-y-10">
  //       {/* Header */}
  // <div className="mb-12">
  //   <div className="flex items-center gap-3 mb-4">
  //     <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
  //       <CreditCard className="w-8 h-8 text-white" />
  //     </div>
  //     <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 via-cyan-700 to-blue-500 bg-clip-text text-transparent">
  //       Billing & Subscriptions
  //     </h1>
  //   </div>
  //   <p className="text-slate-400 text-lg">
  //     Manage your plans and payment history
  //   </p>
  // </div>

  //       {/* Current Plan */}
  //       <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 md:p-8 transition-all hover:shadow-lg">
  //         <div className="flex items-center justify-between flex-wrap gap-4">
  //           <div className="space-y-2">
  //             <h2 className="text-xl font-semibold text-gray-900">
  //               Current Plan
  //             </h2>

  //             {activeRecord ? (
  //               <div className="flex items-center gap-3">
  //                 <div className="flex items-center gap-2">
  //                   <CreditCard className="w-6 h-6 text-blue-600" />
  //                   <span className="text-lg font-medium">
  //                     {activeRecord.billingVariant.period} Plan
  //                   </span>
  //                 </div>

  //                 <span className="px-3 py-1 text-sm rounded-full font-medium bg-green-100 text-green-700 border border-green-200">
  //                   Active
  //                 </span>
  //               </div>
  //             ) : (
  //               <p className="text-gray-500">No active subscription</p>
  //             )}
  //           </div>

  //           <div className="text-right">
  //             <p className="text-3xl font-bold text-gray-900">
  //               {activeRecord
  //                 ? formatCurrency(
  //                     activeRecord.amountPaid,
  //                     activeRecord.currency,
  //                   )
  //                 : 'Free'}
  //             </p>
  //             <p className="text-sm text-gray-500">
  //               {activeRecord?.billingVariant.period || 'No Plan'}
  //             </p>
  //           </div>
  //         </div>
  //       </div>

  //       {/* Billing History */}
  //       <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
  //         <div className="px-6 py-4 border-b border-gray-200">
  //           <h2 className="text-xl font-semibold text-gray-900">
  //             Billing History
  //           </h2>
  //         </div>

  //         {billingData.length === 0 ? (
  // <div className="text-center py-16">
  //   <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
  //   <p className="text-gray-500 text-lg">No billing history found</p>
  // </div>
  //         ) : (
  //           <div>
  //             {billingData.map((record) => (
  //               <div
  //                 key={record._id}
  //                 className="px-6 py-5 hover:bg-gray-50 transition-all border-b border-gray-100 last:border-b-0"
  //               >
  //                 <div className="flex items-center justify-between flex-wrap gap-4">
  //                   <div className="flex items-start gap-4">
  //                     {getStatusIcon(record.isActive)}

  //                     <div>
  //                       <div className="flex items-center gap-2">
  //                         <h3 className="font-semibold text-gray-900">
  //                           {record.billingVariant.period} Plan
  //                         </h3>

  //                         <span
  //                           className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
  //                             record.isActive,
  //                           )}`}
  //                         >
  //                           {getStatusText(record.isActive)}
  //                         </span>
  //                       </div>

  //                       <div className="flex items-center gap-5 text-sm text-gray-500 mt-2">
  //                         <span className="flex items-center gap-1">
  //                           <Calendar className="w-4 h-4" />
  //                           Start: {formatDate(record.startDate)}
  //                         </span>

  //                         <span className="flex items-center gap-1">
  //                           <Clock className="w-4 h-4" />
  //                           End: {formatDate(record.endDate)}
  //                         </span>
  //                       </div>

  //                       <p className="text-xs text-gray-400 mt-1">
  //                         Payment ID: {record.paymentId}
  //                       </p>
  //                     </div>
  //                   </div>

  //                   <div className="text-right">
  //                     <p className="text-xl font-semibold text-gray-900">
  //                       {formatCurrency(record.amountPaid, record.currency)}
  //                     </p>
  //                     <p className="text-sm text-gray-500 capitalize">
  //                       {record.paymentStatus} • {record.paymentGateway}
  //                     </p>
  //                     <p className="text-xs text-gray-400 mt-1">
  //                       {formatDate(record.createdAt)}
  //                     </p>
  //                   </div>
  //                 </div>
  //               </div>
  //             ))}
  //           </div>
  //         )}
  //       </div>

  //       {/* Stats Section */}
  //       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  //         {/* Total Subscriptions */}
  //         <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 flex items-center gap-4 hover:shadow-lg transition-all">
  //           <div className="p-3 rounded-lg bg-blue-100">
  //             <CreditCard className="w-6 h-6 text-blue-700" />
  //           </div>
  //           <div>
  //             <p className="text-sm text-gray-600">Total Subscriptions</p>
  //             <p className="text-2xl font-bold text-gray-900">
  //               {billingData.length}
  //             </p>
  //           </div>
  //         </div>

  //         {/* Active Subscriptions */}
  //         <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 flex items-center gap-4 hover:shadow-lg transition-all">
  //           <div className="p-3 rounded-lg bg-green-100">
  //             <CheckCircle className="w-6 h-6 text-green-700" />
  //           </div>
  //           <div>
  //             <p className="text-sm text-gray-600">Active Subscriptions</p>
  //             <p className="text-2xl font-bold text-gray-900">
  //               {activeSubscriptions}
  //             </p>
  //           </div>
  //         </div>

  //         {/* Total Paid */}
  //         <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 flex items-center gap-4 hover:shadow-lg transition-all">
  //           <div className="p-3 rounded-lg bg-purple-100">
  //             <DollarSign className="w-6 h-6 text-purple-700" />
  //           </div>
  //           <div>
  //             <p className="text-sm text-gray-600">Total Paid</p>
  //             <p className="text-2xl font-bold text-gray-900">
  //               {formatCurrency(totalPaid, 'usd')}
  //             </p>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
}
