'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useApplicationWizard, useCvForm } from '@/hooks/useApplicationWizard';
import { mockUserProfile } from '@/lib/data/user';
import { useEffect } from 'react';

// Import all step components
import { JobStep } from './applications/JobStep';
import SleekCvStep from './applications/wizard/steps/create-cv/CreateCvStep';
import CreateCvStep from './applications/CreateCvStep';
import SleekClStep from './applications/wizard/steps/ClStep';
import { GenerateStep } from './applications/wizard/steps/GenerateStep';

import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import FinalResultView from '../cover-letter/components/FinalResultView';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

const StyledCard = (props: any) => (
  <Card className="bg-white border-slate-200 text-slate-800" {...props} />
);

export function ApplicationWizardClient() {
  const { state, actions, forms } = useApplicationWizard();
  const {
    form: createCvForm,
    fields,
    actions: formActions,
  } = useCvForm(state.jobContext?.jobTitle);

  const {
    wizardStep,
    isLoading,
    loadingMessage,
    generatedData,
    jobs,
    selectedCvId,
  } = state;
  const { navigateToStep, setGeneratedData } = actions;

  /* ---------- Navigation Guards ---------- */

  // 1. Define when the user is "active" in the process
  const isDeepInWizard = wizardStep !== 'job' || isLoading;

  useEffect(() => {
    const handleInternalNavigation = (e: MouseEvent) => {
      if (!isDeepInWizard) return;

      // 1. Find the closest anchor tag (<a>) from the click target
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');

      // 2. If it's a link and it's internal
      if (anchor && anchor.href && anchor.host === window.location.host) {
        // Check if it's just a hash change (like #top), if not, block it
        if (!anchor.href.includes('#')) {
          const confirmLeave = window.confirm(
            'You have an active session. If you leave, your progress will be lost. Do you want to leave?',
          );

          if (!confirmLeave) {
            e.preventDefault();
            e.stopImmediatePropagation(); // Prevents Next.js from seeing the click
          }
        }
      }
    };

    // Use 'capture' phase to catch the event before Next.js handles it
    window.addEventListener('click', handleInternalNavigation, true);

    return () => {
      window.removeEventListener('click', handleInternalNavigation, true);
    };
  }, [isDeepInWizard]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDeepInWizard) {
        e.preventDefault();
        e.returnValue = ''; // Standard browser prompt
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDeepInWizard]);

  useEffect(() => {
    if (!isDeepInWizard) return;

    // Push a dummy state to the history stack to "trap" the back button
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      if (isDeepInWizard) {
        // Re-push the state to stay on the page
        window.history.pushState(null, '', window.location.href);

        alert('Please wait until resume extraction is complete.');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isDeepInWizard]);

  const renderStep = () => {
    // Loading card when initializing
    if (isLoading && wizardStep === 'loading') {
      return (
        <StyledCard className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-purple-600" />
            <p className="mt-4 text-slate-500">
              {loadingMessage ||
                (isLoading && !state.jobContext
                  ? 'Loading job details...'
                  : 'Initializing Wizard...')}
            </p>
          </div>
        </StyledCard>
      );
    }

    switch (wizardStep) {
      case 'job':
        return (
          <JobStep
            isLoading={isLoading}
            loadingMessage={loadingMessage}
            jobListings={jobs || []}
            handleJobContextSubmit={actions.handleJobContextSubmit}
          />
        );

      case 'cv':
        return (
          <SleekCvStep
            mockUserProfile={mockUserProfile}
            handleCvContextSubmit={actions.handleCvContextSubmit}
            // setWizardState={navigateToStep}
            setWizardStep={navigateToStep}
            selectedCvId={selectedCvId}
            setSelectedCvId={actions.setSelectedCvId}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
            handleCVContext={actions.handleCVFileUpload}
          />
        );

      case 'createCv':
        return (
          <CreateCvStep
            createCvForm={createCvForm}
            handleCreateCvFormSubmit={actions.handleCreateCvFormSubmit}
            eduFields={fields.eduFields}
            removeEdu={formActions.removeEdu}
            expFields={fields.expFields}
            removeExp={formActions.removeExp}
            appendEdu={formActions.appendEdu}
            appendExp={formActions.appendExp}
            removeProject={formActions.removeProject}
            projectFields={fields.projectFields}
            isLoading={isLoading}
            navigateToStep={navigateToStep}
            appendProject={formActions.appendProject}
          />
        );

      case 'cl':
        return (
          <SleekClStep
            clForm={forms.clForm}
            handleClContextSubmit={actions.handleClContextSubmit}
            setWizardStep={navigateToStep}
            mockUserProfile={mockUserProfile}
            itemVariants={itemVariants}
          />
        );

      case 'generate':
        return (
          <GenerateStep
            jobContext={state.jobContext}
            cvContext={state.cvContext}
            clContext={state.clContext}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
            handleGenerate={actions.handleGenerate}
            setWizardStep={navigateToStep}
          />
        );

      case 'result':
        return (
          <FinalResultView
            incompleteProfile={actions.incompleteProfile}
            rateLimited={actions.rateLimited}
            rateLimitMessage={actions.rateLimitMessage}
            planPath="/dashboard/subscriptions"
            title="Application"
            targetLink="/dashboard/my-docs?tab=applications"
          />
        );

      default:
        return (
          <div className="min-h-screen flex flex-col justify-center items-center py-20">
            <div>
              <img
                src="/logo.png"
                alt="logo"
                className="w-10 h-10 animate-bounce"
              />
            </div>
            <div className="text-lg">LOADING...</div>
          </div>
        );
    }
  };

  return (
    <div className="">
      <AnimatePresence mode="wait">
        <motion.div
          key={wizardStep}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
