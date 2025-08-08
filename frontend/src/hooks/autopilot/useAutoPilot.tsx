import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { mockUserProfile, AutoApplySettings, SavedCv } from '@/lib/data/user';
import { triggerAutoApplyAgent } from '@/ai/flows/auto-apply-agent-flow';
import { generateCv } from '@/ai/flows/cv-generation';
import { mockSubscriptionPlans } from '@/lib/data/subscriptions';
import {
  cvDetailsSchema,
  autoApplyFormSchema,
  CvDetailsValues,
  AutoApplyFormValues,
} from '@/components/auto-apply/ZodValidation';
import { View, WizardStep } from '@/components/auto-apply/ZodValidation';

// Main form hook
export const useAutoApplyForm = () => {
  return useForm<AutoApplyFormValues>({
    resolver: zodResolver(autoApplyFormSchema),
    mode: 'onChange',
    defaultValues: {
      id: '',
      name: '',
      isActive: false,
      dailyLimit: 5,
      jobFilters: {
        query: 'Developer',
        country: 'India',
        datePosted: 'week',
        workFromHome: true,
        employmentTypes: ['full-time'],
      },
      baseCvId: '',
      coverLetterSettings: {
        strategy: 'generate',
        templateId: undefined,
        instructions: '',
      },
    },
  });
};

// CV form hook
export const useCvForm = (jobQuery: string) => {
  const form = useForm<CvDetailsValues>({
    resolver: zodResolver(cvDetailsSchema),
    defaultValues: getDefaultCvValues(jobQuery),
  });

  const education = useFieldArray({ control: form.control, name: 'education' });
  const experience = useFieldArray({
    control: form.control,
    name: 'experience',
  });

  return { form, ...education, ...experience };
};

const getDefaultCvValues = (jobQuery: string): CvDetailsValues => ({
  fullName: mockUserProfile.fullName,
  email: mockUserProfile.email,
  phone: mockUserProfile.phone || '',
  linkedin: mockUserProfile.linkedin || '',
  summary: mockUserProfile.narratives.achievements || '',
  targetJobTitle: jobQuery || mockUserProfile.jobPreference || '',
  education: mockUserProfile.education?.length
    ? mockUserProfile.education.map((e) => ({
        ...e,
        fieldOfStudy: e.fieldOfStudy || '',
      }))
    : [getDefaultEducation()],
  experience: mockUserProfile.experience?.length
    ? mockUserProfile.experience.map((exp) => ({
        ...exp,
        responsibilities: exp.responsibilities.join('\n'),
      }))
    : [getDefaultExperience()],
  skills: (mockUserProfile.skills || []).join(', '),
});

const getDefaultEducation = () => ({
  institution: '',
  degree: '',
  fieldOfStudy: '',
  country: '',
  gpa: '',
  startDate: '',
  endDate: '',
});

const getDefaultExperience = () => ({
  company: '',
  jobTitle: '',
  employmentType: undefined,
  location: '',
  responsibilities: '',
  startDate: '',
  endDate: '',
});

// Agent actions hook
export const useAgentActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { toast } = useToast();

  const handleTriggerAgent = async (agent: AutoApplySettings) => {
    setIsLoading(true);
    toast({
      title: `Agent "${agent.name}" Activated!`,
      description: 'Preparing applications in the background.',
    });

    try {
      await triggerAutoApplyAgent(agent.id, agent);
      updateAgentLastRun(agent.id);
    } catch (error) {
      showErrorToast(error, 'Agent Failed', 'Could not start the AI agent.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivationToggle = async (
    agent: AutoApplySettings,
    isActive: boolean,
  ) => {
    const agentInProfile = findAgent(agent.id);
    if (!agentInProfile) return;

    agentInProfile.isActive = isActive;
    showStatusToast(agent, isActive);

    if (isActive) await handleTriggerAgent(agent);
  };

  const updateAgentLastRun = (agentId: string) => {
    const agent = findAgent(agentId);
    if (agent) agent.lastRun = new Date().toISOString();
  };

  const findAgent = (id: string) =>
    (mockUserProfile.autoApplyAgents || []).find((a) => a.id === id);

  const showStatusToast = (agent: AutoApplySettings, isActive: boolean) => {
    toast({
      title: `Agent ${isActive ? 'Activated' : 'Deactivated'}`,
      description: `Agent "${agent.name}" is now ${
        isActive ? 'active' : 'inactive'
      }.`,
    });
  };

  const showErrorToast = (error: unknown, title: string, fallback: string) => {
    toast({
      variant: 'destructive',
      title,
      description: error instanceof Error ? error.message : fallback,
    });
  };

  return {
    isLoading,
    loadingMessage,
    setLoadingMessage,
    setIsLoading,
    handleTriggerAgent,
    handleActivationToggle,
  };
};

// File upload hook
export const useFileUpload = (setBaseCvId: (id: string) => void) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const { toast } = useToast();

  const handleFileUpload = async (file: File, jobTitle: string) => {
    setIsUploading(true);
    setUploadMessage('Parsing your CV...');

    try {
      const base64data = await readFileAsDataURL(file);
      const generatedCv = await generateCv({ cvData: base64data, jobTitle });

      setUploadMessage('Saving your CV...');
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newCv = createNewCv(file.name, generatedCv, jobTitle);
      mockUserProfile.savedCvs.unshift(newCv);
      setBaseCvId(newCv.id);

      toast({
        title: 'CV Uploaded and Saved!',
        description: `"${file.name}" is now available and selected.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'CV Processing Failed',
        description:
          error instanceof Error ? error.message : 'Failed to process CV',
      });
    } finally {
      setIsUploading(false);
      setUploadMessage('');
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('File read error'));
      reader.readAsDataURL(file);
    });
  };

  const createNewCv = (
    filename: string,
    generatedCv: any,
    jobTitle: string,
  ): SavedCv => ({
    id: `cv-${Date.now()}`,
    name: `Uploaded: ${filename}`,
    htmlContent: generatedCv.cv,
    atsScore: generatedCv.atsScore,
    createdAt: new Date().toISOString(),
    jobTitle,
  });

  return {
    isUploading,
    uploadMessage,
    handleFileUpload,
  };
};

// Current plan hook
export const useCurrentPlan = () => {
  return mockSubscriptionPlans.find(
    (p) => p.id === mockUserProfile.currentPlanId,
  );
};

// Wizard navigation hook
export const useWizardNavigation = (initialStep: WizardStep = 'intro') => {
  const [wizardStep, setWizardStep] = useState<WizardStep>(initialStep);
  const [view, setView] = useState<View>('wizard');

  const goToNextStep = (currentStep: WizardStep) => {
    const nextStepMap: Record<WizardStep, WizardStep> = {
      intro: 'filters',
      filters: 'cv',
      cv: 'coverLetter',
      createCv: 'cv',
      coverLetter: 'config',
      config: 'config',
    };
    setWizardStep(nextStepMap[currentStep]);
  };

  return { wizardStep, setWizardStep, view, setView, goToNextStep };
};
