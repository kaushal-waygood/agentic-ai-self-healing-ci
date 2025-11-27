'use client';

import { Zap } from 'lucide-react';
import { PendingClaim } from '@/types/credits';

interface PendingClaimsSectionProps {
  pendingClaims: PendingClaim[];
  claiming: Record<string, boolean>;
  onClaim: (claim: PendingClaim) => void;
  onOpenHowToClaim: (actionKey: string) => void;
}

export function PendingClaimsSection({
  pendingClaims,
  claiming,
  onClaim,
  onOpenHowToClaim,
}: PendingClaimsSectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-500" />
        Pending Claims
      </h2>
      {pendingClaims.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
          <div className="text-gray-500">
            No pending claims available at the moment
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingClaims.map((p, idx) => {
            const eligible =
              p.hasOwnProperty('eligible') && p.eligible !== undefined
                ? p.eligible
                : true;
            const actionKey = p.action;

            return (
              <div
                key={actionKey + idx}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-gray-300 transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1 capitalize">
                      {actionKey.replace(/_/g, ' ').toLowerCase()}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">{p.reason}</div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-sm">Reward:</span>
                        <span className="font-bold text-amber-600 text-lg">
                          +{p.credits}
                        </span>
                      </div>
                      {p.lastClaimedAt && (
                        <div className="text-xs text-gray-500">
                          Last: {new Date(p.lastClaimedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                        eligible
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-400/30 active:scale-95'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!eligible || claiming[actionKey]}
                      onClick={() => onClaim(p)}
                    >
                      {claiming[actionKey] ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin" />
                          Claiming...
                        </span>
                      ) : eligible ? (
                        `Claim ${p.credits}`
                      ) : (
                        'Not eligible'
                      )}
                    </button>
                    {actionKey.startsWith('FOLLOW_') && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          onOpenHowToClaim(actionKey);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        How to claim?
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
