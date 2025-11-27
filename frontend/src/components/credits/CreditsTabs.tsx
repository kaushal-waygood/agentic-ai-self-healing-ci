'use client';

import { Zap, Clock } from 'lucide-react';
import { TabKey } from '@/types/credits';

interface CreditsTabsProps {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
}

export function CreditsTabs({ activeTab, onChange }: CreditsTabsProps) {
  return (
    <div className="mb-6 border-b border-gray-200">
      <nav className="flex gap-4">
        <button
          type="button"
          onClick={() => onChange('pending')}
          className={`pb-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'pending'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } flex items-center gap-2`}
        >
          <Zap className="w-4 h-4" />
          Pending Claims
        </button>
        <button
          type="button"
          onClick={() => onChange('transactions')}
          className={`pb-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'transactions'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } flex items-center gap-2`}
        >
          <Clock className="w-4 h-4" />
          Recent Transactions
        </button>
      </nav>
    </div>
  );
}
