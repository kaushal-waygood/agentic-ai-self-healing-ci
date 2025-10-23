/** @format */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Rocket, UserPlus, Building } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  mockUserProfile,
  mockUsers,
  UserProfile,
  mockOrganizations,
  Organization,
} from '@/lib/data/user';
import { mockSubscriptionPlans } from '@/lib/data/subscriptions';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const signupFormSchema = z
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
    jobPreference: z.string().optional(),
    organizationName: z.string().optional(),
    referralCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.accountType === 'individual') {
        return !!data.jobPreference && data.jobPreference.length > 0;
      }
      return true;
    },
    {
      message: 'Please specify your job preference.',
      path: ['jobPreference'],
    },
  )
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

type SignupFormValues = z.infer<typeof signupFormSchema>;

const jobRoles = [
  'Software Engineer',
  'Product Manager',
  'UX Designer',
  'Data Scientist',
  'Marketing Specialist',
  'Sales Representative',
  'Human Resources',
  'Other',
];

export function SignupForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      accountType: 'individual',
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      jobPreference: '',
      organizationName: '',
      referralCode: '',
    },
  });

  const accountType = form.watch('accountType');

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      form.setValue('referralCode', refCode, { shouldValidate: true });
    }
  }, [searchParams, form]);

  async function onSubmit(data: SignupFormValues) {
    form.control.disabled = true;
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const existingUser = mockUsers.find(
      (u) => u.email.toLowerCase() === data.email.toLowerCase(),
    );
    if (existingUser) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: 'An account with this email already exists.',
      });
      form.control.disabled = false;
      return;
    }

    if (data.accountType === 'individual') {
      let toastDescription =
        "Your account is created. Let's set up your profile!";
      let awardedCredits = 0;

      if (data.referralCode) {
        const referrer = mockUsers.find(
          (u) => u.referralCode === data.referralCode,
        );
        if (referrer) {
          const referrerPlan = mockSubscriptionPlans.find(
            (p) => p.id === referrer.currentPlanId,
          );
          const bonus = referrerPlan?.referralBonus || 5;
          referrer.referralsMade = (referrer.referralsMade || 0) + 1;
          referrer.earnedApplicationCredits =
            (referrer.earnedApplicationCredits || 0) + bonus;
          awardedCredits = bonus;
          toastDescription = `Welcome! Your account is created. You and your referrer have been awarded ${bonus} credits!`;
        } else {
          toastDescription = `Welcome! Your account is created. The referral code was not found.`;
        }
      }

      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        fullName: data.fullName,
        email: data.email,
        createdAt: new Date().toISOString(),
        role: 'Individual',
        currentPlanId: 'basic',
        jobPreference: data.jobPreference!,
        referralCode: `USR-${Date.now()}`,
        referredBy: data.referralCode,
        earnedApplicationCredits: awardedCredits,
        usage: {
          aiJobApply: 0,
          aiCvGenerator: 0,
          aiCoverLetterGenerator: 0,
          applications: 0,
        },
        isEmailLinked: false,
        linkedEmailProvider: '',
        savedCvs: [],
        savedCoverLetters: [],
        autoApplyAgents: [],
        actionItems: [],
        narratives: { challenges: '', achievements: '', appreciation: '' },
        education: [],
        experience: [],
        projects: [],
        skills: [],
        lastApplicationDate: '',
      };

      mockUsers.push(newUser);
      Object.assign(mockUserProfile, newUser);

      toast({
        title: 'Welcome to zobsai!',
        description: toastDescription,
      });

      router.push('/onboarding');
    } else {
      // Institution signup
      const newOrg: Organization = {
        id: `org-${Date.now()}`,
        name: data.organizationName!,
        planId: 'enterprise_plus', // Default free plan for institutions
        allowStudentUpgrades: true,
        seats: 100, // Default seats
        status: 'pending_verification', // New institutions must be verified
        apiKey: `sk_${data.organizationName!.slice(0, 5).toLowerCase()}_${[
          ...Array(24),
        ]
          .map(() => Math.random().toString(36)[2])
          .join('')}`,
      };

      const newAdmin: UserProfile = {
        id: `user-${Date.now()}`,
        fullName: data.fullName,
        email: data.email,
        createdAt: new Date().toISOString(),
        role: 'OrgAdmin',
        organizationId: newOrg.id,
        currentPlanId: newOrg.planId,
        jobPreference: 'Organization Management',
        referralCode: `ADM-${Date.now()}`,
        usage: {
          aiJobApply: 0,
          aiCvGenerator: 0,
          aiCoverLetterGenerator: 0,
          applications: 0,
        },
        isEmailLinked: false,
        linkedEmailProvider: '',
        savedCvs: [],
        savedCoverLetters: [],
        autoApplyAgents: [],
        actionItems: [],
        narratives: { challenges: '', achievements: '', appreciation: '' },
        education: [],
        experience: [],
        projects: [],
        skills: [],
        referralsMade: 0,
        earnedApplicationCredits: 0,
        lastApplicationDate: '',
      };

      mockOrganizations.push(newOrg);
      mockUsers.push(newAdmin);
      Object.assign(mockUserProfile, newAdmin);

      toast({
        title: 'Institution Account Submitted!',
        description: `Welcome, ${data.organizationName}. Your account is pending verification and will be reviewed shortly.`,
      });

      router.push('/organization');
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center items-center mb-4">
          <Rocket className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-2xl font-headline">
          Create an Account
        </CardTitle>
        <CardDescription>
          Join zobsai and supercharge your job search.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="accountType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>I am signing up as...</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-2"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0 flex-1">
                        <FormControl>
                          <RadioGroupItem
                            value="individual"
                            id="r1"
                            className="peer sr-only"
                          />
                        </FormControl>
                        <FormLabel
                          htmlFor="r1"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary w-full cursor-pointer"
                        >
                          <UserPlus className="mb-2 h-6 w-6" />
                          Individual
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0 flex-1">
                        <FormControl>
                          <RadioGroupItem
                            value="institution"
                            id="r2"
                            className="peer sr-only"
                          />
                        </FormControl>
                        <FormLabel
                          htmlFor="r2"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary w-full cursor-pointer"
                        >
                          <Building className="mb-2 h-6 w-6" />
                          Institution
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {accountType === 'institution' && (
              <FormField
                control={form.control}
                name="organizationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution / Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., State University" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      {...field}
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Email Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@example.com"
                      {...field}
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {accountType === 'individual' && (
              <FormField
                control={form.control}
                name="jobPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Job Role You're Seeking</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={form.formState.isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a job role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {jobRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                'Creating Account...'
              ) : (
                <>
                  {' '}
                  <UserPlus className="mr-2 h-4 w-4" /> Sign Up{' '}
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm">
        <p>
          Already have an account?&nbsp;
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
