import { driver } from 'driver.js';

export interface DashboardTourProps {
  fireConfetti: () => void;
  setShowCompletionModal: (val: boolean) => void;
}

export const startDashboardTour = ({
  fireConfetti,
  setShowCompletionModal,
}: DashboardTourProps) => {
  const steps = [
    {
      element: '#profile-readiness',
      popover: {
        title: 'Profile Strength',
        description: 'This shows your overall profile readiness score.',
        position: 'right',
      },
    },
    {
      element: '#my-docsx',
      popover: {
        title: 'Saved Documents',
        description: 'Your AI-generated Docs are stored here.',
      },
    },
    {
      element: '#my-applications',
      popover: {
        title: 'Applications',
        description:
          'All personalized AI-generated applications are shown here.',
      },
    },
    {
      element: '#other-driver',
      popover: {
        title: 'Other Stuff',
        description: 'Bookmarked job posts appear here.',
      },
    },
    {
      element: '#plan-driver',
      popover: {
        title: 'Your Current Plan',
        description: 'See your current subscription status and limits.',
      },
    },
    {
      element: '#coreToolkit-driver',
      popover: {
        title: 'AI Toolkits',
        description: 'Your essential ZobsAI AI tools for automation.',
      },
    },
    {
      element: '#current-plan-driver',
      popover: {
        title: 'Your Current Plan',
        description:
          'See your active subscription, renewal date, and usage limits at a glance. Click here to manage or upgrade your plan.',
        position: 'bottom',
      },
    },

    {
      element: '#bell-driver',
      popover: {
        title: 'Notifications',
        description:
          'Stay updated with real-time alerts about your applications, AI generations, and important ZobsAI updates.',
        position: 'bottom',
      },
    },

    {
      element: '#user-driver',
      popover: {
        title: 'Your Profile',
        description:
          'Manage your account settings, switch plans, or log out. Everything related to your personal ZobsAI profile lives here.',
        position: 'bottom',
      },
    },

    // SIDEBAR (Using ID: sidebar-link-${index})
    {
      element: '#sidebar-link-0',
      popover: {
        title: 'Dashboard',
        description: 'Your personalized dashboard.',
        position: 'right',
      },
    },
    {
      element: '#sidebar-link-1',
      popover: {
        title: 'Job Search',
        description: 'Explore jobs tailored to your skills.',
        position: 'right',
      },
    },
    {
      element: '#sidebar-link-2',
      popover: {
        title: 'AI CV Generator',
        description: 'Create professional AI-generated CVs.',
        position: 'right',
      },
    },
    {
      element: '#sidebar-link-3',
      popover: {
        title: 'AI Cover Letter',
        description: 'Generate personalized AI-powered cover letters.',
        position: 'right',
      },
    },
    {
      element: '#sidebar-link-4',
      popover: {
        title: 'AI Auto Docs',
        description: 'Automatically generate complete job application docs.',
        position: 'right',
      },
    },
    {
      element: '#sidebar-link-5',
      popover: {
        title: 'Application Wizard',
        description:
          'Tailor CV + Cover Letter for a specific job automatically.',
        position: 'right',
      },
    },
    {
      element: '#sidebar-link-6',
      popover: {
        title: 'My Applications',
        description: 'Track the jobs you’ve applied for.',
        position: 'right',
      },
    },
    {
      element: '#sidebar-link-7',
      popover: {
        title: 'My Docs',
        description: 'View, manage, and download your saved CVs & Letters.',
        position: 'right',
      },
    },
    // {
    //   element: '#sidebar-link-8',
    //   popover: {
    //     title: 'ZobsAI Partnership',
    //     description: 'Bring ZobsAI to your university or company.',
    //     position: 'right',
    //   },
    // },
    // {
    //   element: '#sidebar-link-10',
    //   popover: {
    //     title: 'Refer & Earn',
    //     description: 'Invite friends and earn rewards.',
    //     position: 'right',
    //   },
    // },
    // {
    //   element: '#sidebar-link-11',
    //   popover: {
    //     title: 'Request New Feature',
    //     description: 'Suggest a new feature for ZobsAI.',
    //     position: 'right',
    //   },
    // },

    {
      popover: {
        title: 'Completed 🎉',
        description: 'Thank you for visiting ZobsAI!',
      },
    },
  ];

  const LAST_INDEX = steps.length - 1;
  let isOnLastStep = false;

  const tour = driver({
    animate: true,
    popoverClass: 'zobsai-tour',
    showProgress: true,
    smoothScroll: true,
    allowClose: true,
    steps,

    // Tracks which step is active
    onHighlighted: (element, step, { state }) => {
      isOnLastStep = state.activeIndex === LAST_INDEX;
    },

    // Fires when the tour ends
    onDestroyed: () => {
      if (isOnLastStep) {
        setShowCompletionModal(true);
        fireConfetti();
      }
    },
  });

  tour.drive();
};
