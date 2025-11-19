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
    allowClose: false,
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
