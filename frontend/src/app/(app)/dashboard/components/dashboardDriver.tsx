import { driver, DriveStep } from 'driver.js';

export interface DashboardTourProps {
  fireConfetti: () => void;
  setShowCompletionModal: (val: boolean) => void;
}

/* ─────────────────────────────────────────────
   PAGE DETECTION
   Returns a key for the current route so we can
   pick the right step-set to show.
───────────────────────────────────────────── */
type PageKey =
  | 'dashboard'
  | 'search-jobs'
  | 'apply'
  | 'cv-generator'
  | 'cover-letter-generator'
  | 'ai-auto-apply'
  | 'my-docs'
  | 'applications'
  | 'profile'
  | 'billing'
  | 'subscriptions'
  | 'referrals'
  | 'unknown';

function detectPage(): PageKey {
  const path = window.location.pathname;
  if (path === '/dashboard' || path === '/dashboard/') return 'dashboard';
  if (path.includes('/search-jobs')) return 'search-jobs';
  if (path.includes('/apply')) return 'apply';
  if (path.includes('/cv-generator')) return 'cv-generator';
  if (path.includes('/cover-letter-generator')) return 'cover-letter-generator';
  if (path.includes('/ai-auto-apply')) return 'ai-auto-apply';
  if (path.includes('/my-docs')) return 'my-docs';
  if (path.includes('/applications')) return 'applications';
  if (path.includes('/profile')) return 'profile';
  if (path.includes('/billing')) return 'billing';
  if (path.includes('/subscriptions')) return 'subscriptions';
  if (path.includes('/referrals')) return 'referrals';
  return 'unknown';
}

/* ─────────────────────────────────────────────
   STEP REGISTRIES — one per page
   Each step only runs if its element is found
   in the DOM (filtered before tour starts).
───────────────────────────────────────────── */

/** Steps only shown on the main /dashboard page */
const dashboardSteps: DriveStep[] = [
  {
    element: '#profile-readiness',
    popover: {
      title: '📋 Profile Readiness',
      description:
        'Your profile score lives here. Every section you complete — work experience, education, skills — directly raises your match score and puts you in front of more recruiters. Aim for 100%.',
    },
  },
  {
    element: '#my-docsx',
    popover: {
      title: '📁 My Documents',
      description:
        'A quick count of every AI-generated asset you own: tailored CVs, cover letters, and full application packages. Click any card to jump straight to that document library.',
    },
  },
  {
    element: '#my-applications',
    popover: {
      title: '🗂️ Job Activity',
      description:
        "Your personal job funnel. Track jobs you've saved for later, viewed, opened externally, or already applied to — all in one place so nothing slips through the cracks.",
    },
  },
  {
    element: '#other-driver',
    popover: {
      title: '🏅 Others',
      description:
        'Keep an eye on your referral count here. Every successful referral earns you bonus credits you can use on AI-powered tools like CV generation and auto-apply.',
    },
  },
  {
    element: '#plan-driver',
    popover: {
      title: '💳 Your Current Plan',
      description:
        "See your active subscription, how many days until renewal, and exactly how many credits you've used for each AI feature this cycle. Upgrade here if you're running low.",
    },
  },
  {
    element: '#coreToolkit-driver',
    popover: {
      title: '🧰 Core AI Toolkit',
      description:
        'Your shortcut panel for the four most-used tools: Search & Apply, Application Wizard, AI CV Generator, and AI Auto-Application. One click to jump to any of them.',
    },
  },
];

/** Steps shown on /dashboard/search-jobs */
const searchJobsSteps: DriveStep[] = [
  {
    element: '[data-tour="search-bar"]',
    popover: {
      title: '🔍 Job Search',
      description:
        'Type a role, skill, or company name. ZobsAI searches thousands of live listings and ranks them by how well they match your profile.',
    },
  },
  {
    element: '[data-tour="filters"]',
    popover: {
      title: '🎚️ Filters',
      description:
        'Narrow results by location, job type, experience level, or salary range. Active filters are shown as chips so you can remove them individually.',
    },
  },
  {
    element: '[data-tour="job-card"]',
    popover: {
      title: '📌 Job Cards',
      description:
        'Each card shows the match score ZobsAI calculated for you. Green means strong alignment. Click a card to read the full JD and apply in one step.',
    },
  },
  {
    element: '[data-tour="save-job"]',
    popover: {
      title: '🔖 Save for Later',
      description:
        "Hit the bookmark icon to save a job without applying. You'll find it under Job Activity → Saved Jobs on the dashboard.",
    },
  },
];

/** Steps shown on /dashboard/apply (Application Wizard) */
const applySteps: DriveStep[] = [
  {
    element: '[data-tour="job-url-input"]',
    popover: {
      title: '🔗 Paste the Job Link',
      description:
        'Drop in any public job URL. ZobsAI scrapes the job description and pulls out the key requirements automatically.',
    },
  },
  {
    element: '[data-tour="wizard-generate"]',
    popover: {
      title: '✨ One-Click Generation',
      description:
        'Click Generate to create a tailored CV, cover letter, and application email — all aligned to that specific job description. Takes about 10 seconds.',
    },
  },
  {
    element: '[data-tour="wizard-preview"]',
    popover: {
      title: '👁️ Preview & Edit',
      description:
        'Review every document before saving. You can edit any section inline before downloading or sending.',
    },
  },
];

/** Steps shown on /dashboard/cv-generator */
const cvGeneratorSteps: DriveStep[] = [
  {
    element: '[data-tour="cv-template"]',
    popover: {
      title: '🗂️ Choose a Template',
      description:
        'Pick from ATS-clean, modern, or minimalist layouts. All templates pass common ATS parsers without losing formatting.',
    },
  },
  {
    element: '[data-tour="cv-form"]',
    popover: {
      title: '📝 Your Profile Data',
      description:
        'ZobsAI pre-fills this form using your saved profile. Adjust anything, then hit Generate to let the AI craft bullet points and a summary for you.',
    },
  },
  {
    element: '[data-tour="cv-preview"]',
    popover: {
      title: '📄 Live Preview',
      description:
        "Watch your CV build in real time on the right. Download as PDF when you're happy, or save to My Documents for reuse.",
    },
  },
];

/** Steps shown on /dashboard/cover-letter-generator */
const coverLetterSteps: DriveStep[] = [
  {
    element: '[data-tour="cl-jd-input"]',
    popover: {
      title: '📋 Paste the Job Description',
      description:
        'Give ZobsAI the JD and it will mirror its language back in your cover letter — naturally, not keyword-stuffed.',
    },
  },
  {
    element: '[data-tour="cl-tone"]',
    popover: {
      title: '🎨 Set the Tone',
      description:
        "Professional, enthusiastic, concise — pick the voice that fits the company culture you're targeting.",
    },
  },
  {
    element: '[data-tour="cl-output"]',
    popover: {
      title: '✉️ Your Cover Letter',
      description:
        'Edit inline, copy to clipboard, or save directly to My Documents. Every letter is saved with the job title so you can reuse it later.',
    },
  },
];

/** Steps shown on /dashboard/ai-auto-apply */
const autoApplySteps: DriveStep[] = [
  {
    element: '[data-tour="autopilot-toggle"]',
    popover: {
      title: '🤖 Autopilot Switch',
      description:
        'Toggle this on and ZobsAI will automatically find matching jobs, generate tailored documents, and submit applications on a schedule — even while you sleep.',
    },
  },
  {
    element: '[data-tour="autopilot-prefs"]',
    popover: {
      title: '⚙️ Application Preferences',
      description:
        'Set the roles, locations, salary range, and keywords you want to target. ZobsAI only applies where you have a strong match score.',
    },
  },
  {
    element: '[data-tour="autopilot-log"]',
    popover: {
      title: '📊 Activity Log',
      description:
        'Every auto-submitted application is logged here with status, timestamp, and the documents that were sent. You stay in full control.',
    },
  },
];

/** Steps shown on /dashboard/my-docs */
const myDocsSteps: DriveStep[] = [
  {
    element: '[data-tour="docs-tabs"]',
    popover: {
      title: '📂 Document Tabs',
      description:
        'Switch between your CVs, Cover Letters, and full Application Packages using these tabs.',
    },
  },
  {
    element: '[data-tour="docs-card"]',
    popover: {
      title: '📑 Document Card',
      description:
        'Each card shows the job it was tailored for, the date created, and quick actions: view, download, or delete.',
    },
  },
];

/** Steps shown on /dashboard/applications */
const applicationsSteps: DriveStep[] = [
  {
    element: '[data-tour="app-status-tabs"]',
    popover: {
      title: '🗂️ Status Pipeline',
      description:
        'Filter your jobs by stage: Saved, Viewed, Visited, or Applied. This is your personal funnel tracker.',
    },
  },
  {
    element: '[data-tour="app-row"]',
    popover: {
      title: '📝 Application Row',
      description:
        'Each row links back to the job and any tailored documents attached to it. Update the status as you progress through interviews.',
    },
  },
];

/** Steps shown on /dashboard/profile */
const profileSteps: DriveStep[] = [
  {
    element: '[data-tour="profile-tabs"]',
    popover: {
      title: '🧑 Profile Sections',
      description:
        "Fill in each tab — Education, Experience, Skills, Projects, and Job Preferences. The more complete your profile, the better ZobsAI's AI matching becomes.",
    },
  },
  {
    element: '[data-tour="profile-save"]',
    popover: {
      title: '💾 Save Changes',
      description:
        'Always save before switching tabs. Your profile data is used across every AI tool — CV generation, auto-apply, and job matching all pull from here.',
    },
  },
];

/** Fallback steps used when the page has no registered steps */
const fallbackSteps: DriveStep[] = [];

/* ─────────────────────────────────────────────
   STEP SELECTOR
   Returns the right step list for the current page
───────────────────────────────────────────── */
function getStepsForPage(page: PageKey): DriveStep[] {
  const map: Record<PageKey, DriveStep[]> = {
    dashboard: dashboardSteps,
    'search-jobs': searchJobsSteps,
    apply: applySteps,
    'cv-generator': cvGeneratorSteps,
    'cover-letter-generator': coverLetterSteps,
    'ai-auto-apply': autoApplySteps,
    'my-docs': myDocsSteps,
    applications: applicationsSteps,
    profile: profileSteps,
    billing: fallbackSteps,
    subscriptions: fallbackSteps,
    referrals: fallbackSteps,
    unknown: fallbackSteps,
  };
  return map[page] ?? fallbackSteps;
}

/* ─────────────────────────────────────────────
   COMPLETION STEP — always last
───────────────────────────────────────────── */
const completionStep: DriveStep = {
  popover: {
    title: '🎉 Tour Complete!',
    description:
      'You now know your way around. If you ever need a refresher, hit the <strong>Start Tour</strong> button in the top-right of any page.',
  },
};

/* ─────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────── */
export const startDashboardTour = ({
  fireConfetti,
  setShowCompletionModal,
}: DashboardTourProps) => {
  const page = detectPage();
  const pageSteps = getStepsForPage(page);

  // Only include steps whose element is actually present in the DOM.
  // Steps with no element (like the completion step) always pass.
  const availableSteps: DriveStep[] = [
    ...pageSteps.filter(
      (step) => !step.element || document.querySelector(step.element as string),
    ),
    completionStep,
  ];

  // Edge case: no page-specific steps found at all (element ids haven't been
  // added to the new page yet) — still show the completion step so the tour
  // doesn't silently do nothing.
  if (availableSteps.length === 1) {
    // Only the completion step — let the user know the page has no tour yet.
    availableSteps[0] = {
      popover: {
        title: '🚀 ZobsAI Tour',
        description:
          "This page doesn't have a guided tour yet — but the rest of the platform does! Head back to the Dashboard and click <strong>Start Tour</strong> to get a full walkthrough.",
      },
    };
  }

  const LAST_INDEX = availableSteps.length - 1;
  let isOnLastStep = false;

  const tour = driver({
    animate: true,
    popoverClass: 'zobsai-tour',
    showProgress: true,
    smoothScroll: true,
    allowClose: true,
    steps: availableSteps,

    onHighlighted: (_element, _step, { state }) => {
      isOnLastStep = state.activeIndex === LAST_INDEX;
    },

    onDestroyed: () => {
      if (isOnLastStep) {
        setShowCompletionModal(true);
        fireConfetti();
      }
    },
  });

  tour.drive();
};
