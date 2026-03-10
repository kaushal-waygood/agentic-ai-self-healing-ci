'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { AnimatePresence, motion } from 'framer-motion';

import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import apiInstance from '@/services/api';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import { getStudentDetailsRequest } from '@/redux/reducers/studentReducer';

import JobWizard from './components/JobWizard';
import ClGenerator from './cl-generator';
import CustomizeWizard from './customizeWizard';
import SavedCoverLetters from './components/SavedCl';
import FinalResultView from './components/FinalResultView';

import { mockUserProfile, SavedCoverLetter } from '@/lib/data/user';
import { Console } from 'console';
import { savedStudentCoverLetterRequest } from '@/redux/reducers/aiReducer';

/* ---------------- helpers ---------------- */

const isUsageLimitError = (error: any) => {
  const status = error?.response?.status;
  const data = error?.response?.data;
  return status === 429 || (status === 403 && data?.error === 'LIMIT_REACHED');
};

/* ---------------- types ---------------- */

type WizardStep = 'job' | 'cv' | 'customize' | 'context' | 'result';

type JobContext = {
  mode: 'paste' | 'select' | 'title';
  value: string;
  title: string;
  description: string;
};

type CvSource = {
  mode: 'upload' | 'profile' | 'saved';
  value: string;
  name: string;
  id?: string;
};

const customizationSchema = z.object({
  tone: z.enum(['Formal', 'Enthusiastic', 'Reserved', 'Casual']),
  style: z.enum(['Concise', 'Detailed']),
  personalStory: z.string().optional(),
});

type CustomizationValues = z.infer<typeof customizationSchema>;

/* ---------------- component ---------------- */

export function CoverLetterGeneratorClient() {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();

  /* wizard */
  const [wizardStep, setWizardStep] = useState<WizardStep>('job');
  const [jobContext, setJobContext] = useState<JobContext | null>(null);
  const [cvSource, setCvSource] = useState<CvSource | null>(null);

  /* ui */
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [additionalNarratives, setAdditionalNarratives] = useState('');

  /* result */
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState('');
  const [currentContent, setCurrentContent] = useState('');
  const [generatingDocumentId, setGeneratingDocumentId] = useState<string | null>(
    null,
  );

  /* saved letters */
  const [savedLettersList, setSavedLettersList] = useState<SavedCoverLetter[]>(
    mockUserProfile.savedCoverLetters,
  );
  const [isNamingDialogDisplayed, setIsNamingDialogDisplayed] = useState(false);
  const [letterNameForSavingInput, setLetterNameForSavingInput] = useState('');
  const [activeLetterToSave, setActiveLetterToSave] = useState<string | null>(
    null,
  );

  /* job inputs */
  const [pastedJobDesc, setPastedJobDesc] = useState('');
  const [enteredJobTitle, setEnteredJobTitle] = useState('');
  const [selectedSavedCvId, setSelectedSavedCvId] = useState('');

  /* limit ui */
  const [rateLimited, setRateLimited] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);
  const [incompleteProfile, setIncompleteProfile] = useState<string | null>(
    null,
  );

  const { students: student } = useSelector(
    (state: RootState) => state.student,
  );

  const { letter } = useSelector((state: RootState) => state.ai);
  useEffect(() => {
    dispatch(getStudentDetailsRequest());
    dispatch(savedStudentCoverLetterRequest());
  }, [dispatch]);

  /* ---------- URL query: slug, step, docType (consistent with cv-generator & apply) ---------- */
  useEffect(() => {
    const slug = searchParams.get('slug');
    if (!slug) return;

    const initFromSlug = async () => {
      try {
        setIsLoading(true);
        setLoadingMessage('Loading job details...');
        const response = await apiInstance.get(`/jobs/job-desc/${slug}`);
        const job = response.data?.singleJob ?? response.data?.job ?? response.data;
        if (!job) return;

        setJobContext({
          mode: 'select',
          value: slug,
          title: job.title ?? '',
          description: job.description ?? '',
        });
        setWizardStep('cv');
      } catch (err) {
        console.error('Failed to load job from slug:', err);
        toast({
          variant: 'destructive',
          title: 'Could not load job',
          description: 'The job may no longer be available. Try selecting a job manually.',
        });
      } finally {
        setIsLoading(false);
        setLoadingMessage('');
      }
    };

    initFromSlug();
  }, [searchParams, toast]);

  /* ---------- Navigation Guards ---------- */

  // 1. Define when the user is "active" in the process
  const isDeepInWizard = wizardStep !== 'job';

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

  // Handle Hard Refresh / Tab Close
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

  // Handle Browser Back Button
  useEffect(() => {
    if (!isDeepInWizard) return;

    // Push a dummy state to the history stack to "trap" the back button
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      if (isDeepInWizard) {
        // Re-push the state to stay on the page
        window.history.pushState(null, '', window.location.href);

        // Optional: replace alert with a toast or your custom AlertDialog
        // toast({
        //   title: 'Progress will be lost',
        //   description:
        //     "Are you sure you want to leave? Use the 'Back' buttons inside the wizard to navigate safely.",
        //   variant: 'destructive',
        // });

        alert('Please wait until resume extraction is complete.');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isDeepInWizard, toast]);

  /* ---------------- job ---------------- */

  const handleSetJobContext = async (
    mode: JobContext['mode'],
    value: string,
  ) => {
    setIsLoading(true);
    setLoadingMessage('Processing job context...');

    try {
      let context: JobContext | null = null;

      if (mode === 'paste' && pastedJobDesc) {
        context = {
          mode,
          value: pastedJobDesc,
          title: 'Pasted Job Description',
          description: pastedJobDesc,
        };
      } else if (mode === 'title' && enteredJobTitle) {
        context = {
          mode,
          value: enteredJobTitle,
          title: enteredJobTitle,
          description: '',
        };
      } else if (mode === 'select' && value) {
        context = {
          mode,
          value,
          title: '',
          description: '',
        };
      }

      if (!context) {
        toast({
          variant: 'destructive',
          title: 'Invalid Input',
          description: 'Please provide valid job information.',
        });
        return;
      }

      setJobContext(context);
      setWizardStep('cv');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  /* ---------------- cv ---------------- */

  const handleSetCvContext = (
    mode: CvSource['mode'],
    data: { value: string; name: string; id?: string },
  ) => {
    setCvSource({ mode, ...data });
    setWizardStep('customize');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!validTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please upload a PDF, PNG, JPG, or Word document',
      });
      return;
    }

    setIsLoading(true);
    setLoadingMessage(`Processing ${file.name}...`);

    const reader = new FileReader();
    reader.onloadend = () => {
      handleSetCvContext('upload', {
        value: reader.result as string,
        name: file.name,
      });
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsDataURL(file);
  };

  const handleUseActiveProfileCv = () => {
    if (!student) {
      toast({
        variant: 'destructive',
        title: 'Profile Not Available',
        description: 'Could not load your profile data.',
      });
      return;
    }

    handleSetCvContext('profile', {
      value: JSON.stringify(student),
      name: 'User Profile Data',
    });
  };

  /* ---------------- generate ---------------- */

  const handleGenerate = async () => {
    if (!jobContext || !cvSource) return;

    setRateLimited(false);
    setRateLimitMessage(null);
    setGeneratingDocumentId(null);
    setIsLoading(true);
    setWizardStep('result');
    setGeneratedCoverLetter('');
    setCurrentContent('');

    try {
      const formData = new FormData();

      if (jobContext.mode === 'paste') {
        formData.append('jobDescription', jobContext.description);
      } else if (jobContext.mode === 'title') {
        formData.append('title', jobContext.title);
      } else {
        formData.append('jobId', jobContext.value);
      }

      if (cvSource.mode === 'profile') {
        formData.append('useProfile', 'true');
      } else if (cvSource.mode === 'upload') {
        const blob = await fetch(cvSource.value).then((r) => r.blob());
        formData.append('cv', blob, cvSource.name);
      } else if (cvSource.mode === 'saved' && cvSource.id) {
        formData.append('savedCVId', cvSource.id);
      }

      if (additionalNarratives) {
        formData.append('finalTouch', additionalNarratives);
      }

      formData.append('flag', 'web');

      const endpoint =
        jobContext.mode === 'paste'
          ? '/students/coverletter/generate/jd'
          : jobContext.mode === 'title'
            ? '/students/coverletter/generate/jobtitle'
            : '/students/coverletter/generate/jobId';

      const res = await apiInstance.post(endpoint, formData);
      const data = res.data?.data ?? res.data;

      // 202: async generation started, poll status API
      if (res.status === 202 && data?.clId) {
        setGeneratingDocumentId(
          typeof data.clId === 'string' ? data.clId : data.clId?.toString?.(),
        );
        toast({
          title: 'Cover Letter Generation Started',
          description:
            'Your cover letter is being generated. We will update when it is ready.',
        });
        return;
      }

      setGeneratedCoverLetter(data);
      setCurrentContent(data);

      dispatch(savedStudentCoverLetterRequest());

      toast({
        title: 'Cover Letter Generated!',
        description: 'Your draft is ready.',
      });
    } catch (error: any) {
      if (
        error?.response?.status === 403 &&
        error?.response?.data?.message === 'Profile incomplete'
      ) {
        setIncompleteProfile(
          error?.response?.data?.reasons?.join(', ') ||
            'Please complete your profile to continue.',
        );
        setWizardStep('result');
        return;
      }

      if (isUsageLimitError(error)) {
        setRateLimited(true);
        setRateLimitMessage(
          error?.response?.data?.message ||
            'You have exhausted your cover letter limit.',
        );
        return;
      }

      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description:
          error?.response?.data?.message ||
          error?.message ||
          'Something went wrong.',
      });

      setWizardStep('context');
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateLetter = async () => {
    await handleGenerate();
  };

  const customizationForm = useForm<CustomizationValues>({
    resolver: zodResolver(customizationSchema),
    defaultValues: {
      tone: 'Formal',
      style: 'Concise',
      personalStory: '',
    },
  });

  /* ---------------- save ---------------- */

  const confirmSaveNamedLetter = async () => {
    if (!letterNameForSavingInput.trim() || !activeLetterToSave) return;

    try {
      await apiInstance.post('/students/letter/save/html', {
        title: letterNameForSavingInput,
        html: activeLetterToSave,
      });

      dispatch(savedStudentCoverLetterRequest());
      toast({ title: 'Cover Letter Saved!' });
    } finally {
      setIsNamingDialogDisplayed(false);
      setLetterNameForSavingInput('');
      setActiveLetterToSave(null);
    }
  };

  /* ---------------- render ---------------- */

  const renderStep = () => {
    switch (wizardStep) {
      case 'job':
        return (
          <JobWizard
            isLoading={isLoading}
            pastedJobDescription={pastedJobDesc}
            setPastedJobDescription={setPastedJobDesc}
            enteredJobTitle={enteredJobTitle}
            handleSetJobContext={handleSetJobContext}
            setEnteredJobTitle={setEnteredJobTitle}
          />
        );
      case 'cv':
        return (
          <ClGenerator
            selectedSavedCvId={selectedSavedCvId}
            setSelectedSavedCvId={setSelectedSavedCvId}
            mockUserProfile={mockUserProfile}
            handleSetCvContext={handleSetCvContext}
            handleUseActiveProfileCv={handleUseActiveProfileCv}
            fileInputRef={fileInputRef}
            handleFileUpload={handleFileUpload}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
            setWizardStep={setWizardStep}
          />
        );
      case 'customize':
        return (
          <CustomizeWizard
            customizationForm={customizationForm}
            handleGenerate={handleGenerate}
            isLoading={isLoading}
            setWizardStep={setWizardStep}
          />
        );
      case 'result':
        return (
          <FinalResultView
            incompleteProfile={incompleteProfile}
            rateLimited={rateLimited}
            rateLimitMessage={rateLimitMessage}
            planPath="/dashboard/subscriptions"
            title="Cover Letter"
            targetLink="/dashboard/my-docs?tab=cover-letters"
            documentId={generatingDocumentId ?? undefined}
            documentType="cl"
            onStatusCompleted={() => dispatch(savedStudentCoverLetterRequest())}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={wizardStep}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {isNamingDialogDisplayed && (
        <AlertDialog open onOpenChange={setIsNamingDialogDisplayed}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Name Your Cover Letter</AlertDialogTitle>
              <AlertDialogDescription>
                Give this version a unique name.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              value={letterNameForSavingInput}
              onChange={(e) => setLetterNameForSavingInput(e.target.value)}
              className="my-4"
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmSaveNamedLetter}>
                Save Letter
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
