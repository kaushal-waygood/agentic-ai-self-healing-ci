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
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import { Loader } from '@/components/Loader';
import { useRouter } from 'next/navigation';

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
  const [billingData, setBillingData] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const {
    planType,
    isActive,
    usageData: usageCounters,
    usageLimits,
  } = useSelector((state: RootState) => state.plan);

  const activeRecord = billingData.find((record) => record.isActive);

  const plan = {
    planType,
    isActive,
    usageCounters,
    usageLimits,
    endDate: activeRecord?.endDate,
  };

  // console.log('PLAN...', plan);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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

  const totalPaid = billingData.reduce(
    (sum, record) => sum + record.amountPaid,
    0,
  );
  const activeSubscriptions = billingData.filter(
    (record) => record.isActive,
  ).length;

  if (loading) {
    return <Loader message="BILLING INFO" classStyle="min-h-screen -mt-16" />;
  }

  return (
    <div className="min-h-screen bg-gray-100/50 p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-headingTextPrimary bg-clip-text text-transparent">
              Billing & Subscriptions
            </h1>
            <p className="text-slate-400 text-base md:text-lg">
              Manage your plans and payment history
            </p>
          </div>
          {/* <button
            onClick={() => setIsLoading(true)} // Example interactive element
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button> */}
        </div>

        {/* Stats Section - Elevated and Modern */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Total Subscriptions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-start gap-4 transition-all duration-300 transform hover:-translate-y-0.5">
            <div className="p-3 md:p-4 rounded-full bg-blue-50">
              <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                Total Subscriptions
              </p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                {billingData.length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-start gap-4 transition-all duration-300 transform hover:-translate-y-0.5">
            <div className="p-3 md:p-4 rounded-full bg-green-50">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                Active Subscriptions
              </p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                {activeSubscriptions}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-start gap-4 transition-all duration-300 transform hover:-translate-y-0.5">
            <div className="p-3 md:p-4 rounded-full bg-purple-50">
              <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                Total Paid
              </p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                {formatCurrency(totalPaid, 'inr')}
              </p>
            </div>
          </div>
        </div>

        {/* GRID LAYOUT FOR BOTH CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT CARD — PREMIUM UI */}
          <div className="bg-white rounded-xl border border-blue-200 p-6 flex flex-col justify-between h-full shadow-sm">
            {/* Top */}
            <div className="space-y-4">
              <p className="text-lg font-semibold text-blue-600">
                Your Active Membership
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                  {activeRecord?.billingVariant.period} Plan
                </h2>
                {activeRecord && (
                  <span className="px-3 py-1 text-sm rounded-full font-semibold bg-green-100 text-green-700 border border-green-300">
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
              <p className="text-4xl md:text-5xl font-extrabold text-blue-700">
                {activeRecord
                  ? formatCurrency(
                      activeRecord?.billingVariant.price.inr,
                      activeRecord.currency,
                    )
                  : '$0.00'}
              </p>

              <p className="text-sm text-gray-500 font-medium">
                {activeRecord?.billingVariant.period || 'Monthly'}
              </p>
            </div>
            {/* Button */}
            <button
              onClick={() => router.push('/dashboard/subscriptions')}
              className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 text-blue-600 border border-blue-400 rounded-lg hover:bg-blue-50 transition font-semibold"
            >
              Manage Subscription
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* RIGHT — PLAN DETAILS CARD */}
          <div className="w-full">
            {plan ? (
              <SubscriptionStatusCard plan={plan} />
            ) : (
              <Loader message="BILLING INFO" classStyle="min-h-screen -mt-16" />
            )}
          </div>
        </div>

        {/* Billing History - Collapsible/Interactive */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div
            className="px-4 py-5 md:px-6 border-b border-gray-200 flex justify-between items-center cursor-pointer"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          >
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Billing History ({billingData.length})
            </h2>
            <ChevronDown
              className={`w-6 h-6 text-gray-500 transition-transform ${
                isHistoryOpen ? 'rotate-180' : ''
              }`}
            />
          </div>

          {isHistoryOpen && (
            <div className="overflow-x-auto">
              {billingData.length === 0 ? (
                <div className="text-center py-16 bg-gray-50/50">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">
                    No billing history found
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 min-w-full">
                  {billingData.map((record) => (
                    <div
                      key={record._id}
                      className="px-4 py-5 md:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-blue-50/70 transition-colors duration-200"
                    >
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="mt-1">
                          {getStatusIcon(record.isActive)}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base md:text-lg font-semibold text-gray-900">
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

                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs md:text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              **Start:** {formatDate(record.startDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              **End:** {formatDate(record.endDate)}
                            </span>
                          </div>
                          <p className="text-[10px] md:text-xs text-gray-400 mt-2 break-all">
                            ID: {record.paymentId}
                          </p>
                        </div>
                      </div>

                      <div className="text-left md:text-right space-y-1 md:pl-0 pl-8">
                        <p className="text-lg md:text-xl font-bold text-gray-900">
                          {formatCurrency(record.amountPaid, record.currency)}
                        </p>
                        <p className="text-xs md:text-sm text-gray-600 capitalize">
                          <span className="font-medium">
                            {record.paymentStatus}
                          </span>{' '}
                          • {record.paymentGateway}
                        </p>
                        <p className="text-[10px] md:text-xs text-gray-400">
                          {formatDate(record.createdAt)}
                        </p>
                        {/* <button className="text-blue-600 text-sm font-medium md:opacity-0 md:group-hover:opacity-100 transition-opacity mt-1">
                          View Receipt
                        </button> */}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
