/** @format */

'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Cookies from 'js-cookie';

// ICONS (Added new icons for consistency)
import {
  Building,
  MailCheck,
  Rocket,
  UserPlus,
  User,
  Mail,
  Lock,
  Sparkles,
  KeyRound,
  FileText,
} from 'lucide-react';

// YOUR UTILS AND SERVICES (ensure paths are correct)
import apiInstance from '@/services/api';
import { errorToast, successToast } from '@/utils/toasts';

// UI COMPONENTS (ensure paths are correct)
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Button } from '../ui/button'; // Button is used for its base, but styled with classNames
import { Input } from '../ui/input'; // Input is used for its base, but styled with classNames

// --- Zod Schema (Unchanged) ---
const signupFormSchema = z
  .object({
    accountType: z.enum(['individual', 'institution'], {
      required_error: 'You need to select an account type.',
    }),
    fullName: z
      .string()
      .min(2, { message: 'Full name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters.' }),
    confirmPassword: z.string().min(1, { message: 'Passwords do not match.' }),
    organizationName: z.string().optional(),
    referredBy: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

type SignupFormValues = z.infer<typeof signupFormSchema>;

const SignupForm = () => {
  // --- All State and Logic Hooks Remain Unchanged ---
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [storedEmail, setStoredEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const router = useRouter();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      accountType: 'individual',
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      organizationName: '',
      referredBy: '',
    },
  });

  const accountType = useWatch({
    control: form.control,
    name: 'accountType',
  });

  // --- All Event Handlers and Effects Remain Unchanged ---
  useEffect(() => {
    const pendingEmail = localStorage.getItem('pendingVerificationEmail');
    if (pendingEmail) {
      setStoredEmail(pendingEmail);
      setSignupSuccess(true);
    }
    const token = Cookies.get('accessToken');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  async function onSubmit(data: SignupFormValues) {
    try {
      await apiInstance.post('/user/signup', data);
      successToast(
        'Account created! Please check your email for a verification code.',
      );
      localStorage.setItem('pendingVerificationEmail', data.email);
      setStoredEmail(data.email);
      setSignupSuccess(true);
    } catch (error) {
      console.error('Error creating user:', error);
      errorToast(
        'An error occurred while creating your account. Please try again.',
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
      router.push('/login'); // Redirect to login after successful verification
    } catch (error) {
      errorToast('Invalid verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!storedEmail) return;
    try {
      await apiInstance.post('/user/resend-otp', { email: storedEmail });
      successToast('Verification code has been resent to your email.');
    } catch (error) {
      errorToast('Failed to resend verification code. Please try again.');
    }
  };

  // --- THEME APPLIED: Main wrapper, background, and animated blobs ---
  return (
    <div className="mt-16 w-full bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full filter blur-3xl opacity-40 animate-pulse hidden sm:block"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full filter blur-3xl opacity-50 animate-pulse hidden sm:block"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {signupSuccess ? (
          // --- THEME APPLIED: Verification Card ---
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="relative inline-block mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                  <MailCheck className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Verify Your Email
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed">
                We've sent a verification code to{' '}
                <span className="font-medium text-gray-700">{storedEmail}</span>
                .
              </p>
            </div>

            <div className="grid gap-4">
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <Input
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    disabled={isVerifying}
                    className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <Button
                  onClick={handleVerification}
                  disabled={!verificationCode || isVerifying}
                  className="w-full group bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-200"
                >
                  {isVerifying ? 'Verifying...' : 'Verify Account'}
                </Button>
                <div className="text-center text-sm">
                  <button
                    onClick={handleResendCode}
                    className="text-blue-600 hover:text-blue-500 font-medium hover:underline"
                    disabled={isVerifying}
                  >
                    Didn't receive a code? Resend
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center text-sm">
              <p className="text-gray-600">
                Wrong email?{' '}
                <button
                  onClick={() => {
                    localStorage.removeItem('pendingVerificationEmail');
                    setSignupSuccess(false);
                    setStoredEmail('');
                  }}
                  className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
                >
                  Sign up again
                </button>
              </p>
            </div>
          </div>
        ) : (
          // --- THEME APPLIED: Main Signup Card ---
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="relative inline-block mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                  <Sparkles className="h-3 w-3 text-yellow-800" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Create an Account
              </h1>
              <p className="text-gray-500 text-sm">
                Join us and let's get started.
              </p>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* --- THEME APPLIED: Radio Group --- */}
                <FormField
                  control={form.control}
                  name="accountType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-gray-700">
                        I am signing up as...
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          <FormItem>
                            <FormControl>
                              <RadioGroupItem
                                value="individual"
                                id="r1"
                                className="peer sr-only"
                              />
                            </FormControl>
                            <FormLabel
                              htmlFor="r1"
                              className="flex flex-col items-center justify-between rounded-xl border-2 border-gray-200 bg-white/50 p-4 text-gray-600 hover:bg-gray-50 hover:text-gray-900 peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:text-purple-700 [&:has([data-state=checked])]:border-purple-600 cursor-pointer"
                            >
                              <UserPlus className="mb-2 h-6 w-6" /> Individual
                            </FormLabel>
                          </FormItem>
                          <FormItem>
                            <FormControl>
                              <RadioGroupItem
                                value="institution"
                                id="r2"
                                className="peer sr-only"
                              />
                            </FormControl>
                            <FormLabel
                              htmlFor="r2"
                              className="flex flex-col items-center justify-between rounded-xl border-2 border-gray-200 bg-white/50 p-4 text-gray-600 hover:bg-gray-50 hover:text-gray-900 peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:text-purple-700 [&:has([data-state=checked])]:border-purple-600 cursor-pointer"
                            >
                              <Building className="mb-2 h-6 w-6" /> Institution
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />

                {/* --- THEME APPLIED: All Form Fields with Icons --- */}
                {accountType === 'institution' && (
                  <FormField
                    control={form.control}
                    name="organizationName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Institution Name
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                              <Building className="h-5 w-5" />
                            </div>
                            <Input
                              className="pl-12 w-full bg-white/50 border-gray-300 rounded-xl focus:ring-purple-600"
                              placeholder="e.g., State University"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">
                        Your Full Name
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                            <User className="h-5 w-5" />
                          </div>
                          <Input
                            className="pl-12 w-full bg-white/50 border-gray-300 rounded-xl focus:ring-purple-600"
                            placeholder="John Doe"
                            {...field}
                            disabled={form.formState.isSubmitting}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">
                        Your Email Address
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                            <Mail className="h-5 w-5" />
                          </div>
                          <Input
                            className="pl-12 w-full bg-white/50 border-gray-300 rounded-xl focus:ring-purple-600"
                            placeholder="name@example.com"
                            {...field}
                            disabled={form.formState.isSubmitting}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                            <Lock className="h-5 w-5" />
                          </div>
                          <Input
                            className="pl-12 w-full bg-white/50 border-gray-300 rounded-xl focus:ring-purple-600"
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            disabled={form.formState.isSubmitting}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                            <Lock className="h-5 w-5" />
                          </div>
                          <Input
                            className="pl-12 w-full bg-white/50 border-gray-300 rounded-xl focus:ring-purple-600"
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            disabled={form.formState.isSubmitting}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="referredBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">
                        Referral Code (Optional)
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                            <FileText className="h-5 w-5" />
                          </div>
                          <Input
                            className="pl-12 w-full bg-white/50 border-gray-300 rounded-xl focus:ring-purple-600"
                            placeholder="Enter code here"
                            {...field}
                            disabled={form.formState.isSubmitting}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full group bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-200"
                >
                  {form.formState.isSubmitting ? (
                    'Creating Account...'
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                    </>
                  )}
                </Button>
              </form>
            </Form>
            <div className="mt-8 text-center text-sm">
              <p className="text-gray-600">
                Already have an account?&nbsp;
                <Link
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupForm;
