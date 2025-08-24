'use client';

import { useState, useRef, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { AnimatePresence, motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Wand2,
  Sparkles,
  Edit3,
  Save,
  List,
  Eye,
  Archive,
  FileText,
  UploadCloud,
  Briefcase,
  User,
  FileSignature,
  ArrowLeft,
  ChevronsRight,
} from 'lucide-react';
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
import JobWizard from '../cv/components/JobWizard';
import ClGenerator from './cl-generator';
import CustomizeWizard from './customizeWizard';

// Wizard related types
type WizardStep =
  | 'job'
  | 'cv'
  | 'customize'
  | 'generating'
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

  const handleSetJobContext = async (mode: 'paste' | 'select' | 'title') => {
    setIsLoading(true);
    setLoadingMessage('Processing job context...');
    let context: JobContext | null = null;
    try {
      if (mode === 'select' && selectedJobId) {
        const job = mockJobListings.find((j) => j.id === selectedJobId);
        if (job)
          context = {
            mode,
            value: job.id,
            title: job.title,
            description: job.description,
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

  const handleSetCvContext = (
    mode: 'saved' | 'profile' | 'upload',
    data: { value: string; name: string },
  ) => {
    setCvContext({ mode, value: data.value, name: data.name });
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
          'students/coverletter/generate/jd',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        // Handle HTML response
        response = {
          letter: apiResponse.data,
        };

        setGeneratedCvOutput(response.letter);
        setCurrentCvContent(response.letter);
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
          'students/coverletter/generate/jobtitle',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        // Handle HTML response
        response = {
          letter: apiResponse.data,
        };
      }

      setGeneratedCvOutput(response.letter);
      setCurrentCvContent(response.letter);

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

  const handleInitiateSave = async () => {
    let contentToSave = generatedCvOutput;

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
    const formValues = customizationForm.getValues();
    const response = await apiInstance.post('/students/letter/save/html', {
      title: letterNameForSavingInput,
      html: generatedCvOutput,
    });

    const newSavedLetter = response.data;
    const updatedList = [newSavedLetter, ...savedLettersList];
    mockUserProfile.savedCoverLetters = updatedList;
    setSavedLettersList(updatedList);
    toast({ title: 'Cover Letter Saved!' });
    setIsNamingDialogDisplayed(false);
    setLetterNameForSavingInput('');
    setActiveLetterToSave(null);
  };

  const loadSavedLetter = (savedLetter: SavedCoverLetter) => {
    setGeneratedCvOutput(savedLetter.coverLetter);

    // customizationForm.reset({
    //   tone: savedLetter.tone,
    //   style: savedLetter.style,
    //   personalStory: savedLetter.personalStory,
    // });
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
      description: `"${savedLetter.name}" is now in the editor.`,
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
      case 'generating':
        return (
          <Card className="flex flex-col items-center justify-center text-center p-12 min-h-[400px]">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <h2 className="text-2xl font-headline font-semibold">
              Crafting Your Letter...
            </h2>
            <p className="text-muted-foreground mt-2">
              This may take a moment.
            </p>
          </Card>
        );
      case 'result':
        return (
          <Card className="flex flex-col items-center justify-center text-center p-12 w-full min-h-[400px]">
            <ChevronsRight className="h-16 w-16 text-primary mb-4" />
            <h2 className="text-2xl font-headline font-semibold">
              Letter Generated!
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xs">
              Your new cover letter is ready. Look right to review and edit your
              letter.
            </p>
            <CardFooter>
              <Button variant="ghost" onClick={() => setWizardStep('job')}>
                <ArrowLeft className="mr-2" />
                Start Over
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleInitiateSave}
                disabled={!generatedCvOutput || isLoading}
              >
                <Archive className="mr-2 h-4 w-4" /> Save Final Version
              </Button>
            </CardFooter>
            <div className="lg:sticky lg:top-4">
              <EditableMaterial
                editorId="cover-letter-editor"
                title="Cover Letter"
                content={generatedCvOutput}
                setContent={setGeneratedCoverLetter}
                isHtml
              />
            </div>
          </Card>
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
    <div className="space-y-8">
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

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <List className="mr-2 h-5 w-5 text-primary" />
            Saved Cover Letters
          </CardTitle>
          <CardDescription>
            Manage and view your previously saved letters. Auto-saved drafts
            appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {savedLettersList.length > 0 ? (
            <ul className="space-y-3">
              {savedLettersList.map((savedLetter) => (
                <li
                  key={savedLetter._id}
                  className="p-3 border rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium">
                      {savedLetter.coverLetterTitle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Saved: {new Date(savedLetter.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadSavedLetter(savedLetter)}
                  >
                    <Eye className="mr-2 h-4 w-4" /> View/Load
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">
              You haven't saved any cover letters yet.
            </p>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}
