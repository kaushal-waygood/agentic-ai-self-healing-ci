'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useCredits } from '@/hooks/useCredits';
import { StatsGrid } from '@/components/credits/StatsGrid';
import { PendingClaimsSection } from '@/components/credits/PendingClaimsSection';
import { TransactionsSection } from '@/components/credits/TransactionsSection';
import { CreditsFooterActions } from '@/components/credits/CreditsFooterActions';
import { HowToClaimModal } from '@/components/credits/HowToClaimModal';
import { SpendCreditsSection } from '@/components/credits/SpendCreditsSection';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader } from '@/components/Loader';

type TabKey = 'balance' | 'spent' | 'transactions';

export default function CreditsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
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

  const getTabFromUrl = useCallback((): TabKey => {
    const tab = searchParams.get('tab');
    if (tab === 'spent' || tab === 'transactions') {
      return tab;
    }
    return 'balance';
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState<TabKey>(getTabFromUrl);
  const [howToClaimOpen, setHowToClaimOpen] = useState(false);
  const [howToClaimData, setHowToClaimData] = useState<{
    title: string;
    steps: string[];
  } | null>(null);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);

    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);

    router.replace(`?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const urlTab = getTabFromUrl();
    if (urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [searchParams, getTabFromUrl, activeTab]);

  if (loading && !transactions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center -mt-16">
        <Loader
          message="Loading Credits…"
          imageClassName="w-6 h-6"
          textClassName="text-sm"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <div className="flex items-center justify-between ">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-headingTextPrimary">
                Credits Wallet
              </h1>
            </div>
            <div>
              <CreditsFooterActions
                refreshing={refreshing}
                onRefresh={refresh}
                onShare={() =>
                  navigator.clipboard.writeText(window.location.href)
                }
              />
            </div>
          </div>

          <p className="text-gray-600">
            Track your balance, earn rewards, and purchase services.
          </p>
        </div>

        <StatsGrid
          balance={balance}
          totalEarned={totalEarned}
          totalSpent={totalSpent}
          transactionsCount={transactionsCount}
          activeTab={activeTab}
          // onChange={setActiveTab}
          onChange={handleTabChange}
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
