'use client';

import { useCallback, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { RootState } from '@/redux/rootReducer';
import {
  earnCreditRequest,
  getCreditRequest,
  getTotalCreditRequest,
} from '@/redux/reducers/creditReducer';
import apiInstance from '@/services/api';
import { PendingClaim } from '@/types/credits';
import { CartItem } from '@/components/credits/SpendCreditsSection';

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
  'youtube.com',
];

const isSocialUrl = (url: string) => {
  try {
    const host = new URL(url).hostname;
    return SOCIAL_DOMAINS.some((d) => host.includes(d));
  } catch {
    return false;
  }
};

export function useCredits() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { claimCredits, loading, error } = useSelector(
    (state: RootState) => state.credit,
  );

  const [claiming, setClaiming] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [spending, setSpending] = useState(false);

  const data = claimCredits?.data || null;

  /* ------------------ fetch ------------------ */

  useEffect(() => {
    dispatch(getTotalCreditRequest());
    dispatch(getCreditRequest());
    // dispatch(earnCreditRequest());
  }, [dispatch]);
  // console.log('error from useCredits ', error);
  // useEffect(() => {
  //   if (error) {
  //     toast({
  //       variant: 'destructive',
  //       title: 'Error',
  //       description: 'Failed to fetch your credits',
  //     });
  //   }
  // }, [error]);

  useEffect(() => {
    if (claimCredits) {
      setClaiming({});
      setRefreshing(false);
    }
  }, [claimCredits]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    dispatch(getTotalCreditRequest());
    dispatch(getCreditRequest());
  }, [dispatch]);

  /* ------------------ actions ------------------ */

  const claimCredit = async (p: any) => {
    if (p.action === 'DAILY_CHECKIN') {
      window.dispatchEvent(new CustomEvent('open-streak-dropdown'));
    }

    const targetUrl = p.url;
    if (!targetUrl) return;

    if (isSocialUrl(targetUrl)) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      router.push(targetUrl);
    }

    if (!ALLOWED_SOCIAL_ACTIONS.has(p.action)) return;

    try {
      setClaiming((prev) => ({ ...prev, [p.action]: true }));

      dispatch(
        earnCreditRequest({
          action: p.action,
          meta: p.meta || {},
        }),
      );
    } catch (err) {
      setClaiming((prev) => ({ ...prev, [p.action]: false }));
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to claim credits',
      });
    }
  };

  const checkout = async (items: CartItem[], totalCost: number) => {
    if (!items.length) return;

    try {
      setSpending(true);
      await apiInstance.post('/students/credits/checkout', { items });

      refresh();

      toast({
        title: 'Credits spent successfully',
        description: `You spent ${totalCost} credits.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Checkout failed',
        description:
          error?.response?.data?.message ||
          'Failed to process checkout. Please try again.',
      });
    } finally {
      setSpending(false);
    }
  };

  /* ------------------ safe data ------------------ */

  const safeData = data || {
    balance: 0,
    totalEarned: 0,
    totalSpent: 0,
    transactionsCount: 0,
    transactions: [],
    pendingClaims: [],
  };

  return {
    loading,
    refreshing,
    spending,
    claiming,

    refresh,
    claimCredit,
    checkout,

    ...safeData,
  };
}
