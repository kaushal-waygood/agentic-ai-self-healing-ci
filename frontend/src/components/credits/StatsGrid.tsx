'use client';

import { Zap, TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface StatsGridProps {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  transactionsCount: number;
  activeTab: 'balance' | 'earned' | 'spent' | 'transactions';
  onChange: (tab: 'balance' | 'earned' | 'spent' | 'transactions') => void;
  pendingClaims: number;
}

const baseCard =
  'cursor-pointer rounded-xl p-6 border transition-all duration-300 hover:shadow-lg';
const activeCard = 'ring-2 ring-offset-2 ring-blue-500 shadow-lg scale-[1.01]';

export function StatsGrid({
  balance,
  totalEarned,
  totalSpent,
  transactionsCount,
  activeTab,
  onChange,
  pendingClaims,
}: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Balance -> Pending Claims */}
      <div
        onClick={() => onChange('balance')}
        className={`${baseCard} bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:border-blue-300 ${
          activeTab === 'balance' ? activeCard : ''
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 text-sm font-medium">Balance</span>
          <Zap className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-3xl font-bold text-blue-700">{balance}</div>
        <p className="text-xs text-gray-600 mt-1">Available credits</p>
        {pendingClaims > 0 && (
          <p className="mt-2 text-[11px] text-blue-700/70">
            {pendingClaims} pending claim
            {pendingClaims > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Earned -> Earn transactions */}
      <div
        onClick={() => onChange('earned')}
        className={`${baseCard} bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:border-green-300 ${
          activeTab === 'earned' ? activeCard : ''
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 text-sm font-medium">Earned</span>
          <TrendingUp className="w-4 h-4 text-green-600" />
        </div>
        <div className="text-3xl font-bold text-green-700">{totalEarned}</div>
        <p className="text-xs text-gray-600 mt-1">Total earned</p>
        <p className="mt-2 text-[11px] text-green-700/70">
          Click to view earn history
        </p>
      </div>

      {/* Spent -> Spend transactions */}
      <div
        onClick={() => onChange('spent')}
        className={`${baseCard} bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:border-red-300 ${
          activeTab === 'spent' ? activeCard : ''
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 text-sm font-medium">Spent</span>
          <TrendingDown className="w-4 h-4 text-red-600" />
        </div>
        <div className="text-3xl font-bold text-red-700">{totalSpent}</div>
        <p className="text-xs text-gray-600 mt-1">Total spent</p>
        <p className="mt-2 text-[11px] text-red-700/70">
          Click to view spend history
        </p>
      </div>

      {/* Transactions -> All transactions */}
      <div
        onClick={() => onChange('transactions')}
        className={`${baseCard} bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:border-purple-300 ${
          activeTab === 'transactions' ? activeCard : ''
        }`}
      >
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
        <p className="mt-2 text-[11px] text-purple-700/70">
          Click to view all transactions
        </p>
      </div>
    </div>
  );
}
