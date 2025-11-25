/** @format */

'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Cookies from 'js-cookie';

// ICONS
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
  Eye, // Added
  EyeOff, // Added
} from 'lucide-react';

// UTILS AND SERVICES
import apiInstance from '@/services/api';
import { errorToast, successToast } from '@/utils/toasts';

// UI COMPONENTS
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { GoogleSignInButton, LinkedInSignInButton } from './GoogleSingupButton';
import Image from 'next/image';

// Zod Schema
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
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [storedEmail, setStoredEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRefCodeFromUrl, setIsRefCodeFromUrl] = useState(false);
  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      organizationName: '',
      referredBy: '',
    },
  });

  const accountType = useWatch({
    control: form.control,
    name: 'accountType',
  });

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      form.setValue('referredBy', refCode);
      setIsRefCodeFromUrl(true);
    }
  }, [searchParams, form]);

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
      const response = await apiInstance.post('/user/signup', data);
      successToast(
        'Account created! Please check your email for a verification code.',
      );
      localStorage.setItem('pendingVerificationEmail', data.email);
      setStoredEmail(data.email);
      setSignupSuccess(true);
    } catch (error) {
      console.error('Error creating user:', error.response.data.message);
      errorToast(
        error.response.data.message || 'Signup failed. Please try again.',
      );
    }
  }

  const handleVerification = async () => {
    if (!verificationCode || !storedEmail) return;
    setIsVerifying(true);
    try {
      const response = await apiInstance.post('/user/verify', {
        email: storedEmail,
        otp: verificationCode,
      });

      if (response.status === 200) {
        localStorage.removeItem('pendingVerificationEmail');
        localStorage.setItem('accessToken', response.data.accessToken);
        setSignupSuccess(false);
        setStoredEmail('');
        setVerificationCode('');
        successToast('Your account has been verified successfully!');
        router.push('/dashboard/onboarding-tour');
      } else {
        router.push('/login');
      }
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

  return (
    // <div className=" w-full bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center py-16 md:py-24 px-4 sm:px-6 md:px-8 relative overflow-hidden">
    <div className="min-h-screen w-full mt-2 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center px-4 sm:px-6 md:px-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full filter blur-3xl opacity-40 animate-pulse hidden sm:block"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full filter blur-3xl opacity-50 animate-pulse hidden sm:block"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>
      <div className="relative z-10 w-full max-w-lg ">
        {signupSuccess ? (
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200/80 rounded-3xl p-8 sm:p-12 ">
            <div className="text-center mb-10">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl mx-auto flex items-center justify-center ">
                  <MailCheck className="h-10 w-10 text-white" />
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Verify Your Email
              </h1>
              <p className="text-gray-500 text-base leading-relaxed">
                We've sent a verification code to{' '}
                <span className="font-medium text-gray-700">{storedEmail}</span>
                .
              </p>
            </div>

            <div className="grid gap-6">
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
                    className="w-full pl-12 pr-4 h-14 text-base bg-white/50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
                  />
                </div>
                <Button
                  onClick={handleVerification}
                  disabled={!verificationCode || isVerifying}
                  className="w-full group bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 text-lg rounded-xl transition-all duration-300 "
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

            <div className="mt-10 text-center text-sm">
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
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200/80 rounded-3xl p-4 sm:p-6 ">
            <div className="text-center mb-5">
              <div className="relative inline-block mb-3">
                <div className="w-16 h-16  rounded-lg flex items-center justify-center ">
                  <Image
                    src="logo.png"
                    alt="zobsai logo"
                    width={100}
                    height={100}
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-yellow-800" />
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Create an Account
              </h1>
              <p className="text-gray-500 text-base">
                Join us and let's get started.
              </p>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-1"
              >
                {/* <FormField
                  control={form.control}
                  name="accountType"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="block text-center text-gray-700 font-medium mb-3">
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
                              className="flex flex-row items-center gap-2 rounded-xl border-2 border-gray-200 bg-white/50 p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:text-purple-700 [&:has([data-state=checked])]:border-purple-600 cursor-pointer transition-all duration-300"
                            >
                              <UserPlus className="mb-2 h-7 w-7" /> Individual
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
                              className="flex flex-row items-center gap-2 rounded-xl border-2 border-gray-200 bg-white/50 p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:text-purple-700 [&:has([data-state=checked])]:border-purple-600 cursor-pointer transition-all duration-300"
                            >
                              <Building className="mb-2 h-7 w-7" /> Institution
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                /> */}

                {accountType === 'institution' && (
                  <FormField
                    control={form.control}
                    name="organizationName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          Institution Name
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                              <Building className="h-5 w-5" />
                            </div>
                            <Input
                              className="pl-12 w-full h-12 text-sm bg-white/50 border-gray-300 rounded-xl focus:ring-purple-600 transition-all duration-300"
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

                <div className="grid grid-cols-2 gap-4  pt-1">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          Your Full Name
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                              <User className="h-5 w-5" />
                            </div>
                            <Input
                              className="pl-12 w-full h-12 text-sm bg-white/50 border-gray-300 rounded-xl focus:ring-purple-600 transition-all duration-300"
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
                        <FormLabel className="text-gray-700 font-medium">
                          Your Email Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                              <Mail className="h-5 w-5" />
                            </div>
                            <Input
                              className="pl-12 w-full h-12 text-sm bg-white/50 border-gray-300 rounded-xl focus:ring-purple-600 transition-all duration-300"
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
                        <FormLabel className="text-gray-700 font-medium">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                              <Lock className="h-5 w-5" />
                            </div>
                            <Input
                              className="pl-12 pr-12 w-full h-12 text-sm bg-white/50 border-gray-300 rounded-xl focus:ring-purple-600 transition-all duration-300"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              {...field}
                              disabled={form.formState.isSubmitting}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
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
                        <FormLabel className="text-gray-700 font-medium">
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                              <Lock className="h-5 w-5" />
                            </div>
                            <Input
                              className="pl-12 pr-12 w-full h-12 text-sm bg-white/50 border-gray-300 rounded-xl focus:ring-purple-600 transition-all duration-300"
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              {...field}
                              disabled={form.formState.isSubmitting}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
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
                        <FormLabel className="text-gray-700 font-medium">
                          Referral Code (Optional)
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                              <FileText className="h-5 w-5" />
                            </div>
                            <Input
                              className="pl-12 w-full h-12 text-sm bg-white/50 border-gray-300 rounded-xl focus:ring-purple-600 transition-all duration-300"
                              placeholder="Enter code here"
                              {...field}
                              disabled={
                                form.formState.isSubmitting || isRefCodeFromUrl
                              }
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full mt-5 group bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-6 px-6 text-lg rounded-xl transition-all duration-300 "
                >
                  {form.formState.isSubmitting ? (
                    'Creating Account...'
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-5 w-5" /> Sign Up
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/80 px-4 text-gray-500 rounded-full backdrop-blur-sm">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <GoogleSignInButton form={form} />
              <LinkedInSignInButton form={form} />
            </div>

            <div className="mt-5 text-center text-sm">
              <p className="text-gray-600">
                By signing up, you agree to our{' '}
                <Link
                  href="/terms-of-service"
                  className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy-policy"
                  className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
            <div className=" text-center text-sm">
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
