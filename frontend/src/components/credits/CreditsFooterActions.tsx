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
    <div className="flex gap-3 justify-end">
      <button
        onClick={onRefresh}
        className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-all duration-300 flex items-center gap-2 border border-gray-300 hover:border-gray-400 hover:shadow-md"
      >
        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        Refresh
      </button>
      <button
        onClick={onShare}
        className="px-4 py-2.5 bg-buttonPrimary hover:shadow-lg hover:shadow-blue-400/30 text-white rounded-lg transition-all duration-300 flex items-center gap-2"
      >
        <Copy className="w-4 h-4" />
        Share
      </button>
    </div>
  );
}
