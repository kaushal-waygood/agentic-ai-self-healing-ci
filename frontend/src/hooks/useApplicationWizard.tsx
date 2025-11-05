'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useForm, useFieldArray, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSelector, useDispatch } from 'react-redux';
import { useToast } from '@/hooks/use-toast';
import { useJobs } from '@/hooks/jobs/useJobs';
import { RootState } from '@/redux/rootReducer';
import { savedStudentResumeRequest } from '@/redux/reducers/aiReducer';
import { getStudentDetailsRequest } from '@/redux/reducers/studentReducer';
import apiInstance from '@/services/api';
import { extractJobDetails } from '@/ai/flows/extract-job-details-flow';
import { generateCv as generateCvFlow } from '@/ai/flows/cv-generation';
import { parseJobFromFile } from '@/ai/flows/parse-job-from-file-flow';
import { mockUserProfile, SavedCv } from '@/lib/data/user'; // Adjust paths as needed

//================================================================
// SECTION: Types & Schemas
//================================================================

export type WizardStep =
  | 'loading'
  | 'job'
  | 'cv'
  | 'createCv'
  | 'cl'
  | 'generate'
  | 'result';

export type JobContext = {
  mode: 'select' | 'paste' | 'upload';
  jobId?: string;
  jobTitle: string;
  jobDescription: string;
  companyName: string;
};

export type CvContext = {
  mode: 'upload' | 'profile' | 'create' | 'saved';
  value: string | File;
  name: string;
};

export type ClContext = {
  mode: 'upload' | 'paste' | 'saved' | 'skip';
  value?: string;
  name?: string;
};

const employmentTypes = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
] as const;

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

export type CvDetailsValues = z.infer<typeof cvDetailsSchema>;

const engagingMessages = [
  'Analyzing job description for keywords...',
  "Cross-referencing your CV with the role's requirements...",
  'Highlighting your most relevant skills...',
  'Structuring your new CV in Harvard style...',
  'Drafting a compelling cover letter...',
  'Finalizing the application email...',
  'Almost there, just polishing the final details...',
];

//================================================================
// SECTION: Custom Hooks
//================================================================

/**
 * Hook for managing the CV creation form state and logic.
 */
export const useCvForm = (jobTitle?: string) => {
  const form = useForm<CvDetailsValues>({
    resolver: zodResolver(cvDetailsSchema),
    defaultValues: {
      fullName: mockUserProfile.fullName,
      email: mockUserProfile.email,
      phone: mockUserProfile.phone || '',
      linkedin: mockUserProfile.linkedin || '',
      summary: mockUserProfile.narratives.achievements || '',
      targetJobTitle: '',
      education:
        mockUserProfile.education?.length > 0
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
        mockUserProfile.experience?.length > 0
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
        mockUserProfile.projects?.length > 0
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

  useEffect(() => {
    if (jobTitle) {
      form.setValue('targetJobTitle', jobTitle);
    }
  }, [jobTitle, form]);

  const {
    fields: eduFields,
    append: appendEdu,
    remove: removeEdu,
  } = useFieldArray({ control: form.control, name: 'education' });
  const {
    fields: expFields,
    append: appendExp,
    remove: removeExp,
  } = useFieldArray({ control: form.control, name: 'experience' });
  const {
    fields: projectFields,
    append: appendProject,
    remove: removeProject,
  } = useFieldArray({ control: form.control, name: 'projects' });

  return {
    form,
    fields: { eduFields, expFields, projectFields },
    actions: {
      appendEdu,
      removeEdu,
      appendExp,
      removeExp,
      appendProject,
      removeProject,
    },
  };
};

/**
 * Main hook to manage the entire application wizard state and logic.
 */
export const useApplicationWizard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { toast } = useToast();
  const dispatch = useDispatch();

  //--- Primary State ---
  const [wizardStep, setWizardStep] = useState<WizardStep>('loading');
  const [jobContext, setJobContext] = useState<JobContext | null>(null);
  const [cvContext, setCvContext] = useState<CvContext | null>(null);
  const [clContext, setClContext] = useState<ClContext | null>(null);
  const [generatedData, setGeneratedData] = useState({
    refinedCv: '',
    tailoredCl: '',
    emailDraft: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [selectedCvId, setSelectedCvId] = useState('');
  const isInitialized = useRef(false);

  //--- External Data & Forms ---
  const { jobs, loading: jobsLoading, selectedJob } = useJobs({ searchParams });
  const { students: student } = useSelector(
    (state: RootState) => state.student,
  );
  const { resume } = useSelector((state: RootState) => state.ai);
  const clForm = useForm<{
    clSource: 'upload' | 'paste' | 'saved' | 'skip';
    pastedCl: string;
    savedClId: string;
  }>({ defaultValues: { clSource: 'skip', pastedCl: '', savedClId: '' } });

  //--- Navigation ---
  const navigateToStep = useCallback(
    (step: WizardStep) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('step', step);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  //--- Effects ---
  useEffect(() => {
    dispatch(getStudentDetailsRequest());
    dispatch(savedStudentResumeRequest());
  }, [dispatch]);

  // Sync wizard step with URL
  useEffect(() => {
    const stepFromUrl = searchParams.get('step') as WizardStep;
    if (jobsLoading) {
      setWizardStep('loading');
      return;
    }
    if (!jobsLoading && !isInitialized.current) {
      if (selectedJob) {
        setJobContext({
          mode: 'select',
          jobId: selectedJob._id,
          jobTitle: selectedJob.title,
          companyName: selectedJob.company,
          jobDescription: selectedJob.description,
        });
        navigateToStep('cv');
      } else if (!stepFromUrl) {
        navigateToStep('job');
      }
      isInitialized.current = true;
    }
    if (stepFromUrl && stepFromUrl !== wizardStep) {
      setWizardStep(stepFromUrl);
    }
  }, [searchParams, jobsLoading, selectedJob, navigateToStep, wizardStep]);

  // Engaging loading messages effect
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
      if (intervalId) clearInterval(intervalId);
    };
  }, [wizardStep, isLoading]);

  //--- Action Handlers ---
  const handleJobContextSubmit = useCallback(
    async (mode: JobContext['mode'], value: File | string) => {
      setIsLoading(true);
      setLoadingMessage('Processing job details...');
      console.log('value', value);
      try {
        let context: JobContext;
        if (mode === 'select' && typeof value === 'string') {
          context = {
            mode,
            jobId: value,
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
      }
    },
    [jobs, navigateToStep, toast],
  );

  const handleCvContextSubmit = useCallback(
    async (mode: CvContext['mode'], value?: string | File) => {
      console.log('handleCvContextSubmit called with:', { mode, value });
      if (mode === 'profile') {
        setCvContext({ mode, value: 'profile', name: 'Your Zobsai Profile' });
      } else if (value) {
        const cvName = typeof value === 'string';
        // ? resume?.find((r) => r._id === value)?.name || 'Saved CV'
        // : value.name;
        setCvContext({ mode, value, name: cvName });
      } else if (mode === 'saved') {
        setCvContext({ mode, value: 'saved', name: 'Your saved cv' });
      } else {
        return;
      }
      navigateToStep('cl');
    },
    [navigateToStep, resume],
  );

  const handleCreateCvFormSubmit = useCallback(
    async (data: CvDetailsValues) => {
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
        if (!Array.isArray(mockUserProfile.savedCvs))
          mockUserProfile.savedCvs = [];
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
    },
    [navigateToStep, toast],
  );

  const handleClContextSubmit = useCallback(async () => {
    const { clSource, pastedCl, savedClId } = clForm.getValues();
    let context: ClContext = { mode: 'skip' };
    if (clSource === 'paste' && pastedCl) {
      context = { mode: 'paste', value: pastedCl, name: 'Pasted Content' };
    } else if (clSource === 'saved' && savedClId) {
      const savedCl = mockUserProfile.savedCoverLetters.find(
        (c) => c.id === savedClId,
      );
      if (savedCl)
        context = {
          mode: 'saved',
          value: savedCl.htmlContent,
          name: savedCl.name,
        };
    }
    setClContext(context);
    navigateToStep('generate');
  }, [clForm, navigateToStep]);

  useEffect(() => {
    const slug = searchParams.get('slug');
    const fetchJob = async () => {
      const response = await apiInstance.get(`/jobs/find/${slug}`);

      setJobContext({
        jobId: response?.data?.job._id,
        jobTitle: response.data.job.title,
        companyName: response.data.job.company,
        jobDescription: response.data.job.description,
      });
    };

    if (slug) fetchJob();
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!cvContext || !jobContext) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please ensure both job and CV information are provided.',
      });
      navigateToStep('cv');
      // router.push
      return;
    }
    setIsLoading(true);
    navigateToStep('generate');
    try {
      const formData = new FormData();
      if (jobContext.jobId) formData.append('jobId', jobContext.jobId);
      else {
        formData.append('jobTitle', jobContext.jobTitle);
        formData.append('companyName', jobContext.companyName);
        const slug = searchParams.get('slug');
        if (slug) {
          const response = await apiInstance.get(`/jobs/find/${slug}`);
          formData.append('jobDescription', response.data.description);
        } else {
          formData.append('jobDescription', jobContext.jobDescription);
        }
      }
      if (cvContext.mode === 'profile') formData.append('useProfile', 'true');
      else if (
        cvContext.mode === 'saved' &&
        typeof cvContext.value === 'string'
      )
        formData.append('savedCVId', cvContext.value);
      else if (cvContext.mode === 'upload' && cvContext.value instanceof File) {
        formData.append('cv', cvContext.value);
        formData.append('useProfile', 'false');
      }
      if (clContext) {
        if (clContext.mode === 'saved' && typeof clContext.value === 'string')
          formData.append('savedCoverLetterId', clContext.value);
        else if (clContext.mode === 'paste' && clContext.value)
          formData.append('coverLetterText', clContext.value);
      }
      formData.append('finalTouch', 'Tailor for ATS optimization');
      const response = await apiInstance.post(
        '/students/applications/tailor',
        formData,
      );
      const result = response.data;
      setGeneratedData({
        refinedCv: result.data.tailoredCV,
        tailoredCl: result.data.tailoredCoverLetter,
        emailDraft: result.data.applicationEmail,
      });
      toast({
        title: 'Success!',
        description: 'Your tailored documents are ready for review.',
      });
      navigateToStep('result');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description:
          (error as any).response?.data?.message ||
          'Failed to generate application. Please try again.',
      });
      navigateToStep('cl'); // Go back to the previous step on failure
    } finally {
      setIsLoading(false);
    }
  }, [cvContext, jobContext, clContext, navigateToStep, toast, searchParams]);

  const handleCVFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
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
          description: 'Please upload a PDF, PNG, JPG, or Word document.',
        });
        return;
      }
      setCvContext({ mode: 'upload', value: file, name: file.name });
      navigateToStep('cl');
    },
    [navigateToStep, toast],
  );

  const handleStartNew = useCallback(() => {
    setJobContext(null);
    setCvContext(null);
    setClContext(null);
    setGeneratedData({ refinedCv: '', tailoredCl: '', emailDraft: '' });
    router.push('/apply?step=job');
    toast({
      title: 'New Application Started',
      description: 'You can now create another tailored application.',
    });
  }, [router, toast]);

  const handleSendEmail = useCallback(() => {
    apiInstance.post('/user/send-email', {
      senderEmail: student?.email,
      recieverEmail: 'thesiddiqui7@gmail.com', // This should likely be a variable
      subject: jobContext?.jobTitle,
      bodyHtml: generatedData.emailDraft,
      htmlResume: generatedData.refinedCv,
      htmlCoverLetter: generatedData.tailoredCl,
    });
    toast({
      title: 'Email Sent',
      description: 'An email has been sent to your linked account.',
    });
  }, [student, jobContext, generatedData, toast]);

  // Inside your useApplicationWizard hook...

  const handleSaveAndFinish = useCallback(async () => {
    // ✅ FIX: Removed arguments
    // ✅ FIX: Add a guard clause to ensure data exists before saving
    if (!jobContext || !generatedData.refinedCv) {
      toast({
        variant: 'destructive',
        title: 'Cannot Save',
        description: 'Job details or generated content is missing.',
      });
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Saving your application...');

    try {
      const response = await apiInstance.post('/students/applications/save', {
        // ✅ FIX: Get data directly from the hook's state
        jobTitle: jobContext.jobTitle,
        jobCompany: jobContext.companyName,
        jobDescription: jobContext.jobDescription,

        cvContent: generatedData.refinedCv,
        coverLetterContent: generatedData.tailoredCl,
        emailContent: generatedData.emailDraft,
      });

      toast({ title: 'Application Saved Successfully!' });
      router.push('/dashboard/my-applications'); // Navigate away after success
    } catch (error) {
      console.error('Save failed:', error);
      toast({ variant: 'destructive', title: 'Save Failed!' });
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [jobContext, generatedData, router, toast]); // Add dependencies for useCallback
  return {
    state: {
      wizardStep,
      isLoading,
      loadingMessage,
      jobContext,
      cvContext,
      clContext,
      generatedData,
      jobs,
      student,
      resume,
      selectedCvId,
    },
    actions: {
      navigateToStep,
      handleJobContextSubmit,
      handleCvContextSubmit,
      handleCreateCvFormSubmit,
      handleClContextSubmit,
      handleGenerate,
      handleCVFileUpload,
      handleStartNew,
      handleSendEmail,
      setSelectedCvId,
      handleSaveAndFinish,
    },
    forms: { clForm },
  };
};
