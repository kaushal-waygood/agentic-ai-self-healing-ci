'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { GenerateStep } from './steps/GenerateStep';
import { ClStep } from './steps/ClStep';
import { CvStep } from './steps/CvStep';
import { JobStep } from '../JobStep';
import { LoadingStep } from './steps/LoadingStep';

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
  value: string; // Can be file data URI, 'profile', or CV ID
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

  useEffect(() => {
    const initialize = async () => {
      setCurrentApplication(selectedJob);
      if (selectedJob) {
        setJobContext({
          mode: 'select',
          jobId: selectedJob._id,
          jobTitle: selectedJob.title,
          companyName: selectedJob.company,
          jobDescription: selectedJob.description,
        });
      }
      setWizardStep('cv');
    };

    initialize();
  }, [searchParams, selectedJob]);

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
        const job = await getJobDetails({ jobId: value });
        if (!job) throw new Error('Job details could not be found.');
        context = {
          mode,
          jobId: job.id,
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
      // Fix: Set the entire context object, not just the title
      setJobContext(context);
      // Reset subsequent steps whenever a new job context is set
      setCvContext(null);
      setClContext(null);
      setWizardStep('cv');
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
    setCvContext({ mode, value: student, name: '' });

    if (mode === 'profile') {
      console.log(cvContext);
    }
    setWizardStep('cl');
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
      setWizardStep('cv');
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
    setWizardStep('generate');
  };

  const handleGenerate = async () => {
    if (!cvContext) {
      toast({
        variant: 'destructive',
        title: 'Missing CV',
        description: 'Please provide your CV before generating',
      });
      return;
    }

    setIsLoading(true);
    setWizardStep('generate');

    try {
      const formData = new FormData();

      formData.append('jobId', selectedJob._id);

      if (cvContext.mode === 'profile') {
        formData.append('useProfile', 'true');
      } else if (cvContext.mode === 'saved' && cvContext.value) {
        formData.append('savedCVId', cvContext.value);
      } else if (cvContext.mode === 'upload' && cvContext.value) {
        // If value is a File object, append directly
        if (cvContext?.value) {
          formData.append('cv', cvContext.value);
          formData.append('useProfile', 'false');
        }
        // If value is a data URL string (for backward compatibility)
        else if (typeof cvContext.value === 'string') {
          const blob = await fetch(cvContext.value).then((r) => r.blob());
          const file = new File([blob], cvContext.name || 'cv.pdf', {
            type: blob.type,
          });
          formData.append('cv', file);
        }
      }

      if (clContext) {
        if (clContext.mode === 'saved' && clContext.value) {
          formData.append('savedCoverLetterId', clContext.value);
        } else if (clContext.mode === 'paste' && clContext.value) {
          formData.append('coverLetterText', clContext.value);
        }
      }

      formData.append('finalTouch', 'Tailor for ATS optimization');

      // PROPER DEBUGGING - Convert FormData to inspectable object
      const formDataObj = {};
      for (const [key, value] of formData.entries()) {
        formDataObj[key] =
          value instanceof File
            ? `File: ${value.name} (${value.size} bytes)`
            : value;
      }

      // 4. Make API call with proper headers
      const response = await apiInstance.post(
        '/students/applications/tailor',
        formDataObj,
      );

      console.log('Full response:', response);

      const result = response.data;
      setRefinedCv(result.data.tailoredCV);
      setTailoredCl(result.data.tailoredCoverLetter);
      setEmailDraft(result.data.applicationEmail);

      toast({
        title: 'Success!',
        description: 'Your tailored documents are ready for review.',
      });

      setWizardStep('result');
    } catch (error) {
      console.error('Full error:', {
        message: error.message,
        response: error.response?.data,
        config: error.config,
      });

      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description:
          error.response?.data?.message ||
          'Failed to generate application. Please try again.',
      });
      setWizardStep('cl');
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
    ];

    if (!validTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please upload a PDF, PNG, JPG, or Word document',
      });
      return;
    }

    // Store the File object directly instead of converting to data URL
    setCvContext({ mode: 'upload', value: file, name: file.name });
    setWizardStep('cl');
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
    // Reset all context
    setJobContext(null);
    setCvContext(null);
    setClContext(null);

    // Reset results
    setRefinedCv('');
    setTailoredCl('');
    setEmailDraft('');

    // Create a new application context
    const newAppId = `app-new-${Date.now()}`;
    setCurrentApplication({ id: newAppId } as MockApplication);

    // Go back to the first step
    setWizardStep('job');

    // Clean up URL
    router.push('/apply');

    toast({
      title: 'New Application Started',
      description: 'You can now create another tailored application.',
    });
  };

  const handleSendEmail = () => {
    const response = apiInstance.post('/user/send-email', {
      senderEmail: student?.email,
      recieverEmail: 'thesiddiqui7@gmail.com',
      subject: jobContext?.title,
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
        className="bg-slate-900/80 border-slate-700 backdrop-blur-sm"
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
    <StyledCard>
      <CardHeader>
        <CardTitle>Step 1: Provide the Job Description</CardTitle>
        <CardDescription>
          Select a job, paste the details, or upload a file.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.div variants={itemVariants}>
          <Label htmlFor="job-select" className="text-slate-300">
            Select from Saved/Found Jobs
          </Label>
          <RadioGroup
            id="job-select"
            value={selectedJobId}
            onValueChange={setSelectedJobId}
            className="mt-2 space-y-1 max-h-40 overflow-y-auto border border-slate-700 p-2 rounded-md"
          >
            {(mockJobListings || []).slice(0, 10).map((job) => (
              <Label
                key={job.id}
                className="flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors hover:bg-slate-800 has-[:checked]:bg-purple-600/20 has-[:checked]:border-purple-500 border border-transparent"
              >
                <RadioGroupItem value={job.id} />
                {job.title} at {job.company}
              </Label>
            ))}
          </RadioGroup>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!selectedJobId || isLoading}
              onClick={() => handleJobContextSubmit('select', selectedJobId)}
            >
              Use Selected Job
            </Button>
          </motion.div>
        </motion.div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-2 text-slate-500">Or</span>
          </div>
        </div>
        <motion.div variants={itemVariants}>
          <Label htmlFor="job-paste" className="text-slate-300">
            Paste Job Description
          </Label>
          <Textarea
            id="job-paste"
            placeholder="Paste the full job description here..."
            className="mt-2 min-h-[150px] bg-slate-800 border-slate-600 focus:border-purple-500"
            value={pastedJobDesc}
            onChange={(e) => setPastedJobDesc(e.target.value)}
          />
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!pastedJobDesc || isLoading}
              onClick={() => handleJobContextSubmit('paste', pastedJobDesc)}
            >
              Use Pasted Description
            </Button>
          </motion.div>
        </motion.div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-2 text-slate-500">Or</span>
          </div>
        </div>
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            className="w-full bg-slate-800 border border-slate-600 hover:bg-slate-700"
            variant="outline"
            onClick={() => jobDescFileInputRef.current?.click()}
            disabled={isLoading}
          >
            {isLoading && loadingMessage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                {loadingMessage}
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4 text-purple-400" /> Upload
                Job Description File
              </>
            )}
          </Button>
          <input
            type="file"
            ref={jobDescFileInputRef}
            onChange={(e) =>
              e.target.files?.[0] &&
              handleJobContextSubmit('upload', e.target.files[0])
            }
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg"
          />
          <p className="text-xs text-slate-500 text-center mt-1">
            PDF, PNG, JPG supported
          </p>
        </motion.div>
      </CardContent>
    </StyledCard>
  );

  const renderCvStep = () => (
    <StyledCard>
      <CardHeader>
        <CardTitle>Step 2: Provide Your CV</CardTitle>
        <CardDescription>
          The AI needs your background to tailor it for the job.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.div variants={itemVariants}>
          <Label className="text-slate-300">Select from Saved CVs</Label>
          <RadioGroup
            value={selectedCvId}
            onValueChange={setSelectedCvId}
            className="mt-2 space-y-1 max-h-40 overflow-y-auto border border-slate-700 p-2 rounded-md"
          >
            {mockUserProfile.savedCvs.length > 0 ? (
              mockUserProfile.savedCvs.map((cv) => (
                <Label
                  key={cv.id}
                  className="flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors hover:bg-slate-800 has-[:checked]:bg-purple-600/20 has-[:checked]:border-purple-500 border border-transparent"
                >
                  <RadioGroupItem value={cv.id} />
                  {cv.name}
                </Label>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center p-4">
                No saved CVs.
              </p>
            )}
          </RadioGroup>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!selectedCvId || isLoading}
              onClick={() => handleCvContextSubmit('saved', selectedCvId)}
            >
              Use Saved CV
            </Button>
          </motion.div>
        </motion.div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-2 text-slate-500">Or</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              className="h-24 w-full flex flex-col gap-2 bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-blue-500"
              onClick={() => handleCvContextSubmit('profile')}
              disabled={isLoading}
            >
              <User className="h-6 w-6 text-blue-400" /> Use My Profile
            </Button>
          </motion.div>
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              className="h-24 w-full flex flex-col gap-2 bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-blue-500"
              onClick={() => cvFileInputRef.current?.click()}
              disabled={isLoading}
            >
              <UploadCloud className="h-6 w-6 text-blue-400" /> Upload CV File
            </Button>
          </motion.div>
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              className="h-24 w-full flex flex-col gap-2 bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-blue-500"
              onClick={() => setWizardStep('createCv')}
              disabled={isLoading}
            >
              <PlusCircle className="h-6 w-6 text-blue-400" /> Create New CV
            </Button>
          </motion.div>
          <input
            type="file"
            ref={cvFileInputRef}
            onChange={handleCVContext}
            className="hidden"
            accept=".pdf,.doc,.docx"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" onClick={() => setWizardStep('job')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </CardFooter>
    </StyledCard>
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
              onClick={() => setWizardStep('cv')}
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
    <StyledCard>
      <CardHeader>
        <CardTitle>Step 3: Cover Letter (Optional)</CardTitle>
        <CardDescription>
          Provide an existing cover letter to give the AI more context, or skip
          to generate one from scratch.
        </CardDescription>
      </CardHeader>
      <Form {...clForm}>
        <form onSubmit={clForm.handleSubmit(handleClContextSubmit)}>
          <CardContent>
            <FormField
              control={clForm.control}
              name="clSource"
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="space-y-4"
                >
                  <motion.div variants={itemVariants}>
                    <Label className="flex items-center gap-3 p-4 border border-slate-700 rounded-md cursor-pointer transition-colors hover:bg-slate-800 has-[:checked]:border-cyan-500 has-[:checked]:bg-cyan-600/10">
                      <RadioGroupItem value="skip" />
                      Skip this step - Generate from scratch
                    </Label>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <Label className="flex items-center gap-3 p-4 border border-slate-700 rounded-md cursor-pointer transition-colors hover:bg-slate-800 has-[:checked]:border-cyan-500 has-[:checked]:bg-cyan-600/10">
                      <RadioGroupItem value="paste" />
                      Paste content from an old cover letter
                    </Label>
                    {clForm.watch('clSource') === 'paste' && (
                      <FormField
                        control={clForm.control}
                        name="pastedCl"
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            placeholder="Paste your draft cover letter here."
                            className="min-h-[120px] mt-3 bg-slate-800 border-slate-600 focus:border-cyan-500"
                          />
                        )}
                      />
                    )}
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <Label className="flex items-center gap-3 p-4 border border-slate-700 rounded-md cursor-pointer transition-colors hover:bg-slate-800 has-[:checked]:border-cyan-500 has-[:checked]:bg-cyan-600/10">
                      <RadioGroupItem value="saved" />
                      Use a saved cover letter
                    </Label>
                    {clForm.watch('clSource') === 'saved' && (
                      <FormField
                        control={clForm.control}
                        name="savedClId"
                        render={({ field }) => (
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="pl-6 mt-2 space-y-1"
                          >
                            {mockUserProfile.savedCoverLetters.length > 0 ? (
                              mockUserProfile.savedCoverLetters.map((cl) => (
                                <Label
                                  key={cl.id}
                                  className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-slate-800/50 text-sm"
                                >
                                  <RadioGroupItem value={cl.id} />
                                  {cl.name}
                                </Label>
                              ))
                            ) : (
                              <p className="text-xs text-slate-500 p-2">
                                No saved cover letters found.
                              </p>
                            )}
                          </RadioGroup>
                        )}
                      />
                    )}
                  </motion.div>
                </RadioGroup>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setWizardStep('cv')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </CardFooter>
        </form>
      </Form>
    </StyledCard>
  );

  const renderGenerateStep = () => (
    <StyledCard className="text-center">
      <CardHeader>
        <CardTitle>Ready to Generate?</CardTitle>
        <CardDescription>
          We'll use the job info and your CV to tailor your application
          documents.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="p-4 border border-slate-700 rounded-md bg-slate-800/50">
          <p className="font-semibold text-purple-400">
            {jobContext?.jobTitle}
          </p>
          <p className="text-sm text-slate-400">Using CV: {cvContext?.name}</p>
          <p className="text-sm text-slate-400">
            Cover Letter:{' '}
            {clContext?.mode === 'skip'
              ? 'Generate from scratch'
              : `Based on ${clContext?.name}`}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <motion.div
          className="w-full"
          whileHover={{
            scale: 1.02,
            transition: { type: 'spring', stiffness: 300 },
          }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            size="lg"
            className="w-full text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 shadow-lg shadow-purple-500/20"
            onClick={handleGenerate}
            disabled={isLoading}
          >
            <Sparkles className="mr-2 h-5 w-5" /> Tailor My Application
          </Button>
        </motion.div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setWizardStep('cl')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </CardFooter>
    </StyledCard>
  );

  const renderGeneratingView = () => (
    <StyledCard className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 mx-auto animate-spin text-purple-400" />
        <h2 className="text-xl font-semibold mt-4 font-headline text-slate-200">
          {loadingMessage}
        </h2>
        <p className="mt-2 text-slate-400">This may take a moment...</p>
      </div>
    </StyledCard>
  );

  const renderResultStep = () => (
    <div className="space-y-6">
      {jobContext && (
        <StyledCard>
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-purple-400" />
              Job Details
            </CardTitle>
            <CardDescription>
              This is the job you are creating an application for.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-bold text-lg text-slate-100">
                {jobContext.jobTitle}
              </h3>
              <p className="text-slate-400">{jobContext.companyName}</p>
            </div>
            <Separator className="bg-slate-700" />
            <div
              className="prose prose-invert max-w-none text-sm h-48 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: jobContext.jobDescription }}
            />
          </CardContent>
        </StyledCard>
      )}
      <StyledCard>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <FileText className="text-purple-400" />
            Tailored CV
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EditableMaterial
            editorId="cv-editor"
            title="CV"
            content={refinedCv}
            setContent={setRefinedCv}
            isHtml
          />
        </CardContent>
      </StyledCard>
      <StyledCard>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <FileCheck2 className="text-purple-400" />
            Tailored Cover Letter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EditableMaterial
            editorId="cl-editor"
            title="Cover Letter"
            content={tailoredCl}
            setContent={setTailoredCl}
            isHtml
          />
        </CardContent>
      </StyledCard>
      <StyledCard>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            Application Email Draft
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EditableMaterial
            editorId="email-editor"
            title="Email"
            content={emailDraft}
            setContent={setEmailDraft}
          />
        </CardContent>
      </StyledCard>
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => setWizardStep('generate')}>
          <ArrowLeft className="mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="bg-slate-800 border-slate-600 hover:bg-slate-700"
            onClick={handleSendEmail}
          >
            Send Email
          </Button>
          <Button
            variant="outline"
            className="bg-slate-800 border-slate-600 hover:bg-slate-700"
            onClick={handleStartNew}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Start New Application
          </Button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={handleSaveAndFinish}
            >
              <Save className="mr-2" />
              Save Application
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (wizardStep) {
      case 'loading':
        return <LoadingStep loadingMessage={'Loading Application Wizard...'} />;
      case 'job':
        return (
          <JobStep
            isLoading={false}
            loadingMessage=""
            mockJobListings={[]} // Pass real data
            handleJobContextSubmit={handleJobContextSubmit}
            jobDescFileInputRef={jobDescFileInputRef}
          />
        );
      case 'cv':
        return (
          <CvStep
            isLoading={false}
            setWizardStep={setWizardStep}
            handleCvContextSubmit={() => {}} // Pass real handler
            handleCVContext={() => {}} // Pass real handler
            cvFileInputRef={cvFileInputRef}
          />
        );
      // case 'createCv':
      //   return <CreateCvStep ...props />;
      case 'cl':
        return (
          <ClStep
            clForm={clForm}
            setWizardStep={setWizardStep}
            handleClContextSubmit={() => {}} // Pass real handler
          />
        );
      case 'generate':
        return isLoading ? (
          <LoadingStep loadingMessage={'Generating...'} />
        ) : (
          <GenerateStep
            isLoading={false}
            jobContext={{}}
            cvContext={{}}
            clContext={{}}
            handleGenerate={() => {}} // Pass real handler
            setWizardStep={setWizardStep}
          />
        );
      // case 'result':
      //   return <ResultStep ...props />;
      default:
        return <p>Invalid step</p>;
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
