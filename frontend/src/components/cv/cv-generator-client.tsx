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
import CVGeneratorClient from './CVGeneratorClient'; // Renamed for clarity from CVGeneratorClient
import ContextWizard from './ContextWizard';
import SleekLoadingCard from '../application/applications/wizard/steps/LoadingStep';
import GeneratedCV from './GeneratedCV';
import SavedCvs from './components/SavedCvs';
import FinalResultView from '../cover-letter/components/FinalResultView';

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

  const handleSetJobContext = async (
    mode: 'select' | 'paste' | 'title',
    value: any,
  ) => {
    let context: JobContext | null = null;
    setIsLoading(true);
    setLoadingMessage('Processing job context...');
    try {
      if (mode === 'select' && value) {
        context = {
          mode,
          value: value,
          // title: value.title,
          // description: value.description,
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

  // const handleSetCvSource = (
  //   mode: CvSource['mode'],
  //   data: { value: string; name: string },
  // ) => {
  //   console.log('Setting CV Source:', mode, data.value, data.name);
  //   setCvSource({ mode, ...data });
  //   setWizardStep('context');
  // };

  const handleSetCvSource = (
    mode: CvSource['mode'],
    data: { value: string; name: string; id?: string },
  ) => {
    console.log('Setting CV Source:', mode, data.value, data.name, data.id); // Also log the ID for debugging
    setCvSource({ mode, ...data });
    setWizardStep('context');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      console.error('No file selected');
      return;
    }

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
    // setWizardStep('generating');
    setWizardStep('result');
    setGeneratedCvOutput(null);
    setCurrentCvContent('');

    try {
      let response: CVGenerationOutput | null = null;
      const formData = new FormData();

      if (jobContext.mode === 'paste') {
        formData.append('jobDescription', jobContext.description);
      } else if (jobContext.mode === 'title') {
        formData.append('title', jobContext.title);
      } else if (jobContext.mode === 'select') {
        formData.append('jobId', jobContext.value);
      }

      if (cvSource.mode === 'profile') {
        formData.append('useProfile', 'true');
      } else if (cvSource.mode === 'upload') {
        const blob = await fetch(cvSource.value).then((r) => r.blob());
        formData.append('cv', blob, cvSource.name);
        // } else if (cvSource.mode === 'saved') {
        //   const blob = new Blob([cvSource.value], { type: 'text/html' });
        //   formData.append('cv', blob, 'saved_cv.html');
        // }
      } else if (cvSource.mode === 'saved' && cvSource.id) {
        // Send the ID instead of the binary blob
        formData.append('savedCVId', cvSource.id);
        formData.append('useProfile', 'false');
      }

      if (additionalNarratives) {
        formData.append('finalTouch', additionalNarratives);
      }

      let apiEndpoint = '';
      if (jobContext.mode === 'paste') {
        apiEndpoint = '/students/resume/generate/jd';
      } else if (jobContext.mode === 'title') {
        apiEndpoint = '/students/resume/generate/jobtitle';
      } else if (jobContext.mode === 'select') {
        apiEndpoint = `/students/resume/generate/jobId`;
      }

      const apiResponse = await apiInstance.post(apiEndpoint, formData);

      const responseData = apiResponse.data.data || apiResponse.data;

      if (responseData && typeof responseData === 'object') {
        await apiInstance.post('/plan/usage', {
          feature: 'cv-creation',
          creditsUsed: 1,
          action: 'generate',
        });
        response = {
          cv: responseData.cv,
          atsScore: responseData.atsScore,
          atsSuggestion: responseData.atsSuggestion,
        };
      } else {
        response = {
          cv: responseData,
          atsScore: 0,
          atsSuggestion:
            'ATS analysis not available for this generation method.',
        };
      }

      const newAutoSavedCv: SavedCv = {
        id: `auto-${Date.now()}`,
        name: `Draft for '${jobContext.title}...'`,
        htmlContent: response.cv,
        atsScore: response.ats ?? 0,
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
      const errorMessage =
        (error as any).response?.data?.message ||
        (error as any).message ||
        'An unknown error occurred. Please try again.';

      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: errorMessage, // This is now a string!
      });
      setWizardStep('context');
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateCv = async () => {
    // This function needs to be implemented fully based on your backend capabilities
    toast({ title: 'Regenerating...', description: 'Please wait.' });
    await handleGenerate(); // For now, just re-run the original generation
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
    if (!activeCvToSave || !cvNameForSavingInput.trim()) {
      toast({
        variant: 'destructive',
        title: 'Cannot Save',
        description: 'CV name cannot be empty.',
      });
      return;
    }
    try {
      await apiInstance.post('students/resume/save/html', {
        title: cvNameForSavingInput,
        html: activeCvToSave.cv,
        ats: activeCvToSave.atsScore,
      });
      toast({ title: 'CV Saved Successfully!' });
      dispatch(savedStudentResumeRequest()); // Refresh saved CVs list
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save the CV.',
      });
    } finally {
      setIsNamingDialogDisplayed(false);
      setActiveCvToSave(null);
      setCvNameForSavingInput('');
    }
  };

  const getAllCvs = async () => {
    try {
      const response = await apiInstance.get('/students/cvs');
    } catch (error) {
      console.error('Error fetching saved CVs:', error);
    }
  };

  const loadSavedCv = async (savedCv) => {
    try {
      const response = await apiInstance.get(
        `students/resume/saved/${savedCv._id}`,
      );

      const loadedData = response.data.html;

      setCurrentCvContent(loadedData.html);
      setGeneratedCvOutput({
        cv: loadedData.html,
        atsScore: loadedData.ats ?? 0,
        atsSuggestion:
          loadedData.atsSuggestion ??
          'ATS score not available for this saved version.',
      });

      setJobContext({
        mode: 'title',
        value: loadedData.title,
        title: loadedData.title,
        description: '',
      });

      setWizardStep('result');
      toast({
        title: 'CV Loaded',
        description: `"${loadedData.htmlCVTitle}" is now in the editor.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to Load CV',
        description: 'Please try again.',
      });
    }
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
      // case 'generating':
      //   return <SleekLoadingCard />;

      case 'result':
        return (
          // <GeneratedCV
          //   generatedCvOutput={generatedCvOutput}
          //   handleInitiateSave={handleInitiateSave}
          //   setCurrentCvContent={setCurrentCvContent}
          //   handleRegenerate={regenerateCv}
          //   setWizardStep={setWizardStep}
          // />

          <FinalResultView />
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
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* <button onClick={getAllCvs}>Get All CV's</button> */}

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
