'use client';

import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
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
    // if (amount === 0) return 'Free';

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

  return (
    <div className="min-h-[80vh] px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Billing & Subscriptions
          </h1>
          <p className="text-gray-600">
            Manage your subscription plans and view billing history
          </p>
        </div>

        {/* Current Plan Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Current Plan
              </h2>
              {activeRecord ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                    <span className="text-lg font-medium text-gray-900">
                      {activeRecord.billingVariant.period} Plan
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      true,
                    )}`}
                  >
                    Active
                  </span>
                </div>
              ) : (
                <p className="text-gray-500">No active subscription</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {console.log('activeRecord', activeRecord?.amountPaid)}
                {activeRecord
                  ? formatCurrency(
                      activeRecord.amountPaid,
                      activeRecord.currency,
                    )
                  : 'Free'}
              </p>
              <p className="text-gray-500 text-sm">
                {activeRecord?.billingVariant.period || 'No plan'}
              </p>
            </div>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Billing History
            </h2>
          </div>

          <div className="overflow-hidden">
            {billingData.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No billing history found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {billingData.map((record) => (
                  <div
                    key={record._id}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(record.isActive)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">
                              {record.billingVariant.period} Plan
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                record.isActive,
                              )}`}
                            >
                              {getStatusText(record.isActive)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Start: {formatDate(record.startDate)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>End: {formatDate(record.endDate)}</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Payment ID: {record.paymentId}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(record.amountPaid, record.currency)}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">
                          {record.paymentStatus} • {record.paymentGateway}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(record.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Subscriptions
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {billingData.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Subscriptions
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeSubscriptions}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalPaid, 'usd')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
