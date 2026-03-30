// /** @format */

// 'use client';

// import Link from 'next/link';
// import React, { useEffect, useState } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { useForm, useWatch } from 'react-hook-form';
// import { z } from 'zod';
// import { zodResolver } from '@hookform/resolvers/zod';
// import Cookies from 'js-cookie';

// // ICONS
// import {
//   Building,
//   MailCheck,
//   Rocket,
//   UserPlus,
//   User,
//   Mail,
//   Lock,
//   Sparkles,
//   KeyRound,
//   FileText,
//   Eye,
//   EyeOff,
// } from 'lucide-react';

// // UTILS AND SERVICES
// import apiInstance from '@/services/api';
// import { errorToast, successToast } from '@/utils/toasts';

// // UI COMPONENTS
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '../ui/form';
// import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
// import { Button } from '../ui/button';
// import { Input } from '../ui/input';
// import { GoogleSignInButton, LinkedInSignInButton } from './GoogleSingupButton';
// import Image from 'next/image';
// import { verifyEmailRequest } from '@/redux/reducers/authReducer';
// import { useDispatch } from 'react-redux';
// import { useSelector } from 'react-redux';
// import { RootState } from '@/redux/rootReducer';
// import { getToken } from '@/hooks/useToken';

// // Zod Schema
// const signupFormSchema = z
//   .object({
//     accountType: z.enum(['individual', 'institution'], {
//       required_error: 'You need to select an account type.',
//     }),
//     fullName: z
//       .string()
//       .min(1, { message: 'Full name is required' })
//       .min(2, { message: 'Full name must be at least 2 characters.' })
//       .max(50, { message: 'Full name cannot exceed 50 characters' }),
//     email: z
//       .string()
//       .min(1, { message: 'Email is required' })
//       .email({ message: 'Invalid email address.' }),
//     password: z
//       .string()
//       .min(1, { message: 'Password is required' })
//       .min(8, { message: 'Password must be at least 8 characters.' })
//       .refine(
//         (password) => {
//           const hasUppercase = /[A-Z]/.test(password);
//           const hasLowercase = /[a-z]/.test(password);
//           const hasNumber = /[0-9]/.test(password);
//           const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
//             password,
//           );
//           return hasUppercase && hasLowercase && hasNumber && hasSpecial;
//         },
//         {
//           message:
//             'Password must include uppercase, lowercase, number and special character',
//         },
//       ),
//     confirmPassword: z
//       .string()
//       .min(1, { message: 'Please confirm your password' }),
//     organizationName: z.string().optional(),
//     referredBy: z.string().optional(),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: 'Passwords do not match.',
//     path: ['confirmPassword'],
//   });

// type SignupFormValues = z.infer<typeof signupFormSchema>;

// const SignupForm = () => {
//   const [signupSuccess, setSignupSuccess] = useState(false);
//   const [verificationCode, setVerificationCode] = useState('');
//   const [storedEmail, setStoredEmail] = useState('');
//   // We can use Redux loading state, but keeping local if specific UI needs it
//   const [isRefCodeFromUrl, setIsRefCodeFromUrl] = useState(false);
//   // State for password visibility
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [focusedField, setFocusedField] = useState('');
//   const [isVerifying, setIsVerifying] = useState(false);
//   const dispatch = useDispatch();

//   // Added isAuthenticated to selector
//   const { user, loading, error, isAuthenticated } = useSelector(
//     (state: RootState) => state.auth,
//   );

//   const loadSavedFormData = () => {
//     if (typeof window !== 'undefined') {
//       const savedData = sessionStorage.getItem('signupFormDraft'); // sessionStorage
//       if (savedData) {
//         try {
//           return JSON.parse(savedData);
//         } catch (e) {
//           return {};
//         }
//       }
//     }
//     return {};
//   };

//   const savedData = loadSavedFormData(); // ⭐ IMPORTANT: Call the function

//   const form = useForm<SignupFormValues>({
//     resolver: zodResolver(signupFormSchema),
//     defaultValues: {
//       accountType: savedData.accountType || 'individual',
//       fullName: savedData.fullName || '',
//       email: savedData.email || '',
//       password: '', // Always empty for security
//       confirmPassword: '', // Always empty for security
//       organizationName: savedData.organizationName || '',
//       referredBy: savedData.referredBy || '',
//     },
//   });

//   const accountType = useWatch({
//     control: form.control,
//     name: 'accountType',
//   });

//   // Save to sessionStorage
//   useEffect(() => {
//     const subscription = form.watch((value, { name }) => {
//       if (name && !['password', 'confirmPassword'].includes(name)) {
//         const currentValues = form.getValues();
//         const dataToSave = {
//           accountType: currentValues.accountType,
//           fullName: currentValues.fullName,
//           email: currentValues.email,
//           organizationName: currentValues.organizationName,
//           referredBy: currentValues.referredBy,
//         };
//         sessionStorage.setItem('signupFormDraft', JSON.stringify(dataToSave)); // sessionStorage
//       }
//     });

//     return () => subscription.unsubscribe();
//   }, [form]);

//   useEffect(() => {
//     const refCode = searchParams.get('ref');
//     if (refCode) {
//       form.setValue('referredBy', refCode);
//       setIsRefCodeFromUrl(true);
//     }
//   }, [searchParams, form]);

//   useEffect(() => {
//     const pendingEmail = localStorage.getItem('pendingVerificationEmail');
//     if (pendingEmail) {
//       setStoredEmail(pendingEmail);
//       setSignupSuccess(true);
//     }
//     const token = getToken();
//     // If user is already logged in via cookie, redirect
//     if (token) {
//       router.push('/dashboard');
//     }
//   }, [router]);

//   // NEW: Effect to handle successful verification redirect
//   useEffect(() => {
//     // Only proceed if the user is actively attempting verification
//     if (isVerifying) {
//       if (isAuthenticated && !loading) {
//         // Clean up local storage
//         localStorage.removeItem('pendingVerificationEmail');

//         // Only show toast and redirect if we are in the signup flow
//         if (signupSuccess) {
//           successToast('Your account has been verified successfully!');
//           router.push('/dashboard/onboarding-tour');
//         }
//       }

//       if (error) {
//         errorToast(error);
//         setIsVerifying(false);
//       }
//     }
//   }, [isAuthenticated, loading, error, router, signupSuccess, isVerifying]);

//   async function onSubmit(data: SignupFormValues) {
//     try {
//       // NOTE: If you move signup to Redux/Saga, replace this with dispatch
//       const response = await apiInstance.post('/user/signup', data);

//       if (response.status === 201) {
//         sessionStorage.removeItem('signupFormDraft'); // sessionStorage
//         successToast(
//           'Account created! Please check your email for a verification code.',
//         );
//         localStorage.setItem('pendingVerificationEmail', data.email);
//         setStoredEmail(data.email);
//         setSignupSuccess(true);
//       }
//     } catch (error: any) {
//       console.error('Error creating user:', error?.response?.data?.message);
//       errorToast(
//         error?.response?.data?.message || 'Signup failed. Please try again.',
//       );
//     }
//   }

//   const handleVerification = () => {
//     if (!verificationCode || !storedEmail) return;

//     setIsVerifying(true);
//     // Dispatch the action. The useEffect above will handle the result.
//     // Mapping 'verificationCode' to 'otp' to match API expectation
//     dispatch(verifyEmailRequest({ storedEmail, verificationCode }));
//   };

//   const handleResendCode = async () => {
//     if (!storedEmail) return;
//     try {
//       await apiInstance.post('/user/resend-otp', { email: storedEmail });
//       successToast('Verification code has been resent to your email.');
//     } catch (error) {
//       errorToast('Failed to resend verification code. Please try again.');
//     }
//   };

//   return (
//     <div
//       className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50
// flex items-center justify-center px-3 sm:px-4 md:px-6 py-2 overflow-y-auto relative"
//     >
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full filter blur-3xl opacity-40 animate-pulse hidden sm:block"></div>
//         <div
//           className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full filter blur-3xl opacity-50 animate-pulse hidden sm:block"
//           style={{ animationDelay: '2s' }}
//         ></div>
//       </div>
//       {/* <div className="relative z-10 w-full max-w-lg "> */}
//       <div className="relative z-10 w-full max-w-sm sm:max-w-md">
//         {signupSuccess ? (
//           <div className="bg-white/80 backdrop-blur-xl border border-gray-200/80 rounded-lg p-5 sm:p-6">
//             <div className="text-center mb-10">
//               <div className="relative inline-block mb-6">
//                 <div className="w-20 h-20 bg-blue-500 rounded-lg mx-auto flex items-center justify-center ">
//                   <MailCheck className="h-10 w-10 text-white" />
//                 </div>
//               </div>
//               <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 bg-headingTextPrimary bg-clip-text text-transparent">
//                 Verify Your Email
//               </h1>
//               <p className="text-gray-500 text-base leading-relaxed">
//                 We've sent a verification code to{' '}
//                 <span className="font-medium text-gray-700">{storedEmail}</span>
//                 .
//               </p>
//             </div>

//             <div className="grid gap-6">
//               <div className="space-y-4">
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
//                     <KeyRound className="h-5 w-5" />
//                   </div>
//                   <Input
//                     placeholder="Enter verification code"
//                     value={verificationCode}
//                     onChange={(e) => setVerificationCode(e.target.value)}
//                     disabled={loading}
//                     className="w-full pl-12 pr-4 h-14 text-base bg-white/50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
//                   />
//                 </div>
//                 <Button
//                   onClick={handleVerification}
//                   disabled={!verificationCode || loading}
//                   className="w-full group bg-buttonPrimary text-white font-semibold py-4 px-6 text-lg rounded-lg transition-all duration-300 "
//                 >
//                   {loading ? 'Verifying...' : 'Verify Account'}
//                 </Button>
//                 <div className="text-center text-sm">
//                   <button
//                     onClick={handleResendCode}
//                     className="text-blue-600 hover:text-blue-500 font-medium hover:underline"
//                     disabled={loading}
//                   >
//                     Didn't receive a code? Resend
//                   </button>
//                 </div>
//               </div>
//             </div>

//             <div className="mt-10 text-center text-sm">
//               <p className="text-gray-600">
//                 Wrong email?{' '}
//                 <button
//                   onClick={() => {
//                     localStorage.removeItem('pendingVerificationEmail');
//                     setSignupSuccess(false);
//                     setStoredEmail('');
//                     setIsVerifying(false);
//                   }}
//                   className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
//                 >
//                   Sign up again
//                 </button>
//               </p>
//             </div>
//           </div>
//         ) : (
//           <div className="bg-white/80 backdrop-blur-xl border border-gray-200/80 rounded-lg sm:p-4 p-2">
//             <div className="text-center mb-5">
//               <div className="relative inline-block mb-1 sm:mb-2">
//                 <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center">
//                   <Image
//                     src="logo.png"
//                     alt="Zobsai logo"
//                     width={100}
//                     height={100}
//                   />
//                 </div>
//               </div>

//               <h1 className="text-lg sm:text-2xl font-bold text-gray-900 bg-headingTextPrimary bg-clip-text text-transparent">
//                 Create an Account
//               </h1>
//               <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
//                 Join us and let's get started.
//               </p>
//             </div>
//             <Form {...form}>
//               <form
//                 onSubmit={form.handleSubmit(onSubmit)}
//                 className="space-y-0.5"
//               >
//                 {accountType === 'institution' && (
//                   <FormField
//                     control={form.control}
//                     name="organizationName"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-gray-700 font-medium">
//                           Institution Name
//                         </FormLabel>
//                         <FormControl>
//                           <div className="relative">
//                             <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
//                               <Building className="h-5 w-5" />
//                             </div>
//                             <Input
//                               className="pl-12 w-full h-10 text-sm bg-white/50 border-gray-300 rounded-lg focus:ring-purple-600 transition-all duration-300"
//                               placeholder="e.g., State University"
//                               {...field}
//                             />
//                           </div>
//                         </FormControl>
//                         <FormMessage className="text-red-500 text-xs" />
//                       </FormItem>
//                     )}
//                   />
//                 )}

//                 <div className="grid grid-cols-2 gap-2 mb-2">
//                   <div className="col-span-2 space-y-2">
//                     <FormField
//                       control={form.control}
//                       name="fullName"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel className="text-gray-700 font-medium">
//                             Full Name
//                           </FormLabel>
//                           <FormControl>
//                             <div className="relative">
//                               <div
//                                 className={`absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center transition-all ${
//                                   focusedField === 'fullName'
//                                     ? 'text-purple-600'
//                                     : 'text-gray-400'
//                                 }`}
//                               >
//                                 <User className="h-5 w-5" />
//                               </div>
//                               <input
//                                 className="w-full pl-10 text-sm sm:pl-12 pr-3 py-2 bg-white/50 border border-gray-300 rounded-lg
//                           text-gray-900 placeholder-gray-400 transition-all "
//                                 placeholder="John Doe"
//                                 {...field}
//                                 onFocus={() => setFocusedField('fullName')}
//                                 onBlur={() => setFocusedField('')}
//                                 disabled={form.formState.isSubmitting}
//                               />
//                             </div>
//                           </FormControl>
//                           <FormMessage className="text-red-500 text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name="email"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel className="text-gray-700 font-medium">
//                             Email Address
//                           </FormLabel>
//                           <FormControl>
//                             <div className="relative">
//                               <div
//                                 className={`absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center transition-all ${
//                                   focusedField === 'email'
//                                     ? 'text-purple-600'
//                                     : 'text-gray-400'
//                                 }`}
//                               >
//                                 <Mail className="h-5 w-5" />
//                               </div>
//                               <input
//                                 className="w-full pl-10 text-sm sm:pl-12 pr-3 py-2 bg-white/50 border border-gray-300 rounded-lg
//                           text-gray-900 placeholder-gray-400 transition-all"
//                                 placeholder="name@example.com"
//                                 {...field}
//                                 onFocus={() => setFocusedField('email')}
//                                 onBlur={() => setFocusedField('')}
//                                 disabled={form.formState.isSubmitting}
//                               />
//                             </div>
//                           </FormControl>
//                           <FormMessage className="text-red-500 text-xs" />
//                         </FormItem>
//                       )}
//                     />
//                   </div>

//                   <div className="col-span-2 sm:col-span-1">
//                     <FormField
//                       control={form.control}
//                       name="password"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel className="text-gray-700 font-medium">
//                             Password
//                           </FormLabel>
//                           <FormControl>
//                             <div className="relative">
//                               <div
//                                 className={`absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center transition-all ${
//                                   focusedField === 'password'
//                                     ? 'text-purple-600'
//                                     : 'text-gray-400'
//                                 }`}
//                               >
//                                 <Lock className="h-5 w-5" />
//                               </div>
//                               <input
//                                 className="w-full pl-10 text-sm sm:pl-12 pr-3 py-2 bg-white/50 border border-gray-300 rounded-lg
//                           text-gray-900 placeholder-gray-400 transition-all"
//                                 type={showPassword ? 'text' : 'password'}
//                                 placeholder="••••••••"
//                                 {...field}
//                                 onFocus={() => setFocusedField('password')}
//                                 onBlur={() => setFocusedField('')}
//                                 disabled={form.formState.isSubmitting}
//                               />
//                               <button
//                                 type="button"
//                                 onClick={() => setShowPassword(!showPassword)}
//                                 className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
//                               >
//                                 {showPassword ? (
//                                   <EyeOff className="h-5 w-5" />
//                                 ) : (
//                                   <Eye className="h-5 w-5" />
//                                 )}
//                               </button>
//                             </div>
//                           </FormControl>
//                           <FormMessage className="text-red-500 text-xs" />
//                         </FormItem>
//                       )}
//                     />
//                   </div>
//                   <div className="col-span-2 sm:col-span-1">
//                     <FormField
//                       control={form.control}
//                       name="confirmPassword"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel className="text-gray-700 font-medium">
//                             Confirm Password
//                           </FormLabel>
//                           <FormControl>
//                             <div className="relative">
//                               <div
//                                 className={`absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center transition-all ${
//                                   focusedField === 'confirmPassword'
//                                     ? 'text-purple-600'
//                                     : 'text-gray-400'
//                                 }`}
//                               >
//                                 <Lock className="h-5 w-5" />
//                               </div>
//                               <input
//                                 className="w-full pl-10 text-sm sm:pl-12 pr-3 py-2 bg-white/50 border border-gray-300 rounded-lg
//                           text-gray-900 placeholder-gray-400 transition-all"
//                                 type={showConfirmPassword ? 'text' : 'password'}
//                                 placeholder="••••••••"
//                                 {...field}
//                                 onFocus={() =>
//                                   setFocusedField('confirmPassword')
//                                 }
//                                 onBlur={() => setFocusedField('')}
//                                 disabled={form.formState.isSubmitting}
//                               />
//                               <button
//                                 type="button"
//                                 onClick={() =>
//                                   setShowConfirmPassword(!showConfirmPassword)
//                                 }
//                                 className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
//                               >
//                                 {showConfirmPassword ? (
//                                   <EyeOff className="h-5 w-5" />
//                                 ) : (
//                                   <Eye className="h-5 w-5" />
//                                 )}
//                               </button>
//                             </div>
//                           </FormControl>
//                           <FormMessage className="text-red-500 text-xs" />
//                         </FormItem>
//                       )}
//                     />
//                   </div>

//                   <div className="col-span-2">
//                     <FormField
//                       control={form.control}
//                       name="referredBy"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel className="text-gray-700 font-medium">
//                             Referral Code (Optional)
//                           </FormLabel>
//                           <FormControl>
//                             <div className="relative">
//                               <div
//                                 className={`absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center transition-all ${
//                                   focusedField === 'referredBy'
//                                     ? 'text-purple-600'
//                                     : 'text-gray-400'
//                                 }`}
//                               >
//                                 <FileText className="h-5 w-5" />
//                               </div>
//                               <Input
//                                 className="w-full pl-10 text-sm sm:pl-12 pr-3 py-2 bg-white/50 border border-gray-300 rounded-lg
//                           text-gray-900 placeholder-gray-400 transition-all"
//                                 placeholder="Enter code here"
//                                 {...field}
//                                 onFocus={() => setFocusedField('referredBy')}
//                                 onBlur={() => setFocusedField('')}
//                                 disabled={
//                                   form.formState.isSubmitting ||
//                                   isRefCodeFromUrl
//                                 }
//                               />
//                             </div>
//                           </FormControl>
//                           <FormMessage className="text-red-500 text-xs" />
//                         </FormItem>
//                       )}
//                     />
//                   </div>
//                 </div>
//                 <Button
//                   type="submit"
//                   disabled={form.formState.isSubmitting}
//                   className="w-full mt-3 group bg-buttonPrimary text-white font-semibold py-4 px-6 text-lg rounded-lg transition-all duration-300 hover:scale-[1.02] group-hover:shadow-lg"
//                 >
//                   {form.formState.isSubmitting ? (
//                     'Creating Account...'
//                   ) : (
//                     <>
//                       <UserPlus className="mr-2 h-5 w-5" /> Sign Up
//                     </>
//                   )}
//                 </Button>
//               </form>
//             </Form>

//             <div className="relative my-5">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-gray-200" />
//               </div>
//               <div className="relative flex justify-center text-xs ">
//                 <span className="bg-white/80 px-4 text-gray-500 rounded-full backdrop-blur-sm">
//                   Or continue with
//                 </span>
//               </div>
//             </div>

//             <div className="flex flex-col gap-4">
//               <GoogleSignInButton authType="signup" />
//               <LinkedInSignInButton authType="signup" />
//             </div>

//             <div className="mt-5 text-center text-sm">
//               <p className="text-gray-600">
//                 By signing up, you agree to our{' '}
//                 <Link
//                   href="/terms-of-service"
//                   target="_blank"
//                   className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
//                 >
//                   Terms of Service
//                 </Link>{' '}
//                 and{' '}
//                 <Link
//                   href="/privacy-policy"
//                   target="_blank"
//                   className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
//                 >
//                   Privacy Policy
//                 </Link>
//                 .
//               </p>
//             </div>
//             <div className=" text-center text-sm">
//               <p className="text-gray-600">
//                 Already have an account?&nbsp;
//                 <Link
//                   href="/login"
//                   className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
//                 >
//                   Login
//                 </Link>
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SignupForm;

'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Cookies from 'js-cookie';
import Image from 'next/image';

// ICONS
import {
  Building,
  MailCheck,
  UserPlus,
  User,
  Mail,
  Lock,
  KeyRound,
  FileText,
  Eye,
  EyeOff,
  ArrowRight,
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
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { GoogleSignInButton, LinkedInSignInButton } from './GoogleSingupButton';
import { verifyEmailRequest } from '@/redux/reducers/authReducer';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import { getToken } from '@/hooks/useToken';

// Zod Schema
const signupFormSchema = z
  .object({
    accountType: z.enum(['individual', 'institution'], {
      required_error: 'You need to select an account type.',
    }),
    fullName: z
      .string()
      .min(1, { message: 'Full name is required' })
      .min(2, { message: 'Full name must be at least 2 characters.' })
      .max(50, { message: 'Full name cannot exceed 50 characters' }),
    email: z
      .string()
      .min(1, { message: 'Email is required' })
      .email({ message: 'Invalid email address.' }),
    password: z
      .string()
      .min(1, { message: 'Password is required' })
      .min(8, { message: 'Password must be at least 8 characters.' })
      .refine(
        (password) => {
          const hasUppercase = /[A-Z]/.test(password);
          const hasLowercase = /[a-z]/.test(password);
          const hasNumber = /[0-9]/.test(password);
          const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
            password,
          );
          return hasUppercase && hasLowercase && hasNumber && hasSpecial;
        },
        {
          message:
            'Password must include uppercase, lowercase, number and special character',
        },
      ),
    confirmPassword: z
      .string()
      .min(1, { message: 'Please confirm your password' }),
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
  const [isRefCodeFromUrl, setIsRefCodeFromUrl] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const dispatch = useDispatch();

  const { user, loading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  const loadSavedFormData = () => {
    if (typeof window !== 'undefined') {
      const savedData = sessionStorage.getItem('signupFormDraft');
      if (savedData) {
        try {
          return JSON.parse(savedData);
        } catch (e) {
          return {};
        }
      }
    }
    return {};
  };

  const savedData = loadSavedFormData();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      accountType: savedData.accountType || 'individual',
      fullName: savedData.fullName || '',
      email: savedData.email || '',
      password: '',
      confirmPassword: '',
      organizationName: savedData.organizationName || '',
      referredBy: savedData.referredBy || '',
    },
  });

  const accountType = useWatch({
    control: form.control,
    name: 'accountType',
  });

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name && !['password', 'confirmPassword'].includes(name)) {
        const currentValues = form.getValues();
        const dataToSave = {
          accountType: currentValues.accountType,
          fullName: currentValues.fullName,
          email: currentValues.email,
          organizationName: currentValues.organizationName,
          referredBy: currentValues.referredBy,
        };
        sessionStorage.setItem('signupFormDraft', JSON.stringify(dataToSave));
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

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
    const token = getToken();
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  useEffect(() => {
    if (isVerifying) {
      if (isAuthenticated && !loading) {
        localStorage.removeItem('pendingVerificationEmail');
        if (signupSuccess) {
          successToast('Your account has been verified successfully!');
          router.push('/dashboard/onboarding-tour');
        }
      }
      if (error) {
        errorToast(error);
        setIsVerifying(false);
      }
    }
  }, [isAuthenticated, loading, error, router, signupSuccess, isVerifying]);

  async function onSubmit(data: SignupFormValues) {
    try {
      const response = await apiInstance.post('/user/signup', data);
      if (response.status === 201) {
        sessionStorage.removeItem('signupFormDraft');
        successToast(
          'Account created! Please check your email for a verification code.',
        );
        localStorage.setItem('pendingVerificationEmail', data.email);
        setStoredEmail(data.email);
        setSignupSuccess(true);
      }
    } catch (error: any) {
      console.error('Error creating user:', error?.response?.data?.message);
      errorToast(
        error?.response?.data?.message || 'Signup failed. Please try again.',
      );
    }
  }

  const handleVerification = () => {
    if (!verificationCode || !storedEmail) return;
    setIsVerifying(true);
    dispatch(verifyEmailRequest({ storedEmail, verificationCode }));
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
    <div className="flex min-h-screen bg-white font-inter">
      {/* ================= LEFT COLUMN ================= */}
      <div
        className="relative hidden lg:flex lg:w-1/2 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-blue-900/80 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-transparent to-transparent"></div>

        <div className="relative z-10 flex h-full w-full flex-col justify-center p-16">
          <div
            onClick={() => router.push('/')}
            className="h-10  absolute left-16 top-12 flex items-center  bg-white p-2 rounded-lg cursor-pointer"
          >
            <div className="relative w-6 h-6 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Zobsai logo icon"
                width={100}
                height={100}
                className="object-contain"
              />
            </div>

            <span className="text-3xl font-bold tracking-tight  bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text leading-none text-transparent ">
              obsAI
            </span>
          </div>

          <div className="mt-12 max-w-xl">
            <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
              SUPERCHARGE YOUR JOB SEARCH.
            </h1>
            <p className="text-xl font-light leading-relaxed text-blue-100">
              Join thousands of professionals landing their dream roles faster
              with our AI-powered toolkits.
            </p>
          </div>
        </div>
      </div>

      {/* ================= RIGHT COLUMN ================= */}
      <div className="flex w-full lg:w-1/2 items-center justify-center overflow-y-auto bg-white p-8 sm:p-12 lg:p-20">
        <div className="w-full max-w-md py-8">
          {/* Mobile Logo */}
          <div
            onClick={() => router.push('/')}
            className="mb-8 flex items-center lg:hidden cursor-pointer"
          >
            <div className="relative w-7 h-7 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Zobsai logo icon"
                width={38}
                height={38}
                className="object-contain"
              />
            </div>

            <span className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text leading-none text-transparent ">
              obsAI
            </span>
          </div>

          {/* === OTP VERIFICATION STATE === */}
          {signupSuccess ? (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50">
                  <MailCheck className="h-10 w-10 text-blue-600" />
                </div>
                <h2 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">
                  Verify Your Email
                </h2>
                <p className="text-base text-slate-500">
                  We've sent a code to{' '}
                  <span className="font-medium text-slate-800">
                    {storedEmail}
                  </span>
                  .
                </p>
              </div>

              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <Input
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    disabled={loading}
                    className="h-14 w-full rounded-lg border border-slate-200 bg-slate-50 pl-12 pr-4 text-base text-slate-900 placeholder-slate-400 transition-all duration-200 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
                <button
                  onClick={handleVerification}
                  disabled={!verificationCode || loading}
                  className="w-full rounded-lg bg-blue-600 py-3.5 font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md disabled:opacity-70"
                >
                  {loading ? 'Verifying...' : 'Verify Account'}
                </button>
                <div className="text-center text-sm">
                  <button
                    onClick={handleResendCode}
                    className="font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                    disabled={loading}
                  >
                    Didn't receive a code? Resend
                  </button>
                </div>

                <div className="mt-8 text-center text-sm text-slate-500">
                  Wrong email?{' '}
                  <button
                    onClick={() => {
                      localStorage.removeItem('pendingVerificationEmail');
                      setSignupSuccess(false);
                      setStoredEmail('');
                      setIsVerifying(false);
                    }}
                    className="font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                  >
                    Sign up again
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* === SIGNUP FORM STATE === */
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <h2 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">
                Create an Account
              </h2>
              <p className="mb-8 text-base text-slate-500">
                Join us and let's get started.
              </p>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  {/* Institution conditional field */}
                  {accountType === 'institution' && (
                    <FormField
                      control={form.control}
                      name="organizationName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="mb-1.5 block text-sm font-medium text-slate-700">
                            Institution Name
                          </FormLabel>
                          <FormControl>
                            <input
                              {...field}
                              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 transition-all duration-200 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                              placeholder="e.g., State University"
                              disabled={form.formState.isSubmitting}
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* FULL NAME */}
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className=" block text-sm font-medium text-slate-700">
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <input
                            {...field}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 transition-all duration-200 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                            placeholder="John Doe"
                            disabled={form.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />

                  {/* EMAIL */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className=" block text-sm font-medium text-slate-700">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <input
                            {...field}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 transition-all duration-200 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                            placeholder="name@example.com"
                            disabled={form.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />

                  {/* PASSWORD GRID */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className=" block text-sm font-medium text-slate-700">
                            Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <input
                                {...field}
                                type={showPassword ? 'text' : 'password'}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-slate-900 placeholder-slate-400 transition-all duration-200 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                                placeholder="••••••••"
                                disabled={form.formState.isSubmitting}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className=" block text-sm font-medium text-slate-700">
                            Confirm Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <input
                                {...field}
                                type={showConfirmPassword ? 'text' : 'password'}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-slate-900 placeholder-slate-400 transition-all duration-200 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                                placeholder="••••••••"
                                disabled={form.formState.isSubmitting}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* REFERRAL CODE */}
                  <FormField
                    control={form.control}
                    name="referredBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className=" block text-sm font-medium text-slate-700">
                          Referral Code{' '}
                          <span className="font-normal text-slate-400">
                            (Optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <input
                            {...field}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 transition-all duration-200 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                            placeholder="Enter code here"
                            disabled={
                              form.formState.isSubmitting || isRefCodeFromUrl
                            }
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />

                  {/* SUBMIT BUTTON */}
                  <button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="mt-2 flex w-full items-center justify-center rounded-lg bg-blue-600 py-3.5 font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md disabled:opacity-70"
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                        Creating Account...
                      </>
                    ) : (
                      'Sign Up'
                    )}
                  </button>

                  <p className="mt-4 text-center text-xs leading-relaxed text-slate-500">
                    By signing up, you agree to our{' '}
                    <Link
                      href="/terms-of-service"
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy-policy"
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </form>
              </Form>

              {/* DIVIDER */}
              <div className="relative mb-6 mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-slate-500">
                    or continue with
                  </span>
                </div>
              </div>

              {/* SOCIAL LOGIN */}
              <div className="grid grid-cols-2 gap-4">
                <GoogleSignInButton authType="signup" />
                <LinkedInSignInButton authType="signup" />
              </div>

              {/* LOGIN LINK */}
              <p className="mt-8 text-center text-sm text-slate-600">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
