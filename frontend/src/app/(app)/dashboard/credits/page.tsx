'use client';

import React, { useState } from 'react';
import { useCredits } from '@/hooks/useCredits';
import { StatsGrid } from '@/components/credits/StatsGrid';
import { PendingClaimsSection } from '@/components/credits/PendingClaimsSection';
import { TransactionsSection } from '@/components/credits/TransactionsSection';
import { CreditsFooterActions } from '@/components/credits/CreditsFooterActions';
import { HowToClaimModal } from '@/components/credits/HowToClaimModal';
import { SpendCreditsSection } from '@/components/credits/SpendCreditsSection';

type TabKey = 'balance' | 'spent' | 'transactions';

export default function CreditsPage() {
  const {
    balance,
    totalEarned,
    totalSpent,
    transactionsCount,
    transactions,
    pendingClaims,

    loading,
    refreshing,
    spending,
    claiming,

    refresh,
    claimCredit,
    checkout,
  } = useCredits();

  const [activeTab, setActiveTab] = useState<TabKey>('balance');
  const [howToClaimOpen, setHowToClaimOpen] = useState(false);
  const [howToClaimData, setHowToClaimData] = useState<{
    title: string;
    steps: string[];
  } | null>(null);

  if (loading && !transactions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Credits…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between">
          <div>
            <h1 className="text-4xl font-bold">Credits Wallet</h1>
            <p className="text-gray-600">
              Track your balance, earn rewards, and purchase services.
            </p>
          </div>

          <CreditsFooterActions
            refreshing={refreshing}
            onRefresh={refresh}
            onShare={() => navigator.clipboard.writeText(window.location.href)}
          />
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
            onClaim={claimCredit}
            onOpenHowToClaim={(actionKey) => {
              setHowToClaimData({
                title: actionKey.replace(/_/g, ' '),
                steps: [
                  'Open the social link in a new tab.',
                  'Follow / Subscribe as required.',
                  'Return back to ZobsAI.',
                  'Click the "Claim" button.',
                ],
              });
              setHowToClaimOpen(true);
            }}
          />
        )}

        {activeTab === 'spent' && (
          <SpendCreditsSection
            balance={balance}
            loading={spending}
            onCheckout={checkout}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsSection transactions={transactions} />
        )}
      </div>

      <HowToClaimModal
        open={howToClaimOpen}
        data={howToClaimData}
        onClose={() => setHowToClaimOpen(false)}
      />
    </div>
  );
}
