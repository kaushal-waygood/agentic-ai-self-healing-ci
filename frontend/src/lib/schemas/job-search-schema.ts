import { z } from 'zod';

export const JobPreferencesSchema = z.object({
  // Location Preferences
  preferedCountries: z.array(z.string()).optional().default([]),
  preferedCities: z.array(z.string()).optional().default([]),
  isRemote: z.boolean().optional().default(false),
  relocationWillingness: z
    .enum(['not-willing', 'open', 'very-willing', 'seeking'])
    .optional(),

  // Job Details
  preferedJobTitles: z.array(z.string()).optional().default([]),
  preferedJobTypes: z.array(z.string()).optional().default([]),
  preferedIndustries: z.array(z.string()).optional().default([]),
  preferedExperienceLevel: z
    .enum(['ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR', 'EXECUTIVE', 'NONE'])
    .optional(),

  // Compensation
  preferedSalary: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().optional(),
    period: z.enum(['YEAR', 'MONTH', 'WEEK']).optional(),
  }),

  // Skills & Education
  mustHaveSkills: z
    .array(
      z.object({
        skill: z.string().optional(),
        level: z.string().optional(),
      }),
    )
    .optional()
    .default([]),
  niceToHaveSkills: z.array(z.string()).optional().default([]),
  preferedCertifications: z.array(z.string()).optional().default([]),
  preferedEducationLevel: z
    .enum(['high_school', 'associate', 'bachelor', 'master', 'phd', 'none'])
    .optional(),

  // Company Preferences
  preferedCompanySizes: z.array(z.string()).optional().default([]),
  preferedCompanyCultures: z.array(z.string()).optional().default([]),

  // Additional Preferences
  visaSponsorshipRequired: z.boolean().optional().default(false),
  immediateAvailability: z.boolean().optional().default(false),
});

export type JobPreferences = z.infer<typeof JobPreferencesSchema>;
