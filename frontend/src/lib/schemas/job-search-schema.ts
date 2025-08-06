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

  // Compensation (updated)
  preferedSalary: z
    .object({
      min: z
        .number()
        .min(0, 'Minimum salary must be positive')
        .optional()
        .nullable(),
      max: z
        .number()
        .min(0, 'Maximum salary must be positive')
        .optional()
        .nullable(),
      currency: z.string().min(1, 'Currency is required').optional().nullable(),
      period: z.enum(['YEAR', 'MONTH', 'WEEK']).optional().nullable(),
    })
    .nullable()
    .optional()
    .refine(
      (data) => {
        if (!data) return true;
        if (data.min && data.max) {
          return data.max >= data.min;
        }
        return true;
      },
      {
        message:
          'Maximum salary must be greater than or equal to minimum salary',
        path: ['max'],
      },
    ),

  // Rest of the schema remains the same...
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
  preferedCompanySizes: z.array(z.string()).optional().default([]),
  preferedCompanyCultures: z.array(z.string()).optional().default([]),
  visaSponsorshipRequired: z.boolean().optional().default(false),
  immediateAvailability: z.boolean().optional().default(false),
});

export type JobPreferences = z.infer<typeof JobPreferencesSchema>;
