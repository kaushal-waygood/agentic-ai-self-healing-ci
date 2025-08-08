import { z } from 'zod';

const employmentTypes = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
] as const;

// CV Creation Form Schemas
export const educationEntrySchema = z.object({
  institution: z.string().min(1, 'Institution name is required'),
  degree: z.string().min(1, 'Degree is required'),
  fieldOfStudy: z.string().min(1, 'Field of study is required'),
  country: z.string().min(1, 'Country is required'),
  gpa: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
});

export const experienceEntrySchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  employmentType: z.enum(employmentTypes).optional(),
  location: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  responsibilities: z.string().min(1, 'Please list some responsibilities.'),
});

export const cvDetailsSchema = z.object({
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
  skills: z.string().min(1, 'Please list some skills, comma-separated'),
  targetJobTitle: z
    .string()
    .min(1, 'A job title is required to tailor the CV.'),
});
export type CvDetailsValues = z.infer<typeof cvDetailsSchema>;

export const autoApplyFormSchema = z
  .object({
    id: z.string().nonempty('ID is required.'),
    name: z.string().min(3, 'Agent name must be at least 3 characters long.'),
    isActive: z.boolean().default(false),
    dailyLimit: z.preprocess(
      (val) => Number(val),
      z.number().min(1, 'Must be at least 1').max(50, 'Limit cannot exceed 50'), // General max, will be checked against plan
    ),
    jobFilters: z.object({
      query: z.string().min(3, 'Query must be at least 3 characters'),
      country: z.string().nonempty('Country is required.'),
      datePosted: z.enum(['all', 'today', '3days', 'week', 'month']).optional(),
      workFromHome: z.boolean().optional(),
      employmentTypes: z
        .array(z.string())
        .min(1, 'At least one employment type is required.'),
    }),
    baseCvId: z.string().nonempty('You must select a base CV.'),
    coverLetterSettings: z.object({
      strategy: z.enum(['generate', 'use_template']),
      templateId: z.string().optional(),
      instructions: z.string().optional(),
    }),
  })
  .refine(
    (data) => {
      if (data.coverLetterSettings.strategy === 'use_template') {
        return !!data.coverLetterSettings.templateId;
      }
      return true;
    },
    {
      message: 'A template must be selected.',
      path: ['coverLetterSettings.templateId'],
    },
  );

export type AutoApplyFormValues = z.infer<typeof autoApplyFormSchema>;
export type WizardStep =
  | 'intro'
  | 'filters'
  | 'cv'
  | 'createCv'
  | 'coverLetter'
  | 'config';
export type View = 'dashboard' | 'wizard';
