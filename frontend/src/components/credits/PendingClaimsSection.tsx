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
  console.log(pendingClaims);
  return (
    <div className="">
      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-900 mb-5 flex items-center gap-2">
        <span className="p-2 rounded-lg bg-blue-100">
          <Zap className="w-4 h-4 text-blue-500" />
        </span>
        Pending Claims
        {pendingClaims.length > 0 && (
          <span className="text-lg font-normal text-gray-500">
            ({pendingClaims.length}
            {pendingClaims.length > 1 ? '' : ''})
          </span>
        )}
      </h2>

      {pendingClaims.length === 0 ? (
        <div className="bg-white/80 backdrop-blur border border-gray-200 rounded-lg p-10 text-center shadow-sm">
          <p className="text-gray-500 text-sm">
            No pending claims available at the moment
          </p>
        </div>
      ) : (
        // <div className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pendingClaims.map((p, idx) => {
            const eligible =
              p.hasOwnProperty('eligible') && p.eligible !== undefined
                ? p.eligible
                : true;
            const actionKey = p.action;

            return (
              <div
                key={actionKey + idx}
                className="
                group bg-white/90 backdrop-blur
                border border-gray-200 rounded-lg p-5
                transition-all duration-300
                hover:-translate-y-0.5 hover:shadow-xl hover:border-gray-300
              "
              >
                <div className="flex items-start justify-between gap-6">
                  {/* Left content */}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 capitalize mb-1 tracking-wide">
                      <span className="text-gray-400 mr-2">{idx + 1}.</span>
                      {actionKey.replace(/_/g, ' ').toLowerCase()}
                    </p>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {p.reason}
                    </p>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Reward</span>
                        <span className="font-extrabold text-amber-600 text-lg">
                          +{p.credits}
                        </span>
                      </div>

                      {p.lastClaimedAt && (
                        <div className="text-xs text-gray-400">
                          Last claimed:{' '}
                          {new Date(p.lastClaimedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col  items-end gap-3">
                    <button
                      className={`
                      px-5 py-2.5 rounded-lg font-medium
                      transition-all duration-300
                      ${
                        eligible
                          ? `
                            bg-gradient-to-r from-blue-600 to-blue-700
                            text-white
                            hover:shadow-lg hover:shadow-blue-500/30
                            active:scale-95
                          `
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }
                    `}
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
                        className="
                        text-xs text-blue-600
                        hover:text-blue-700
                        underline-offset-4 hover:underline
                        transition-colors
                      "
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
