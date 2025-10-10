import {
  Brain,
  FileText,
  Send,
  BarChart3,
  Globe,
  Target,
  AlertTriangle,
  Clock,
  FileX,
  TrendingDown,
  UserX,
  CheckCircle,
  XCircle,
  Frown,
  Crown,
  Star,
  Rocket,
  Settings,
  Zap,
  Trophy,
  Upload,
  Users,
  Building,
  Briefcase,
} from 'lucide-react';

export const solutions = [
  {
    icon: Brain,
    title: 'AI Resume Tailoring',
    description:
      'Automatically customizes your resume for each job posting, optimizing keywords and formatting for maximum ATS compatibility.',
    color: 'from-purple-500 to-blue-500',
    bgColor: 'from-purple-50 to-blue-50',
    stat: '98% ATS Pass Rate',
    demo: 'Resume optimized in 15 seconds',
    features: [
      'Keyword optimization',
      'ATS formatting',
      'Industry-specific tailoring',
    ],
  },
  {
    icon: FileText,
    title: 'Smart Cover Letters',
    description:
      'Generates personalized, compelling cover letters that highlight your relevant experience for each specific role.',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'from-emerald-50 to-teal-50',
    stat: '5x Higher Response',
    demo: 'Personalized letter in 30 seconds',
    features: [
      'Personal tone matching',
      'Experience highlighting',
      'Company research integration',
    ],
  },
  {
    icon: Send,
    title: 'Automated Applications',
    description:
      'Submits applications on your behalf 24/7, ensuring you never miss new opportunities while you sleep.',
    color: 'from-orange-500 to-red-500',
    bgColor: 'from-orange-50 to-red-50',
    stat: '100+ Daily Applications',
    demo: 'Always working, even at 3 AM',
    features: ['24/7 automation', 'Queue management', 'Application tracking'],
  },
  {
    icon: BarChart3,
    title: 'ATS Score Calculator',
    description:
      "Real-time analysis of your resume's ATS compatibility with detailed improvement suggestions.",
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'from-blue-50 to-cyan-50',
    stat: 'Real-time Analysis',
    demo: 'Instant compatibility scoring',
    features: ['Live scoring', 'Improvement tips', 'Competitor analysis'],
  },
  {
    icon: Globe,
    title: 'Multi-Platform Integration',
    description:
      'Applies to jobs across LinkedIn, Indeed, Glassdoor, and 50+ other job boards from one dashboard.',
    color: 'from-violet-500 to-purple-500',
    bgColor: 'from-violet-50 to-purple-50',
    stat: '50+ Job Boards',
    demo: 'One dashboard, all platforms',
    features: ['LinkedIn integration', 'Multi-board sync', 'Unified dashboard'],
  },
  {
    icon: Target,
    title: 'Precision Targeting',
    description:
      'Smart job matching based on your skills, experience, and career goals for higher success rates.',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'from-pink-50 to-rose-50',
    stat: '15x Better Targeting',
    demo: 'Smart matching algorithm',
    features: ['Skill matching', 'Career alignment', 'Success prediction'],
  },
];

export const painPoints = [
  {
    icon: Clock,
    title: 'Hours of Manual Applications',
    description:
      'Spending 3-5 hours per application, customizing resumes and cover letters for each job posting.',
    stat: '5+ Hours',
    color: 'from-red-500 to-orange-500',
    bgColor: 'from-red-50 to-orange-50',
    solution: 'AI completes in 2 minutes',
    button: 'Apply Smarter',
  },
  {
    icon: FileX,
    title: 'ATS Rejection Black Hole',
    description:
      '95% of applications rejected by ATS systems before human eyes even see your resume.',
    stat: '95% Rejected',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'from-purple-50 to-pink-50',
    solution: 'ATS-optimized applications',
    button: 'Boost My Resume',
  },
  {
    icon: TrendingDown,
    title: 'Low Response Rates',
    description:
      'Less than 2% response rate despite sending hundreds of applications manually.',
    stat: '2% Response',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'from-blue-50 to-cyan-50',
    solution: 'Smart targeting increases to 15%',
    button: 'Get More Replies',
  },
  {
    icon: UserX,
    title: 'Generic Applications',
    description:
      "One-size-fits-all resumes that don't match specific job requirements and keywords.",
    stat: 'Generic CVs',
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'from-yellow-50 to-orange-50',
    solution: 'Tailored for each job',
    button: 'Tailor My Resume',
  },
];

export const beforeStats = [
  { icon: XCircle, text: '3-5 hours per application', negative: true },
  { icon: XCircle, text: '2% response rate', negative: true },
  { icon: XCircle, text: '95% ATS rejection rate', negative: true },
  { icon: XCircle, text: 'Burnout and frustration', negative: true },
];

export const afterStats = [
  { icon: CheckCircle, text: '100+ applications daily', negative: false },
  { icon: CheckCircle, text: '15x higher response rate', negative: false },
  { icon: CheckCircle, text: '85% ATS compatibility', negative: false },
  { icon: CheckCircle, text: 'More interviews, less stress', negative: false },
];

export const pricingData = {
  individual: {
    weekly: {
      plans: [
        {
          name: 'Basic',
          icon: Rocket,
          color: 'blue',
          prices: {
            usd: 2.49,
            inr: 99,
          },
          features: [
            { name: 'CV Creation', value: '1' },
            { name: 'Cover Letter', value: '1' },
            { name: 'AI Tailored Application', value: '1' },
            { name: 'AI Auto-Apply Agent', value: '1' },
            { name: 'Auto-Apply Daily limit', value: '2' },
            { name: 'Total Auto Apply Application', value: '3' },
            { name: 'Normal Application', value: 'Unlimited' },
          ],
        },
        {
          name: 'Pro',
          icon: Star,
          color: 'purple',
          popular: true,
          prices: {
            usd: 'Pro ($)', // Placeholder as per screenshot
            inr: 'Pro (Rs)', // Placeholder as per screenshot
          },
          features: [
            { name: 'CV Creation', value: '2' },
            { name: 'Cover Letter', value: '2' },
            { name: 'AI Tailored Application', value: '2' },
            { name: 'AI Auto-Apply Agent', value: '2' },
            { name: 'Auto-Apply Daily limit', value: '3' },
            { name: 'Total Auto Apply Application', value: '20' },
            { name: 'Normal Application', value: 'Unlimited' },
          ],
        },
      ],
    },
    monthly: {
      plans: [
        {
          name: 'Basic',
          icon: Rocket,
          color: 'blue',
          prices: {
            monthly: { usd: 0.0, inr: 0 },
            quarterly: { usd: 0, inr: 0 },
            halfYearly: { usd: 0, inr: 0 },
            annual: { usd: 0, inr: 0 },
          },
          features: [
            { name: 'CV Creation', value: '2' },
            { name: 'Cover Letter', value: '2' },
            { name: 'AI Tailored Application', value: '2' },
            { name: 'AI Auto-Apply Agent', value: '1' },
            { name: 'Auto-Apply Daily limit', value: '2' },
            { name: 'Total Auto Apply Application', value: '12' },
            { name: 'Normal Application', value: 'Unlimited' },
          ],
        },
        {
          name: 'Pro',
          icon: Star,
          color: 'purple',
          popular: true,
          prices: {
            monthly: { usd: 9.99, inr: 499 },
            quarterly: { usd: 23.98, inr: 1198 },
            halfYearly: { usd: 47.95, inr: 2395 },
            annual: { usd: 95.9, inr: 4790 },
          },
          features: [
            { name: 'CV Creation', value: '10' },
            { name: 'Cover Letter', value: '10' },
            { name: 'AI Tailored Application', value: '10' },
            { name: 'AI Auto-Apply Agent', value: '10' },
            { name: 'Auto-Apply Daily limit', value: '10' },
            { name: 'Total Auto Apply Application', value: '120' },
            { name: 'Normal Application', value: 'Unlimited' },
          ],
        },
      ],
    },
  },
  enterprise: {
    plans: [
      {
        name: 'Plus',
        icon: Rocket,
        color: 'blue',
        prices: {
          monthly: { usd: 0, inr: 0 },
          quarterly: { usd: 0, inr: 0 },
          halfYearly: { usd: 0, inr: 0 },
          annual: { usd: 0, inr: 0 },
        },
        features: [
          { name: 'CV Creation', value: '1' },
          { name: 'Cover Letter', value: '1' },
          { name: 'AI Tailored Application', value: '1' },
          { name: 'AI Auto-Apply Agent', value: '1' },
          { name: 'Auto-Apply Daily limit', value: '2' },
          { name: 'Total Auto Apply', value: '12' },
          { name: 'Normal Application', value: 'Unlimited' },
        ],
      },
      {
        name: 'Pro',
        icon: Crown,
        color: 'emerald',
        popular: true,
        prices: {
          monthly: { usd: 5.0, inr: 250 },
          quarterly: { usd: 11.99, inr: 599 },
          halfYearly: { usd: 23.98, inr: 1198 },
          annual: { usd: 47.95, inr: 2395 },
        },
        features: [
          { name: 'CV Creation', value: '20' },
          { name: 'Cover Letter', value: '20' },
          { name: 'AI Tailored Application', value: '20' },
          { name: 'AI Auto-Apply Agent', value: '15' },
          { name: 'Auto-Apply Daily limit', value: '10' },
          { name: 'Total Auto Apply', value: '120' },
          { name: 'Normal Application', value: 'Unlimited' },
        ],
      },
    ],
  },
};

export const steps = [
  {
    step: '01',
    icon: Upload,
    title: 'Upload Your Profile',
    description:
      'Upload your existing resume and set your job preferences. Our AI analyzes your experience and career goals.',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    lightGradient: 'from-blue-50 to-blue-100',
    time: '2 minutes',
    highlight: 'AI Profile Analysis',
    stats: '99% accuracy',
  },
  {
    step: '02',
    icon: Settings,
    title: 'AI Customization',
    description:
      'Our AI creates tailored versions of your resume and cover letter optimized for each job application.',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    lightGradient: 'from-purple-50 to-purple-100',
    time: 'Instant',
    highlight: 'Smart Optimization',
    stats: '500+ variations',
  },
  {
    step: '03',
    icon: Zap,
    title: 'Automated Applications',
    description:
      'ZobsAI starts applying to relevant jobs 24/7 across multiple platforms while you focus on other things.',
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-600',
    lightGradient: 'from-emerald-50 to-emerald-100',
    time: '24/7',
    highlight: 'Auto-Pilot Mode',
    stats: '100+ daily',
  },
  {
    step: '04',
    icon: Trophy,
    title: 'Track & Interview',
    description:
      'Monitor your application status, response rates, and schedule interviews through our dashboard.',
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600',
    lightGradient: 'from-orange-50 to-orange-100',
    time: 'Real-time',
    highlight: 'Success Tracking',
    stats: '15x response rate',
  },
];

export const platforms = [
  {
    name: 'LinkedIn',
    description: 'Professional networking and job opportunities',
    jobs: '2M+ active jobs',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    lightGradient: 'from-blue-100 to-blue-200',
    features: ['Professional Network', 'Premium Jobs', 'Company Insights'],
    icon: '💼',
    popularity: 95,
  },
  {
    name: 'Indeed',
    description: "World's largest job search engine",
    jobs: '15M+ job listings',
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-600',
    lightGradient: 'from-emerald-100 to-emerald-200',
    features: ['Massive Database', 'Salary Insights', 'Company Reviews'],
    icon: '🎯',
    popularity: 98,
  },
  {
    name: 'Glassdoor',
    description: 'Company insights and job opportunities',
    jobs: '5M+ job postings',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    lightGradient: 'from-purple-100 to-purple-200',
    features: ['Company Reviews', 'Salary Data', 'Interview Tips'],
    icon: '🔍',
    popularity: 88,
  },
  {
    name: 'ZipRecruiter',
    description: 'AI-powered job matching platform',
    jobs: '8M+ active jobs',
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600',
    lightGradient: 'from-orange-100 to-orange-200',
    features: ['AI Matching', 'Quick Apply', 'Recruiter Connect'],
    icon: '⚡',
    popularity: 85,
  },
  {
    name: 'Monster',
    description: 'Career advancement and job search',
    jobs: '3M+ opportunities',
    color: 'cyan',
    gradient: 'from-cyan-500 to-cyan-600',
    lightGradient: 'from-cyan-100 to-cyan-200',
    features: ['Career Advice', 'Resume Builder', 'Job Alerts'],
    icon: '🚀',
    popularity: 75,
  },
  {
    name: 'CareerBuilder',
    description: 'Comprehensive job search platform',
    jobs: '4M+ job listings',
    color: 'indigo',
    gradient: 'from-indigo-500 to-indigo-600',
    lightGradient: 'from-indigo-100 to-indigo-200',
    features: ['Skills Assessment', 'Career Resources', 'Employer Brand'],
    icon: '🏢',
    popularity: 80,
  },
];

export const stats = [
  {
    icon: Globe,
    number: '50+',
    label: 'Job Platforms',
    description: 'Integrated job boards',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    icon: Briefcase,
    number: '20M+',
    label: 'Job Listings',
    description: 'Available opportunities',
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: Building,
    number: '500K+',
    label: 'Companies',
    description: 'Hiring actively',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    icon: Users,
    number: '10K+',
    label: 'Success Stories',
    description: 'Happy job seekers',
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600',
  },
];
