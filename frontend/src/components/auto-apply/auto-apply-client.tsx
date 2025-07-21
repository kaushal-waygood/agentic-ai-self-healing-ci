
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { mockUserProfile, AutoApplySettings, SavedCv } from "@/lib/data/user";
import { triggerAutoApplyAgent } from "@/ai/flows/auto-apply-agent-flow";
import { generateCv } from "@/ai/flows/cv-generation";
import { countries } from "@/lib/data/countries";
import { ArrowLeft, ArrowRight, Bot, Check, ChevronsRight, Edit, Loader2, PlayCircle, PlusCircle, Settings, Trash2, UploadCloud, Wand2, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { mockSubscriptionPlans } from "@/lib/data/subscriptions";
import Link from "next/link";
import { ToastAction } from "../ui/toast";


const employmentTypeOptions = [
  { id: 'FULLTIME', label: 'Full-time' },
  { id: 'CONTRACTOR', label: 'Contractor' },
  { id: 'PARTTIME', label: 'Part-time' },
  { id: 'INTERN', label: 'Internship' },
];

const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'] as const;

// CV Creation Form Schemas
const educationEntrySchema = z.object({
  institution: z.string().min(1, "Institution name is required"),
  degree: z.string().min(1, "Degree is required"),
  fieldOfStudy: z.string().min(1, "Field of study is required"),
  country: z.string().min(1, "Country is required"),
  gpa: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

const experienceEntrySchema = z.object({
  company: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  employmentType: z.enum(employmentTypes).optional(),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  responsibilities: z.string().min(1, "Please list some responsibilities."),
});

const cvDetailsSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  linkedin: z.string().url().or(z.literal('')).optional(),
  summary: z.string().min(10, "Summary should be at least 10 characters"),
  education: z.array(educationEntrySchema).min(1, "At least one education entry is required"),
  experience: z.array(experienceEntrySchema).min(1, "At least one experience entry is required"),
  skills: z.string().min(1, "Please list some skills, comma-separated"),
  targetJobTitle: z.string().min(1, "A job title is required to tailor the CV."),
});
type CvDetailsValues = z.infer<typeof cvDetailsSchema>;


const autoApplyFormSchema = z.object({
  id: z.string().nonempty("ID is required."),
  name: z.string().min(3, "Agent name must be at least 3 characters long."),
  isActive: z.boolean().default(false),
  dailyLimit: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Must be at least 1").max(50, "Limit cannot exceed 50") // General max, will be checked against plan
  ),
  jobFilters: z.object({
    query: z.string().min(3, "Query must be at least 3 characters"),
    country: z.string().nonempty("Country is required."),
    datePosted: z.enum(['all', 'today', '3days', 'week', 'month']).optional(),
    workFromHome: z.boolean().optional(),
    employmentTypes: z.array(z.string()).min(1, "At least one employment type is required."),
  }),
  baseCvId: z.string().nonempty("You must select a base CV."),
  coverLetterSettings: z.object({
    strategy: z.enum(['generate', 'use_template']),
    templateId: z.string().optional(),
    instructions: z.string().optional(),
  }),
}).refine(data => {
    if (data.coverLetterSettings.strategy === 'use_template') {
        return !!data.coverLetterSettings.templateId;
    }
    return true;
}, {
    message: "A template must be selected.",
    path: ["coverLetterSettings.templateId"],
});


type AutoApplyFormValues = z.infer<typeof autoApplyFormSchema>;
type WizardStep = "intro" | "filters" | "cv" | "createCv" | "coverLetter" | "config";
type View = 'dashboard' | 'wizard';

export function AutoApplyClient() {
  const [view, setView] = useState<View>('wizard');
  const [wizardStep, setWizardStep] = useState<WizardStep>("intro");
  const [editingAgent, setEditingAgent] = useState<AutoApplySettings | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const form = useForm<AutoApplyFormValues>({
    resolver: zodResolver(autoApplyFormSchema),
    mode: 'onChange',
    defaultValues: {
      id: "",
      name: "",
      isActive: false,
      dailyLimit: 5,
      jobFilters: {
        query: mockUserProfile.jobPreference || "",
        country: "",
        datePosted: "week",
        workFromHome: false,
        employmentTypes: [],
      },
      baseCvId: "",
      coverLetterSettings: {
        strategy: "generate",
        templateId: undefined,
        instructions: "",
      },
    },
  });
  
  const { formState: { errors, dirtyFields } } = form;

  const currentPlan = mockSubscriptionPlans.find(p => p.id === mockUserProfile.currentPlanId);

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
    console.error("Auto Apply Agent form validation failed:", JSON.stringify(errors, null, 2));
    
    const firstErrorStep = (() => {
      if (errors.name || errors.jobFilters) return "filters";
      if (errors.baseCvId) return "cv";
      if (errors.coverLetterSettings) return "coverLetter";
      if (errors.dailyLimit) return "config";
      if (errors.id) return "intro";
      return wizardStep;
    })();

    setWizardStep(firstErrorStep);

    toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: "Please review all steps for errors. We've taken you to the step with the first error.",
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
      targetJobTitle: form.getValues('jobFilters.query') || mockUserProfile.jobPreference || '',
      education: (mockUserProfile.education || []).length > 0 ? mockUserProfile.education.map(e => ({...e, fieldOfStudy: e.fieldOfStudy || ''})) : [{ institution: "", degree: "", fieldOfStudy: "", country: "", gpa: "", startDate: "", endDate: "" }],
      experience: (mockUserProfile.experience || []).length > 0 ? mockUserProfile.experience.map(exp => ({...exp, responsibilities: exp.responsibilities.join('\n')})) : [{ company: "", jobTitle: "", employmentType: undefined, location: "", responsibilities: "", startDate: "", endDate: "" }],
      skills: (mockUserProfile.skills || []).join(', '),
    },
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control: createCvForm.control, name: "education" });
  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control: createCvForm.control, name: "experience" });

  const startNewAgentWizard = () => {
    if (!currentPlan || currentPlan.limits.autoApplyAgents === 0) {
      toast({
        variant: "destructive",
        title: "Upgrade Required",
        description: "Creating AI Auto-Apply agents is a premium feature. Please upgrade your plan.",
        action: <ToastAction altText="Upgrade" asChild><Link href="/subscriptions">Upgrade</Link></ToastAction>,
      });
      return;
    }
    if (currentPlan.limits.autoApplyAgents !== -1 && (mockUserProfile.autoApplyAgents || []).length >= currentPlan.limits.autoApplyAgents) {
      toast({
        variant: "destructive",
        title: "Agent Limit Reached",
        description: `Your plan allows for ${currentPlan.limits.autoApplyAgents} agent(s).`,
        action: <ToastAction altText="Upgrade" asChild><Link href="/subscriptions">Upgrade</Link></ToastAction>,
      });
      return;
    }

    setEditingAgent(null);
    form.reset({
      id: `agent-${Date.now()}`,
      name: "",
      isActive: false,
      dailyLimit: currentPlan.limits.autoApplyDailyLimit !== -1 ? currentPlan.limits.autoApplyDailyLimit : 5,
      jobFilters: {
        query: mockUserProfile.jobPreference || "",
        country: "",
        datePosted: "week",
        workFromHome: false,
        employmentTypes: [],
      },
      baseCvId: "",
      coverLetterSettings: {
        strategy: "generate",
        instructions: ""
      },
    });
    setWizardStep("filters");
    setView("wizard");
  }

  const startEditAgentWizard = (agent: AutoApplySettings) => {
    setEditingAgent(agent);
    form.reset(agent);
    setWizardStep("filters");
    setView("wizard");
  }

  const onSubmit = async (data: AutoApplyFormValues) => {
    if (!currentPlan) return;
    if (currentPlan.limits.autoApplyDailyLimit !== -1 && data.dailyLimit > currentPlan.limits.autoApplyDailyLimit) {
        toast({
            variant: "destructive",
            title: "Daily Limit Exceeded",
            description: `Your plan's daily limit is ${currentPlan.limits.autoApplyDailyLimit}. Please adjust the agent's limit.`,
        });
        setWizardStep('config');
        return;
    }

    setIsLoading(true);
    
    if (!Array.isArray(mockUserProfile.autoApplyAgents)) {
        mockUserProfile.autoApplyAgents = [];
    }

    if (editingAgent) {
      const index = (mockUserProfile.autoApplyAgents || []).findIndex(a => a.id === editingAgent.id);
      if (index > -1) {
        mockUserProfile.autoApplyAgents[index] = data;
      }
    } else {
      (mockUserProfile.autoApplyAgents || []).push(data);
       if (!mockUserProfile.hasSetupFirstAgent) {
        mockUserProfile.careerXp = (mockUserProfile.careerXp || 0) + 50;
        mockUserProfile.hasSetupFirstAgent = true;
        toast({ title: "+50 Career XP!", description: "For setting up your first AI agent." });
      }
    }
    
    toast({
      title: "Agent Settings Saved!",
      description: `Your settings for agent "${data.name}" have been updated.`,
    });

    setIsLoading(false);
    setView("dashboard");
  };

  const deleteAgent = (agentId: string) => {
      mockUserProfile.autoApplyAgents = (mockUserProfile.autoApplyAgents || []).filter(a => a.id !== agentId);
      toast({ title: "Agent Deleted", description: "The AI agent has been removed." });
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
    if (!currentPlan || currentPlan.limits.autoApplyAgents === 0) {
        toast({ variant: "destructive", title: "Upgrade Required", description: "AI Auto Apply is a premium feature." });
        return;
    }

    setIsLoading(true);
    toast({ title: `Agent "${agent.name}" Activated!`, description: "Preparing applications in the background." });
    
    try {
      await triggerAutoApplyAgent(agent.id, agent);
      const agentInProfile = (mockUserProfile.autoApplyAgents || []).find(a => a.id === agent.id);
      if (agentInProfile) {
          agentInProfile.lastRun = new Date().toISOString();
      }
    } catch(error) {
       toast({ variant: "destructive", title: "Agent Failed", description: "Could not start the AI agent." });
    } finally {
       setIsLoading(false);
    }
  };
  
  const handleActivationToggle = (agent: AutoApplySettings, isActive: boolean) => {
      const agentInProfile = (mockUserProfile.autoApplyAgents || []).find(a => a.id === agent.id);
      if (!agentInProfile) return;
      agentInProfile.isActive = isActive;
      
      toast({ title: `Agent ${isActive ? 'Activated' : 'Deactivated'}`, description: `Agent "${agent.name}" is now ${isActive ? 'active' : 'inactive'}.`});

      if (isActive) {
          handleTriggerAgent(agent);
      }
      // Force a re-render of the dashboard
      setView('wizard');
      setTimeout(() => setView('dashboard'), 0);
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const jobTitle = form.getValues('jobFilters.query') || 'General';
    if (!file) return;

    setIsLoading(true);
    setLoadingMessage("Parsing your CV...");

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
        try {
            const base64data = reader.result as string;
            const generatedCv = await generateCv({ cvData: base64data, jobTitle });

            setLoadingMessage("Saving your CV...");
            await new Promise(resolve => setTimeout(resolve, 500));

            const newCv: SavedCv = {
                id: `cv-${Date.now()}`,
                name: `Uploaded: ${file.name}`,
                htmlContent: generatedCv.cv,
                atsScore: generatedCv.atsScore,
                createdAt: new Date().toISOString(),
                jobTitle: jobTitle
            };

            mockUserProfile.savedCvs.unshift(newCv);
            form.setValue('baseCvId', newCv.id, { shouldValidate: true });
            toast({ title: "CV Uploaded and Saved!", description: `"${file.name}" is now available and selected.` });
        } catch (error) {
            toast({ variant: "destructive", title: "CV Processing Failed", description: (error as Error).message });
        } finally {
            setIsLoading(false);
            setLoadingMessage("");
        }
    };
    reader.onerror = () => {
        toast({ variant: "destructive", title: "File Read Error" });
        setIsLoading(false);
        setLoadingMessage("");
    };
  };

  const handleCreateCvFormSubmit = async (data: CvDetailsValues) => {
    setIsLoading(true);

    try {
        const cvJsonString = JSON.stringify({
            fullName: data.fullName,
            contact: { email: data.email, phone: data.phone, linkedin: data.linkedin },
            summary: data.summary,
            education: data.education,
            experience: data.experience.map(exp => ({...exp, responsibilities: exp.responsibilities ? exp.responsibilities.split('\n').filter(Boolean) : []})),
            skills: data.skills.split(',').map(s => s.trim()).filter(s => s),
        });

        const generatedCv = await generateCv({ cvData: cvJsonString, jobTitle: data.targetJobTitle });
        const newCv: SavedCv = { id: `cv-${Date.now()}`, name: `Created CV for ${data.targetJobTitle}`, htmlContent: generatedCv.cv, atsScore: generatedCv.atsScore, createdAt: new Date().toISOString(), jobTitle: data.targetJobTitle };
        mockUserProfile.savedCvs.unshift(newCv);
        form.setValue('baseCvId', newCv.id, { shouldValidate: true });
        toast({ title: "CV Created & Selected!", description: "Your new CV is ready to be used by the agent." });
        setWizardStep('cv');
    } catch (error) {
        toast({ variant: "destructive", title: "CV Creation Failed", description: (error as Error).message });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleGoToNextStep = async (
    currentStep: WizardStep, 
    fieldsToValidate: (keyof AutoApplyFormValues | `jobFilters.${keyof AutoApplyFormValues['jobFilters']}` | `coverLetterSettings.${keyof AutoApplyFormValues['coverLetterSettings']}`)[]
  ) => {
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      const nextStepMap: Record<WizardStep, WizardStep> = {
        intro: "filters",
        filters: "cv",
        cv: "coverLetter",
        createCv: "cv",
        coverLetter: "config",
        config: "config"
      };
      setWizardStep(nextStepMap[currentStep]);
    } else {
      toast({
        variant: "destructive",
        title: "Incomplete Step",
        description: "Please fill out all required fields before proceeding."
      });
    }
  };
  
  const filtersWatch = form.watch(["name", "jobFilters.query", "jobFilters.country", "jobFilters.employmentTypes"]);
  const isFiltersStepValid = !!filtersWatch[0] && !!filtersWatch[1] && !!filtersWatch[2] && (filtersWatch[3] || []).length > 0;
  const baseCvId = form.watch('baseCvId');

  const renderWizardContent = () => {

    switch(wizardStep) {
      case "intro":
        return (
            <Card className="text-center">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Setup a New AI Agent</CardTitle>
                    <CardDescription>This wizard will configure your personal job agent to find and prepare applications for you.</CardDescription>
                </CardHeader>
                <CardContent><Bot className="h-16 w-16 mx-auto text-primary" /></CardContent>
                <CardFooter className="flex justify-between">
                    <Button type="button" variant="ghost" onClick={() => setView("dashboard")} disabled={(mockUserProfile.autoApplyAgents || []).length === 0}>
                        <ArrowLeft className="mr-2 h-4 w-4"/>Back to Dashboard
                    </Button>
                    <Button type="button" onClick={startNewAgentWizard} size="lg">
                        Get Started <ChevronsRight className="ml-2 h-5 w-5"/>
                    </Button>
                </CardFooter>
            </Card>
        );
      
      case "filters":
        return (
            <Card>
                <CardHeader>
                  <CardTitle>Step 1: Agent Name & Job Filters</CardTitle>
                  <CardDescription>Give your agent a name and define your ideal job. Fields marked with <span className="text-destructive">*</span> are required.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem><FormLabel>Agent Name <span className="text-destructive">*</span></FormLabel><FormControl><Input placeholder="e.g., Senior Product Manager Roles" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <Separator/>
                    <FormField control={form.control} name="jobFilters.query" render={({ field }) => (
                      <FormItem><FormLabel>Job Title / Keywords <span className="text-destructive">*</span></FormLabel><FormControl><Input placeholder="e.g., Senior Product Manager" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="jobFilters.country" render={({ field }) => (
                      <FormItem><FormLabel>Country <span className="text-destructive">*</span></FormLabel><Select onValueChange={field.onChange} value={field.value ?? ''}><FormControl><SelectTrigger><SelectValue placeholder="Select a country" /></SelectTrigger></FormControl><SelectContent>{countries.map(c => <SelectItem key={c.code} value={c.code.toLowerCase()}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="jobFilters.workFromHome" render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><Label className="font-normal">Remote / Work from home only</Label></FormItem>
                    )}/>
                    <div><FormLabel>Employment Types <span className="text-destructive">*</span></FormLabel>{employmentTypeOptions.map(item => (<FormField key={item.id} control={form.control} name="jobFilters.employmentTypes" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0 mt-2"><FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={checked => {return checked ? field.onChange([...(field.value || []), item.id]) : field.onChange((field.value || []).filter(v => v !== item.id));}}/></FormControl><FormLabel className="font-normal">{item.label}</FormLabel></FormItem>)}/>))} <FormMessage className="pt-2">{errors.jobFilters?.employmentTypes?.message}</FormMessage></div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button type="button" variant="ghost" onClick={() => editingAgent ? setView("dashboard") : setWizardStep("intro")}><ArrowLeft className="mr-2 h-4 w-4"/>Back</Button>
                    <Button type="button" onClick={() => handleGoToNextStep('filters', ['name', 'jobFilters.query', 'jobFilters.country', 'jobFilters.employmentTypes'])} disabled={!isFiltersStepValid}>Next: Select CV <ArrowRight className="ml-2 h-4 w-4"/></Button>
                </CardFooter>
            </Card>
        );

      case "cv":
        return (
            <Card>
                <CardHeader><CardTitle>Step 2: Choose Your Master CV</CardTitle><CardDescription>Select a base CV. This is required.</CardDescription></CardHeader>
                <CardContent>
                    <FormField control={form.control} name="baseCvId" render={({ field }) => (<FormItem><FormLabel>Select Base CV <span className="text-destructive">*</span></FormLabel><FormControl><RadioGroup onValueChange={(value) => field.onChange(value)} value={field.value ?? ''} className="space-y-2">{mockUserProfile.savedCvs.map(cv => (<FormItem key={cv.id} className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value={cv.id} id={`cv-${cv.id}`} /></FormControl><Label htmlFor={`cv-${cv.id}`} className="font-normal cursor-pointer flex-grow">{cv.name}</Label></FormItem>))}</RadioGroup></FormControl>{mockUserProfile.savedCvs.length === 0 && <p className="text-sm text-center py-4 text-muted-foreground">No saved CVs. Please create or upload one below.</p>}<FormMessage className="pt-2" /></FormItem>)}/>
                    <Separator className="my-6" />
                    <div className="space-y-2 text-center">
                         <p className="text-sm text-muted-foreground mb-2">Or add a new CV</p>
                        <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                            {isLoading && loadingMessage ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> {loadingMessage}</>
                            ) : (
                                <><UploadCloud className="mr-2 h-4 w-4"/>Upload a CV</>
                            )}
                        </Button>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.doc,.docx,.png,.jpg" />
                        <Button type="button" variant="outline" className="w-full" onClick={() => setWizardStep('createCv')} disabled={isLoading}>
                            <PlusCircle className="mr-2 h-4 w-4"/> Create a New CV
                        </Button>
                    </div>
                </CardContent>
                 <CardFooter className="flex justify-between">
                    <Button type="button" variant="ghost" onClick={() => setWizardStep("filters")}><ArrowLeft className="mr-2 h-4 w-4"/>Back</Button>
                    <Button type="button" onClick={() => handleGoToNextStep('cv', ['baseCvId'])} disabled={!baseCvId}>Next: Cover Letter <ArrowRight className="ml-2 h-4 w-4"/></Button>
                </CardFooter>
            </Card>
        );

    case "createCv":
        return (
            <Card>
                <CardHeader><CardTitle>Create a New CV for the Agent</CardTitle><CardDescription>Fill in your details. The AI will craft a CV, save it, and select it for the agent.</CardDescription></CardHeader>
                <Form {...createCvForm}>
                    <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); createCvForm.handleSubmit(handleCreateCvFormSubmit)(); }}>
                    <CardContent className="space-y-6 pt-6">
                        <FormField control={createCvForm.control} name="targetJobTitle" render={({ field }) => (<FormItem><FormLabel>Target Job Title <span className="text-destructive">*</span></FormLabel><FormControl><Input placeholder="e.g., Senior Product Manager" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={createCvForm.control} name="summary" render={({ field }) => (<FormItem><FormLabel>Professional Summary <span className="text-destructive">*</span></FormLabel><FormControl><Textarea placeholder="A brief summary of your career..." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                        <div>
                            <h3 className="text-lg font-medium mb-2">Education <span className="text-destructive">*</span></h3>
                            {eduFields.map((field, index) => (<Card key={field.id} className="p-4 mt-2 mb-4 space-y-4 relative">
                                <FormField control={createCvForm.control} name={`education.${index}.institution`} render={({ field: f }) => (<FormItem><FormLabel>Institution</FormLabel><FormControl><Input {...f} value={f.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                                <FormField control={createCvForm.control} name={`education.${index}.degree`} render={({ field: f }) => (<FormItem><FormLabel>Degree</FormLabel><FormControl><Input {...f} value={f.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                                <FormField control={createCvForm.control} name={`education.${index}.fieldOfStudy`} render={({ field: f }) => (<FormItem><FormLabel>Field of Study</FormLabel><FormControl><Input {...f} value={f.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={createCvForm.control} name={`education.${index}.country`} render={({ field: f }) => (<FormItem><FormLabel>Country</FormLabel><Select onValueChange={f.onChange} defaultValue={f.value}><FormControl><SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger></FormControl><SelectContent><SelectContent>{countries.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}</SelectContent></SelectContent></Select><FormMessage /></FormItem>)}/>
                                    <FormField control={createCvForm.control} name={`education.${index}.gpa`} render={({ field: f }) => (<FormItem><FormLabel>GPA (Optional)</FormLabel><FormControl><Input {...f} value={f.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={createCvForm.control} name={`education.${index}.startDate`} render={({ field: f }) => (<FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="month" {...f} value={f.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={createCvForm.control} name={`education.${index}.endDate`} render={({ field: f }) => (<FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="month" placeholder="or 'Present'" {...f} value={f.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                                </div>
                                {eduFields.length > 1 && <Button type="button" variant="destructive" size="sm" onClick={() => removeEdu(index)} className="absolute top-2 right-2"><Trash2 className="h-4 w-4"/> Remove</Button>}
                            </Card>))}
                            <Button type="button" variant="outline" size="sm" onClick={() => appendEdu({ institution: "", degree: "", fieldOfStudy: "", country: "", gpa: "", startDate: "", endDate: "" })}><PlusCircle className="mr-2 h-4 w-4" /> Add Education</Button>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium mb-2">Experience <span className="text-destructive">*</span></h3>
                            {expFields.map((field, index) => (<Card key={field.id} className="p-4 mt-2 mb-4 space-y-4 relative">
                                <FormField control={createCvForm.control} name={`experience.${index}.company`} render={({ field: f }) => (<FormItem><FormLabel>Company</FormLabel><FormControl><Input {...f} value={f.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                                <FormField control={createCvForm.control} name={`experience.${index}.jobTitle`} render={({ field: f }) => (<FormItem><FormLabel>Job Title</FormLabel><FormControl><Input {...f} value={f.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={createCvForm.control} name={`experience.${index}.employmentType`} render={({ field: f }) => (<FormItem><FormLabel>Employment Type</FormLabel><Select onValueChange={f.onChange} defaultValue={f.value}><FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl><SelectContent><SelectContent>{employmentTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></SelectContent></Select><FormMessage /></FormItem>)}/>
                                    <FormField control={createCvForm.control} name={`experience.${index}.location`} render={({ field: f }) => (<FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g. San Francisco, CA" {...f} value={f.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={createCvForm.control} name={`experience.${index}.startDate`} render={({ field: f }) => (<FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="month" {...f} value={f.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={createCvForm.control} name={`experience.${index}.endDate`} render={({ field: f }) => (<FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="month" placeholder="or 'Present'" {...f} value={f.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                                </div>
                                <FormField control={createCvForm.control} name={`experience.${index}.responsibilities`} render={({ field: f }) => (<FormItem><FormLabel>Responsibilities</FormLabel><FormControl><Textarea placeholder="Describe your key responsibilities..." {...f} value={f.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                                {expFields.length > 1 && <Button type="button" variant="destructive" size="sm" onClick={() => removeExp(index)} className="absolute top-2 right-2"><Trash2 className="h-4 w-4"/> Remove</Button>}
                            </Card>))}
                            <Button type="button" variant="outline" size="sm" onClick={() => appendExp({ company: "", jobTitle: "", employmentType: undefined, location: "", responsibilities: "", startDate: "", endDate: "" })}><PlusCircle className="mr-2 h-4 w-4" /> Add Experience</Button>
                        </div>
                        <FormField control={createCvForm.control} name="skills" render={({ field }) => (<FormItem><FormLabel>Skills <span className="text-destructive">*</span></FormLabel><FormControl><Textarea placeholder="e.g., JavaScript, Project Management..." {...field} value={field.value ?? ''} /></FormControl><FormDescription>Comma-separated list.</FormDescription><FormMessage /></FormItem>)}/>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button type="button" variant="ghost" onClick={() => setWizardStep("cv")}><ArrowLeft className="mr-2 h-4 w-4"/>Back</Button>
                        <Button type="button" onClick={createCvForm.handleSubmit(handleCreateCvFormSubmit)} disabled={isLoading}>
                           {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Creating...</> : <><Wand2 className="mr-2 h-4 w-4"/>Create & Use this CV</>}
                       </Button>
                    </CardFooter>
                    </form>
                </Form>
            </Card>
        );

      case "coverLetter":
        return (
            <Card>
                <CardHeader><CardTitle>Step 3: Set Cover Letter Strategy (Optional)</CardTitle></CardHeader>
                <CardContent>
                    <FormField control={form.control} name="coverLetterSettings.strategy" render={({ field }) => (<FormItem className="space-y-3"><FormControl><RadioGroup onValueChange={field.onChange} value={field.value ?? 'generate'} className="space-y-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="generate" /></FormControl><Label className="font-normal">Let AI generate it from scratch for each job.</Label></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="use_template" /></FormControl><Label className="font-normal">Use one of my saved cover letters as a template.</Label></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)}/>
                    {form.watch('coverLetterSettings.strategy') === 'use_template' && (<FormField control={form.control} name="coverLetterSettings.templateId" render={({ field }) => (<FormItem className="mt-4"><FormLabel>Select Template <span className="text-destructive">*</span></FormLabel><Select onValueChange={field.onChange} value={field.value ?? ''}><FormControl><SelectTrigger><SelectValue placeholder="Select a saved cover letter" /></SelectTrigger></FormControl><SelectContent>{mockUserProfile.savedCoverLetters.map(cl => <SelectItem key={cl.id} value={cl.id}>{cl.name}</SelectItem>)}</SelectContent></Select>{mockUserProfile.savedCoverLetters.length === 0 && <p className="text-xs text-muted-foreground pt-2">No saved cover letters available.</p>}<FormMessage /></FormItem>)}/>)}
                     <FormField control={form.control} name="coverLetterSettings.instructions" render={({ field }) => (<FormItem className="mt-4"><FormLabel>Specific Instructions (Optional)</FormLabel><FormControl><Textarea placeholder="e.g., Always mention my passion for sustainable technology." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                </CardContent>
                 <CardFooter className="flex justify-between">
                    <Button type="button" variant="ghost" onClick={() => setWizardStep("cv")}><ArrowLeft className="mr-2 h-4 w-4"/>Back</Button>
                    <Button type="button" onClick={() => handleGoToNextStep('coverLetter', ['coverLetterSettings'])}>Next: Final Config <ArrowRight className="ml-2 h-4 w-4"/></Button>
                </CardFooter>
            </Card>
        );

      case "config":
        return (
            <Card>
                <CardHeader><CardTitle>Step 4: Configure and Save</CardTitle></CardHeader>
                <CardContent>
                    <FormField control={form.control} name="dailyLimit" render={({ field }) => (<FormItem><FormLabel>Max Applications to Prepare per Day <span className="text-destructive">*</span></FormLabel><FormControl><Input type="number" min="1" max={currentPlan?.limits.autoApplyDailyLimit === -1 ? 50 : currentPlan?.limits.autoApplyDailyLimit} {...field} value={field.value ?? 5} /></FormControl><FormDescription>Your plan supports up to {currentPlan?.limits.autoApplyDailyLimit === -1 ? '50 (recommended max)' : currentPlan?.limits.autoApplyDailyLimit} per day. The agent will stop once this limit is reached.</FormDescription><FormMessage /></FormItem>)}/>
                </CardContent>
                 <CardFooter className="flex justify-between">
                    <Button type="button" variant="ghost" onClick={() => setWizardStep("coverLetter")}><ArrowLeft className="mr-2 h-4 w-4"/>Back</Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Saving...</> : <>Save Agent Settings <Check className="ml-2 h-4 w-4"/></>}
                    </Button>
                </CardFooter>
            </Card>
        );
        
      default:
        return null;
    }
  }

  const renderDashboard = () => (
    <div className="space-y-6">
        <div className="space-y-4">
        {(mockUserProfile.autoApplyAgents || []).map(agent => (
            <Card key={agent.id} className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                        <span className="flex items-center gap-2"><Bot className="h-6 w-6 text-primary"/> {agent.name}</span>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEditAgentWizard(agent)}><Edit className="h-4 w-4"/></Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the agent "{agent.name}". This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteAgent(agent.id)} className="bg-destructive hover:bg-destructive/90">Delete Agent</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardTitle>
                    <CardDescription>Targeting: "{agent.jobFilters.query}"</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5"><Label className="text-base">Agent Status</Label><p className="text-sm text-muted-foreground">Last run: {agent.lastRun ? new Date(agent.lastRun).toLocaleString() : 'Never'}</p></div>
                        <Switch checked={agent.isActive} onCheckedChange={(checked) => handleActivationToggle(agent, checked)} />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={() => handleTriggerAgent(agent)} disabled={isLoading || !agent.isActive} className="w-full">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <PlayCircle className="mr-2 h-4 w-4"/>}
                        Run Agent Now
                    </Button>
                </CardFooter>
            </Card>
        ))}
        </div>
        <Button onClick={startNewAgentWizard} variant="outline" className="w-full" size="lg">
            <PlusCircle className="mr-2 h-5 w-5"/> Create Another AI Auto Apply Agent
        </Button>
    </div>
  );

  const renderWizard = () => {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
          <AnimatePresence mode="wait">
              <motion.div
              key={wizardStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              >
              {renderWizardContent()}
              </motion.div>
          </AnimatePresence>
        </form>
      </Form>
    );
  };


  return (
    <div className="w-full max-w-3xl mx-auto">
        {view === 'dashboard' ? renderDashboard() : renderWizard()}
    </div>
  );
}
