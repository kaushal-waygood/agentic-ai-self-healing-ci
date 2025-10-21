// components/PlanDropdown.js

import { Crown, Zap, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UsageTracker } from '@/app/(app)/dashboard/UsageAndLimitsCard';

// --- UPDATED: Added 'Weekly' and 'Monthly' plan configurations ---
const planConfig = {
  Free: {
    Icon: Zap,
    title: 'Free Plan',
    buttonClasses:
      'flex items-center space-x-2 px-1 py-1 rounded-xl bg-gradient-to-r from-blue-100 to-gray-200 text-blue-800 hover:from-blue-200 hover:to-blue-300 transition-all duration-200 border border-blue-300',
    headerClasses: 'p-2 bg-gradient-to-r from-blue-400 to-blue-600',
  },
  Weekly: {
    Icon: Zap,
    title: 'Weekly Plan',
    buttonClasses:
      'flex items-center space-x-2 px-3 py-2 rounded-xl bg-gradient-to-r from-green-100 to-green-200 text-green-800 hover:from-green-200 hover:to-green-300 transition-all duration-200 border border-green-300',
    headerClasses: 'p-6 bg-gradient-to-r from-green-400 to-green-600',
  },
  Monthly: {
    Icon: Zap,
    title: 'Monthly Plan',
    buttonClasses:
      'flex items-center space-x-2 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 hover:from-purple-200 hover:to-purple-300 transition-all duration-200 border border-purple-300',
    headerClasses: 'p-6 bg-gradient-to-r from-purple-400 to-purple-600',
  },
};

const PlanDropdown = ({
  planType,
  isOpen,
  onToggle,
  usageData,
  planLimits,
}) => {
  const router = useRouter();

  // Select the correct configuration based on planType, with 'Free' as a fallback
  const config = planConfig[planType] || planConfig.Free;
  const { Icon } = config;

  return (
    <div className="relative">
      <button onClick={onToggle} className={config.buttonClasses}>
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium hidden sm:inline">{planType}</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
          <div className={config.headerClasses}>
            <div className="flex items-center space-x-3 text-white">
              <Icon className="w-6 h-6" />
              <div>
                <h3 className="font-bold text-sm">{config.title}</h3>
                <p className="text-yellow-100 text-xs">
                  Your current billing cycle usage
                </p>
              </div>
            </div>
          </div>
          <div className="p-2  space-y-4">
            <UsageTracker
              label="AI Applications"
              used={usageData.aiJobApply}
              limit={planLimits.aiJobApply}
            />
            <UsageTracker
              label="AI CV Generations"
              used={usageData.aiCvGenerator}
              limit={planLimits.aiCvGenerator}
            />
            <UsageTracker
              label="AI Cover Letters"
              used={usageData.aiCoverLetterGenerator}
              limit={planLimits.aiCoverLetterGenerator}
            />
            <UsageTracker
              label="Tracked Applications"
              used={usageData.applications}
              limit={planLimits.applicationLimit}
            />
          </div>

          {planType === 'Free' ? (
            <div className="p-4 border-t border-slate-100">
              <button
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
                onClick={() => router.push('/dashboard/subscriptions')}
              >
                <Crown className="w-4 h-4" />
                <span>Upgrade Plan</span>
              </button>
            </div>
          ) : (
            <div></div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlanDropdown;
