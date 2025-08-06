import { z } from 'zod';

export const signupFormSchema = z
  .object({
    accountType: z.enum(['individual', 'institution'], {
      required_error: 'You must select an account type.',
    }),
    fullName: z.string().min(1, { message: 'Full name is required.' }),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters.' }),
    confirmPassword: z.string(),
    jobPreference: z.string().optional(), // Now truly optional for all cases
    organizationName: z.string().optional(),
    referralCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.accountType === 'institution') {
        return !!data.organizationName && data.organizationName.length > 0;
      }
      return true;
    },
    {
      message: 'Organization name is required.',
      path: ['organizationName'],
    },
  );
