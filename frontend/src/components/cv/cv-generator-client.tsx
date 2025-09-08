'use client';

import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

import { CVGenerationOutput } from '@/ai/flows/cv-generation';
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
import { Input } from '../ui/input';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import { useDispatch } from 'react-redux';
import { getStudentDetailsRequest } from '@/redux/reducers/studentReducer';
import apiInstance from '@/services/api';
import { savedStudentResumeRequest } from '@/redux/reducers/aiReducer';
import JobWizard from './components/JobWizard';
import CVGeneratorClient from './CVGeneratorClient';
import ContextWizard from './ContextWizard';
import SleekLoadingCard from '../application/applications/wizard/steps/LoadingStep';
import GeneratedCV from './GeneratedCV';
import SavedCvs from './components/SavedCvs';

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

  const [pastedJobDescription, setPastedJobDescription] = useState('');
  const [enteredJobTitle, setEnteredJobTitle] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');

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
      console.error('error', error);
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
      let response: CVGenerationOutput | null = null;
      const formData = new FormData();

      // --- This part is the same, building the FormData ---
      if (jobContext.mode === 'paste') {
        formData.append('jobDescription', jobContext.description);
        // ... (rest of the logic for paste mode)
      } else if (jobContext.mode === 'title') {
        formData.append('title', jobContext.title);
      }

      if (cvSource.mode === 'profile') {
        formData.append('useProfile', 'true');
      } else if (cvSource.mode === 'upload') {
        const blob = await fetch(cvSource.value).then((r) => r.blob());
        // Use 'cv' as the key to match your backend multer config
        formData.append('cv', blob, cvSource.name);
      } else if (cvSource.mode === 'saved') {
        const blob = new Blob([cvSource.value], { type: 'text/html' });
        formData.append('cv', blob, 'saved_cv.html');
      }

      if (additionalNarratives) {
        formData.append('finalTouch', additionalNarratives);
      }

      let apiEndpoint = '';
      if (jobContext.mode === 'paste') {
        apiEndpoint = 'students/resume/generate/jd';
      } else if (jobContext.mode === 'title') {
        apiEndpoint = 'students/resume/generate/jobtitle';
      }

      const apiResponse = await apiInstance.post(apiEndpoint, formData);

      if (apiResponse.data && typeof apiResponse.data === 'object') {
        // This handles the JSON response from the 'jobtitle' route
        response = {
          cv: apiResponse.data.cv,
          atsScore: apiResponse.data.atsScore,
          atsSuggestion: apiResponse.data.atsSuggestion,
        };
      } else {
        // This handles a raw HTML response (fallback for 'jd' route if it behaves differently)
        response = {
          cv: apiResponse.data,
          atsScore: 0,
          atsSuggestion:
            'ATS analysis not available for this generation method.',
        };
      }

      const newAutoSavedCv: SavedCv = {
        id: `auto-${Date.now()}`,
        name: `Draft for '${jobContext.title.substring(0, 25)}...'`,
        htmlContent: response.cv,
        atsScore: response.atsScore ?? 0,
        atsScoreReasoning: response.atsSuggestion ?? 'N/A',
        createdAt: new Date().toISOString(),
        jobTitle: jobContext.title,
      };

      setSavedCvsList((prev) => [newAutoSavedCv, ...prev]);
      setGeneratedCvOutput(response);
      setCurrentCvContent(response.cv);

      toast({
        title: 'CV Generated & Auto-saved!',
        description: 'Your new CV draft has been added to your saved list.',
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
          'Failed to generate CV. Please check the server logs.',
      });
      setWizardStep('context'); // Go back to the context step on failure
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateCv = async () => {
    const response = await apiInstance.post('/students/resume/generate/jd', {
      jobContextString: JSON.stringify(jobContext),
      studentData: JSON.stringify(student),
      finalTouch: additionalNarratives,
      previousCVJson: JSON.stringify(generatedCvOutput),
    });

    setGeneratedCvOutput(response.data);
    setCurrentCvContent(response.data.cv);
  };

  const handleInitiateSave = () => {
    if (!generatedCvOutput) {
      toast({ variant: 'destructive', title: 'No CV to Save' });
      return;
    }
    setActiveCvToSave({ ...generatedCvOutput, cv: currentCvContent });
    setCvNameForSavingInput(`CV for ${jobContext?.title || 'Job'}`);
    setIsNamingDialogDisplayed(true);
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

    setCurrentCvContent(repsonse.data.html);
    setGeneratedCvOutput({
      cv: savedCv.html,
      atsScore: savedCv.atsScore ?? 0,
      atsScoreReasoning:
        savedCv.atsScoreReasoning ??
        'ATS score not available for this saved version.',
    });

    setJobContext({
      mode: 'title',
      value: savedCv.htmlCVTitle,
      title: savedCv.htmlCVTitle,
    });

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
          handleRegenerate={regenerateCv}
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
