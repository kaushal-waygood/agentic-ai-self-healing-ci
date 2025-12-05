'use client';

import { useState, useMemo } from 'react';
import { CreditTransaction } from '@/types/credits';
import { ArrowDownLeft, ArrowUpRight, Filter, LayoutList } from 'lucide-react';

interface TransactionsSectionProps {
  transactions: CreditTransaction[];
}

type FilterType = 'ALL' | 'EARN' | 'SPEND';

export function TransactionsSection({
  transactions,
}: TransactionsSectionProps) {
  const [filter, setFilter] = useState<FilterType>('ALL');

  const filteredTransactions = useMemo(() => {
    if (filter === 'ALL') return transactions;
    return transactions.filter((t) => t.type === filter);
  }, [transactions, filter]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header & Sub-tabs */}
      <div className="border-b border-gray-200 bg-gray-50/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <LayoutList className="w-5 h-5 text-gray-500" />
          Transaction History
        </h2>

        <div className="flex p-1 bg-gray-200/60 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              filter === 'ALL'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('EARN')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
              filter === 'EARN'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-600 hover:text-green-700 hover:bg-gray-200/50'
            }`}
          >
            Earned
          </button>
          <button
            onClick={() => setFilter('SPEND')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
              filter === 'SPEND'
                ? 'bg-white text-red-700 shadow-sm'
                : 'text-gray-600 hover:text-red-700 hover:bg-gray-200/50'
            }`}
          >
            Spent
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[600px] overflow-y-auto">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
              <Filter className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">
              No transactions found
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              There are no{' '}
              {filter.toLowerCase() !== 'all' ? filter.toLowerCase() : ''}{' '}
              transactions to display.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTransactions.map((t, i) => {
              const isEarn = t.type === 'EARN';
              return (
                <div
                  key={i}
                  className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isEarn
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {isEarn ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 capitalize">
                        {t.kind.replace(/_/g, ' ').toLowerCase()}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {new Date(t.createdAt).toLocaleDateString()} at{' '}
                        {new Date(t.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-bold ${
                        isEarn ? 'text-green-600' : 'text-gray-900'
                      }`}
                    >
                      {isEarn ? '+' : '-'}
                      {t.amount}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 group-hover:text-gray-600 transition-colors">
                      Bal: {t.balanceAfter}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
