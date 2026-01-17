// components/PlanDropdown.tsx
import { Crown, Zap, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UsageTracker } from '@/components/dashboard/UtilsComp'; // adjust path if necessary

const planConfig = {
  Free: {
    Icon: Zap,
    title: 'Free Plan',
    buttonClasses:
      'flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-100 to-gray-200 text-blue-800 hover:from-blue-200 hover:to-blue-300 transition-all duration-200 border border-blue-300',
    headerClasses:
      'p-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-t-lg',
  },
  Weekly: {
    Icon: Zap,
    title: 'Weekly Plan',
    buttonClasses:
      'flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-green-100 to-green-200 text-green-800 hover:from-green-200 hover:to-green-300 transition-all duration-200 border border-green-300',
    headerClasses:
      'p-4 bg-gradient-to-r from-green-400 to-green-600 rounded-t-lg',
  },
  Monthly: {
    Icon: Zap,
    title: 'Monthly Plan',
    buttonClasses:
      'flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 hover:from-purple-200 hover:to-purple-300 transition-all duration-200 border border-purple-300',
    headerClasses:
      'p-4 bg-gradient-to-r from-purple-400 to-purple-600 rounded-t-lg',
  },
};

const safeNum = (v: any, fallback = 0) => {
  if (v === -1) return -1;
  if (v === undefined || v === null || v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const PlanDropdown = ({
  planType,
  isOpen,
  onToggle,
  usageData,
  planLimits,
}: any) => {
  const router = useRouter();
  const config = planConfig[planType] || planConfig.Free;
  const { Icon } = config;

  // normalize values passed to UsageTracker (avoid undefined)
  const cvUsed = safeNum(usageData?.cvCreation, 0);
  const cvLimit = planLimits?.aiCvGenerator ?? null;

  const coverUsed = safeNum(usageData?.coverLetter, 0);
  const coverLimit = planLimits?.aiCoverLetterGenerator ?? null;

  const appUsed = safeNum(usageData?.aiApplication, 0);
  const appLimit = planLimits?.aiJobApply ?? planLimits?.aiJobApply ?? null;

  const autoDocsUsed = safeNum(usageData?.aiAutoApply, 0);
  const autoDocsLimit = planLimits?.aiAutoApply ?? 0;

  const autoDocsDailyLimit = safeNum(usageData?.aiAutoApplyDailyLimit, 0);
  const autoDocsDailyLimitLimit = planLimits?.aiAutoApplyDailyLimit ?? 0;

  const manualDocsUsed = safeNum(usageData?.aiMannualApplication, 0);
  const manualDocsLimit = planLimits?.aiMannualApplication ?? 0;

  const atsUsed = safeNum(usageData?.atsScore, 0);
  const atsLimit = planLimits?.atsScore ?? 0;

  const jobMatchingScore = safeNum(usageData?.jobMatching, 0);
  const jobMatchingScoreLimit = planLimits?.jobMatching ?? 0;

  return (
    <div className="relative ">
      <button onClick={onToggle} className={config.buttonClasses}>
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium hidden sm:inline">{planType}</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        // <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50">
        <div
          className="
            fixed md:absolute
            top-16 md:top-full
            left-4 right-4 md:left-auto md:right-0
            mt-0 md:mt-2
            w-auto md:w-80
            bg-white rounded-xl
            shadow-2xl border border-slate-200
            z-50
          "
        >
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

          <div className="p-4 space-y-4">
            <UsageTracker
              label="AI CV Creation"
              used={cvUsed}
              limit={cvLimit ?? 0}
            />
            <UsageTracker
              label="AI Cover Letter"
              used={coverUsed}
              limit={coverLimit}
            />
            <UsageTracker
              label="AI Tailored Application"
              used={appUsed}
              limit={appLimit ?? 0}
            />
            <UsageTracker
              label="AI Auto Application"
              used={autoDocsUsed}
              limit={autoDocsLimit ?? 0}
            />
            <UsageTracker
              label="Auto-Apply Daily limit"
              used={autoDocsDailyLimit}
              limit={autoDocsDailyLimitLimit ?? 0}
            />

            <UsageTracker
              label="AI ATS Score"
              used={atsUsed}
              limit={atsLimit ?? 0}
            />
            <UsageTracker
              label="AI Job Match Score"
              used={jobMatchingScore}
              limit={jobMatchingScoreLimit ?? 0}
            />
            <UsageTracker
              label="AI Manual Application"
              used={manualDocsUsed}
              limit={manualDocsLimit ?? 0}
            />
          </div>

          {planType === 'Free' || planType === 'Weekly' ? (
            <div className="p-4 border-t border-slate-100">
              <button
                className="w-full bg-buttonPrimary text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
                onClick={() => router.push('/dashboard/subscriptions')}
              >
                <Crown className="w-4 h-4" />
                <span>
                  {planType === 'Free'
                    ? 'Upgrade to Premium'
                    : 'Upgrade to Premium'}
                </span>
              </button>
            </div>
          ) : (
            <div />
          )}
        </div>
      )}
    </div>
  );
};

export default PlanDropdown;
