/** @format */
'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Building, MailCheck, Rocket, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Button } from '../ui/button';
import axios from 'axios';
import apiInstance from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { errorToast, successToast } from '@/utils/toasts';
import { GoogleSignInButton } from './GoogleSingupButton';

// 1. Update the schema to include the optional referral field
const signupFormSchema = z
  .object({
    accountType: z.enum(['individual', 'institution'], {
      required_error: 'You need to select an account type.',
    }),
    fullName: z
      .string()
      .min(2, { message: 'Full name must be at least 2 characters.' })
      .max(50, { message: 'Full name must be at most 50 characters.' }),
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters.' })
      .regex(/[a-z]/, {
        message: 'Password must contain at least one lowercase letter.',
      })
      .regex(/[A-Z]/, {
        message: 'Password must contain at least one uppercase letter.',
      })
      .regex(/[0-9]/, { message: 'Password must contain at least one number.' })
      .regex(/[^a-zA-Z0-9]/, {
        message: 'Password must contain at least one special character.',
      }),
    confirmPassword: z.string().min(1, { message: 'Passwords do not match.' }),
    organizationName: z.string().optional(),
    jobPreference: z.string().optional(),
    referredBy: z.string().optional(), // New optional referral field
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

type SignupFormValues = z.infer<typeof signupFormSchema>;
type JobRole = { _id: string; name: string };

const SignupForm = () => {
  const [jobRoles, setJobRoles] = useState<any[]>(['Software Developer']);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [storedEmail, setStoredEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Check localStorage for pending verification on component mount
  useEffect(() => {
    const pendingEmail = localStorage.getItem('pendingVerificationEmail');
    if (pendingEmail) {
      setStoredEmail(pendingEmail);
      setSignupSuccess(true);
    }
  }, []);

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
      referredBy: '', // Set default value for the new field
    },
  });

  const accountType = form.watch('accountType');

  async function onSubmit(data: SignupFormValues) {
    try {
      await apiInstance.post('/user/signup', data);
      successToast(
        'Your account has been created successfully! Please check your email for verification instructions.',
      );

      // Store email in localStorage and state
      localStorage.setItem('pendingVerificationEmail', data.email);
      setStoredEmail(data.email);
      setSignupSuccess(true);
    } catch (error) {
      console.error('Error creating user:', error);
      errorToast(
        'An error occurred while creating your account. Please try again later.',
      );
    }
  }

  const handleVerification = async () => {
    if (!verificationCode || !storedEmail) return;

    setIsVerifying(true);
    try {
      await apiInstance.post('/user/verify', {
        email: storedEmail,
        otp: verificationCode,
      });

      successToast('Your account has been verified successfully!');
      localStorage.removeItem('pendingVerificationEmail');
      setSignupSuccess(false);
      setStoredEmail('');
      setVerificationCode('');
    } catch (error) {
      errorToast('Invalid verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!storedEmail) return;

    try {
      await apiInstance.post('/user/resend-verification', {
        email: storedEmail,
      });
      successToast('Verification code has been resent to your email.');
    } catch (error) {
      errorToast('Failed to resend verification code. Please try again.');
    }
  };

  if (signupSuccess) {
    return (
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center items-center mb-4">
            <MailCheck className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline">
            Verify Your Email
          </CardTitle>
          <CardDescription>
            We've sent a verification code to {storedEmail}. Please enter it
            below.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-4">
            <Input
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              disabled={isVerifying}
            />
            <Button
              onClick={handleVerification}
              className="w-full"
              disabled={!verificationCode || isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Verify Account'}
            </Button>
            <div className="text-center text-sm">
              <button
                onClick={handleResendCode}
                className="text-primary hover:underline"
                disabled={isVerifying}
              >
                Didn't receive a code? Resend
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p>
            Want to use a different email?{' '}
            <button
              onClick={() => {
                localStorage.removeItem('pendingVerificationEmail');
                setSignupSuccess(false);
                setStoredEmail('');
              }}
              className="font-medium text-primary hover:underline"
            >
              Sign up again
            </button>
          </p>
        </CardFooter>
      </Card>
    );
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
          Join CareerPilot and supercharge your job search.
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

            {/* 2. Add the new form field for the referral code */}
            <FormField
              control={form.control}
              name="referredBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referral Code (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter code here"
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

      <GoogleSignInButton form={form} />

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
};

export default SignupForm;
