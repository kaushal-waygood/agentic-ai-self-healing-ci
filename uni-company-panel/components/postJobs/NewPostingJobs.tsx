'use client';

import React, { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

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
  MapPin,
  Banknote,
  FileText,
  Globe,
  Mail,
  Sparkles,
  ClipboardList,
  FileUp,
  PenTool,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MessageSquare,
  Plus,
  Trash2,
  Briefcase,
  DollarSign,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import { useJobStore } from '@/store/job.store';
import PreviewModal from './PreviewModal';
import { toast } from 'sonner';

const QuillJs = dynamic(() => import('@/components/rich-text/QuillJs'), {
  ssr: false,
  loading: () => <div className="h-40 bg-gray-50 animate-pulse rounded-md" />,
});

// --- Schema (Same as before) ---
const jobSchema = z
  .object({
    // Step 1: Overview
    title: z.string().min(1, 'Job title is requiblue'),
    company: z.string().min(1, 'Company name is requiblue'),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters'),
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
          requiblue: z.boolean().default(true),
        }),
      )
      .optional(),

    // Step 4: Screening
    applyEmail: z.string().email('Please enter a valid email'),
    resumeRequiblue: z.boolean(),
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
          message: 'City is requiblue for on-site jobs',
        });
      if (!data.country)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['country'],
          message: 'Country is requiblue for on-site jobs',
        });
    }

    // Assignment Validation
    if (data.includeAssignment) {
      if (!data.assignmentType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select an assignment type',
          path: ['assignmentType'],
        });
      }
      if (
        data.assignmentType === 'MANUAL' &&
        (!data.assignmentQuestion || data.assignmentQuestion.length < 5)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please write a question or instruction',
          path: ['assignmentQuestion'],
        });
      }
    }
  });

type JobFormType = z.infer<typeof jobSchema>;

// --- Step Definitions ---
const STEPS = [
  {
    id: 0,
    name: 'Overview',
    icon: Building2,
    fields: ['title', 'company', 'description', 'remote', 'city', 'country'],
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
  // {
  //   id: 2,
  //   name: 'Screening',
  //   icon: ClipboardList,
  //   fields: [
  //     'applyEmail',
  //     'includeAssignment',
  //     'assignmentQuestion',
  //     'assignmentFile',
  //   ],
  // },
];

const NewJobPost = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mannualPostJob, rewriteJobDescriptionWithAI, loading } =
    useJobStore();

  const [editorKey, setEditorKey] = useState(0);

  const THEME = {
    glassCard:
      'bg-white/90 backdrop-blur-xl border-0 shadow-2xl shadow-blue-500/10',
    gradientText:
      'bg-gradient-to-r from-blue-600 via-blue-600 to-pink-600 bg-clip-text text-transparent',
    gradientBtn:
      'bg-gradient-to-r from-blue-600 via-blue-600 to-pink-600 text-white hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-[1.02]',
    inputFocus:
      'focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-transparent transition-all duration-300',
    sectionIcon:
      'p-2 bg-gradient-to-br from-blue-50 to-blue-50 rounded-lg text-blue-500 mr-3',
  };

  const form = useForm<JobFormType>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      description: '',
      company: '',
      applyEmail: '',
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
      screeningQuestions: [],
      resumeRequiblue: true,
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

  // const onSubmit = async (data: JobFormType) => {
  //   setIsSubmitting(true);
  //   try {
  //     const finalPayload: any = {
  //       title: data.title,
  //       description: data.description,
  //       company: data.company,
  //       applyMethod: { method: 'EMAIL', emails: [data.applyEmail] },
  //       jobTypes: [data.jobType],
  //       contractLength:
  //         data.jobType === 'CONTRACT'
  //           ? {
  //               value: data.contractLengthValue,
  //               type: data.contractLengthType,
  //             }
  //           : null,
  //       salary: {
  //         min: data.salaryMin,
  //         max: data.salaryMax,
  //         period: data.salaryPeriod,
  //       },
  //       jobAddress: !data.remote
  //         ? `${data.city}${data.state ? ', ' + data.state : ''}, ${
  //             data.country
  //           }`
  //         : null,
  //       country: data.country,
  //       resumeRequiblue: data.resumeRequiblue,
  //       remote: data.remote,
  //       location: data.remote
  //         ? null
  //         : {
  //             city: data.city,
  //             state: data.state || '',
  //             postalCode: data.postalCode || '',
  //           },
  //       responsibilities: splitLines(data.responsibilities),
  //       qualifications: splitLines(data.qualifications),
  //       experience: splitLines(data.experience),
  //       tags: splitTags(data.tags),
  //       screeningQuestions: data.screeningQuestions,
  //       assignment: data.includeAssignment
  //         ? {
  //             isEnabled: true,
  //             type: data.assignmentType,
  //             content:
  //               data.assignmentType === 'MANUAL'
  //                 ? data.assignmentQuestion
  //                 : 'File Attached',
  //           }
  //         : null,
  //     };

  // if (data.includeAssignment) {
  //   finalPayload.assignment = {
  //     isEnabled: true,
  //     type: data.assignmentType,
  //     content:
  //       data.assignmentType === 'MANUAL'
  //         ? data.assignmentQuestion
  //         : 'File Attached',
  //   };
  //   // File upload logic here if needed
  // }

  //     console.log('Payload:', finalPayload);
  //     // mannualPostJob(finalPayload);
  //     toast.success('Job posted successfully!');
  //   } catch (error) {
  //     console.error(error);
  //     toast.error('Failed to post job.');
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

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
          ? {
              value: data.contractLengthValue,
              type: data.contractLengthType,
            }
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
      resumeRequiblue: data.resumeRequiblue, // Kept your variable name
      remote: data.remote,
      location: data.remote
        ? null
        : {
            city: data.city,
            state: data.state || '',
            postalCode: data.postalCode || '',
          },
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
      // await mannualPostJob(previewPayload);
      toast.success('Job posted successfully!');
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
    append({ question: text, type: type, requiblue: true });
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
    <div className="min-h-screen p-4 md:p-6 flex flex-col ">
      {/* Header */}
      <div className="w-full  mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold text-blue-500`}>
            Create Job Posting
          </h1>
          <p className="text-gray-600">
            Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].name}
          </p>
        </div>

        {/* Visual Step Indicator */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-full border shadow-sm">
          {STEPS.map((step, idx) => (
            <div key={idx} className="flex items-center">
              <div
                className={`
              w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all
              ${
                currentStep === idx
                  ? 'bg-blue-500 text-white shadow-md scale-110'
                  : currentStep > idx
                    ? 'bg-green-100 text-green-500'
                    : 'bg-slate-100 text-slate-400'
              }
            `}
              >
                {currentStep > idx ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  idx + 1
                )}
              </div>
              {idx < STEPS.length - 1 && (
                <div className="w-6 h-0.5 bg-slate-100 mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>
      <Card className={`w-full  ${THEME.glassCard} overflow-visible`}>
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100 rounded-t-xl overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <CardHeader className=" ">
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
        </CardHeader>

        <CardContent className="p-6 md:p-4 ">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handlePreview)} className="">
              {/* --- STEP 0: JOB OVERVIEW --- */}
              {currentStep === 0 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  {/* Main Two-Column Container */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20">
                    {/* LEFT COLUMN: Inputs & Location Logic */}
                    <div className="space-y-6 col-span-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Job Title *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. Senior Frontend Dev"
                                  {...field}
                                  className={THEME.inputFocus}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. Acme Inc."
                                  {...field}
                                  className={THEME.inputFocus}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Location Logic Section */}
                      <div className="p-4 rounded-lg border border-blue-200 space-y-4">
                        <FormField
                          control={form.control}
                          name="remote"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <FormLabel className="text-base text-blue-900">
                                Remote Position?
                              </FormLabel>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-blue-500 "
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {!remote && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 animate-in fade-in">
                            <FormField
                              control={form.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City *</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      className="bg-white"
                                      placeholder="New York"
                                      className={THEME.inputFocus}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="country"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Country *</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      className="bg-white"
                                      placeholder="USA"
                                      className={THEME.inputFocus}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RIGHT COLUMN: Description Editor */}
                    <div className="h-full col-span-7">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="flex flex-col h-full">
                            <FormLabel>Job Description *</FormLabel>

                            <FormControl>
                              <div className="border rounded-lg overflow-hidden flex-grow">
                                <QuillJs
                                  content={field.value}
                                  onContentChange={field.onChange}
                                  key={editorKey}
                                />
                              </div>
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div>
                        {/* AI Rewrite Button */}

                        <Button
                          type="button"
                          onClick={handleAiRewrite}
                          disabled={loading}
                          className="m-1 transition-all duration-300 hover:scale-[1.02] "
                        >
                          {loading ? (
                            <>
                              <span className="animate-pulse">
                                Rewriting...
                              </span>
                              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            </>
                          ) : (
                            <>
                              Rewrite with AI
                              <Sparkles className="ml-2 h-4 w-4 " />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8   animate-in fade-in slide-in-from-right-4 duration-300">
                    <FormField
                      control={form.control}
                      name="responsibilities"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Key Responsibilities</FormLabel>
                          <FormDescription>(One per line)</FormDescription>
                          <FormControl>
                            <textarea
                              {...field}
                              rows={5}
                              className={`w-full rounded-lg border border-input p-3 ${THEME.inputFocus}`}
                              placeholder="- Lead the design team..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="qualifications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qualifications / Skills</FormLabel>
                          <FormDescription>(One per line)</FormDescription>
                          <FormControl>
                            <textarea
                              {...field}
                              rows={5}
                              className={` w-full rounded-md border border-input p-3 ${THEME.inputFocus}`}
                              placeholder="- 5+ years React experience..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags (comma separated)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="react, typescript, remote, senior"
                              className={THEME.inputFocus}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* --- STEP 1: REQUIREMENTS --- */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <FormField
                    control={form.control}
                    name="jobType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employment Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className={THEME.inputFocus}>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="FULL_TIME">Full-time</SelectItem>
                            <SelectItem value="PART_TIME">Part-time</SelectItem>
                            <SelectItem value="CONTRACT">Contract</SelectItem>
                            <SelectItem value="INTERN">Internship</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  {jobType === 'CONTRACT' && (
                    <div className="flex flex-wrap justify-start gap-4">
                      <FormField
                        control={form.control}
                        name="contractLengthValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                className="bg-white"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contractLengthType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-white">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="MONTHS">Months</SelectItem>
                                <SelectItem value="YEARS">Years</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap justify-start gap-4">
                    <FormField
                      control={form.control}
                      name="salaryMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Salary</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              className={THEME.inputFocus}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="salaryMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Salary</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              className={THEME.inputFocus}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="salaryPeriod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Period</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className={THEME.inputFocus}>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="YEAR">Per Year</SelectItem>
                              <SelectItem value="MONTH">Per Month</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* 1. BASIC SETTINGS */}
                  <div className="flex flex-wrap justify-start gap-4">
                    <FormField
                      control={form.control}
                      name="applyEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recruiter Email *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                className={` ${THEME.inputFocus}`}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="resumeRequiblue"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3 bg-white h-[46px] mt-8">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm">
                              Require Resume/CV
                            </FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* 2. SCREENING QUESTIONS (INDEED STYLE) */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-blue-500" />
                          Applicant Questions
                        </h3>
                        <p className="text-sm text-gray-500">
                          Ask candidates specific questions to screen them
                          faster.
                        </p>
                      </div>
                    </div>

                    {/* Suggested Chips */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {SUGGESTED_QUESTIONS.map((q, idx) => (
                        <Button
                          key={idx}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addQuestion(q.text, q.type)}
                          className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-500 border-blue-200"
                        >
                          <Plus className="w-3 h-3 mr-1" />{' '}
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
                          className="group relative flex flex-col md:flex-row items-start md:items-center gap-4 p-2 border border-gray-200 rounded-lg shadow-sm transition-all hover:border-blue-200 hover:shadow-md animate-in fade-in slide-in-from-top-2 duration-300"
                        >
                          {/* Index Badge */}
                          <div className="hidden md:flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-[10px] font-bold text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                            {index + 1}
                          </div>

                          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 w-full">
                            {/* Question Input - Spans 8 columns on desktop */}
                            <div className="md:col-span-8 ">
                              <FormField
                                control={form.control}
                                name={`screeningQuestions.${index}.question`}
                                render={({ field }) => (
                                  <FormItem className="space-y-1">
                                    <FormLabel className="text-xs font-semibold text-gray-500 md:hidden">
                                      Question
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        placeholder="e.g. How many years of experience do you have in React?"
                                        className="h-11 border-gray-200 focus-visible:ring-blue-500 transition-all bg-transparent"
                                      />
                                    </FormControl>
                                    <FormMessage className="text-[11px]" />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Type Select - Spans 4 columns on desktop */}
                            <div className="md:col-span-4">
                              <FormField
                                control={form.control}
                                name={`screeningQuestions.${index}.type`}
                                render={({ field }) => (
                                  <FormItem className="space-y-1">
                                    <FormLabel className="text-xs font-semibold text-gray-500 md:hidden">
                                      Response Type
                                    </FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="h-11 border-gray-200 focus:ring-blue-500 bg-gray-50/50">
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
                            className="shrink-0 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-full"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}

                      {/* Empty State */}
                      {fields.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 transition-colors hover:bg-gray-50">
                          <div className="p-3 bg-white rounded-full shadow-sm border border-gray-100 mb-3">
                            <MessageSquare className="w-6 h-6 text-gray-400" />
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900">
                            No screening questions
                          </h3>
                          <p className="text-xs text-gray-500 mb-4">
                            Add questions to filter your candidates effectively.
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

                      {/* Add Another Button (Sticky-style bottom action) */}
                      {fields.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => addQuestion('', 'text')}
                          className="w-full h-12 border-2 border-dashed border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add another question
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* 3. ASSIGNMENT SECTION (EXISTING) */}
                  <div className="pt-6 border-t border-gray-100">
                    <FormField
                      control={form.control}
                      name="includeAssignment"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-blue-100 bg-blue-50/50 p-4 shadow-sm mb-6">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-semibold text-blue-900">
                              Include Screening Assignment?
                            </FormLabel>
                            <p className="text-xs text-blue-500/80">
                              Candidates must complete a file upload or written
                              task.
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-blue-600"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {includeAssignment && (
                      <div className="p-4 border border-gray-200 rounded-lg bg-white space-y-4">
                        <FormField
                          control={form.control}
                          name="assignmentType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Submission Type</FormLabel>
                              <Tabs
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="w-full"
                              >
                                <TabsList className="grid w-full grid-cols-2">
                                  <TabsTrigger value="MANUAL">
                                    <PenTool className="w-4 h-4 mr-2" />
                                    Write Text
                                  </TabsTrigger>
                                  <TabsTrigger value="FILE">
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
                                <FormLabel>Assignment Instructions</FormLabel>
                                <FormControl>
                                  <textarea
                                    {...field}
                                    rows={4}
                                    placeholder="e.g. Please analyze this dataset and..."
                                    className={`w-full rounded-md border border-input p-3 ${THEME.inputFocus}`}
                                  />
                                </FormControl>
                                <FormMessage />
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
                                <FormLabel>Upload Brief (PDF/DOC)</FormLabel>
                                <FormControl>
                                  <Input
                                    {...fieldProps}
                                    type="file"
                                    onChange={(e) => onChange(e.target.files)}
                                    className="cursor-pointer bg-gray-50"
                                  />
                                </FormControl>
                                <FormMessage />
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

        {/* Footer Navigation */}
        <CardFooter className="flex justify-between border-t border-gray-100 bg-white/50 p-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          {currentStep === STEPS.length - 1 ? (
            <Button
              onClick={form.handleSubmit(handlePreview)}
              disabled={isSubmitting}
              className={`px-8 bg-blue-600 hover:bg-blue-700 cursor-pointer hover:scale-105  `}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  Publish Now <CheckCircle2 className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className={`px-8 bg-blue-500 hover:bg-blue-700 cursor-pointer hover:scale-105  `}
            >
              Next Step <ArrowRight className="ml-2 h-4 w-4" />
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
  );
};

export default NewJobPost;
