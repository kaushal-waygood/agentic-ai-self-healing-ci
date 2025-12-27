// // 'use client';

// import { Zap, TrendingUp, TrendingDown, Clock } from 'lucide-react';

// interface StatsGridProps {
//   balance: number;
//   totalEarned: number;
//   totalSpent: number;
//   transactionsCount: number;
//   activeTab: 'balance' | 'earned' | 'spent' | 'transactions';
//   onChange: (tab: 'balance' | 'earned' | 'spent' | 'transactions') => void;
//   pendingClaims: number;
// }

// const baseCard =
//   'cursor-pointer rounded-xl border transition-all duration-300 hover:shadow-lg p-4 sm:p-6';
// const activeCard = 'ring-2 ring-offset-2 ring-blue-500 shadow-lg scale-[1.01]';

// export function StatsGrid({
//   balance,
//   totalEarned,
//   totalSpent,
//   transactionsCount,
//   activeTab,
//   onChange,
//   pendingClaims,
// }: StatsGridProps) {
//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//       {/* Balance */}
//       <div
//         onClick={() => onChange('balance')}
//         className={`${baseCard} hover:border-blue-300 ${
//           activeTab === 'balance' ? activeCard : ''
//         }`}
//       >
//         <div className="flex items-center justify-between mb-2">
//           <span className="text-gray-600 text-sm font-medium">Balance</span>
//           <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
//         </div>
//         <div className="text-2xl sm:text-3xl font-bold text-blue-700">
//           {balance}
//         </div>
//         <p className="text-xs text-gray-600 mt-1">Available credits</p>

//         {pendingClaims > 0 && (
//           <p className="mt-2 text-[11px] text-blue-700/70">
//             {pendingClaims} pending claim
//             {pendingClaims > 1 ? 's' : ''}
//           </p>
//         )}
//       </div>

//       {/* Earned */}
//       <div
//         onClick={() => onChange('earned')}
//         className={`${baseCard} hover:border-green-300 ${
//           activeTab === 'earned' ? activeCard : ''
//         }`}
//       >
//         <div className="flex items-center justify-between mb-2">
//           <span className="text-gray-600 text-sm font-medium">Earned</span>
//           <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
//         </div>
//         <div className="text-2xl sm:text-3xl font-bold text-green-700">
//           {totalEarned}
//         </div>
//         <p className="text-xs text-gray-600 mt-1">Total earned</p>
//         <p className="mt-2 text-[11px] text-green-700/70">
//           Click to view earn history
//         </p>
//       </div>

//       {/* Spent */}
//       <div
//         onClick={() => onChange('spent')}
//         className={`${baseCard} hover:border-red-300 ${
//           activeTab === 'spent' ? activeCard : ''
//         }`}
//       >
//         <div className="flex items-center justify-between mb-2">
//           <span className="text-gray-600 text-sm font-medium">Spent</span>
//           <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
//         </div>
//         <div className="text-2xl sm:text-3xl font-bold text-red-700">
//           {totalSpent}
//         </div>
//         <p className="text-xs text-gray-600 mt-1">Total spent</p>
//         <p className="mt-2 text-[11px] text-red-700/70">
//           Click to view spend history
//         </p>
//       </div>

//       {/* Transactions */}
//       <div
//         onClick={() => onChange('transactions')}
//         className={`${baseCard} hover:border-purple-300 ${
//           activeTab === 'transactions' ? activeCard : ''
//         }`}
//       >
//         <div className="flex items-center justify-between mb-2">
//           <span className="text-gray-600 text-sm font-medium">
//             Transactions
//           </span>
//           <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
//         </div>
//         <div className="text-2xl sm:text-3xl font-bold text-purple-700">
//           {transactionsCount}
//         </div>
//         <p className="text-xs text-gray-600 mt-1">Total transactions</p>
//         <p className="mt-2 text-[11px] text-purple-700/70">
//           Click to view all transactions
//         </p>
//       </div>
//     </div>
//   );
// }

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

export function StatsGrid({
  balance,
  totalEarned,
  totalSpent,
  transactionsCount,
  activeTab,
  onChange,
  pendingClaims,
}: StatsGridProps) {
  const statsMap = {
    balance: {
      label: 'Balance',
      value: balance,
      desc: 'Available credits',
      icon: <Zap className="w-5 h-5 text-blue-600" />,
      color: 'text-blue-700',
      extra:
        pendingClaims > 0
          ? `${pendingClaims} pending claim${pendingClaims > 1 ? 's' : ''}`
          : null,
    },
    earned: {
      label: 'Earned',
      value: totalEarned,
      desc: 'Total earned',
      icon: <TrendingUp className="w-5 h-5 text-green-600" />,
      color: 'text-green-700',
      extra: 'Click to view earn history',
    },
    spent: {
      label: 'Spent',
      value: totalSpent,
      desc: 'Total spent',
      icon: <TrendingDown className="w-5 h-5 text-red-600" />,
      color: 'text-red-700',
      extra: 'Click to view spend history',
    },
    transactions: {
      label: 'Transactions',
      value: transactionsCount,
      desc: 'Total transactions',
      icon: <Clock className="w-5 h-5 text-purple-600" />,
      color: 'text-purple-700',
      extra: 'Click to view all transactions',
    },
  };

  const activeStat = statsMap[activeTab];

  return (
    <>
      {/* ================= MOBILE SEGMENTED CONTROL ================= */}
      <div className="sm:hidden mb-6  ">
        {/* Pills */}
        <div className="inline-flex rounded-lg bg-gray-100 p-2 mb-4">
          {[
            { key: 'balance', label: 'All' },
            { key: 'earned', label: 'Earned' },
            { key: 'spent', label: 'Spent' },
            { key: 'transactions', label: 'Transactions' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => onChange(item.key as StatsGridProps['activeTab'])}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all
                ${
                  activeTab === item.key
                    ? 'bg-white shadow text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Selected Stat Card */}
        <div className="rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              {activeStat.label}
            </span>
            {activeStat.icon}
          </div>

          <div className={`text-3xl font-bold ${activeStat.color}`}>
            {activeStat.value}
          </div>

          <p className="text-xs text-gray-600 mt-1">{activeStat.desc}</p>

          {activeStat.extra && (
            <p className="mt-2 text-[11px] opacity-70">{activeStat.extra}</p>
          )}
        </div>
      </div>

      {/* ================= DESKTOP GRID ================= */}
      <div className="hidden sm:grid grid-cols-4 lg:grid-cols-4 gap-4 mb-6">
        {(Object.keys(statsMap) as Array<StatsGridProps['activeTab']>).map(
          (key) => {
            const stat = statsMap[key];

            return (
              <div
                key={key}
                onClick={() => onChange(key)}
                className={`cursor-pointer rounded-xl border p-2 sm:p-4 transition-all duration-300 hover:shadow-lg
                ${
                  activeTab === key
                    ? 'ring-2 ring-offset-2 ring-blue-500 shadow-lg scale-[1.01]'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">
                    {stat.label}{' '}
                  </span>
                  {/* {stat.icon} */}
                  <span className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </span>
                </div>

                {/* <div className={`text-2xl sm:text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </div> */}

                <p className="text-xs text-gray-600 mt-1">{stat.desc}</p>

                {stat.extra && (
                  <p className="mt-2 text-[11px] opacity-70">{stat.extra}</p>
                )}
              </div>
            );
          },
        )}
      </div>
    </>
  );
}
