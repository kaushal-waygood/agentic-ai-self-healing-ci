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
import { SubscriptionStatusCard } from '../../components/dashboardPage';

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
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    const loadPlan = async () => {
      const res = await apiInstance.get('/plan/get-user-plan-type');
      setPlan(res.data.data);
    };
    loadPlan();
  }, []);

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
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        {/* <Loader2 className="w-10 h-10 animate-spin" /> */}
        <div>
          <img src="/logo.png" alt="" className="w-10 h-10 animate-bounce" />
        </div>

        <div className="text-lg">LOADING BILLING INFO... </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100/50 p-2 sm:p-3 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex justify-between flex-wrap items-center  border-b border-gray-200">
          <div className="">
            <div className="flex items-center gap-3 ">
              <h1 className=" py-1 text-4xl font-bold bg-headingTextPrimary bg-clip-text text-transparent">
                Billing & Subscriptions
              </h1>
            </div>
            <p className="text-slate-400 text-lg">
              Manage your plans and payment history
            </p>
          </div>
          <button
            onClick={() => setIsLoading(true)} // Example interactive element
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg  hover:bg-blue-50 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
        </div>

        {/* Stats Section - Elevated and Modern */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Subscriptions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-start gap-4   transition-all duration-300 transform hover:-translate-y-0.5">
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
          <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-start gap-4   transition-all duration-300 transform hover:-translate-y-0.5">
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
          <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-start gap-4   transition-all duration-300 transform hover:-translate-y-0.5">
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

        {/* GRID LAYOUT FOR BOTH CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT CARD — PREMIUM UI */}
          <div className="bg-white rounded-xl  border border-blue-200 p-6 flex flex-col justify-between h-full">
            {/* Top */}
            <div className="space-y-4">
              <p className="text-lg font-semibold text-blue-600">
                Your Active Membership
              </p>

              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-extrabold text-gray-900">
                  {activeRecord?.billingVariant.period} Plan
                </h2>

                {activeRecord && (
                  <span className="px-3 py-1 text-sm rounded-full font-semibold bg-green-100 text-green-700 border border-green-300 ">
                    <CheckCircle className="w-4 h-4 inline-block mr-1" />
                    Active
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Next renewal:{' '}
                <span className="font-medium text-gray-800">
                  {activeRecord ? formatDate(activeRecord.endDate) : 'N/A'}
                </span>
              </p>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-gray-200" />

            {/* Price Section */}
            <div className="space-y-1">
              <p className="text-5xl font-extrabold text-blue-700">
                {activeRecord
                  ? formatCurrency(
                      activeRecord?.billingVariant.price.usd,
                      activeRecord.currency,
                    )
                  : '$0.00'}
              </p>

              <p className="text-sm text-gray-500 font-medium">
                {activeRecord?.billingVariant.period || 'Monthly'}
              </p>
            </div>

            {/* Button */}
            <button className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 text-blue-600 border border-blue-400 rounded-lg hover:bg-blue-50 transition font-semibold">
              Manage Subscription
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* RIGHT — PLAN DETAILS CARD */}
          <div className="">
            {plan ? (
              <SubscriptionStatusCard plan={plan} />
            ) : (
              <div className="flex items-center flex-col justify-center ">
                {/* <Loader2 className="w-10 h-10 animate-spin" /> */}
                <div>
                  <img
                    src="/logo.png"
                    alt=""
                    className="w-10 h-10 animate-bounce"
                  />
                </div>
                <div className="text-lg">LOADING SUBSCRIPTION...</div>
              </div>
            )}
          </div>
        </div>

        {/* Billing History - Collapsible/Interactive */}
        <div className="bg-white rounded-lg  border border-gray-200 overflow-hidden">
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
}
