'use client';

import { toast } from '@/hooks/use-toast';
import apiInstance from '@/services/api';
import React, { useEffect, useState, useCallback } from 'react';

const API_BASE = ''; // e.g. 'https://api.example.com' or '' for same-origin

export default function CreditsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [claiming, setClaiming] = useState({}); // action -> boolean

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

  const handleClaim = async (action, meta = {}) => {
    if (!data || !data.userId) return;
    if (claiming[action]) return;
    setClaiming((s) => ({ ...s, [action]: true }));
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/v1/users/${data.userId}/earn`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, meta }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || JSON.stringify(json));
      }

      // Refresh summary after claiming
      await fetchSummary();
    } catch (err) {
      console.error('Claim error', err);
      setError(err.message || String(err));
    } finally {
      setClaiming((s) => ({ ...s, [action]: false }));
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2">Credits</h2>
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2">Credits</h2>
        <div className="text-red-600">Error: {error}</div>
        <button
          className="mt-4 px-3 py-2 border rounded"
          onClick={fetchSummary}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2">Credits</h2>
        <div>No data returned from server.</div>
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
    <div className="p-6 max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Wallet</h1>
        <p className="text-sm text-gray-600 mt-1">
          Balance: <span className="font-medium">{balance}</span> credits —
          Earned {totalEarned}, Spent {totalSpent} ({transactionsCount}{' '}
          transactions)
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Pending claims</h2>
        {pendingClaims.length === 0 ? (
          <div className="text-sm text-gray-600">
            No pending claims available.
          </div>
        ) : (
          <div className="grid gap-3">
            {pendingClaims.map((p, idx) => {
              const eligible = p.hasOwnProperty('eligible') ? p.eligible : true;
              const actionKey = p.action;
              return (
                <div
                  key={actionKey + idx}
                  className="p-3 border rounded flex items-start justify-between"
                >
                  <div>
                    <div className="font-medium">
                      {actionKey.replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{p.reason}</div>
                    <div className="mt-2 text-sm">
                      Credits:{' '}
                      <span className="font-semibold">{p.credits}</span>
                    </div>
                    {p.lastClaimedAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        Last claimed:{' '}
                        {new Date(p.lastClaimedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    <button
                      className={`px-4 py-2 rounded font-medium ${
                        eligible
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600 cursor-not-allowed'
                      }`}
                      disabled={!eligible || claiming[actionKey]}
                      onClick={() => handleClaim(actionKey, p.meta || {})}
                    >
                      {claiming[actionKey]
                        ? 'Claiming...'
                        : eligible
                        ? `Claim ${p.credits}`
                        : 'Not eligible'}
                    </button>
                    {/* For social follows we show a hint to verify */}
                    {actionKey.startsWith('FOLLOW_') && (
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          // optional: open social in new tab
                          alert(
                            'Open the social link in a new tab, follow, then come back and claim. Server-side verification recommended.',
                          );
                        }}
                        className="text-xs text-blue-600 mt-2"
                      >
                        How to claim
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Recent transactions</h2>
        {transactions.length === 0 ? (
          <div className="text-sm text-gray-600">No transactions yet.</div>
        ) : (
          <div className="space-y-2">
            {transactions.map((t, i) => (
              <div
                key={i}
                className="p-3 border rounded flex justify-between items-center"
              >
                <div>
                  <div className="text-sm font-medium">{t.kind}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(t.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-semibold ${
                      t.type === 'EARN' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {t.type === 'EARN' ? '+' : '-'}
                    {t.amount}
                  </div>
                  <div className="text-xs text-gray-500">
                    Balance: {t.balanceAfter}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="mt-6">
        <button
          className="px-4 py-2 border rounded mr-3"
          onClick={fetchSummary}
        >
          Refresh
        </button>
        <button
          className="px-4 py-2 border rounded"
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            alert('Copied page URL');
          }}
        >
          Share
        </button>
      </footer>
    </div>
  );
}
