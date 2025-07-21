
export type SubscriptionPlanLimits = {
  aiJobApply: number; // Tailored Application Wizard uses
  aiCvGenerator: number;
  aiCoverLetterGenerator: number;
  autoApplyAgents: number;
  autoApplyDailyLimit: number;
  applicationLimit: number; // Max total applications per month
};

export type SubscriptionPlan = {
  id: string;
  name: 'Basic' | 'Plus' | 'Pro' | 'Platinum' | 'Enterprise Plus' | 'Enterprise Pro' | 'Enterprise Platinum';
  basePriceMonthly: number;
  quarterlyDiscountPercent: number;
  halfYearlyDiscountPercent: number;
  enterpriseDiscountPercent?: number; // % discount from the equivalent individual plan
  isPopular?: boolean;
  limits: SubscriptionPlanLimits;
  displayFeatures: string[];
  referralBonus?: number;
  icon?: keyof typeof import('lucide-react');
  iconColor?: string;
  borderColor?: string;
};

const plusLimits: SubscriptionPlanLimits = {
  aiJobApply: 20,
  aiCvGenerator: 5,
  aiCoverLetterGenerator: 5,
  autoApplyAgents: 1,
  autoApplyDailyLimit: 3,
  applicationLimit: 30,
};

const proLimits: SubscriptionPlanLimits = {
  aiJobApply: 100,
  aiCvGenerator: 30,
  aiCoverLetterGenerator: 30,
  autoApplyAgents: 3,
  autoApplyDailyLimit: 5,
  applicationLimit: 200,
};

const platinumLimits: SubscriptionPlanLimits = {
  aiJobApply: 250, // Unlimited
  aiCvGenerator: 100, // Unlimited
  aiCoverLetterGenerator: 100, // Unlimited
  autoApplyAgents: 5,
  autoApplyDailyLimit: 15,
  applicationLimit: 500, // Unlimited
};


const initialMockSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    basePriceMonthly: 0,
    quarterlyDiscountPercent: 0,
    halfYearlyDiscountPercent: 0,
    referralBonus: 10,
    icon: 'Zap',
    iconColor: 'text-muted-foreground',
    limits: {
      aiJobApply: 10,
      aiCvGenerator: 3,
      aiCoverLetterGenerator: 5,
      autoApplyAgents: 0,
      autoApplyDailyLimit: 0,
      applicationLimit: 10,
    },
    displayFeatures: [
      'Earn 10 AI application credits per successful referral',
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    basePriceMonthly: 4.99,
    quarterlyDiscountPercent: 10,
    halfYearlyDiscountPercent: 25,
    isPopular: true,
    icon: 'Star',
    iconColor: 'text-primary',
    borderColor: 'border-primary',
    limits: plusLimits,
    displayFeatures: [
      'Enhanced AI CV creation (10+ templates)',
      'Enhanced AI Cover Letter generation (10+ formats)',
      'Fully automated AI job application submission',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    basePriceMonthly: 19.99,
    quarterlyDiscountPercent: 15,
    halfYearlyDiscountPercent: 20,
    icon: 'Gem',
    iconColor: 'text-yellow-500',
    borderColor: 'border-primary',
    limits: proLimits,
    displayFeatures: [
      'AI Job Matching Score',
      'Advanced ATS Friendly AI CV creation (20+ templates)',
      'Advanced AI Cover Letter generation (20+ formats)',
    ],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    basePriceMonthly: 29.99,
    quarterlyDiscountPercent: 20,
    halfYearlyDiscountPercent: 25,
    icon: 'ShieldCheck',
    iconColor: 'text-purple-500',
    borderColor: 'border-purple-500',
    limits: platinumLimits,
    displayFeatures: [
      'Everything in Pro, plus:',
      'Unlimited AI Generations',
      'Priority Support',
    ],
  },
  {
    id: 'enterprise_plus',
    name: 'Enterprise Plus',
    basePriceMonthly: 0,
    enterpriseDiscountPercent: 100, // 100% discount off 'Plus' plan makes it free
    quarterlyDiscountPercent: 0,
    halfYearlyDiscountPercent: 0,
    icon: 'Star',
    iconColor: 'text-primary',
    borderColor: 'border-secondary',
    limits: plusLimits, // Inherit from Plus
    displayFeatures: [
      'Enhanced AI CV creation (10+ templates)',
      'Enhanced AI Cover Letter generation (10+ formats)',
      'Centralized Admin Dashboard',
      'Seat management & provisioning',
    ],
  },
  {
    id: 'enterprise_pro',
    name: 'Enterprise Pro',
    basePriceMonthly: 19.99, // Price is derived from individual Pro plan
    enterpriseDiscountPercent: 15,
    quarterlyDiscountPercent: 10,
    halfYearlyDiscountPercent: 15,
    icon: 'Gem',
    iconColor: 'text-yellow-500',
    borderColor: 'border-secondary',
    limits: proLimits, // Inherit from Pro
    displayFeatures: [
      'AI Job Matching Score',
      'Advanced ATS Friendly AI CV creation (20+ templates)',
      'Centralized Admin Dashboard & Analytics',
      'Custom branding options',
      'Dedicated account manager',
    ],
  },
  {
    id: 'enterprise_platinum',
    name: 'Enterprise Platinum',
    basePriceMonthly: 29.99, // Price is derived from individual Platinum plan
    enterpriseDiscountPercent: 30,
    quarterlyDiscountPercent: 10,
    halfYearlyDiscountPercent: 20,
    icon: 'ShieldCheck',
    iconColor: 'text-purple-500',
    borderColor: 'border-purple-500',
    limits: platinumLimits, // Inherit from Platinum
    displayFeatures: [
      'All Pro features, plus:',
      'Unlimited AI Generations & Applications',
      'Dedicated Customer Success Manager',
      'API Access & Custom Integrations',
      'Priority Support Queue',
    ],
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __mockSubscriptionPlans: SubscriptionPlan[] | undefined;
}

export let mockSubscriptionPlans: SubscriptionPlan[];

if (process.env.NODE_ENV === 'production') {
  mockSubscriptionPlans = initialMockSubscriptionPlans;
} else {
  if (!globalThis.__mockSubscriptionPlans) {
    globalThis.__mockSubscriptionPlans = initialMockSubscriptionPlans;
  }
  mockSubscriptionPlans = globalThis.__mockSubscriptionPlans;
}
