'use client';

import { toast } from '@/hooks/use-toast';
import apiInstance from '@/services/api';
import Image from 'next/image';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Copy,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const API_BASE = 'http://127.0.0.1:8080';

export default function CreditsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [claiming, setClaiming] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [howToClaimOpen, setHowToClaimOpen] = useState(false);
  const [howToClaimData, setHowToClaimData] = useState(null);

  console.log(data);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiInstance(`/students/credits`);
      if (res.status !== 200) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch credits',
        });
      }
      const json = res.data.data;
      setData(json);
    } catch (err) {
      console.error(err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const router = useRouter();

  const handleClaim = async (action, meta = {}, fallbackUrl = null) => {
    router.push(action.url);
  };

  if (loading) {
    return (
      <div className="flex items-center flex-col justify-center min-h-[80vh]">
        <div>
          <Image
            src="/logo.png"
            width={100}
            height={100}
            alt=""
            className="w-10 h-10 animate-bounce"
          />
        </div>

        <div className="text-lg">LOADING YOUR WALLET...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Error Loading Credits
            </h2>
            <div className="text-red-600 mb-4">{error}</div>
            <button
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              onClick={fetchSummary}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-gray-600">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  const {
    balance = 0,
    totalEarned = 0,
    totalSpent = 0,
    transactionsCount = 0,
    transactions = [],
    pendingClaims = [],
  } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Credits Wallet
          </h1>
          <p className="text-gray-600">
            Manage your earnings and claim rewards
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Balance</span>
              <Zap className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-700">{balance}</div>
            <p className="text-xs text-gray-600 mt-1">Available credits</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 hover:shadow-lg hover:border-green-300 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Earned</span>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-700">
              {totalEarned}
            </div>
            <p className="text-xs text-gray-600 mt-1">Total earned</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-6 hover:shadow-lg hover:border-red-300 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Spent</span>
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-red-700">{totalSpent}</div>
            <p className="text-xs text-gray-600 mt-1">Total spent</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 hover:shadow-lg hover:border-purple-300 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">
                Transactions
              </span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-700">
              {transactionsCount}
            </div>
            <p className="text-xs text-gray-600 mt-1">Total transactions</p>
          </div>
        </div>

        {/* Pending Claims */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Pending Claims
          </h2>
          {pendingClaims.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
              <div className="text-gray-500">
                No pending claims available at the moment
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingClaims.map((p, idx) => {
                const eligible = p.hasOwnProperty('eligible')
                  ? p.eligible
                  : true;
                const actionKey = p.action;
                return (
                  <div
                    key={actionKey + idx}
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-gray-300 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 mb-1 capitalize">
                          {actionKey.replace(/_/g, ' ').toLowerCase()}
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          {p.reason}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 text-sm">
                              Reward:
                            </span>
                            <span className="font-bold text-amber-600 text-lg">
                              +{p.credits}
                            </span>
                          </div>
                          {p.lastClaimedAt && (
                            <div className="text-xs text-gray-500">
                              Last:{' '}
                              {new Date(p.lastClaimedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                            eligible
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-400/30 active:scale-95'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                          disabled={!eligible || claiming[actionKey]}
                          onClick={() => handleClaim(p, p.meta || {})}
                        >
                          {claiming[actionKey] ? (
                            <span className="flex items-center gap-2">
                              <span className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin"></span>
                              Claiming...
                            </span>
                          ) : eligible ? (
                            `Claim ${p.credits}`
                          ) : (
                            'Not eligible'
                          )}
                        </button>
                        {actionKey.startsWith('FOLLOW_') && (
                          // <button
                          //   onClick={(e) => {
                          //     e.preventDefault();
                          //     alert(
                          //       'Open the social link in a new tab, follow, then come back and claim.',
                          //     );
                          //   }}
                          //   className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                          // >
                          //   How to claim?
                          // </button>

                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setHowToClaimData({
                                title: actionKey.replace(/_/g, ' '),
                                steps: [
                                  'Open the social link in a new tab.',
                                  'Follow / Subscribe as required.',
                                  'Return back to ZobsAI.',
                                  'Click the "Claim" button to receive credits.',
                                ],
                              });
                              setHowToClaimOpen(true);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            How to claim?
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Transactions
          </h2>
          {transactions.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
              <div className="text-gray-500">No transactions yet</div>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {transactions.map((t, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all duration-300 flex justify-between items-center"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900 capitalize">
                      {t.kind.toLowerCase()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(t.createdAt).toLocaleDateString()} at{' '}
                      {new Date(t.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-bold text-lg ${
                        t.type === 'EARN' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {t.type === 'EARN' ? '+' : '-'}
                      {t.amount}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Balance: {t.balanceAfter}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchSummary().then(() => setRefreshing(false));
            }}
            className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-all duration-300 flex items-center gap-2 border border-gray-300 hover:border-gray-400 hover:shadow-md"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </button>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              toast({
                title: 'Copied!',
                description: 'Page URL copied to clipboard',
              });
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg hover:shadow-blue-400/30 text-white rounded-lg transition-all duration-300 flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>
      {/* HOW-TO-CLAIM MODAL */}
      {howToClaimOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md p-6 animate-in zoom-in-95 duration-300 relative">
            {/* Close Button */}
            <button
              onClick={() => setHowToClaimOpen(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition"
            >
              ✕
            </button>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4 capitalize bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {howToClaimData?.title || 'How to Claim'}
            </h2>

            {/* Steps */}
            <div className="space-y-4">
              {howToClaimData?.steps?.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="h-7 w-7 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold shadow-md">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 text-sm font-medium">{step}</p>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              onClick={() => setHowToClaimOpen(false)}
              className="w-full mt-6 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-700 text-white font-semibold shadow-md hover:shadow-xl active:scale-95 transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
