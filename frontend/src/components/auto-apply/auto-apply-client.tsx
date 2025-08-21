'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { mockUserProfile, AutoApplySettings, SavedCv } from '@/lib/data/user';
// import { triggerAutoApplyAgent } from '@/ai/flows/auto-apply-agent-flow';
import { generateCv } from '@/ai/flows/cv-generation';
import { mockSubscriptionPlans } from '@/lib/data/subscriptions';

import CvWizard from './CvWizard';
import CreateCVWizard from './CreateCVWizard';
import CoverLetterWizard from './CoverLetterWizard';
import FilterWizard from './FilterWizard';
import ConfigWizard from './ConfigWizard';
import IntroWizard from './IntroWizard';
import RenderDashboard from './RenderDashboard';
import RenderWizard from './RenderWizard';
import {
  cvDetailsSchema,
  experienceEntrySchema,
  CvDetailsValues,
  autoApplyFormSchema,
  AutoApplyFormValues,
  View,
} from './ZodValidation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import { getStudentDetailsRequest } from '@/redux/reducers/studentReducer';
import {
  useAutoApplyForm,
  useCvForm,
  useAgentActions,
  useFileUpload,
  useCurrentPlan,
  useWizardNavigation,
} from '@/hooks/autopilot/useAutoPilot';
import apiInstance from '@/services/api';

export function AutoApplyClient() {
  const [view, setView] = useState<View>('wizard');
  const [wizardStep, setWizardStep] = useState<WizardStep>('intro');
  const [editingAgent, setEditingAgent] = useState<AutoApplySettings | null>(
    null,
  );
  const [savedCvData, setSavedCvData] = useState<SavedCv | null>(null);
  const dispatch = useDispatch();
  const { students } = useSelector((state: RootState) => state.student);
  useEffect(() => {
    dispatch(getStudentDetailsRequest());
  }, [dispatch]);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<AutoApplyFormValues>({
    resolver: zodResolver(autoApplyFormSchema),
    mode: 'onChange',
    defaultValues: {
      id: '',
      name: '',
      isActive: false,
      dailyLimit: 5,
      jobFilters: {
        query: mockUserProfile.query,
        country: mockUserProfile.country,
        datePosted: 'week',
        workFromHome: true,
        employmentTypes: [],
      },
      baseCvId: '',
      coverLetterSettings: {
        strategy: 'generate',
        templateId: undefined,
        instructions: '',
      },
    },
  });

  const {
    formState: { errors, dirtyFields },
  } = form;

  const currentPlan = mockSubscriptionPlans.find(
    (p) => p.id === mockUserProfile.currentPlanId,
  );

  // Initialize view based on existing agents
  useEffect(() => {
    if ((mockUserProfile.autoApplyAgents || []).length > 0) {
      setView('dashboard');
    } else {
      setView('wizard');
      setWizardStep('intro');
    }
  }, []);

  const onInvalid = (errors: any) => {
    console.error(
      'Auto Apply Agent form validation failed:',
      JSON.stringify(errors, null, 2),
    );

    const firstErrorStep = (() => {
      if (errors.name || errors.jobFilters) return 'filters';
      if (errors.baseCvId) return 'cv';
      if (errors.coverLetterSettings) return 'coverLetter';
      if (errors.dailyLimit) return 'config';
      if (errors.id) return 'intro';
      return wizardStep;
    })();

    setWizardStep(firstErrorStep);

    toast({
      variant: 'destructive',
      title: 'Incomplete Form',
      description:
        "Please review all steps for errors. We've taken you to the step with the first error.",
    });
  };

  const createCvForm = useForm<CvDetailsValues>({
    resolver: zodResolver(cvDetailsSchema),
    defaultValues: {
      fullName: mockUserProfile.fullName,
      email: mockUserProfile.email,
      phone: mockUserProfile.phone || '',
      linkedin: mockUserProfile.linkedin || '',
      summary: mockUserProfile.narratives.achievements || '',
      targetJobTitle:
        form.getValues('jobFilters.query') ||
        mockUserProfile.jobPreference ||
        '',
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

  const startNewAgentWizard = () => {
    setEditingAgent(null);
    form.reset({
      id: `agent-${Date.now()}`,
      name: '',
      isActive: false,
      dailyLimit:
        currentPlan.limits.autoApplyDailyLimit !== -1
          ? currentPlan.limits.autoApplyDailyLimit
          : 5,
      jobFilters: {
        query: mockUserProfile.jobPreference || '',
        country: '',
        datePosted: 'week',
        workFromHome: false,
        employmentTypes: [],
      },
      baseCvId: '',
      coverLetterSettings: {
        strategy: 'generate',
        instructions: '',
      },
    });
    setWizardStep('filters'); // change it to filters
    setView('wizard');
  };

  const startEditAgentWizard = (agent: AutoApplySettings) => {
    setEditingAgent(agent);
    form.reset(agent);
    setWizardStep('filters');
    setView('wizard');
  };

  const onSubmit = async (data: AutoApplyFormValues) => {
    console.log('data', data);
    if (!currentPlan) return;

    setIsLoading(true);

    try {
      // Prepare form data according to backend requirements
      const formData = new FormData();

      // Add basic fields
      formData.append('agentName', data.name);
      formData.append('jobTitle', data.jobFilters.query);
      formData.append('country', data.jobFilters.country);
      formData.append('isRemote', data.jobFilters.workFromHome.toString());
      formData.append('isOnsite', (!data.jobFilters.workFromHome).toString());
      formData.append(
        'employmentType',
        data.jobFilters.employmentTypes.join(','),
      );
      formData.append('autopilotLimit', data.dailyLimit.toString());
      formData.append('coverLetterStrategy', data.coverLetterSettings.strategy);
      formData.append(
        'coverLetterInstructions',
        data.coverLetterSettings.instructions || '',
      );

      // Handle CV option
      if (data.baseCvId.startsWith('uploaded-cv')) {
        formData.append('cvOption', 'uploaded_pdf');
        // Find the uploaded CV
        const uploadedCv = mockUserProfile.savedCvs.find(
          (cv) => cv.id === data.baseCvId,
        );
        if (uploadedCv && uploadedCv.htmlContent) {
          // Convert base64 to file if needed
          const blob = await fetch(uploadedCv.htmlContent).then((r) =>
            r.blob(),
          );
          formData.append('cv', blob, 'uploaded_cv.pdf');
        }
      } else {
        formData.append('cvOption', 'current_profile');
      }

      // Make API call
      const response = await apiInstance.post('/pilotagent/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        // Update local state
        if (!Array.isArray(mockUserProfile.autoApplyAgents)) {
          mockUserProfile.autoApplyAgents = [];
        }

        const newAgent = {
          ...data,
          id: response.data.agent.agentId || `agent-${Date.now()}`,
          lastRun: new Date().toISOString(),
        };

        if (editingAgent) {
          const index = mockUserProfile.autoApplyAgents.findIndex(
            (a) => a.id === editingAgent.id,
          );
          if (index > -1) {
            mockUserProfile.autoApplyAgents[index] = newAgent;
          }
        } else {
          mockUserProfile.autoApplyAgents.push(newAgent);
          if (!mockUserProfile.hasSetupFirstAgent) {
            mockUserProfile.careerXp = (mockUserProfile.careerXp || 0) + 50;
            mockUserProfile.hasSetupFirstAgent = true;
            toast({
              title: '+50 Career XP!',
              description: 'For setting up your first AI agent.',
            });
          }
        }

        toast({
          title: 'Agent Created Successfully!',
          description: `Your agent "${data.name}" is now active.`,
        });
        setView('dashboard');
      } else {
        throw new Error(response.data.message || 'Failed to create agent');
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        variant: 'destructive',
        title: 'Agent Creation Failed',
        description:
          error.message || 'An error occurred while creating the agent',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAgent = (agentId: string) => {
    mockUserProfile.autoApplyAgents = (
      mockUserProfile.autoApplyAgents || []
    ).filter((a) => a.id !== agentId);
    toast({
      title: 'Agent Deleted',
      description: 'The AI agent has been removed.',
    });
    if ((mockUserProfile.autoApplyAgents || []).length === 0) {
      setWizardStep('intro');
      setView('wizard');
    } else {
      // Force a re-render of the dashboard
      setView('wizard');
      setTimeout(() => setView('dashboard'), 0);
    }
  };

  const handleTriggerAgent = async (agent: AutoApplySettings) => {
    // if (!currentPlan || currentPlan.limits.autoApplyAgents === 0) {
    //   toast({
    //     variant: 'destructive',
    //     title: 'Upgrade Required',
    //     description: 'AI Auto Apply is a premium feature.',
    //   });
    //   return;
    // }

    setIsLoading(true);
    toast({
      title: `Agent "${agent.name}" Activated!`,
      description: 'Preparing applications in the background.',
    });

    try {
      console.log('agent', agent);
      const agentInProfile = (mockUserProfile.autoApplyAgents || []).find(
        (a) => a.id === agent.id,
      );
      if (agentInProfile) {
        agentInProfile.lastRun = new Date().toISOString();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Agent Failed',
        description: 'Could not start the AI agent.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivationToggle = (
    agent: AutoApplySettings,
    isActive: boolean,
  ) => {
    console.log('handleActivationToggle', agent, isActive);
    const agentInProfile = (mockUserProfile.autoApplyAgents || []).find(
      (a) => a.id === agent.id,
    );

    const response = apiInstance.post(`/pilotagent/activate/${agent.id}`, {
      agentId: agent.id,
      isActive,
    });

    if (!agentInProfile) return;
    agentInProfile.isActive = isActive;

    toast({
      title: `Agent ${isActive ? 'Activated' : 'Deactivated'}`,
      description: `Agent "${agent.name}" is now ${
        isActive ? 'active' : 'inactive'
      }.`,
    });

    if (isActive) {
      handleTriggerAgent(agent);
    }
    // Force a re-render of the dashboard
    setView('wizard');
    setTimeout(() => setView('dashboard'), 0);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    console.log('handleFileUpload');
    const file = event.target.files?.[0];
    console.log('file', file);
    if (!file) return;

    setIsLoading(true);
    setLoadingMessage('Parsing your CV...');

    try {
      const jobTitle = form.getValues('jobFilters.query') || 'General';
      const base64data = await readFileAsBase64(file);

      setLoadingMessage('Processing your CV...');

      // Create a new CV object from the uploaded file
      const newCv: SavedCv = {
        id: `uploaded-cv-${Date.now()}`,
        name: `Uploaded CV for ${jobTitle}`,
        htmlContent: base64data, // Store the base64 content
        atsScore: 0, // Default score, can be calculated later
        createdAt: new Date().toISOString(),
        jobTitle: jobTitle,
      };

      // Add to saved CVs
      mockUserProfile.savedCvs.unshift(newCv);

      // Set as selected CV
      form.setValue('baseCvId', newCv.id, { shouldValidate: true });

      toast({
        title: 'CV uploaded successfully!',
        description: 'Your CV is ready to be used',
      });
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Helper function
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleCreateCvFormSubmit = async (data: CvDetailsValues) => {
    setIsLoading(true);

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
        skills: data.skills
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s),
      });

      const generatedCv = await generateCv({
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
      mockUserProfile.savedCvs.unshift(newCv);
      form.setValue('baseCvId', newCv.id, { shouldValidate: true });
      toast({
        title: 'CV Created & Selected!',
        description: 'Your new CV is ready to be used by the agent.',
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
    }
  };

  const handleGoToNextStep = async (
    currentStep: WizardStep,
    fieldsToValidate: (
      | keyof AutoApplyFormValues
      | `jobFilters.${keyof AutoApplyFormValues['jobFilters']}`
      | `coverLetterSettings.${keyof AutoApplyFormValues['coverLetterSettings']}`
    )[],
  ) => {
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      const nextStepMap: Record<WizardStep, WizardStep> = {
        intro: 'filters',
        filters: 'cv',
        cv: 'coverLetter',
        createCv: 'cv',
        coverLetter: 'config',
        config: 'config',
      };
      setWizardStep(nextStepMap[currentStep]);
    } else {
      toast({
        variant: 'destructive',
        title: 'Incomplete Step',
        description: 'Please fill out all required fields before proceeding.',
      });
    }
  };

  const filtersWatch = form.watch([
    'name',
    'jobFilters.query',
    'jobFilters.country',
    'jobFilters.employmentTypes',
  ]);
  const isFiltersStepValid =
    !!filtersWatch[0] &&
    !!filtersWatch[1] &&
    !!filtersWatch[2] &&
    (filtersWatch[3] || []).length > 0;
  const baseCvId = form.watch('baseCvId');

  const renderWizardContent = () => {
    switch (wizardStep) {
      case 'intro':
        return (
          <IntroWizard
            handleGoToNextStep={handleGoToNextStep}
            startNewAgentWizard={startNewAgentWizard}
            setView={setView}
          />
        );

      case 'filters':
        return (
          <FilterWizard
            form={form}
            errors={errors}
            isFiltersStepValid={isFiltersStepValid}
            handleGoToNextStep={handleGoToNextStep}
          />
        );

      case 'cv':
        return (
          <CvWizard
            form={form}
            errors={errors}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
            handleFileUpload={handleFileUpload}
            setWizardStep={setWizardStep}
            wizardStep={wizardStep}
            handleGoToNextStep={handleGoToNextStep}
            baseCvId={baseCvId}
            setIsLoading={setIsLoading} // Add this
            setLoadingMessage={setLoadingMessage} // Add this
          />
        );

      case 'createCv':
        return (
          <CreateCVWizard
            createCvForm={createCvForm}
            handleCreateCvFormSubmit={handleCreateCvFormSubmit}
            setWizardStep={setWizardStep}
            isLoading={isLoading}
          />
        );

      case 'coverLetter':
        return (
          <CoverLetterWizard
            form={form}
            errors={errors}
            handleGoToNextStep={handleGoToNextStep}
            coverLetterSettings={form.watch('coverLetterSettings')}
          />
        );

      case 'config':
        return (
          <ConfigWizard
            form={form}
            errors={errors}
            setWizardStep={setWizardStep}
            isLoading={isLoading}
            currentPlan={currentPlan}
            handleGoToNextStep={handleGoToNextStep}
          />
        );

      default:
        return null;
    }
  };

  const renderWizard = () => (
    <RenderWizard
      form={form}
      wizardStep={wizardStep}
      renderWizardContent={renderWizardContent}
      onSubmit={onSubmit}
      onInvalid={onInvalid}
    />
  );

  const renderDashboard = () => (
    <RenderDashboard
      startNewAgentWizard={startNewAgentWizard}
      startEditAgentWizard={startEditAgentWizard}
      deleteAgent={deleteAgent}
      handleActivationToggle={handleActivationToggle}
      handleTriggerAgent={handleTriggerAgent}
      isLoading={isLoading}
    />
  );

  return (
    <div className="w-full max-w-3xl mx-auto">
      {view === 'dashboard' ? renderDashboard() : renderWizard()}
    </div>
  );
}
