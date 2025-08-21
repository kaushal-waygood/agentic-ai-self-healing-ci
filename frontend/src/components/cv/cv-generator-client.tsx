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
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">
                Step 2: Provide Your CV
              </CardTitle>
              <CardDescription>
                Choose your professional background source.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full h-20 text-base flex-col gap-2"
                onClick={handleFileInputUploadClick}
                disabled={isLoading}
              >
                {isLoading && loadingMessage ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <UploadCloud />
                    Upload CV File
                  </>
                )}
              </Button>
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={handleFileUpload}
              />
              <Button
                variant="outline"
                className="w-full h-20 text-base"
                onClick={handleUseProfile}
              >
                <User />
                Use My Profile
              </Button>
              {mockUserProfile.savedCvs?.length > 0 && (
                <>
                  <Separator />
                  <RadioGroup
                    value={selectedSavedCvId}
                    onValueChange={setSelectedSavedCvId}
                    className="space-y-2 max-h-40 overflow-y-auto p-2 border rounded-md"
                  >
                    {mockUserProfile.savedCvs.map((cv) => (
                      <Label
                        key={cv.id}
                        className="flex items-center gap-3 p-2 border rounded-md cursor-pointer hover:bg-muted/50 has-[:checked]:bg-primary/10 has-[:checked]:border-primary"
                      >
                        <RadioGroupItem value={cv.id} id={cv.id} />
                        {cv.name}
                      </Label>
                    ))}
                  </RadioGroup>
                  <Button
                    className="w-full"
                    onClick={() =>
                      handleSetCvSource('saved', {
                        value:
                          mockUserProfile.savedCvs.find(
                            (c) => c.id === selectedSavedCvId,
                          )?.htmlContent || '',
                        name:
                          mockUserProfile.savedCvs.find(
                            (c) => c.id === selectedSavedCvId,
                          )?.name || '',
                      })
                    }
                    disabled={!selectedSavedCvId}
                  >
                    Use Selected CV
                  </Button>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" onClick={() => setWizardStep('job')}>
                <ArrowLeft className="mr-2" />
                Back
              </Button>
            </CardFooter>
          </Card>
        );
      case 'context':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">
                Step 3: Final Touches
              </CardTitle>
              <CardDescription>
                Optionally add keywords or achievements for the AI to emphasize.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="e.g., Emphasize my experience with scalable systems. Mention my passion for user-centric design."
                className="min-h-[150px]"
                value={additionalNarratives}
                onChange={(e) => setAdditionalNarratives(e.target.value)}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" onClick={() => setWizardStep('cv')}>
                <ArrowLeft className="mr-2" />
                Back
              </Button>
              <Button size="lg" onClick={handleGenerate}>
                <Wand2 className="mr-2" />
                Generate My CV
              </Button>
            </CardFooter>
          </Card>
        );
      case 'generating':
        return (
          <Card className="flex flex-col items-center justify-center text-center p-12 min-h-[400px]">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <h2 className="text-2xl font-headline font-semibold">
              Crafting Your CV...
            </h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Our AI is analyzing your profile and the job description. This can
              take up to a minute.
            </p>
          </Card>
        );
      case 'result':
        return (
          <Card className="flex flex-col items-center justify-center text-center p-12 min-h-[400px]">
            <ChevronsRight className="h-16 w-16 text-primary mb-4" />
            <h2 className="text-2xl font-headline font-semibold">
              CV Generated!
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xs">
              Your tailored CV is ready. Review it and your saved CVs below.
            </p>
          </Card>
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

      {wizardStep === 'result' && generatedCvOutput && (
        <Card id="ai-generated-cv-card">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="font-headline text-2xl">
                  Your AI Generated CV
                </CardTitle>
                <CardDescription>
                  Review the CV below. Click the "Edit" button to make live
                  edits.
                </CardDescription>
              </div>
              <Button variant="secondary" onClick={handleInitiateSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Final Version
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Card className="mb-6 border-primary bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center">
                  <Star className="h-5 w-5 mr-2 text-primary" />
                  AI ATS Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-primary">
                    {generatedCvOutput.atsScore}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">
                    / 100
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {generatedCvOutput.atsScoreReasoning}
                </p>
              </CardContent>
            </Card>
            <EditableMaterial
              editorId="cv-live-editor"
              title="CV"
              content={generatedCvOutput.cv}
              setContent={setCurrentCvContent}
              isHtml
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <List className="mr-2 h-5 w-5 text-primary" />
            Your Saved CVs
          </CardTitle>
          <CardDescription>
            Manage your CVs. Auto-saved drafts appear here. Click to load one
            into the editor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resume?.html?.length > 0 ? (
            <ul className="space-y-3">
              {resume?.html.map((savedCv, i) => (
                <li
                  key={i}
                  className="p-3 border rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{savedCv.htmlCVTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      Generated for: {savedCv.jobTitle} | Created:{' '}
                      {new Date(savedCv.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadSavedCv(savedCv)}
                  >
                    <Eye className="mr-2 h-4 w-4" /> View/Load
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              You haven't generated any CVs yet. Use the wizard above to create
              your first one.
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
