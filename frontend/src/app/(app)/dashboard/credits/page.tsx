'use client';

import { toast } from '@/hooks/use-toast';
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import {
  earnCreditRequest,
  getCreditRequest,
  getTotalCreditRequest,
} from '@/redux/reducers/creditReducer';

import { StatsGrid } from '@/components/credits/StatsGrid';
import { PendingClaimsSection } from '@/components/credits/PendingClaimsSection';
import { TransactionsSection } from '@/components/credits/TransactionsSection';
import { CreditsFooterActions } from '@/components/credits/CreditsFooterActions';
import { HowToClaimModal } from '@/components/credits/HowToClaimModal';
import {
  SpendCreditsSection,
  CartItem,
} from '@/components/credits/SpendCreditsSection';
import apiInstance from '@/services/api';

// 4 main cards = 4 possible views
export type TabKey = 'balance' | 'earned' | 'spent' | 'transactions';

export interface PendingClaim {
  action: string;
  reason: string;
  credits: number;
  lastClaimedAt?: string;
  url?: string;
  meta?: any;
  eligible?: boolean;
}

export interface CreditTransaction {
  kind: string;
  createdAt: string;
  type: 'EARN' | 'SPEND';
  amount: number;
  balanceAfter: number;
}

const ALLOWED_SOCIAL_ACTIONS = new Set([
  'FOLLOW_LINKEDIN',
  'FOLLOW_INSTAGRAM',
  'FOLLOW_FACEBOOK',
  'FOLLOW_YOUTUBE',
  'FOLLOW_TIKTOK',
  'SHARE_SOCIAL_CONTENT',
  'LIKE_COMMENT_SHARE',
]);

const SOCIAL_DOMAINS = [
  'instagram.com',
  'facebook.com',
  'twitter.com',
  'linkedin.com',
  'tiktok.com',
];

const isSocialUrl = (url: string) => {
  try {
    const host = new URL(url).hostname;
    return SOCIAL_DOMAINS.some((d) => host.includes(d));
  } catch {
    return false;
  }
};

export default function CreditsPage() {
  const [claiming, setClaiming] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [howToClaimOpen, setHowToClaimOpen] = useState(false);
  const [howToClaimData, setHowToClaimData] = useState<{
    title: string;
    steps: string[];
  } | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>('balance');
  const [spending, setSpending] = useState(false); // ✅ needed for SpendCreditsSection

  const router = useRouter();
  const dispatch = useDispatch();

  const { claimCredits, credit, loading, error } = useSelector(
    (state: RootState) => state.credit,
  );

  const data = claimCredits?.data || null;

  useEffect(() => {
    dispatch(getCreditRequest());
    dispatch(getTotalCreditRequest());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch your credits',
      });
    }
  }, [error]);

  useEffect(() => {
    if (claimCredits) {
      setClaiming({});
      setRefreshing(false);
    }
  }, [claimCredits]);

  const fetchSummary = useCallback(() => {
    dispatch(getCreditRequest());
    dispatch(getTotalCreditRequest());
  }, [dispatch]);

  const handleClaim = async (p: PendingClaim) => {
    const targetUrl = p.url;
    if (!targetUrl) return;

    if (isSocialUrl(targetUrl)) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      router.push(targetUrl);
    }

    if (!ALLOWED_SOCIAL_ACTIONS.has(p.action)) return;

    const actionKey = p.action;

    try {
      setClaiming((prev) => ({ ...prev, [actionKey]: true }));

      dispatch(
        earnCreditRequest({
          action: p.action,
          meta: p.meta || {},
        }),
      );
    } catch (err) {
      console.error(err);
      setClaiming((prev) => ({ ...prev, [actionKey]: false }));
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to claim credits',
      });
    }
  };

  const handleOpenHowToClaim = (actionKey: string) => {
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
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast({
      title: 'Copied!',
      description: 'Page URL copied to clipboard',
    });
  };

  // ✅ Proper checkout implementation: receives items + totalCost from SpendCreditsSection
  const handleCheckout = async (items: CartItem[], totalCost: number) => {
    if (!items.length) return;

    try {
      setSpending(true);

      const res = await apiInstance.post('/students/credits/checkout', {
        items,
      });

      const { data: resData } = res || {};
      const balance = resData?.data?.balance;
      const usageLimits = resData?.data?.usageLimits;

      // Optional: you can dispatch something to update Redux directly here.
      // For now, reuse your existing flow and refetch summary.
      fetchSummary();

      toast({
        title: 'Credits spent successfully',
        description: `You spent ${totalCost} credits.`,
      });
    } catch (error: any) {
      console.error('Checkout error:', error);
      const message =
        error?.response?.data?.message ||
        'Failed to process checkout. Please try again.';

      toast({
        variant: 'destructive',
        title: 'Checkout failed',
        description: message,
      });
    } finally {
      setSpending(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-gray-600">Loading your credits...</p>
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
  }: {
    balance: number;
    totalEarned: number;
    totalSpent: number;
    transactionsCount: number;
    transactions: CreditTransaction[];
    pendingClaims: PendingClaim[];
  } = data;

  const earnTransactions = transactions.filter((t) => t.type === 'EARN');
  const spendTransactions = transactions.filter((t) => t.type === 'SPEND');

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Credits Wallet
          </h1>
          <p className="text-gray-600">
            Manage your earnings and claim rewards
          </p>
        </div>

        <StatsGrid
          balance={balance}
          totalEarned={totalEarned}
          totalSpent={totalSpent}
          transactionsCount={transactionsCount}
          activeTab={activeTab}
          onChange={setActiveTab}
          pendingClaims={pendingClaims.length}
        />

        {activeTab === 'balance' && (
          <PendingClaimsSection
            pendingClaims={pendingClaims}
            claiming={claiming}
            onClaim={handleClaim}
            onOpenHowToClaim={handleOpenHowToClaim}
          />
        )}

        {activeTab === 'earned' && (
          <TransactionsSection transactions={earnTransactions} />
        )}

        {activeTab === 'spent' && (
          <>
            <SpendCreditsSection
              balance={balance}
              loading={spending}
              onCheckout={handleCheckout}
            />
            <TransactionsSection transactions={spendTransactions} />
          </>
        )}

        {activeTab === 'transactions' && (
          <TransactionsSection transactions={transactions} />
        )}

        <CreditsFooterActions
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchSummary();
          }}
          onShare={handleShare}
        />
      </div>

      <HowToClaimModal
        open={howToClaimOpen}
        data={howToClaimData}
        onClose={() => setHowToClaimOpen(false)}
      />
    </div>
  );
}
