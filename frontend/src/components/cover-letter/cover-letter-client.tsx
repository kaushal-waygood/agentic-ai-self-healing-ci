'use client';

import { useState, useRef, useEffect } from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

import { mockUserProfile, SavedCoverLetter } from '@/lib/data/user';
import { extractJobDetails } from '@/ai/flows/extract-job-details-flow';
import { mockJobListings } from '@/lib/data/jobs';
import EditableMaterial from '../application/editable-material';
import { mockSubscriptionPlans } from '@/lib/data/subscriptions';
import Link from 'next/link';
import { ToastAction } from '../ui/toast';
import apiInstance from '@/services/api';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import { getStudentDetailsRequest } from '@/redux/reducers/studentReducer';
import JobWizard from './components/JobWizard';
import ClGenerator from './cl-generator';
import CustomizeWizard from './customizeWizard';
import SleekLoadingCard from '../application/applications/wizard/steps/LoadingStep';
import SavedCoverLetters from './components/SavedCl';
import GeneratedCoverLetter from './components/GeneratedCoverLetter';
import g from '@genkit-ai/googleai';
import FinalResultView from './components/FinalResultView';

// Wizard related types
type WizardStep =
  | 'job'
  | 'cv'
  | 'customize'
  // | 'generating'
  | 'result'
  | 'context';
type JobContext = {
  mode: 'paste' | 'select' | 'title';
  value: string;
  title: string;
  description: string;
};
type CvContext = {
  mode: 'saved' | 'profile' | 'upload';
  value: string;
  name: string;
};

const customizationSchema = z.object({
  tone: z.enum(['Formal', 'Enthusiastic', 'Reserved', 'Casual']),
  style: z.enum(['Concise', 'Detailed']),
  personalStory: z.string().optional(),
});
type CustomizationValues = z.infer<typeof customizationSchema>;

type CvSource = {
  mode: 'upload' | 'profile' | 'form' | 'saved';
  value: string; // dataURI, 'profile', saved CV ID, or a serialized form object
  name: string;
};

export function CoverLetterGeneratorClient() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wizard State
  const [wizardStep, setWizardStep] = useState<WizardStep>('job');
  const [jobContext, setJobContext] = useState<JobContext | null>(null);
  const [cvContext, setCvContext] = useState<CvContext | null>(null);

  // UI & Loading State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Result & Saved Letters State
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState('');
  const [savedLettersList, setSavedLettersList] = useState<SavedCoverLetter[]>(
    mockUserProfile.savedCoverLetters,
  );
  const [isNamingDialogDisplayed, setIsNamingDialogDisplayed] = useState(false);
  const [letterNameForSavingInput, setLetterNameForSavingInput] = useState('');
  const [activeLetterToSave, setActiveLetterToSave] = useState<string | null>(
    null,
  );

  const [additionalNarratives, setAdditionalNarratives] = useState('');
  const [currentCvContent, setCurrentCvContent] = useState<string>('');
  const [cvSource, setCvSource] = useState<CvSource | null>(null);

  // Form for step 3
  const customizationForm = useForm<CustomizationValues>({
    resolver: zodResolver(customizationSchema),
    defaultValues: { tone: 'Formal', style: 'Concise', personalStory: '' },
  });

  // State for Job Step
  const [pastedJobDesc, setPastedJobDesc] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [enteredJobTitle, setEnteredJobTitle] = useState('');

  // State for CV Step
  const [selectedSavedCvId, setSelectedSavedCvId] = useState('');
  const [generatedCvOutput, setGeneratedCvOutput] =
    useState<CVGenerationOutput | null>(null);

  const {
    students: student,
    loading: studentLoading,
    error: studentError,
  } = useSelector((state: RootState) => state.student);

  const {
    resume,
    loading: generatedCvLoading,
    error: generatedCvError,
  } = useSelector((state: RootState) => state.ai);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getStudentDetailsRequest());
  }, [generatedCvOutput]);

  const handleSetJobContext = async (
    mode: 'paste' | 'select' | 'title',
    value: string,
  ) => {
    setIsLoading(true);
    setLoadingMessage('Processing job context...');
    let context: JobContext | null = null;
    try {
      if (mode === 'select' && value) {
        setSelectedJobId(value);
        if (value)
          context = {
            mode,
            value: value,
          };
      } else if (mode === 'paste' && pastedJobDesc) {
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
          description: `Job application for the role of ${enteredJobTitle}.`,
        };
      }

      if (context) {
        setJobContext(context);
        setWizardStep('cv');
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid Input',
          description: 'Please provide valid job information.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Processing Job',
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // const handleSetCvContext = (
  //   mode: 'saved' | 'profile' | 'upload',
  //   data: { value: string; name: string; id?: string },
  // ) => {
  //   setCvSource({ mode, value: data.value, name: data.name });
  //   setWizardStep('customize');
  // };

  const handleSetCvContext = (
    mode: 'saved' | 'profile' | 'upload',
    data: { value: string; name: string; id?: string },
  ) => {
    setCvSource({
      mode,
      ...data,
    });
    setWizardStep('customize');
  };

  const handleSetCvSource = (
    mode: CvSource['mode'],
    data: { value: string; name: string },
  ) => {
    setCvSource({ mode, ...data });
    setWizardStep('customize');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      console.error('No file selected');
      return;
    }

    // Basic file validation
    const validTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    // const maxSize = 5 * 1024 * 1024; // 5MB

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

      // Reset file input to allow selecting same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      console.error('File read error:', reader.error);
      toast({
        variant: 'destructive',
        title: 'File Read Error',
        description: 'Could not read the file. Please try another file.',
      });
      setIsLoading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleUseActiveProfileCv = () => {
    if (student) {
      handleSetCvContext('profile', {
        value: JSON.stringify(student),
        name: 'User Profile Data',
      });
      setCvSource({ mode: 'profile', ...student });
      setWizardStep('customize');
    } else {
      toast({
        variant: 'destructive',
        title: 'Profile Not Available',
        description: 'Could not load your profile data.',
      });
    }
  };

  const [rateLimited, setRateLimited] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!jobContext || !cvSource) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Job and CV context are required.',
      });
      return;
    }

    if (!student) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not find your user profile.',
      });
      return;
    }

    // clear previous rate-limit state
    setRateLimited(false);
    setRateLimitMessage(null);

    setIsLoading(true);
    setWizardStep('result');
    setGeneratedCvOutput(null);
    setCurrentCvContent('');

    try {
      // PRE-FLIGHT: check usage/plan first to avoid heavy uploads/generation if blocked
      let planResponse;
      try {
        planResponse = await apiInstance.post('/plan/usage', {
          feature: 'cover-letter',
          creditsUsed: 0,
          action: 'generate', // server should either reserve/approve or reject
        });
        console.log('Plan response:', planResponse);
      } catch (err: any) {
        const status = err?.response?.status;
        const serverMessage =
          err?.response?.data?.message || err?.message || null;

        if (status === 429) {
          // Rate limited: stop here and show purchase UI
          setRateLimited(true);
          setRateLimitMessage(
            serverMessage ||
              'You have reached your cover-letter generation limit.',
          );
          setIsLoading(false);
          setWizardStep('result');
          return;
        } else {
          const msg = serverMessage || 'Failed to check plan usage. Try again.';
          toast({
            variant: 'destructive',
            title: 'Plan Check Failed',
            description: msg,
          });
          setIsLoading(false);
          setWizardStep('context');
          return;
        }
      }

      // server explicit deny via success:false
      if (planResponse?.data && planResponse.data.success === false) {
        toast({
          variant: 'destructive',
          title: 'Usage Denied',
          description:
            planResponse.data.message ||
            'Your plan does not allow this action right now.',
        });
        setIsLoading(false);
        setWizardStep('context');
        return;
      }

      // PLAN OK — now build payload and call generation endpoints
      let response: any = null;

      if (jobContext.mode === 'paste') {
        const formData = new FormData();
        formData.append('jobDescription', jobContext.description);

        if (cvSource.mode === 'profile') {
          formData.append('useProfile', 'true');
        } else if (cvSource.mode === 'upload') {
          const blob = await fetch(cvSource.value).then((r) => r.blob());
          formData.append('cv', blob, cvSource.name);
        } else if (cvSource.mode === 'saved') {
          const blob = new Blob([cvSource.value], { type: 'text/html' });
          formData.append('cv', blob, 'saved_cv.html');
        }

        if (additionalNarratives) {
          formData.append('finalTouch', additionalNarratives);
        }

        formData.append('flag', 'web');

        const apiResponse = await apiInstance.post(
          '/students/coverletter/generate/jd',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } },
        );

        response = { letter: apiResponse.data };
      } else if (jobContext.mode === 'title') {
        const formData = new FormData();
        formData.append('title', jobContext.title);

        if (cvSource.mode === 'profile') {
          formData.append('useProfile', 'true');
        } else if (cvSource.mode === 'upload') {
          const blob = await fetch(cvSource.value).then((r) => r.blob());
          formData.append('cv', blob, cvSource.name);
        } else if (cvSource.mode === 'saved') {
          const blob = new Blob([cvSource.value], { type: 'text/html' });
          formData.append('cv', blob, 'saved_cv.html');
        }

        if (additionalNarratives) {
          formData.append('finalTouch', additionalNarratives);
        }

        formData.append('flag', 'web');

        const apiResponse = await apiInstance.post(
          '/students/coverletter/generate/jobtitle',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } },
        );

        response = { letter: apiResponse.data };
      } else if (jobContext.mode === 'select') {
        const formData = new FormData();
        formData.append('jobId', jobContext.value);

        if (cvSource.mode === 'profile') {
          formData.append('useProfile', 'true');
        } else if (cvSource.mode === 'upload') {
          const blob = await fetch(cvSource.value).then((r) => r.blob());
          formData.append('cv', blob, cvSource.name);
        } else if (cvSource.mode === 'saved' && (cvSource as any).id) {
          formData.append('savedCVId', (cvSource as any).id);
          formData.append('useProfile', 'false');
        }

        if (additionalNarratives) {
          formData.append('finalTouch', additionalNarratives);
        }

        formData.append('flag', 'web');

        const apiResponse = await apiInstance.post(
          '/students/coverletter/generate/jobId',
          formData,
        );

        response = { letter: apiResponse.data };
      }

      // If we got a letter, continue to record usage (you do this after success)
      if (response?.letter) {
        // post-usage increment (optional, but you had this previously)
        try {
          await apiInstance.post('/plan/usage', {
            feature: 'cover-letter',
            creditsUsed: 0,
            action: 'generate',
          });
        } catch (usageErr) {
          // non-fatal: log or ignore; generation succeeded
          console.warn('Usage increment failed after generation', usageErr);
        }

        setGeneratedCvOutput(response.letter);
        setCurrentCvContent(response.letter);

        toast({
          title: 'Cover Letter Generated & Auto-saved!',
          description:
            'Your new cover letter draft has been added to your saved list below.',
        });
        setWizardStep('result');
      }
    } catch (error) {
      const errorMessage =
        (error as any).response?.data?.message ||
        (error as any).message ||
        'An unknown error occurred. Please try again.';

      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: errorMessage,
      });
      setWizardStep('context');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiateSave = async () => {
    const contentToSave = currentCvContent?.trim(); // ✅ Use the edited content

    if (!contentToSave) {
      toast({ variant: 'destructive', title: 'No Letter to Save' });
      return;
    }

    setActiveLetterToSave(contentToSave);
    setLetterNameForSavingInput(`Letter for ${jobContext?.title || 'Job'}`);
    setIsNamingDialogDisplayed(true);
  };

  const confirmSaveNamedLetter = async () => {
    if (!letterNameForSavingInput.trim() || !activeLetterToSave) return;

    try {
      const formValues = customizationForm.getValues();

      await apiInstance.post('/students/letter/save/html', {
        title: letterNameForSavingInput,
        html: currentCvContent, // ✅ Save edited content
      });

      const updatedResponse = await apiInstance.get('/students/letter/saved');
      setSavedLettersList(updatedResponse.data.html);

      toast({ title: 'Cover Letter Saved!' });
    } catch (error) {
      console.error('Error saving letter:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save your cover letter. Try again.',
      });
    } finally {
      setIsNamingDialogDisplayed(false);
      setLetterNameForSavingInput('');
      setActiveLetterToSave(null);
    }
  };

  const loadSavedLetter = (savedLetter: SavedCoverLetter) => {
    setGeneratedCvOutput(savedLetter.coverLetter);

    setJobContext({
      mode: 'paste',
      value: savedLetter.jobDescription,
      title: 'Saved Job',
      description: savedLetter.jobDescription,
    });
    setCvContext(null);
    setWizardStep('result');
    toast({
      title: 'Letter Loaded',
      description: `"${savedLetter.coverLetterTitle}" is now in the editor.`,
    });
  };

  const regenerateLetter = async () => {
    await handleGenerate();
    const response = await apiInstance.post('/plan/usage', {
      feature: 'cover-letter',
      creditsUsed: 0,
      action: 'regenerate',
    });
    toast({
      title: 'Letter Regenerated',
      description: 'Your new CV draft has been added to your saved list below.',
    });
  };

  const renderWizardStep = () => {
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
      // case 'generating':
      //   return <SleekLoadingCard />;

      case 'result':
        return (
          <FinalResultView
            cvlink={undefined}
            rateLimited={rateLimited}
            rateLimitMessage={rateLimitMessage}
            planPath="/dashboard/subscriptions"
            title="Cover Letter"
            targetLink={'/dashboard/my-docs?tab=cover-letters'}
          />
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    const fetchSavedLetters = async () => {
      try {
        const response = await apiInstance.get('/students/letter/saved');
        setSavedLettersList(response.data.html);
      } catch (error) {
        console.error('Error fetching saved letters:', error);
      }
    };

    fetchSavedLetters();
  }, []);

  return (
    <div className=" w-full max-w-7xl mx-auto space-y-8">
      <div>
        {/* Left Panel: Wizard */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={wizardStep}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {renderWizardStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <SavedCoverLetters
        savedLettersList={savedLettersList}
        loadSavedLetter={loadSavedLetter}
      />

      {isNamingDialogDisplayed && (
        <AlertDialog
          open={isNamingDialogDisplayed}
          onOpenChange={setIsNamingDialogDisplayed}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Name Your Cover Letter</AlertDialogTitle>
              <AlertDialogDescription>
                Give this version a unique name. E.g., "Letter for Google PM
                Role".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              placeholder="Enter Cover Letter Name"
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

      {isNamingDialogDisplayed && (
        <AlertDialog
          open={isNamingDialogDisplayed}
          onOpenChange={setIsNamingDialogDisplayed}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Name Your CV</AlertDialogTitle>
              <AlertDialogDescription>
                Give this version a unique name. E.g., "CV for Google PM Role".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              placeholder="Enter CV Name"
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
