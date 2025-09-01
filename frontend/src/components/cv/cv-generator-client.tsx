'use client';

import { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  UploadCloud,
  FileText,
  Wand2,
  Star,
  Info,
  List,
  Eye,
  Loader2,
  Briefcase,
  User,
  FileSignature,
  ArrowLeft,
  ChevronsRight,
  Save,
} from 'lucide-react';
import { generateCv, CVGenerationOutput } from '@/ai/flows/cv-generation';
import { mockUserProfile, SavedCv } from '@/lib/data/user';
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
import { AnimatePresence, motion } from 'framer-motion';
import { mockJobListings } from '@/lib/data/jobs';
import { extractJobDetails } from '@/ai/flows/extract-job-details-flow';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { EditableMaterial } from '../application/editable-material';
import { mockSubscriptionPlans } from '@/lib/data/subscriptions';
import Link from 'next/link';
import { ToastAction } from '../ui/toast';
import { Separator } from '../ui/separator';
import { add } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import { useDispatch } from 'react-redux';
import { getStudentDetailsRequest } from '@/redux/reducers/studentReducer';
import apiInstance from '@/services/api';
import {
  generateCVByJobDescriptionRequest,
  savedStudentResumeRequest,
} from '@/redux/reducers/aiReducer';
import JobWizard from './components/JobWizard';
import CVGeneratorClient from './CVGeneratorClient';
import ContextWizard from './ContextWizard';
import SleekLoadingCard from '../application/applications/wizard/steps/LoadingStep';
import GeneratedCV from './GeneratedCV';
import SavedCvs from './components/SavedCvs';

// --- Types and Schemas ---

type WizardStep = 'job' | 'cv' | 'context' | 'generating' | 'result';
type JobContext = {
  mode: 'select' | 'paste' | 'title';
  value: string; // job ID, pasted text, or job title
  title: string;
  description: string;
};
type CvSource = {
  mode: 'upload' | 'profile' | 'form' | 'saved';
  value: string; // dataURI, 'profile', saved CV ID, or a serialized form object
  name: string;
};

export function CvGeneratorClient() {
  const { toast } = useToast();
  const [wizardStep, setWizardStep] = useState<WizardStep>('job');

  // Wizard State
  const [jobContext, setJobContext] = useState<JobContext | null>(null);
  const [cvSource, setCvSource] = useState<CvSource | null>(null);
  const [additionalNarratives, setAdditionalNarratives] = useState('');
  const [isJobDiscription, setIsJobDiscription] = useState('');

  // UI & Result State
  const [generatedCvOutput, setGeneratedCvOutput] =
    useState<CVGenerationOutput | null>(null);
  const [currentCvContent, setCurrentCvContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const [savedCvsList, setSavedCvsList] = useState<SavedCv[]>([]);
  const [isNamingDialogDisplayed, setIsNamingDialogDisplayed] = useState(false);
  const [cvNameForSavingInput, setCvNameForSavingInput] = useState('');
  const [activeCvToSave, setActiveCvToSave] =
    useState<CVGenerationOutput | null>(null);

  // State for Job Context Step
  const [pastedJobDescription, setPastedJobDescription] = useState('');
  const [enteredJobTitle, setEnteredJobTitle] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');

  // State for CV Source Step
  const [selectedSavedCvId, setSelectedSavedCvId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSetJobContext = async (mode: 'select' | 'paste' | 'title') => {
    let context: JobContext | null = null;
    setIsLoading(true);
    setLoadingMessage('Processing job context...');
    try {
      if (mode === 'select' && selectedJobId) {
        const job = mockJobListings.find((j) => j.id === selectedJobId);
        if (job)
          context = {
            mode,
            value: selectedJobId,
            title: job.title,
            description: job.description,
          };
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
          description: '', // No description available for title mode
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
      console.log('error', error);
      toast({
        variant: 'destructive',
        title: 'Error Processing Job',
        description: 'Could not process the job details.',
      });
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleSetCvSource = (
    mode: CvSource['mode'],
    data: { value: string; name: string },
  ) => {
    setCvSource({ mode, ...data });
    setWizardStep('context');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('Selected file:', file); // Debugging

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
      console.log('File read completed');
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

  const handleFileInputUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error('File input ref is not attached yet');
    }
  };

  const handleUseProfile = () => {
    if (studentLoading) {
      toast({
        title: 'Loading Profile',
        description: 'Please wait while we load your profile data...',
      });
      return;
    }

    if (!student) {
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

  const handleGenerate = async () => {
    if (!jobContext || !cvSource) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Job and CV context are required.',
      });
      return;
    }

    // Check if student data is available
    if (!student) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not find your user profile.',
      });
      return;
    }

    setIsLoading(true);
    setWizardStep('generating');
    setGeneratedCvOutput(null);
    setCurrentCvContent('');

    try {
      let response;

      // Handle different job context modes
      if (jobContext.mode === 'paste') {
        // JD-based CV generation
        const formData = new FormData();

        formData.append('jobDescription', jobContext.description);

        if (cvSource.mode === 'profile') {
          formData.append('useProfile', 'true');
        } else if (cvSource.mode === 'upload') {
          // Convert data URI to blob if needed
          const blob = await fetch(cvSource.value).then((r) => r.blob());
          formData.append('cv', blob, cvSource.name);
        } else if (cvSource.mode === 'saved') {
          // Create a blob from saved CV content
          const blob = new Blob([cvSource.value], { type: 'text/html' });
          formData.append('cv', blob, 'saved_cv.html');
        }

        // Add additional narratives if provided
        if (additionalNarratives) {
          formData.append('finalTouch', additionalNarratives);
        }

        const apiResponse = await apiInstance.post(
          'students/resume/generate/jd',
          formData,
        );

        // Handle HTML response
        response = {
          cv: apiResponse.data,
          atsScore: 0,
          atsScoreReasoning: 'ATS score not calculated for JD-based generation',
        };
      } else if (jobContext.mode === 'title') {
        const formData = new FormData();

        formData.append('title', jobContext.title);

        if (cvSource.mode === 'profile') {
          formData.append('useProfile', 'true');
        } else if (cvSource.mode === 'upload') {
          // Convert data URI to blob if needed
          const blob = await fetch(cvSource.value).then((r) => r.blob());
          formData.append('cv', blob, cvSource.name);
        } else if (cvSource.mode === 'saved') {
          // Create a blob from saved CV content
          const blob = new Blob([cvSource.value], { type: 'text/html' });
          formData.append('cv', blob, 'saved_cv.html');
        }

        // Add additional narratives if provided
        if (additionalNarratives) {
          formData.append('finalTouch', additionalNarratives);
        }

        const apiResponse = await apiInstance.post(
          'students/resume/generate/jobtitle',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        // Handle HTML response
        response = {
          cv: apiResponse.data,
          atsScore: 0, // You might want to calculate this from the API
          atsScoreReasoning: 'ATS score not calculated for JD-based generation',
        };
      }

      // Save the generated CV
      const newAutoSavedCv: SavedCv = {
        id: `auto-${Date.now()}`,
        name: `Draft for '${jobContext.title.substring(
          0,
          25,
        )}...' - ${new Date().toLocaleString()}`,
        htmlContent: response.cv,
        atsScore: response.atsScore ?? 0,
        atsScoreReasoning:
          response.atsScoreReasoning ?? 'ATS score not available',
        createdAt: new Date().toISOString(),
        jobTitle: jobContext.title,
      };

      const updatedSavedCvs = [newAutoSavedCv, ...savedCvsList];
      setSavedCvsList(updatedSavedCvs);

      setGeneratedCvOutput(response);
      setCurrentCvContent(response.cv);

      toast({
        title: 'CV Generated & Auto-saved!',
        description:
          'Your new CV draft has been added to your saved list below.',
      });
      setWizardStep('result');
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description:
          error.response?.data?.error ||
          error.message ||
          'Failed to generate CV',
      });
      setWizardStep('context');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiateSave = () => {
    if (!generatedCvOutput) {
      toast({ variant: 'destructive', title: 'No CV to Save' });
      return;
    }
    setActiveCvToSave({ ...generatedCvOutput, cv: currentCvContent });
    setCvNameForSavingInput(`CV for ${jobContext?.title || 'Job'}`);
    setIsNamingDialogDisplayed(true);

    console.log('activeCvToSave', activeCvToSave.cv);
    console.log('cvNameForSavingInput', cvNameForSavingInput);
    console.log('isNamingDialogDisplayed', isNamingDialogDisplayed);
  };

  const confirmSaveNamedCv = async () => {
    const response = await apiInstance.post('students/resume/save/html', {
      title: cvNameForSavingInput,
      html: activeCvToSave.cv,
    });

    toast({ title: 'CV Saved!' });
    setIsNamingDialogDisplayed(false);
  };

  const loadSavedCv = async (savedCv: SavedCv) => {
    const repsonse = await apiInstance.get(
      `students/resume/saved/${savedCv._id}`,
    );

    console.log('repsonse', repsonse.data.html);
    setCurrentCvContent(repsonse.data.html);
    setGeneratedCvOutput({
      cv: savedCv.html,
      atsScore: savedCv.atsScore ?? 0,
      atsScoreReasoning:
        savedCv.atsScoreReasoning ??
        'ATS score not available for this saved version.',
    });

    console.log('generatedCvOutput', generatedCvOutput);

    setJobContext({
      mode: 'title',
      value: savedCv.htmlCVTitle,
      title: savedCv.htmlCVTitle,
    });

    console.log('currentCvContent', jobContext);

    setWizardStep('result');
    toast({
      title: 'CV Loaded',
      description: `"${savedCv.name}" is now in the editor.`,
    });
  };

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
            handleFileInputUploadClick={handleFileInputUploadClick}
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
      case 'generating':
        return <SleekLoadingCard />;

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
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {wizardStep === 'result' && generatedCvOutput && (
        <GeneratedCV
          generatedCvOutput={generatedCvOutput}
          handleInitiateSave={handleInitiateSave}
          setCurrentCvContent={setCurrentCvContent}
        />
      )}

      <SavedCvs resume={resume} loadSavedCv={loadSavedCv} />

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
