'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { EditableMaterial } from '@/components/application/editable-material';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  FileCheck2,
  FileText,
  Loader2,
  PlusCircle,
  Save,
  Sparkles,
  Trash2,
  UploadCloud,
  User,
  Wand2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

import { mockUserProfile, SavedCv, SavedCoverLetter } from '@/lib/data/user';
import { mockJobListings, JobListing } from '@/lib/data/jobs';
import { mockApplications, MockApplication } from '@/lib/data/applications';
import { getJobDetails } from '@/ai/flows/get-job-details-flow';
import { generateTailoredApplication } from '@/ai/flows/tailored-application';
import { parseCv } from '@/ai/flows/parse-cv-flow';
import { extractJobDetails } from '@/ai/flows/extract-job-details-flow';
import { generateCv as generateCvFlow } from '@/ai/flows/cv-generation';
import { parseJobFromFile } from '@/ai/flows/parse-job-from-file-flow';
import { countries } from '@/lib/data/countries';
import { PageHeader } from '../common/page-header';
import { mockSubscriptionPlans } from '@/lib/data/subscriptions';
import { ToastAction } from '../ui/toast';
import Link from 'next/link';
import { useJobs } from '@/hooks/jobs/useJobs';
import { useProfile } from '@/hooks/useProfile';
import { current } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import { useDispatch } from 'react-redux';
import { savedStudentResumeRequest } from '@/redux/reducers/aiReducer';
import { getStudentDetailsRequest } from '@/redux/reducers/studentReducer';
import apiInstance from '@/services/api';
import { sendEmailPermit } from '@/services/api/auth';
import SleekCvStep from './applications/wizard/steps/create-cv/CreateCvStep';
import SleekClStep from './applications/wizard/steps/ClStep';
import { GenerateStep } from './applications/wizard/steps/GenerateStep';
import SleekLoadingCard from './applications/wizard/steps/LoadingStep';
import ResultStep from './applications/wizard/steps/result/ResultStep';
import { JobStep } from './applications/JobStep';

// Types for Wizard State
type WizardStep =
  | 'loading'
  | 'job'
  | 'cv'
  | 'createCv'
  | 'cl'
  | 'generate'
  | 'result';

type JobContext = {
  mode: 'select' | 'paste' | 'upload';
  jobId?: string;
  jobTitle: string;
  jobDescription: string;
  companyName: string;
};

type CvContext = {
  mode: 'upload' | 'profile' | 'create' | 'saved';
  value: string | File; // Can be file data URI, 'profile', or CV ID
  name: string;
};

type ClContext = {
  mode: 'upload' | 'paste' | 'saved' | 'skip';
  value?: string; // Can be file data URI or CL ID
  name?: string;
};

const clFormSchema = z.object({
  clSource: z.enum(['upload', 'paste', 'saved', 'skip']),
  pastedCl: z.string().optional(),
  savedClId: z.string().optional(),
});

const employmentTypes = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
] as const;

// CV Creation Form Schemas
const educationEntrySchema = z.object({
  institution: z.string().min(1, 'Institution name is required'),
  degree: z.string().min(1, 'Degree is required'),
  fieldOfStudy: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  gpa: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
});

const experienceEntrySchema = z
  .object({
    company: z.string().min(1, 'Company name is required'),
    jobTitle: z.string().min(1, 'Job title is required'),
    employmentType: z.enum(employmentTypes).optional(),
    location: z.string().optional(),
    isCurrent: z.boolean().default(false).optional(),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    responsibilities: z.string().optional(),
  })
  .refine(
    (data) => data.isCurrent || (!!data.endDate && data.endDate.length > 0),
    {
      message: 'End date is required for past jobs.',
      path: ['endDate'],
    },
  );

const projectEntrySchema = z
  .object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().min(1, 'Project description is required'),
    technologies: z.string().optional(),
    link: z
      .string()
      .url({ message: 'Please enter a valid URL.' })
      .or(z.literal(''))
      .optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isCurrent: z.boolean().default(false).optional(),
  })
  .refine(
    (data) => data.isCurrent || (!!data.endDate && data.endDate.length > 0),
    {
      message: 'End date is required for past projects.',
      path: ['endDate'],
    },
  );

const cvDetailsSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  linkedin: z.string().url().or(z.literal('')).optional(),
  summary: z.string().min(10, 'Summary should be at least 10 characters'),
  education: z
    .array(educationEntrySchema)
    .min(1, 'At least one education entry is required'),
  experience: z
    .array(experienceEntrySchema)
    .min(1, 'At least one experience entry is required'),
  projects: z.array(projectEntrySchema).optional(),
  skills: z.string().min(1, 'Please list some skills, comma-separated'),
  targetJobTitle: z
    .string()
    .min(1, 'A job title is required to tailor the CV.'),
});
type CvDetailsValues = z.infer<typeof cvDetailsSchema>;

const engagingMessages = [
  'Analyzing job description for keywords...',
  "Cross-referencing your CV with the role's requirements...",
  'Highlighting your most relevant skills...',
  'Structuring your new CV in Harvard style...',
  'Drafting a compelling cover letter...',
  'Finalizing the application email...',
  'Almost there, just polishing the final details...',
];

// Framer Motion Variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

export function ApplicationWizardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { toast } = useToast();

  // Wizard State
  const [wizardStep, setWizardStep] = useState<WizardStep>('loading');
  const [currentApplication, setCurrentApplication] =
    useState<MockApplication | null>(null);

  // Context State for each step
  const [jobContext, setJobContext] = useState<JobContext | null>(null);
  const [cvContext, setCvContext] = useState<CvContext | null>(null);
  const [clContext, setClContext] = useState<ClContext | null>(null);

  // Result State
  const [refinedCv, setRefinedCv] = useState('');
  const [tailoredCl, setTailoredCl] = useState('');
  const [emailDraft, setEmailDraft] = useState('');

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const cvFileInputRef = useRef<HTMLInputElement>(null);
  const clFileInputRef = useRef<HTMLInputElement>(null);
  const jobDescFileInputRef = useRef<HTMLInputElement>(null);

  // Step 1 Form State
  const [pastedJobDesc, setPastedJobDesc] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');

  // Step 2 Form State
  const [selectedCvId, setSelectedCvId] = useState('');

  // Step 3 Form State
  const clForm = useForm<{
    clSource: 'upload' | 'paste' | 'saved' | 'skip';
    pastedCl: string;
    savedClId: string;
  }>({ defaultValues: { clSource: 'skip', pastedCl: '', savedClId: '' } });

  const { jobs, loading, selectedJob } = useJobs({ searchParams });
  const { defaultValues } = useProfile();

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

  const navigateToStep = useCallback(
    (step: WizardStep) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('step', step);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    dispatch(getStudentDetailsRequest());
    dispatch(savedStudentResumeRequest());
  }, [dispatch]);

  const createCvForm = useForm<CvDetailsValues>({
    resolver: zodResolver(cvDetailsSchema),
    defaultValues: {
      fullName: mockUserProfile.fullName,
      email: mockUserProfile.email,
      phone: mockUserProfile.phone || '',
      linkedin: mockUserProfile.linkedin || '',
      summary: mockUserProfile.narratives.achievements || '',
      targetJobTitle: '',
      education:
        (mockUserProfile.education || []).length > 0
          ? mockUserProfile.education.map((e) => ({
              ...e,
              fieldOfStudy: e.fieldOfStudy || '',
            }))
          : [
              {
                institution: '',
                degree: '',
                fieldOfStudy: '',
                country: '',
                gpa: '',
                startDate: '',
                endDate: '',
              },
            ],
      experience:
        (mockUserProfile.experience || []).length > 0
          ? mockUserProfile.experience.map((exp) => ({
              ...exp,
              responsibilities: exp.responsibilities.join('\n'),
              isCurrent: exp.endDate?.toLowerCase() === 'present',
            }))
          : [
              {
                company: '',
                jobTitle: '',
                employmentType: undefined,
                location: '',
                responsibilities: '',
                startDate: '',
                endDate: '',
                isCurrent: false,
              },
            ],
      projects:
        (mockUserProfile.projects || []).length > 0
          ? mockUserProfile.projects
          : [
              {
                name: '',
                description: '',
                technologies: '',
                link: '',
                startDate: '',
                endDate: '',
                isCurrent: false,
              },
            ],
      skills: (mockUserProfile.skills || []).join(', '),
    },
  });

  const {
    fields: eduFields,
    append: appendEdu,
    remove: removeEdu,
  } = useFieldArray({ control: createCvForm.control, name: 'education' });
  const {
    fields: expFields,
    append: appendExp,
    remove: removeExp,
  } = useFieldArray({ control: createCvForm.control, name: 'experience' });
  const {
    fields: projectFields,
    append: appendProject,
    remove: removeProject,
  } = useFieldArray({ control: createCvForm.control, name: 'projects' });

  useEffect(() => {
    if (jobContext?.jobTitle) {
      createCvForm.setValue('targetJobTitle', jobContext.jobTitle);
    }
  }, [jobContext, createCvForm]);

  const saveApplicationState = useCallback(() => {
    if (!currentApplication || !currentApplication.id) return;

    const updatedState = {
      step: wizardStep,
      jobContext,
      cvContext,
      clContext,
      refinedCv,
      tailoredCl,
      emailDraft,
    };

    const appIndex = mockApplications.findIndex(
      (a) => a.id === currentApplication.id,
    );
    if (appIndex > -1) {
      mockApplications[appIndex].wizardState = updatedState;
      mockApplications[appIndex].jobTitle =
        jobContext?.jobTitle || mockApplications[appIndex].jobTitle;
      mockApplications[appIndex].company =
        jobContext?.companyName || mockApplications[appIndex].company;
    } else {
      mockApplications.unshift({
        id: currentApplication.id,
        jobId: jobContext?.jobId || '',
        jobTitle: jobContext?.jobTitle || 'New Application',
        company: jobContext?.companyName || 'N/A',
        dateApplied: new Date().toISOString().split('T')[0],
        status: 'Draft',
        wizardState: updatedState,
      });
    }
  }, [
    currentApplication,
    wizardStep,
    jobContext,
    cvContext,
    clContext,
    refinedCv,
    tailoredCl,
    emailDraft,
  ]);

  useEffect(() => {
    saveApplicationState();
  }, [saveApplicationState]);

  const isInitialized = useRef(false);
  useEffect(() => {
    const stepFromUrl = searchParams.get('step') as WizardStep;
    const validSteps: WizardStep[] = [
      'job',
      'cv',
      'createCv',
      'cl',
      'generate',
      'result',
    ];

    // If data is still loading, enforce the loading state.
    if (loading) {
      setWizardStep('loading');
      return;
    }

    // Set up initial application context only once after loading is done.
    if (!loading && !isInitialized.current) {
      if (selectedJob) {
        setCurrentApplication(selectedJob);
        setJobContext({
          mode: 'select',
          jobId: selectedJob._id,
          jobTitle: selectedJob.title,
          companyName: selectedJob.company,
          jobDescription: selectedJob.description,
        });
      } else if (!currentApplication) {
        const newAppId = `app-new-${Date.now()}`;
        setCurrentApplication({ id: newAppId } as MockApplication);
      }
      isInitialized.current = true;
    }

    // If a valid step is in the URL, sync the state to it.
    // This handles direct navigation, browser back/forward, and redirects.
    if (stepFromUrl && validSteps.includes(stepFromUrl)) {
      setWizardStep(stepFromUrl);
    } else {
      // Otherwise, this is the initial load without a valid step.
      // We must decide where to start and navigate there (which updates the URL).
      if (selectedJob) {
        navigateToStep('cv');
      } else {
        navigateToStep('job');
      }
    }
  }, [searchParams, loading, selectedJob, navigateToStep, currentApplication]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (wizardStep === 'generate' && isLoading) {
      let messageIndex = 0;
      setLoadingMessage(engagingMessages[messageIndex]);

      intervalId = setInterval(() => {
        messageIndex = (messageIndex + 1) % engagingMessages.length;
        setLoadingMessage(engagingMessages[messageIndex]);
      }, 2500);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [wizardStep, isLoading]);

  // --- Step Handlers ---
  const handleJobContextSubmit = async (
    mode: JobContext['mode'],
    value: File | string,
  ) => {
    setIsLoading(true);
    setLoadingMessage('Processing job details...');
    try {
      let context: JobContext;
      if (mode === 'select' && typeof value === 'string') {
        const job = jobs.find((j) => j._id === value);
        if (!job) throw new Error('Job details could not be found.');
        context = {
          mode,
          jobId: job._id,
          jobTitle: job.title,
          companyName: job.company,
          jobDescription: job.description,
        };
      } else if (mode === 'paste' && typeof value === 'string') {
        const extracted = await extractJobDetails({ jobDescription: value });
        context = {
          mode,
          jobTitle: extracted.jobTitle,
          companyName: extracted.companyName,
          jobDescription: value,
        };
      } else if (mode === 'upload' && value instanceof File) {
        setLoadingMessage('Parsing uploaded file...');
        const dataUri = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(value);
        });
        const parsed = await parseJobFromFile({ jobDescDataUri: dataUri });
        context = {
          mode: 'upload',
          jobTitle: parsed.jobTitle,
          companyName: parsed.companyName,
          jobDescription: parsed.jobDescription,
        };
      } else {
        throw new Error('Invalid job context submission.');
      }
      setJobContext(context);
      // Reset subsequent steps whenever a new job context is set
      setCvContext(null);
      setClContext(null);
      navigateToStep('cv');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Processing Job',
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      if (jobDescFileInputRef.current) {
        jobDescFileInputRef.current.value = '';
      }
    }
  };

  const handleCvContextSubmit = async (
    mode: CvContext['mode'],
    value?: string | File,
  ) => {
    if (mode === 'profile') {
      setCvContext({ mode, value: 'profile', name: 'Your Zobsai Profile' });
    } else if (value) {
      const cvName =
        typeof value === 'string'
          ? resume?.find((r) => r._id === value)?.name || 'Saved CV'
          : value.name;
      setCvContext({ mode, value, name: cvName });
    } else {
      console.error('handleCvContextSubmit called without a value.');
      return;
    }
    navigateToStep('cl');
  };

  const handleCreateCvFormSubmit = async (data: CvDetailsValues) => {
    setIsLoading(true);
    setLoadingMessage('Generating your CV from the form...');
    try {
      const cvJsonString = JSON.stringify({
        fullName: data.fullName,
        contact: {
          email: data.email,
          phone: data.phone,
          linkedin: data.linkedin,
        },
        summary: data.summary,
        education: data.education,
        experience: data.experience.map((exp) => ({
          ...exp,
          responsibilities: exp.responsibilities
            ? exp.responsibilities.split('\n').filter(Boolean)
            : [],
        })),
        projects: data.projects,
        skills: data.skills
          ? data.skills
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      });

      const generatedCv = await generateCvFlow({
        cvData: cvJsonString,
        jobTitle: data.targetJobTitle,
      });
      const newCv: SavedCv = {
        id: `cv-${Date.now()}`,
        name: `Created CV for ${data.targetJobTitle}`,
        htmlContent: generatedCv.cv,
        atsScore: generatedCv.atsScore,
        createdAt: new Date().toISOString(),
        jobTitle: data.targetJobTitle,
      };

      if (!Array.isArray(mockUserProfile.savedCvs)) {
        mockUserProfile.savedCvs = [];
      }
      mockUserProfile.savedCvs.unshift(newCv);
      setSelectedCvId(newCv.id);

      toast({
        title: 'CV Created & Selected!',
        description: 'Your new CV is ready to be used.',
      });
      navigateToStep('cv');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'CV Creation Failed',
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleClContextSubmit = async () => {
    const { clSource, pastedCl, savedClId } = clForm.getValues();

    let context: ClContext = { mode: 'skip' };

    if (clSource === 'paste' && pastedCl) {
      context = { mode: 'paste', value: pastedCl, name: 'Pasted Content' };
    } else if (clSource === 'saved' && savedClId) {
      const savedCl = mockUserProfile.savedCoverLetters.find(
        (c) => c.id === savedClId,
      );
      if (savedCl) {
        context = {
          mode: 'saved',
          value: savedCl.htmlContent,
          name: savedCl.name,
        };
      }
    }

    setClContext(context);
    navigateToStep('generate');
  };

  const handleGenerate = async () => {
    if (!cvContext) {
      toast({
        variant: 'destructive',
        title: 'Missing CV',
        description: 'Please provide your CV before generating.',
      });
      return;
    }

    if (!jobContext) {
      toast({
        variant: 'destructive',
        title: 'Missing Job Information',
        description:
          'Job details are missing. Please go back and select a job.',
      });
      navigateToStep('job');
      return;
    }

    setIsLoading(true);
    navigateToStep('generate');

    try {
      const formData = new FormData();

      if (jobContext.jobId) {
        formData.append('jobId', jobContext.jobId);
      } else {
        formData.append('jobTitle', jobContext.jobTitle);
        formData.append('companyName', jobContext.companyName);

        if (searchParams.get('slug')) {
          const response = await apiInstance.get(
            `/jobs/find/${searchParams.get('slug')}`,
          );
          formData.append('jobDescription', response.data.description);
        } else {
          formData.append('jobDescription', jobContext.jobDescription);
        }
      }

      if (cvContext.mode === 'profile') {
        formData.append('useProfile', 'true');
      } else if (
        cvContext.mode === 'saved' &&
        typeof cvContext.value === 'string'
      ) {
        formData.append('savedCVId', cvContext.value);
      } else if (
        cvContext.mode === 'upload' &&
        cvContext.value instanceof File
      ) {
        formData.append('cv', cvContext.value);
        formData.append('useProfile', 'false');
      }

      if (clContext) {
        if (clContext.mode === 'saved' && typeof clContext.value === 'string') {
          formData.append('savedCoverLetterId', clContext.value);
        } else if (clContext.mode === 'paste' && clContext.value) {
          formData.append('coverLetterText', clContext.value);
        }
      }

      formData.append('finalTouch', 'Tailor for ATS optimization');

      const response = await apiInstance.post(
        '/students/applications/tailor',
        formData,
      );

      const result = response.data;
      setRefinedCv(result.data.tailoredCV);
      setTailoredCl(result.data.tailoredCoverLetter);
      setEmailDraft(result.data.applicationEmail);

      toast({
        title: 'Success!',
        description: 'Your tailored documents are ready for review.',
      });

      navigateToStep('result');
    } catch (error) {
      console.error('Full error:', {
        message: (error as Error).message,
        response: (error as any).response?.data,
        config: (error as any).config,
      });

      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description:
          (error as any).response?.data?.message ||
          'Failed to generate application. Please try again.',
      });
      navigateToStep('cl');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCVContext = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        description: 'Please upload a PDF, PNG, JPG, or Word document.',
      });
      return;
    }

    setCvContext({ mode: 'upload', value: file, name: file.name });
    navigateToStep('cl');
  };

  const handleSaveAndFinish = () => {
    if (!currentApplication || !jobContext) return;

    toast({
      title: 'Application Saved!',
      description: "You can find it in your 'My Applications' list.",
    });
    router.push('/applications');
  };

  const handleStartNew = () => {
    setJobContext(null);
    setCvContext(null);
    setClContext(null);
    setRefinedCv('');
    setTailoredCl('');
    setEmailDraft('');

    const newAppId = `app-new-${Date.now()}`;
    setCurrentApplication({ id: newAppId } as MockApplication);

    router.push('/apply?step=job');

    toast({
      title: 'New Application Started',
      description: 'You can now create another tailored application.',
    });
  };

  const handleSendEmail = () => {
    console.log('handleSendEmail', jobContext);
    console.log(student?.email, 'thesiddiqui7@gmail.com', jobContext?.jobTitle);
    const response = apiInstance.post('/user/send-email', {
      senderEmail: student?.email,
      recieverEmail: 'thesiddiqui7@gmail.com',
      subject: jobContext?.jobTitle,
      bodyHtml: emailDraft,
      htmlResume: refinedCv,
      htmlCoverLetter: tailoredCl,
    });

    toast({
      title: 'Email Sent',
      description: 'An email has been sent to your linked account.',
    });
  };

  const StyledCard = (props) => (
    <motion.div variants={containerVariants}>
      <Card
        className="bg-slate-900/80 border-slate-800 backdrop-blur-sm text-slate-50"
        {...props}
      />
    </motion.div>
  );

  // --- Render Functions ---
  const renderLoadingStep = () => (
    <StyledCard className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 mx-auto animate-spin text-purple-400" />
        <p className="mt-4 text-slate-400">
          {loadingMessage || 'Loading Application Wizard...'}
        </p>
      </div>
    </StyledCard>
  );

  const renderJobStep = () => (
    <JobStep
      isLoading={isLoading}
      loadingMessage={loadingMessage}
      jobListings={jobs || []}
      handleJobContextSubmit={handleJobContextSubmit}
    />
  );

  const renderCvStep = () => (
    <SleekCvStep
      mockUserProfile={mockUserProfile}
      handleCvContextSubmit={handleCvContextSubmit}
      setWizardState={navigateToStep}
      selectedCvId={selectedCvId}
      setSelectedCvId={setSelectedCvId}
      isLoading={isLoading}
      loadingMessage={loadingMessage}
      wizardStep={wizardStep}
      setWizardStep={navigateToStep}
      handleCVContext={handleCVContext}
    />
  );

  const renderCreateCvStep = () => (
    <StyledCard>
      <CardHeader>
        <CardTitle>Create a New CV</CardTitle>
        <CardDescription>
          Fill out your professional details. This will be saved and used for
          this application.
        </CardDescription>
      </CardHeader>
      <Form {...createCvForm}>
        <form onSubmit={createCvForm.handleSubmit(handleCreateCvFormSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={createCvForm.control}
              name="targetJobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Target Job Title for this CV{' '}
                    <span className="text-red-400">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Senior Product Manager"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={createCvForm.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Professional Summary <span className="text-red-400">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief professional summary of your career and goals."
                      {...field}
                      value={field.value ?? ''}
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-2">
                Education <span className="text-red-400">*</span>
              </h3>
              {eduFields.map((field, index) => (
                <Card
                  key={field.id}
                  className="p-4 mt-2 mb-4 space-y-4 relative"
                >
                  <FormField
                    control={createCvForm.control}
                    name={`education.${index}.institution`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Institution</FormLabel>
                        <FormControl>
                          <Input {...f} value={f.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createCvForm.control}
                    name={`education.${index}.degree`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Degree</FormLabel>
                        <FormControl>
                          <Input {...f} value={f.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createCvForm.control}
                      name={`education.${index}.country`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select
                            onValueChange={f.onChange}
                            defaultValue={f.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {countries.map((c) => (
                                <SelectItem key={c.code} value={c.name}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createCvForm.control}
                      name={`education.${index}.fieldOfStudy`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Field of Study (Optional)</FormLabel>
                          <FormControl>
                            <Input {...f} value={f.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createCvForm.control}
                      name={`education.${index}.startDate`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="month" {...f} value={f.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createCvForm.control}
                      name={`education.${index}.endDate`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input
                              type="month"
                              placeholder="or 'Present'"
                              {...f}
                              value={f.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeEdu(index)}
                    className="absolute top-2 right-2"
                  >
                    <Trash2 className="h-4 w-4" /> Remove
                  </Button>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendEdu({
                    institution: '',
                    degree: '',
                    fieldOfStudy: '',
                    country: '',
                    gpa: '',
                    startDate: '',
                    endDate: '',
                  })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Education
              </Button>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-2">
                Work Experience <span className="text-red-400">*</span>
              </h3>
              {expFields.map((field, index) => (
                <Card
                  key={field.id}
                  className="p-4 mt-2 mb-4 space-y-4 relative"
                >
                  <FormField
                    control={createCvForm.control}
                    name={`experience.${index}.company`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input {...f} value={f.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createCvForm.control}
                    name={`experience.${index}.jobTitle`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input {...f} value={f.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createCvForm.control}
                      name={`experience.${index}.startDate`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="month" {...f} value={f.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createCvForm.control}
                      name={`experience.${index}.endDate`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input
                              type="month"
                              placeholder="or 'Present'"
                              {...f}
                              value={f.value ?? ''}
                              disabled={createCvForm.watch(
                                `experience.${index}.isCurrent`,
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={createCvForm.control}
                    name={`experience.${index}.isCurrent`}
                    render={({ field: f }) => (
                      <FormItem className="flex flex-row items-center space-x-2 pt-2">
                        <FormControl>
                          <Checkbox
                            checked={f.value}
                            onCheckedChange={(checked) => {
                              f.onChange(checked);
                              createCvForm.setValue(
                                `experience.${index}.endDate`,
                                checked ? 'Present' : '',
                              );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          I currently work here
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createCvForm.control}
                    name={`experience.${index}.responsibilities`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Responsibilities (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your key responsibilities and achievements. Use separate lines for each point."
                            {...f}
                            value={f.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeExp(index)}
                    className="absolute top-2 right-2"
                  >
                    <Trash2 className="h-4 w-4" /> Remove
                  </Button>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendExp({
                    company: '',
                    jobTitle: '',
                    location: '',
                    employmentType: undefined,
                    responsibilities: '',
                    startDate: '',
                    endDate: '',
                    isCurrent: false,
                  })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Experience
              </Button>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-2">
                Projects / Research Work
              </h3>
              {projectFields.map((field, index) => (
                <Card
                  key={field.id}
                  className="p-4 mt-2 mb-4 space-y-4 relative"
                >
                  <FormField
                    control={createCvForm.control}
                    name={`projects.${index}.name`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., AI-Powered Chatbot"
                            {...f}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createCvForm.control}
                    name={`projects.${index}.description`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your project, its goals, and your role."
                            {...f}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createCvForm.control}
                      name={`projects.${index}.startDate`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="month" {...f} value={f.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createCvForm.control}
                      name={`projects.${index}.endDate`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input
                              type="month"
                              placeholder="or 'Present'"
                              {...f}
                              value={f.value ?? ''}
                              disabled={createCvForm.watch(
                                `projects.${index}.isCurrent`,
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={createCvForm.control}
                    name={`projects.${index}.isCurrent`}
                    render={({ field: f }) => (
                      <FormItem className="flex flex-row items-center space-x-2 pt-2">
                        <FormControl>
                          <Checkbox
                            checked={f.value}
                            onCheckedChange={(checked) => {
                              f.onChange(checked);
                              createCvForm.setValue(
                                `projects.${index}.endDate`,
                                checked ? 'Present' : '',
                              );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          I am currently working on this
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createCvForm.control}
                    name={`projects.${index}.technologies`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Technologies Used (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., React, Python, TensorFlow"
                            {...f}
                            value={f.value ?? ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Comma-separated list of technologies.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createCvForm.control}
                    name={`projects.${index}.link`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Project Link (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://github.com/user/project"
                            {...f}
                            value={f.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeProject(index)}
                    className="absolute top-2 right-2"
                  >
                    <Trash2 className="h-4 w-4" /> Remove
                  </Button>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendProject({
                    name: '',
                    description: '',
                    technologies: '',
                    link: '',
                    startDate: '',
                    endDate: '',
                    isCurrent: false,
                  })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Project
              </Button>
            </div>

            <Separator />
            <FormField
              control={createCvForm.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Skills <span className="text-red-400">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., React, Node.js, Project Management"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Comma-separated list of your top skills.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigateToStep('cv')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={createCvForm.handleSubmit(handleCreateCvFormSubmit)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Create & Use this CV
                  </>
                )}
              </Button>
            </motion.div>
          </CardFooter>
        </form>
      </Form>
    </StyledCard>
  );

  const renderClStep = () => (
    <SleekClStep
      clForm={clForm}
      handleClContextSubmit={handleClContextSubmit}
      setWizardStep={navigateToStep}
      mockUserProfile={mockUserProfile}
      itemVariants={itemVariants}
    />
  );

  const renderGenerateStep = () => (
    <GenerateStep
      isLoading={isLoading}
      jobContext={jobContext}
      cvContext={cvContext}
      clContext={clContext}
      handleGenerate={handleGenerate}
      setWizardStep={navigateToStep}
    />
  );

  const renderGeneratingView = () => <SleekLoadingCard />;

  const renderResultStep = () => (
    <ResultStep
      jobContext={jobContext}
      refinedCv={refinedCv}
      setRefinedCv={setRefinedCv}
      tailoredCl={tailoredCl}
      setTailoredCl={setTailoredCl}
      emailDraft={emailDraft}
      setEmailDraft={setEmailDraft}
      setWizardStep={navigateToStep}
      handleSendEmail={handleSendEmail}
      handleSaveAndFinish={handleSaveAndFinish}
      handleStartNew={handleStartNew}
    />
  );

  const renderStep = () => {
    console.log('wizardStep', wizardStep);
    switch (wizardStep) {
      case 'loading':
        return renderLoadingStep();
      case 'job':
        console.log('jobContext', jobContext);
        return (
          <SleekCvStep
            mockUserProfile={mockUserProfile}
            handleCvContextSubmit={handleCvContextSubmit}
            setWizardState={navigateToStep}
            selectedCvId={selectedCvId}
            setSelectedCvId={setSelectedCvId}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
            wizardStep={wizardStep}
            setWizardStep={navigateToStep}
            handleCVContext={handleCVContext}
          />
        );
      case 'cv':
        return renderCvStep();
      case 'createCv':
        return renderCreateCvStep();
      case 'cl':
        return renderClStep();
      case 'generate':
        return isLoading ? renderGeneratingView() : renderGenerateStep();
      case 'result':
        return renderResultStep();
      default:
        return renderJobStep();
    }
  };

  return (
    <>
      {currentApplication &&
        wizardStep !== 'job' &&
        wizardStep !== 'loading' && (
          <PageHeader
            title={
              wizardStep === 'result'
                ? `Your Tailored Application`
                : 'Application Wizard'
            }
            description={
              wizardStep === 'result'
                ? `at ${jobContext?.companyName}`
                : 'Create a new tailored application'
            }
            icon={Wand2}
          />
        )}
      <div className="max-w-4xl mx-auto">
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
    </>
  );
}
