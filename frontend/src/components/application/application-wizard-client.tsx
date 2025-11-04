'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useApplicationWizard, useCvForm } from '@/hooks/useApplicationWizard';
import { mockUserProfile } from '@/lib/data/user';

// Import all step components
import { JobStep } from './applications/JobStep';
import SleekCvStep from './applications/wizard/steps/create-cv/CreateCvStep';
import CreateCvStep from './applications/CreateCvStep';
import SleekClStep from './applications/wizard/steps/ClStep';
import { GenerateStep } from './applications/wizard/steps/GenerateStep';
import SleekLoadingCard from './applications/wizard/steps/LoadingStep';
import ResultStep from './applications/wizard/steps/result/ResultStep';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import FinalResultView from '../cover-letter/components/FinalResultView';

// Framer Motion Variants & Styled Components
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

const StyledCard = (props) => (
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

  const renderStep = () => {
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
            setWizardState={navigateToStep}
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
        return isLoading ? (
          // <SleekLoadingCard message={loadingMessage} />

          <FinalResultView />
        ) : (
          <GenerateStep
            jobContext={state.jobContext}
            cvContext={state.cvContext}
            clContext={state.clContext}
            handleGenerate={actions.handleGenerate}
            setWizardStep={navigateToStep}
          />
        );
      case 'result':
        return (
          <ResultStep
            jobContext={state.jobContext}
            refinedCv={generatedData.refinedCv}
            setRefinedCv={(val) =>
              setGeneratedData((d) => ({ ...d, refinedCv: val }))
            }
            tailoredCl={generatedData.tailoredCl}
            setTailoredCl={(val) =>
              setGeneratedData((d) => ({ ...d, tailoredCl: val }))
            }
            emailDraft={generatedData.emailDraft}
            setEmailDraft={(val) =>
              setGeneratedData((d) => ({ ...d, emailDraft: val }))
            }
            setWizardStep={navigateToStep}
            handleSendEmail={actions.handleSendEmail}
            handleSaveAndFinish={() => {
              actions.handleSaveAndFinish();
            }}
            handleStartNew={actions.handleStartNew}
          />
        );
      default:
        // Default to the loading state to handle undefined steps gracefully
        return (
          <div className="min-h-screen flex flex-col justify-center items-center py-20">
            {/* <Loader2 className="h-12 w-12 mx-auto animate-spin text-purple-600" />{' '} */}
            {/* <Loader2 className="h-12 w-12 animate-spin text-blue-500" /> */}
            <div>
              <img
                src="/logo.png"
                alt=""
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
