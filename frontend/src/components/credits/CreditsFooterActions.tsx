'use client';

import { Copy, RefreshCw } from 'lucide-react';

interface CreditsFooterActionsProps {
  refreshing: boolean;
  onRefresh: () => void;
  onShare: () => void;
}

export function CreditsFooterActions({
  refreshing,
  onRefresh,
  onShare,
}: CreditsFooterActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onRefresh}
        className="px-4 py-2.5  hover:bg-gray-50 text-gray-700 rounded-lg transition-all duration-300 flex items-center gap-2  border-gray-300 hover:border-gray-400 hover:shadow-md"
      >
        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        Refresh
      </button>
      {/* <button
        onClick={onShare}
        className="px-4 py-2.5  hover:shadow-lg hover:bg-blue-500 hover:text-white hover:text-gray-700 rounded-lg transition-all duration-300 flex items-center gap-2"
      >
        <Copy className="w-4 h-4" />
        Share
      </button> */}
    </div>
  );
}
