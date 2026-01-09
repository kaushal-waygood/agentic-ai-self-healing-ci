'use client';

import React, { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
import { Progress } from '@/components/ui/progress'; // Ensure you have this or use a simple div
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
} from 'lucide-react';
import dynamic from 'next/dynamic';

import { useJobStore } from '@/store/job.store';

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
    name: 'Requirements',
    icon: FileText,
    fields: ['responsibilities', 'qualifications', 'experience', 'tags'],
  },
  {
    id: 2,
    name: 'Contract & Pay',
    icon: Banknote,
    fields: [
      'jobType',
      'salaryMin',
      'salaryMax',
      'salaryPeriod',
      'contractLengthValue',
    ],
  },
  {
    id: 3,
    name: 'Screening',
    icon: ClipboardList,
    fields: [
      'applyEmail',
      'includeAssignment',
      'assignmentQuestion',
      'assignmentFile',
    ],
  },
];

const NewJobPost = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mannualPostJob } = useJobStore();

  const THEME = {
    glassCard:
      'bg-white/90 backdrop-blur-xl border-0 shadow-2xl shadow-purple-500/10',
    gradientText:
      'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent',
    gradientBtn:
      'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-[1.02]',
    inputFocus:
      'focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:border-transparent transition-all duration-300',
    sectionIcon:
      'p-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg text-purple-600 mr-3',
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

  const onSubmit = async (data: JobFormType) => {
    setIsSubmitting(true);
    try {
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
          ? `${data.city}${data.state ? ', ' + data.state : ''}, ${
              data.country
            }`
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

      console.log('Payload:', finalPayload);
      mannualPostJob(finalPayload);
      toast.success('Job posted successfully!');
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

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 flex flex-col items-center">
      {/* Header */}
      <div className="mb-8 text-center space-y-2">
        <h1 className={`text-4xl font-bold ${THEME.gradientText}`}>
          Create Job Posting
        </h1>
        <p className="text-gray-500">
          Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].name}
        </p>
      </div>

      <Card className={`w-full max-w-3xl ${THEME.glassCard} overflow-visible`}>
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100 rounded-t-xl overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <CardHeader className="border-b border-gray-100 bg-white/50 pb-6 pt-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
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

        <CardContent className="p-6 md:p-8 min-h-[400px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* --- STEP 0: JOB OVERVIEW --- */}
              {currentStep === 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description *</FormLabel>
                        <FormControl>
                          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <QuillJs
                              content={field.value}
                              onContentChange={field.onChange}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Location Logic */}
                  <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 space-y-4">
                    <FormField
                      control={form.control}
                      name="remote"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base text-purple-900">
                              Remote Position?
                            </FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-purple-600"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {!remote && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 animate-in fade-in">
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
              )}

              {/* --- STEP 1: REQUIREMENTS --- */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <FormField
                    control={form.control}
                    name="responsibilities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Key Responsibilities</FormLabel>
                        <FormDescription>
                          What will they do day-to-day? (One per line)
                        </FormDescription>
                        <FormControl>
                          <textarea
                            {...field}
                            rows={5}
                            className={`w-full rounded-md border border-input p-3 ${THEME.inputFocus}`}
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
                        <FormDescription>
                          What must they have? (One per line)
                        </FormDescription>
                        <FormControl>
                          <textarea
                            {...field}
                            rows={5}
                            className={`w-full rounded-md border border-input p-3 ${THEME.inputFocus}`}
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
              )}

              {/* --- STEP 2: CONTRACT & PAY --- */}
              {currentStep === 2 && (
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
                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg grid grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                </div>
              )}

              {/* --- STEP 3: SCREENING & ASSIGNMENT --- */}
              {/* --- STEP 3: SCREENING & ASSIGNMENT --- */}
              {currentStep === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  {/* 1. BASIC SETTINGS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="applyEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recruiter Email *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                              <Input
                                {...field}
                                className={`pl-10 ${THEME.inputFocus}`}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="resumeRequired"
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
                          <MessageSquare className="w-5 h-5 text-purple-600" />
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
                          className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                        >
                          <Plus className="w-3 h-3 mr-1" />{' '}
                          {q.text.length > 30
                            ? q.text.substring(0, 30) + '...'
                            : q.text}
                        </Button>
                      ))}
                    </div>

                    {/* Dynamic List */}
                    <div className="space-y-3">
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
                                <FormItem className="col-span-1 md:col-span-3">
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
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
                            className="text-purple-600"
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
                    </div>
                  </div>

                  {/* 3. ASSIGNMENT SECTION (EXISTING) */}
                  <div className="pt-6 border-t border-gray-100">
                    <FormField
                      control={form.control}
                      name="includeAssignment"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 p-4 shadow-sm mb-6">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-semibold text-blue-900">
                              Include Screening Assignment?
                            </FormLabel>
                            <p className="text-xs text-blue-700/80">
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
                      <div className="p-4 border border-gray-200 rounded-xl bg-white space-y-4">
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
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className={`px-8 ${THEME.gradientBtn}`}
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
              className={`px-8 ${THEME.gradientBtn}`}
            >
              Next Step <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default NewJobPost;
