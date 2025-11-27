'use client';

import { CreditTransaction } from '@/types/credits';

interface TransactionsSectionProps {
  transactions: CreditTransaction[];
}

export function TransactionsSection({
  transactions,
}: TransactionsSectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Recent Transactions
      </h2>
      {transactions.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
          <div className="text-gray-500">No transactions yet</div>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto pr-2">
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
  );
}
