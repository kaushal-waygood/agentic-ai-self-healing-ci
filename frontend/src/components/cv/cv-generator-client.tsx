'use client';

import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';

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
import { Input } from '../ui/input';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import { getStudentDetailsRequest } from '@/redux/reducers/studentReducer';
import { savedStudentResumeRequest } from '@/redux/reducers/aiReducer';

import apiInstance from '@/services/api';

import { CVGenerationOutput } from '@/ai/flows/cv-generation';
import { mockUserProfile, SavedCv } from '@/lib/data/user';

import JobWizard from './components/JobWizard';
import CVGeneratorClient from './CVGeneratorClient';
import ContextWizard from './ContextWizard';
import SavedCvs from './components/SavedCvs';
import FinalResultView from '../cover-letter/components/FinalResultView';

/* ---------- helpers ---------- */

const isUsageLimitError = (error: any) => {
  const status = error?.response?.status;
  const data = error?.response?.data;

  return status === 429 || (status === 403 && data?.error === 'LIMIT_REACHED');
};

/* ---------- types ---------- */

type WizardStep = 'job' | 'cv' | 'context' | 'generating' | 'result';

type JobContext = {
  mode: 'select' | 'paste' | 'title';
  value: string;
  title: string;
  description: string;
};

type CvSource = {
  mode: 'upload' | 'profile' | 'form' | 'saved';
  value: string;
  name: string;
  id?: string;
};

/* ---------- component ---------- */

export function CvGeneratorClient() {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* wizard state */
  const [wizardStep, setWizardStep] = useState<WizardStep>('job');
  const [jobContext, setJobContext] = useState<JobContext | null>(null);
  const [cvSource, setCvSource] = useState<CvSource | null>(null);
  const [additionalNarratives, setAdditionalNarratives] = useState('');

  /* ui + result */
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [generatedCvOutput, setGeneratedCvOutput] =
    useState<CVGenerationOutput | null>(null);
  const [currentCvContent, setCurrentCvContent] = useState('');

  /* saved cvs */
  const [savedCvsList, setSavedCvsList] = useState<SavedCv[]>([]);
  const [isNamingDialogDisplayed, setIsNamingDialogDisplayed] = useState(false);
  const [cvNameForSavingInput, setCvNameForSavingInput] = useState('');
  const [activeCvToSave, setActiveCvToSave] =
    useState<CVGenerationOutput | null>(null);

  /* job step */
  const [pastedJobDescription, setPastedJobDescription] = useState('');
  const [enteredJobTitle, setEnteredJobTitle] = useState('');
  const [selectedSavedCvId, setSelectedSavedCvId] = useState('');

  /* limit ui */
  const [rateLimited, setRateLimited] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);
  const [incompleteProfile, setIncompleteProfile] = useState<string | null>(
    null,
  );

  const {
    students: student,
    loading: studentLoading,
    error: studentError,
  } = useSelector((state: RootState) => state.student);

  const { resume } = useSelector((state: RootState) => state.ai);

  /* ---------- effects ---------- */

  useEffect(() => {
    dispatch(getStudentDetailsRequest());
    dispatch(savedStudentResumeRequest());
  }, [dispatch]);

  useEffect(() => {
    if (studentError) {
      toast({
        variant: 'destructive',
        title: 'Error loading profile',
        description: studentError.message || 'Failed to load student data',
      });
    }
  }, [studentError, toast]);

  /* ---------- handlers ---------- */

  const handleSetJobContext = async (
    mode: JobContext['mode'],
    value: string,
  ) => {
    setIsLoading(true);
    setLoadingMessage('Processing job context...');
    try {
      let context: JobContext | null = null;

      if (mode === 'select' && value) {
        context = { mode, value, title: '', description: '' };
      } else if (mode === 'paste' && pastedJobDescription) {
        context = {
          mode,
          value: pastedJobDescription,
          title: 'Pasted Job Description',
          description: pastedJobDescription,
        };
      } else if (mode === 'title' && enteredJobTitle) {
        context = {
          mode,
          value: enteredJobTitle,
          title: enteredJobTitle,
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

  const handleSetCvSource = (
    mode: CvSource['mode'],
    data: { value: string; name: string; id?: string },
  ) => {
    setCvSource({ mode, ...data });
    setWizardStep('context');
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
      handleSetCvSource('upload', {
        value: reader.result as string,
        name: file.name,
      });
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsDataURL(file);
  };

  const handleUseProfile = () => {
    if (studentLoading || !student) {
      toast({
        variant: 'destructive',
        title: 'Profile Not Available',
        description: 'Could not load your profile data.',
      });
      return;
    }

    handleSetCvSource('profile', {
      value: JSON.stringify(student),
      name: 'User Profile Data',
    });
  };

  /* ---------- generation ---------- */

  const handleGenerate = async () => {
    if (!jobContext || !cvSource) return;

    setRateLimited(false);
    setRateLimitMessage(null);
    setIsLoading(true);
    setWizardStep('result');
    setGeneratedCvOutput(null);
    setCurrentCvContent('');

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
          ? '/students/resume/generate/jd'
          : jobContext.mode === 'title'
          ? '/students/resume/generate/jobtitle'
          : '/students/resume/generate/jobId';

      const res = await apiInstance.post(endpoint, formData);
      const data = res.data.data || res.data;

      const output: CVGenerationOutput = {
        cv: data.cv ?? data,
        atsScore: data.atsScore ?? 0,
        atsSuggestion: data.atsSuggestion ?? '',
      };

      setGeneratedCvOutput(output);
      setCurrentCvContent(output.cv);

      toast({
        title: 'CV Generated & Auto-saved!',
        description: 'Your new CV draft has been added to your saved list.',
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
      if (isUsageLimitError(error)) {
        setRateLimited(true);
        setRateLimitMessage(
          error?.response?.data?.message ||
            'You have exhausted your CV generation limit.',
        );
        return;
      }

      // toast({
      //   variant: 'destructive',
      //   title: 'Generation Failed',
      //   description:
      //     error?.response?.data?.reasons[0] ||
      //     error?.message ||
      //     'Something went wrong.',
      // });
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: (
          <ul className="list-disc pl-4 space-y-1">
            {error?.response?.data?.reasons?.map(
              (reason: string, index: number) => (
                <li key={index}>{reason}</li>
              ),
            )}
          </ul>
        ),
      });

      setWizardStep('context');
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateCv = async () => {
    await handleGenerate();
  };

  /* ---------- save ---------- */

  const handleInitiateSave = () => {
    if (!generatedCvOutput) return;
    setActiveCvToSave({ ...generatedCvOutput, cv: currentCvContent });
    setCvNameForSavingInput(`CV for ${jobContext?.title || 'Job'}`);
    setIsNamingDialogDisplayed(true);
  };

  const confirmSaveNamedCv = async () => {
    if (!activeCvToSave || !cvNameForSavingInput.trim()) return;

    try {
      await apiInstance.post('/students/resume/save/html', {
        title: cvNameForSavingInput,
        html: activeCvToSave.cv,
        ats: activeCvToSave.atsScore,
      });
      toast({ title: 'CV Saved Successfully!' });
      dispatch(savedStudentResumeRequest());
    } finally {
      setIsNamingDialogDisplayed(false);
      setActiveCvToSave(null);
      setCvNameForSavingInput('');
    }
  };

  /* ---------- render ---------- */

  const renderStep = () => {
    switch (wizardStep) {
      case 'job':
        return (
          <JobWizard
            isLoading={isLoading}
            pastedJobDescription={pastedJobDescription}
            setPastedJobDescription={setPastedJobDescription}
            enteredJobTitle={enteredJobTitle}
            handleSetJobContext={handleSetJobContext}
            setEnteredJobTitle={setEnteredJobTitle}
          />
        );
      case 'cv':
        return (
          <CVGeneratorClient
            handleFileInputUploadClick={() => fileInputRef.current?.click()}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
            fileInputRef={fileInputRef}
            handleFileUpload={handleFileUpload}
            handleUseProfile={handleUseProfile}
            mockUserProfile={mockUserProfile}
            selectedSavedCvId={selectedSavedCvId}
            setSelectedSavedCvId={setSelectedSavedCvId}
            handleSetCvSource={handleSetCvSource}
            setWizardStep={setWizardStep}
          />
        );
      case 'context':
        return (
          <ContextWizard
            additionalNarratives={additionalNarratives}
            setAdditionalNarratives={setAdditionalNarratives}
            setWizardStep={setWizardStep}
            handleGenerate={handleGenerate}
          />
        );
      case 'result':
        return (
          <FinalResultView
            incompleteProfile={incompleteProfile}
            cvlink={undefined}
            rateLimited={rateLimited}
            rateLimitMessage={rateLimitMessage}
            planPath="/dashboard/subscriptions"
            title="CV"
            targetLink="/dashboard/my-docs?tab=cvs"
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {isNamingDialogDisplayed && (
        <AlertDialog open onOpenChange={setIsNamingDialogDisplayed}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Name Your CV</AlertDialogTitle>
              <AlertDialogDescription>
                Give this version a unique name.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              value={cvNameForSavingInput}
              onChange={(e) => setCvNameForSavingInput(e.target.value)}
              className="my-4"
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmSaveNamedCv}>
                Save CV
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
