'use client';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2,
  Building2,
  Banknote,
  Sparkles,
  FileUp,
  PenTool,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MessageSquare,
  Plus,
  Trash2,
  Mail,
  Users,
  Calendar,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useJobStore } from '@/store/job.store';
import PreviewModal from './PreviewModal';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';

const QuillJs = dynamic(() => import('@/components/rich-text/QuillJs'), {
  ssr: false,
  loading: () => <div className="h-40 bg-gray-50 animate-pulse rounded-md" />,
});

// --- Schema (Same as before) ---
const jobSchema = z
  .object({
    // Step 1: Overview
    title: z.string().min(1, 'Job title is required'),
    company: z.string().min(1, 'Company name is required'),
    description: z.string(),
    // .min(10, 'Description must be at least 10 characters'),
    remote: z.boolean(),
    city: z.string().optional(), // Made optional initially, refined later
    country: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),

    // Step 2: Requirements
    responsibilities: z.string().optional(),
    qualifications: z.string().optional(),
    experience: z.string().optional(),
    tags: z.string().optional(),
    hiringTimeline: z
      .enum(['IMMEDIATE', 'WITHIN_WEEK', 'WITHIN_MONTH', 'FLEXIBLE'])
      .optional(),
    numberOfOpenings: z.coerce.number().min(1).optional(),

    // Step 3: Contract & Pay
    jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']),
    contractLengthValue: z.coerce.number().optional(),
    contractLengthType: z.enum(['MONTHS', 'YEARS']).optional(),
    salaryMin: z.coerce.number().min(0, 'Salary must be positive'),
    salaryMax: z.coerce.number().min(0, 'Salary must be positive'),
    salaryPeriod: z.enum(['YEAR', 'MONTH']),

    // New Screening Questions Array
    screeningQuestions: z
      .array(
        z.object({
          question: z.string().min(1, 'Question cannot be empty'),
          type: z.enum(['text', 'number', 'boolean', 'date']),
          required: z.boolean().default(true),
        }),
      )
      .optional(),

    // Step 4: Screening
    applyEmail: z.string().email('Please enter a valid email'),
    resumeRequired: z.boolean(),
    includeAssignment: z.boolean().default(false),
    assignmentType: z.enum(['MANUAL', 'FILE']).optional(),
    assignmentQuestion: z.string().optional(),
    assignmentFile: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    // Location Validation (only if not remote)
    if (!data.remote) {
      if (!data.city)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['city'],
          message: 'City is required for on-site jobs',
        });
      if (!data.country)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['country'],
          message: 'Country is required for on-site jobs',
        });
    }

    // Assignment Validation
    if (data.includeAssignment) {
      if (!data.assignmentType)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['assignmentType'],
          message: 'Please select an assignment type',
        });
      if (
        data.assignmentType === 'MANUAL' &&
        (!data.assignmentQuestion || data.assignmentQuestion.length < 5)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['assignmentQuestion'],
          message: 'Please write a question or instruction',
        });
      }
    }
  });

type JobFormType = z.infer<typeof jobSchema>;

const STEPS = [
  {
    id: 0,
    name: 'Overview',
    icon: Building2,
    fields: [
      'title',
      'company',
      'description',
      'remote',
      'city',
      'country',
      'hiringTimeline',
      'numberOfOpenings',
    ],
  },

  {
    id: 1,
    name: 'Contract & Pay & Screening',
    icon: Banknote,
    fields: [
      'jobType',
      'salaryMin',
      'salaryMax',
      'salaryPeriod',
      'contractLengthValue',
    ],
  },
];

const NewJobPost = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mannualPostJob, rewriteJobDescriptionWithAI, loading } =
    useJobStore();

  const { user } = useAuthStore();

  console.log(user);
  const [editorKey, setEditorKey] = useState(0);

  const THEME = {
    glassCard:
      'bg-white/95 backdrop-blur-2xl border border-gray-100 shadow-xl shadow-blue-500/20 rounded-2xl',
    gradientText:
      'bg-gradient-to-r from-blue-700 via-indigo-600 to-pink-600 bg-clip-text text-transparent',
    gradientBtn:
      'bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 text-white hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105 rounded-xl',
    inputFocus:
      'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-300 transition-all duration-300 shadow-sm rounded-xl',
    sectionIcon:
      'p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl text-blue-600 mr-4 shadow-md',
  };

  const form = useForm<JobFormType>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      description: '',
      company: user?.fullName,
      applyEmail: user?.email,
      jobType: 'FULL_TIME',
      contractLengthValue: 0,
      contractLengthType: 'MONTHS',
      salaryMin: 0,
      salaryMax: 0,
      salaryPeriod: 'YEAR',
      city: '',
      state: '',
      postalCode: '',
      country: 'IN',
      responsibilities: '',
      qualifications: '',
      experience: '',
      tags: '',
      hiringTimeline: 'IMMEDIATE',
      numberOfOpenings: 1,
      screeningQuestions: [],
      resumeRequired: true,
      remote: false,
      includeAssignment: false,
      assignmentType: 'MANUAL',
    },
    mode: 'onChange', // Helps with validation per step
  });

  // Watchers
  const remote = form.watch('remote');
  const jobType = form.watch('jobType');
  const includeAssignment = form.watch('includeAssignment');
  const assignmentType = form.watch('assignmentType');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewPayload, setPreviewPayload] = useState<any>(null); // Store the final formatted data here

  useEffect(() => {
    if (user?.fullName && !form.getValues('company')) {
      form.setValue('company', user.fullName);
    }
  }, [user, form]);

  // --- Navigation Logic ---
  const handleNext = async () => {
    const fields = STEPS[currentStep].fields;
    const isValid = await form.trigger(fields as any);

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    } else {
      toast.error('Please fix the errors before proceeding.');
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // --- Submission Logic ---
  const splitLines = (value?: string | null) =>
    value
      ? value
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  const splitTags = (value?: string | null) =>
    value
      ? value
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  // This replaces your current onSubmit
  const handlePreview = (data: JobFormType) => {
    // 1. Construct the payload exactly as you did before
    const finalPayload: any = {
      title: data.title,
      description: data.description,
      company: data.company,
      applyMethod: { method: 'EMAIL', emails: [data.applyEmail] },
      jobTypes: [data.jobType],
      contractLength:
        data.jobType === 'CONTRACT'
          ? { value: data.contractLengthValue, type: data.contractLengthType }
          : null,
      salary: {
        min: data.salaryMin,
        max: data.salaryMax,
        period: data.salaryPeriod,
      },
      jobAddress: !data.remote
        ? `${data.city}${data.state ? ', ' + data.state : ''}, ${data.country}`
        : null,
      country: data.country,
      resumeRequired: data.resumeRequired,
      remote: data.remote,
      location: data.remote
        ? null
        : {
            city: data.city,
            state: data.state || '',
            postalCode: data.postalCode || '',
          },
      hiringTimeline: data.hiringTimeline,
      numberOfOpenings: data.numberOfOpenings,
      responsibilities: splitLines(data.responsibilities),
      qualifications: splitLines(data.qualifications),
      experience: splitLines(data.experience),
      tags: splitTags(data.tags),
      screeningQuestions: data.screeningQuestions,
      assignment: data.includeAssignment
        ? {
            isEnabled: true,
            type: data.assignmentType,
            content:
              data.assignmentType === 'MANUAL'
                ? data.assignmentQuestion
                : 'File Attached',
          }
        : null,
    };

    if (data.includeAssignment) {
      finalPayload.assignment = {
        isEnabled: true,
        type: data.assignmentType,
        content:
          data.assignmentType === 'MANUAL'
            ? data.assignmentQuestion
            : 'File Attached',
      };
      // File upload logic here if needed
    }

    // 2. Save this payload to state and open the modal
    setPreviewPayload(finalPayload);
    setIsPreviewOpen(true);
  };

  const handleFinalSubmit = async () => {
    if (!previewPayload) return;

    setIsSubmitting(true);
    try {
      console.log('Publishing Payload:', previewPayload);
      await mannualPostJob(previewPayload);
      toast.success('Job posted successfully!');
      form.reset();
      setCurrentStep(0);
      setIsPreviewOpen(false); // Close modal on success
      // Optional: Redirect or reset form here
    } catch (error) {
      console.error(error);
      toast.error('Failed to post job.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'screeningQuestions',
  });

  // Pre-defined suggestions (Indeed style)
  const SUGGESTED_QUESTIONS = [
    {
      text: 'How many years of experience do you have with [Skill]?',
      type: 'number',
    },
    { text: 'Are you authorized to work in [Country]?', type: 'boolean' },
    { text: "Do you have a valid Driver's License?", type: 'boolean' },
    { text: 'What is your expected salary range?', type: 'text' },
    { text: 'Are you comfortable working on-site?', type: 'boolean' },
  ];

  const addQuestion = (text: string, type: any) => {
    append({ question: text, type: type, required: true });
  };

  const CurrentIcon = STEPS[currentStep].icon;

  const handleAiRewrite = async () => {
    const currentHtml = form.getValues('description');
    const doc = new DOMParser().parseFromString(currentHtml, 'text/html');
    const plainText = doc.body.textContent || '';

    if (!plainText.trim()) {
      toast.error('Please enter some description first');
      return;
    }

    try {
      const newText = await rewriteJobDescriptionWithAI(plainText);
      if (newText) {
        // Optional: Convert Markdown to HTML if your AI returns "**Bold**"
        let formattedText = newText
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\n/g, '<br />');

        form.setValue('description', formattedText, {
          shouldValidate: true,
          shouldDirty: true,
        });

        // 2. Increment key to force Quill to re-render with new content
        setEditorKey((prev) => prev + 1);

        toast.success('Description rewritten!');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to rewrite description.');
    } finally {
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${THEME.gradientText}`}>
              Create Job Posting
            </h1>
            <p className="text-gray-600 mt-1">
              Step {currentStep + 1} of {STEPS.length} •{' '}
              {STEPS[currentStep].name}
            </p>
          </div>

          {/* Visual Step Indicator */}
          <div className="flex items-center gap-3">
            {STEPS.map((step, idx) => (
              <div key={idx} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    currentStep === idx
                      ? 'bg-blue-600 text-white shadow-lg scale-110'
                      : currentStep > idx
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > idx ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    idx + 1
                  )}
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="w-10 h-0.5 bg-gray-200 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className={`${THEME.glassCard}`}>
          <div
            className="h-1 bg-gradient-to-r from-blue-600 to-pink-600"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />

          {/* <CardHeader className=" ">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 text-blue-500 rounded-lg">
              <CurrentIcon className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">
                {STEPS[currentStep].name}
              </CardTitle>
              <CardDescription>
                Please fill in the details below.
              </CardDescription>
            </div>
          </div>
        </CardHeader> */}
          <CardHeader className="px-6 py-5 border-b bg-white/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`${THEME.sectionIcon}`}>
                  <CurrentIcon className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {STEPS[currentStep].name}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Please fill in the details below.
                  </CardDescription>
                </div>
              </div>

              {/* RIGHT SIDE: Company Info */}
              <div className="text-right hidden md:block">
                <div className="flex items-center gap-3 justify-end">
                  <Building2 className="w-5 h-5 text-gray-500" />
                  <div className="text-base font-semibold text-gray-900 capitalize">
                    {form.getValues('company') ||
                      user?.fullName ||
                      'Your Company'}
                  </div>
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-2 justify-end mt-1">
                  <Mail className="w-4 h-4 text-gray-500" />
                  {form.getValues('applyEmail') ||
                    user?.email ||
                    'email@company.com'}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 md:p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handlePreview)}
                className="space-y-10"
              >
                {/* --- STEP 0: JOB OVERVIEW --- */}
                {currentStep === 0 && (
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-bold text-gray-700">
                              Job Title *
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Senior Frontend Dev"
                                {...field}
                                className={`${THEME.inputFocus} h-11`}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      {/* <FormField
                          control={form.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. Acme Inc."
                                  {...field}
                                  disabled
                                  className={THEME.inputFocus}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        /> */}

                      <FormField
                        control={form.control}
                        name="applyEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-bold text-gray-700">
                              Recruiter Email *
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled
                                className="h-11 rounded-lg border-gray-300 bg-gray-50"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Location Logic Section */}
                    <div className="w-full max-w-2xl p-6 rounded-2xl border border-blue-200 bg-blue-50/50 space-y-6 shadow-sm">
                      <FormField
                        control={form.control}
                        name="remote"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel className="text-lg font-semibold text-blue-900">
                              Remote Position?
                            </FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-blue-600 scale-125"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      {!remote && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base font-semibold">
                                  City *
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    className="h-11 rounded-lg border-gray-300"
                                    placeholder="New York"
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base font-semibold">
                                  Country *
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    className="h-11 rounded-lg border-gray-300"
                                    placeholder="USA"
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="hiringTimeline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-bold text-gray-700 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-600" />
                              Hiring timeline
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger
                                  className={`${THEME.inputFocus} h-11`}
                                >
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="IMMEDIATE">
                                  Immediate
                                </SelectItem>
                                <SelectItem value="WITHIN_WEEK">
                                  Within a week
                                </SelectItem>
                                <SelectItem value="WITHIN_MONTH">
                                  Within a month
                                </SelectItem>
                                <SelectItem value="FLEXIBLE">
                                  Flexible
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="numberOfOpenings"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-bold text-gray-700 flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-600" />
                              Number of openings
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 1)
                                }
                                className={`${THEME.inputFocus} h-11`}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-bold text-gray-700">
                              Skills / Tags
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g. React, TypeScript, Remote"
                                className={`${THEME.inputFocus} h-11`}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* RIGHT COLUMN: Description Editor */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-gray-700">
                            Job Description *
                          </FormLabel>
                          <FormControl>
                            <div className="border border-gray-300 rounded-xl overflow-hidden shadow-sm min-h-[300px]">
                              <QuillJs
                                content={field.value}
                                onContentChange={field.onChange}
                                key={editorKey}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <div className="mt-3">
                      <Button
                        type="button"
                        onClick={handleAiRewrite}
                        disabled={loading}
                        className={`${THEME.gradientBtn} px-5 py-2.5 text-sm font-medium`}
                      >
                        {loading ? (
                          <>
                            Rewriting...{' '}
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          </>
                        ) : (
                          <>
                            Rewrite with AI{' '}
                            <Sparkles className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField
                        control={form.control}
                        name="responsibilities"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-bold text-gray-700">
                              Key Responsibilities
                            </FormLabel>
                            <FormDescription className="text-xs text-gray-500">
                              One per line
                            </FormDescription>
                            <FormControl>
                              <textarea
                                {...field}
                                rows={6}
                                className="w-full rounded-xl border border-gray-300 p-4 focus:border-blue-500 focus:ring-blue-500 resize-y min-h-[140px] bg-white/80 backdrop-blur-sm"
                                placeholder="- Lead frontend development\n- Mentor junior developers..."
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="qualifications"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-bold text-gray-700">
                              Qualifications / Skills
                            </FormLabel>
                            <FormDescription className="text-xs text-gray-500">
                              One per line
                            </FormDescription>
                            <FormControl>
                              <textarea
                                {...field}
                                rows={6}
                                className="w-full rounded-xl border border-gray-300 p-4 focus:border-blue-500 focus:ring-blue-500 resize-y min-h-[140px] bg-white/80 backdrop-blur-sm"
                                placeholder="- 5+ years of React experience\n- Strong TypeScript skills..."
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* --- STEP 1: REQUIREMENTS --- */}
                {currentStep === 1 && (
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                      <div className="md:col-span-1">
                        <FormField
                          control={form.control}
                          name="jobType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-bold text-gray-700">
                                Employment Type
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger
                                    className={`${THEME.inputFocus} h-11`}
                                  >
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="FULL_TIME">
                                    Full-time
                                  </SelectItem>
                                  <SelectItem value="PART_TIME">
                                    Part-time
                                  </SelectItem>
                                  <SelectItem value="CONTRACT">
                                    Contract
                                  </SelectItem>
                                  <SelectItem value="INTERN">
                                    Internship
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>

                      {jobType === 'CONTRACT' && (
                        <>
                          <div className="md:col-span-1">
                            <FormField
                              control={form.control}
                              name="contractLengthValue"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-bold text-gray-700">
                                    Duration
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      className={`${THEME.inputFocus} h-11`}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="md:col-span-1">
                            <FormField
                              control={form.control}
                              name="contractLengthType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-bold text-gray-700">
                                    Unit
                                  </FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger
                                        className={`${THEME.inputFocus} h-11`}
                                      >
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="MONTHS">
                                        Months
                                      </SelectItem>
                                      <SelectItem value="YEARS">
                                        Years
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                          </div>
                        </>
                      )}

                      <div className="md:col-span-1">
                        <FormField
                          control={form.control}
                          name="salaryMin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-bold text-gray-700">
                                Min Salary
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  className={`${THEME.inputFocus} h-11`}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="md:col-span-1">
                        <FormField
                          control={form.control}
                          name="salaryMax"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-bold text-gray-700">
                                Max Salary
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  className={`${THEME.inputFocus} h-11`}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="md:col-span-1">
                        <FormField
                          control={form.control}
                          name="salaryPeriod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-bold text-gray-700">
                                Period
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger
                                    className={`${THEME.inputFocus} h-11`}
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="YEAR">Per Year</SelectItem>
                                  <SelectItem value="MONTH">
                                    Per Month
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* 1. BASIC SETTINGS */}
                    <div className="flex flex-wrap justify-start gap-6">
                      <FormField
                        control={form.control}
                        name="resumeRequired"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-xl border border-gray-200 p-4 bg-white/80 backdrop-blur-sm h-[52px] shadow-sm min-w-[320px]">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-bold text-gray-900">
                                Require Resume/CV
                              </FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-indigo-600"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* 2. SCREENING QUESTIONS (INDEED STYLE) */}
                    <div className="space-y-6 pt-8 border-t border-gray-200 max-w-4xl mx-auto">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                            <MessageSquare className="w-6 h-6 text-blue-600" />
                            Applicant Questions
                          </h3>
                          <p className="text-base text-gray-600 mt-2">
                            Ask candidates specific questions to screen them
                            faster.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mb-6">
                        {SUGGESTED_QUESTIONS.map((q, idx) => (
                          <Button
                            key={idx}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addQuestion(q.text, q.type)}
                            className="text-sm bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border border-blue-200 rounded-full px-4 py-2 shadow-sm transition-all duration-300 hover:scale-105"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            {q.text.length > 30
                              ? q.text.substring(0, 30) + '...'
                              : q.text}
                          </Button>
                        ))}
                      </div>

                      {/* Dynamic List */}
                      {/* <div className="space-y-3">
                      {fields.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in zoom-in-95"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 w-full">
                            <FormField
                              control={form.control}
                              name={`screeningQuestions.${index}.question`}
                              render={({ field }) => (
                                <FormItem className="">
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Enter your question..."
                                      className="bg-white"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`screeningQuestions.${index}.type`}
                              render={({ field }) => (
                                <FormItem>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="text">
                                        Short Answer
                                      </SelectItem>
                                      <SelectItem value="boolean">
                                        Yes / No
                                      </SelectItem>
                                      <SelectItem value="number">
                                        Numeric
                                      </SelectItem>
                                      <SelectItem value="date">Date</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="text-blue-500 hover:text-blue-500 hover:bg-blue-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}

                      {fields.length === 0 && (
                        <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-lg">
                          <p className="text-gray-400 text-sm">
                            No screening questions added yet.
                          </p>
                          <Button
                            type="button"
                            variant="link"
                            onClick={() => addQuestion('', 'text')}
                            className="text-blue-500"
                          >
                            Add Custom Question
                          </Button>
                        </div>
                      )}

                      {fields.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => addQuestion('', 'text')}
                          className="w-full border-dashed text-gray-500"
                        >
                          <Plus className="w-4 h-4 mr-2" /> Add Another Question
                        </Button>
                      )}
                    </div> */}

                      <div className="space-y-4">
                        {fields.map((field, index) => (
                          <div
                            key={field.id}
                            className="group relative flex flex-col md:flex-row items-start md:items-center gap-4 p-4 border border-gray-200 rounded-xl shadow-sm transition-all hover:border-blue-300 hover:shadow-md bg-white/80 backdrop-blur-sm"
                          >
                            {/* Index Badge */}
                            <div className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 text-sm font-medium text-blue-700 group-hover:bg-blue-100 transition-colors">
                              {index + 1}
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 w-full">
                              {/* Question Input - Spans 8 columns on desktop */}
                              <div className="md:col-span-8">
                                <FormField
                                  control={form.control}
                                  name={`screeningQuestions.${index}.question`}
                                  render={({ field }) => (
                                    <FormItem className="space-y-1">
                                      <FormLabel className="text-sm font-medium text-gray-600 md:hidden">
                                        Question
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          placeholder="e.g. How many years of experience do you have in React?"
                                          className={`${THEME.inputFocus} h-11 bg-white/80 backdrop-blur-sm`}
                                        />
                                      </FormControl>
                                      <FormMessage className="text-xs" />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="md:col-span-4">
                                <FormField
                                  control={form.control}
                                  name={`screeningQuestions.${index}.type`}
                                  render={({ field }) => (
                                    <FormItem className="space-y-1">
                                      <FormLabel className="text-sm font-medium text-gray-600 md:hidden">
                                        Response Type
                                      </FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger
                                            className={`${THEME.inputFocus} h-11 bg-white/80 backdrop-blur-sm`}
                                          >
                                            <SelectValue placeholder="Response Type" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="text">
                                            Short Answer
                                          </SelectItem>
                                          <SelectItem value="boolean">
                                            Yes / No
                                          </SelectItem>
                                          <SelectItem value="number">
                                            Numeric
                                          </SelectItem>
                                          <SelectItem value="date">
                                            Date
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>

                            {/* Delete Button */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              className="shrink-0 text-gray-500 hover:text-pink-600 hover:bg-pink-50 transition-colors rounded-full"
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </div>
                        ))}

                        {/* Empty State */}
                        {fields.length === 0 && (
                          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50 backdrop-blur-sm transition-colors hover:bg-gray-50">
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-pink-50 rounded-full shadow-sm mb-4">
                              <MessageSquare className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">
                              No screening questions
                            </h3>
                            <p className="text-sm text-gray-600 mt-2 mb-6 text-center">
                              Add questions to filter your candidates
                              effectively.
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => addQuestion('', 'text')}
                              className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add your first question
                            </Button>
                          </div>
                        )}

                        {fields.length > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => addQuestion('', 'text')}
                            className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 hover:text-indigo-600 hover:border-indigo-300 rounded-xl transition-colors"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add another question
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* 3. ASSIGNMENT SECTION (EXISTING) */}
                    <div className="pt-8 border-t border-gray-200 max-w-3xl mx-auto">
                      <FormField
                        control={form.control}
                        name="includeAssignment"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-blue-200 bg-blue-50/70 p-6 shadow-md mb-8">
                            <div className="space-y-1">
                              <FormLabel className="text-lg font-semibold text-blue-900">
                                Include Screening Assignment?
                              </FormLabel>
                              <p className="text-sm text-blue-600/80">
                                Candidates must complete a file upload or
                                written task.
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-indigo-600 scale-125"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {includeAssignment && (
                        <div className="p-6 border border-gray-200 rounded-2xl bg-white/80 backdrop-blur-sm space-y-6 shadow-sm">
                          <FormField
                            control={form.control}
                            name="assignmentType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-bold text-gray-700">
                                  Submission Type
                                </FormLabel>
                                <Tabs
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="w-full"
                                >
                                  <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-xl p-1">
                                    <TabsTrigger
                                      value="MANUAL"
                                      className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md"
                                    >
                                      <PenTool className="w-4 h-4 mr-2" />
                                      Write Text
                                    </TabsTrigger>
                                    <TabsTrigger
                                      value="FILE"
                                      className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md"
                                    >
                                      <FileUp className="w-4 h-4 mr-2" />
                                      Upload File
                                    </TabsTrigger>
                                  </TabsList>
                                </Tabs>
                              </FormItem>
                            )}
                          />

                          {assignmentType === 'MANUAL' ? (
                            <FormField
                              control={form.control}
                              name="assignmentQuestion"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-bold text-gray-700">
                                    Assignment Instructions
                                  </FormLabel>
                                  <FormControl>
                                    <textarea
                                      {...field}
                                      rows={4}
                                      placeholder="e.g. Please review the attached case study and provide your analysis..."
                                      className="w-full rounded-xl border border-gray-300 p-4 focus:border-blue-500 focus:ring-blue-500 resize-y bg-white/70 backdrop-blur-sm"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          ) : (
                            <FormField
                              control={form.control}
                              name="assignmentFile"
                              render={({
                                field: { value, onChange, ...fieldProps },
                              }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700">
                                    Upload Brief (PDF/DOC)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...fieldProps}
                                      type="file"
                                      onChange={(e) => onChange(e.target.files)}
                                      className="cursor-pointer bg-gradient-to-r from-gray-50 to-gray-100 h-11 rounded-xl border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex justify-between px-6 py-5 border-t bg-gradient-to-r from-gray-50 to-gray-100">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="text-gray-700 hover:text-indigo-700 px-4 py-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            {currentStep === STEPS.length - 1 ? (
              <Button
                onClick={form.handleSubmit(handlePreview)}
                disabled={isSubmitting}
                className={`${THEME.gradientBtn} px-8 py-2.5`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  'Publish Now'
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className={`${THEME.gradientBtn} px-8 py-2.5`}
              >
                Next Step <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            )}
          </CardFooter>
        </Card>

        {isPreviewOpen && previewPayload && (
          <PreviewModal
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            onConfirm={handleFinalSubmit}
            isSubmitting={isSubmitting}
            data={previewPayload}
          />
        )}
      </div>
    </div>
  );
};

export default NewJobPost;
