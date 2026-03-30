// /** @format */

// 'use client';

// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';
// import { useDispatch } from 'react-redux';

// // ICONS
// import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

// // YOUR UTILS AND SERVICES (ensure paths are correct)
// import { useToast } from '@/hooks/use-toast';
// import apiInstance from '@/services/api';
// import { successToast, errorToast } from '@/utils/toasts';
// import { loginRequest } from '@/redux/reducers/authReducer';
// import { GoogleSignInButton, LinkedInSignInButton } from './GoogleSingupButton';

// // SHADCN/UI COMPONENTS (ensure paths are correct)
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form';
// import { useSelector } from 'react-redux';
// import { RootState } from '@/redux/rootReducer';
// import Image from 'next/image';
// import NProgress from 'nprogress';
// import { getToken } from '@/hooks/useToken';
// // --- ZOD SCHEMAS (Unchanged) ---
// const loginFormSchema = z.object({
//   email: z.string().email({ message: 'Please enter a valid email.' }),
//   password: z.string().min(1, { message: 'Password is required.' }),
// });

// const forgotPasswordSchema = z.object({
//   email: z.string().email({ message: 'Please enter a valid email.' }),
// });

// type LoginFormValues = z.infer<typeof loginFormSchema>;
// type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

// const LoginForm = () => {
//   // --- All State Management and Logic Hooks Remain Unchanged ---
//   const [showPassword, setShowPassword] = useState(false);
//   const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
//   const [focusedField, setFocusedField] = useState('');
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

//   const { toast } = useToast();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const dispatch = useDispatch();

//   const [isForgotPasswordSubmitting, setIsForgotPasswordSubmitting] =
//     useState(false);

//   const loginForm = useForm<LoginFormValues>({
//     resolver: zodResolver(loginFormSchema),
//     defaultValues: { email: '', password: '' },
//   });

//   const forgotPasswordForm = useForm<ForgotPasswordValues>({
//     resolver: zodResolver(forgotPasswordSchema),
//     defaultValues: { email: '' },
//   });

//   const { token, user, error, isLoading } = useSelector(
//     (state: RootState) => state.auth,
//   );

//   useEffect(() => {
//     if (!isLoading) {
//       NProgress.done();
//     }
//   }, [isLoading]);

//   // async function onSubmit(data: LoginFormValues) {
//   //   NProgress.start();

//   //   const deviceInfo = {
//   //     device: navigator.platform,
//   //     browser: navigator.userAgent,
//   //     timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//   //   };

//   //   try {
//   //     dispatch(
//   //       loginRequest({
//   //         email: data.email,
//   //         password: data.password,
//   //         deviceInfo,
//   //       }),
//   //     );
//   //     // if (token && user) {
//   //     //   toast({
//   //     //     title: 'Login Success',
//   //     //     variant: 'success',
//   //     //   });
//   //     // }
//   //   } catch (error) {
//   //     console.error('Login error:', error);

//   //     NProgress.done();

//   //     toast({
//   //       title: 'Login Failed',
//   //       description: 'Invalid email or password. Please try again.',
//   //       variant: 'destructive',
//   //     });
//   //   } finally {
//   //     NProgress.done();
//   //   }
//   // }

//   // --- MAIN LOGIN HANDLER ---

//   const [isSubmitting, setIsSubmitting] = useState(false);
//   async function onSubmit(data: LoginFormValues) {
//     setIsSubmitting(true);
//     NProgress.start();

//     const deviceInfo = {
//       device: navigator.platform,
//       browser: navigator.userAgent,
//       timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//     };

//     dispatch(
//       loginRequest({
//         email: data.email,
//         password: data.password,
//         deviceInfo,
//       }),
//     );
//   }

//   useEffect(() => {
//     if (isSubmitting && error && !isLoading) {
//       NProgress.done();
//       toast({
//         title: 'Login Failed',
//         description: error.message || 'Invalid email or password.',
//         variant: 'destructive',
//       });

//       setIsSubmitting(false);
//     }
//   }, [error, isSubmitting, isLoading, toast]);

//   useEffect(() => {
//     if (token && user && isSubmitting) {
//       NProgress.done();
//       router.push('/dashboard');
//       toast({ title: 'Login Success', variant: 'success' });
//       setIsSubmitting(false);
//     }
//   }, [token, user, router, isSubmitting, toast]);

//   async function onForgotPasswordSubmit(data: ForgotPasswordValues) {
//     setIsForgotPasswordSubmitting(true);
//     try {
//       await apiInstance.post('/user/forgot-password', data);
//       toast({
//         title: 'Password reset email sent',
//         description:
//           'Check your email for instructions to reset your password.',
//       });
//       setForgotPasswordOpen(false);
//       forgotPasswordForm.reset();
//     } catch (error) {
//       console.error('Forgot password error:', error);
//       toast({
//         title: 'Error',
//         description: 'Failed to send password reset email. Please try again.',
//         variant: 'destructive',
//       });
//     } finally {
//       setIsForgotPasswordSubmitting(false);
//     }
//   }

//   useEffect(() => {
//     if (searchParams.get('token') == 'failed') {
//       toast({
//         title: 'Login Failed',
//         description: 'Invalid email or password. Please try again.',
//         variant: 'destructive',
//       });
//     }
//   }, []);

//   useEffect(() => {
//     const handleMouseMove = (e) =>
//       setMousePosition({ x: e.clientX, y: e.clientY });
//     window.addEventListener('mousemove', handleMouseMove);
//     return () => window.removeEventListener('mousemove', handleMouseMove);
//   }, []);

//   return (
//     <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-4 md:p-5 pt-6 pb-6 overflow-y-auto bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
//       <div className="relative z-10 w-full max-w-xs sm:max-w-2xl ">
//         <div
//           className="bg-white/80 backdrop-blur-xl border border-gray-200/80 rounded-lg
//           p-5 sm:p-6 md:p-6 transition-all duration-500"
//         >
//           {/* HEADER */}
//           <div className="text-center mb-2 sm:mb-4">
//             <div className="relative inline-block mb-1 sm:mb-2">
// <div className="w-10 h-10 sm:w-12 sm:h-12  rounded-lg flex items-center justify-center">
//   <Image
//     src="logo.png"
//     alt="Zobsai logo"
//     width={100}
//     height={100}
//   />
// </div>
//             </div>

//             <h1
//               className="text-lg sm:text-2xl font-bold text-gray-900
//              bg-headingTextPrimary bg-clip-text text-transparent"
//             >
//               Welcome Back!
//             </h1>

//             <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
//               Enter your credentials to access your account
//             </p>
//           </div>

//           <div className="flex flex-col sm:flex-row gap-4 justify-between">
//             <div className="w-full sm:w-1/2">
//               {/* LOGIN FORM */}
//               <Form {...loginForm}>
//                 <form
//                   onSubmit={loginForm.handleSubmit(onSubmit)}
//                   className="space-y-4 sm:space-y-2
// "
//                 >
//                   {/* EMAIL */}
//                   <FormField
//                     control={loginForm.control}
//                     name="email"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-sm font-medium text-gray-700">
//                           Email Address
//                         </FormLabel>
//                         <FormControl>
//                           <div className="relative">
//                             <div
//                               className={`absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center transition-all ${
//                                 focusedField === 'email'
//                                   ? 'text-purple-600'
//                                   : 'text-gray-400'
//                               }`}
//                             >
//                               <Mail className="h-5 w-5" />
//                             </div>

//                             <input
//                               {...field}
//                               onFocus={() => setFocusedField('email')}
//                               onBlur={() => setFocusedField('')}
//                               className="w-full pl-10 text-sm sm:pl-12 pr-3 py-2 bg-white/50 border border-gray-300 rounded-lg
//                           text-gray-900 placeholder-gray-400  transition-all"
//                               placeholder="name@example.com"
//                               disabled={loginForm.formState.isSubmitting}
//                             />
//                           </div>
//                         </FormControl>
//                         <FormMessage className="text-red-500 text-xs" />
//                       </FormItem>
//                     )}
//                   />

//                   {/* PASSWORD */}
//                   <FormField
//                     control={loginForm.control}
//                     name="password"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-sm font-medium text-gray-700">
//                           Password
//                         </FormLabel>
//                         <FormControl>
//                           <div className="relative">
//                             <div
//                               className={`absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center transition-all ${
//                                 focusedField === 'password'
//                                   ? 'text-purple-600'
//                                   : 'text-gray-400'
//                               }`}
//                             >
//                               <Lock className="h-5 w-5" />
//                             </div>

//                             <input
//                               type={showPassword ? 'text' : 'password'}
//                               {...field}
//                               onFocus={() => setFocusedField('password')}
//                               onBlur={() => setFocusedField('')}
//                               className="w-full text-sm pl-10 sm:pl-12 pr-10 py-2 bg-white/50 border border-gray-300 rounded-lg
//                           text-gray-900 placeholder-gray-400  transition-all"
//                               placeholder="••••••••"
//                             />

//                             <button
//                               type="button"
//                               onClick={() => setShowPassword(!showPassword)}
//                               className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-400 hover:text-blue-600"
//                             >
//                               {showPassword ? (
//                                 <EyeOff className="h-5 w-5" />
//                               ) : (
//                                 <Eye className="h-5 w-5" />
//                               )}
//                             </button>
//                           </div>
//                         </FormControl>
//                         <FormMessage className="text-red-500 text-xs" />
//                       </FormItem>
//                     )}
//                   />

//                   {/* FORGOT PASSWORD */}
//                   <div className="flex justify-end">
//                     <button
//                       type="button"
//                       onClick={() => setForgotPasswordOpen(true)}
//                       className="text-xs sm:text-xs text-blue-600 hover:text-blue-500 hover:underline"
//                     >
//                       Forgot password?
//                     </button>
//                   </div>

//                   {/* LOGIN BUTTON */}
//                   <button
//                     type="submit"
//                     disabled={loginForm.formState.isSubmitting}
//                     className="w-full bg-buttonPrimary text-white font-semibold
//                 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-60 hover:scale-[1.02] group-hover:shadow-lg"
//                   >
//                     {loginForm.formState.isSubmitting ? (
//                       <div className="flex items-center justify-center">
//                         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
//                         Logging in...
//                       </div>
//                     ) : (
//                       <div className="flex items-center justify-center">
//                         Login <ArrowRight className="ml-2 h-5 w-5" />
//                       </div>
//                     )}
//                   </button>
//                 </form>
//               </Form>
//             </div>

//             <div className="w-full sm:w-1/2 flex flex-col justify-end gap-3 sm:gap-4 sm:border-l-2 border-gray-200 sm:pl-4 ">
//               {/* DIVIDER */}
//               <div className=" relative my-1 ">
//                 <div className="absolute inset-0 flex items-center">
//                   <div className="w-full border-t border-gray-200" />
//                 </div>
//                 <div className="relative flex justify-center text-xs">
//                   <span className="bg-white/80 px-3 text-gray-500">
//                     Or continue with
//                   </span>
//                 </div>
//               </div>

//               {/* SOCIAL LOGIN */}
//               <div className="flex flex-col gap-3 sm:gap-4">
//                 <GoogleSignInButton form={loginForm} />
//                 <LinkedInSignInButton form={loginForm} />
//               </div>

//               {/* SIGN UP – Enhanced with animation */}
//               <div className=" relative group">
//                 {/* CTA Card */}
//                 <div
//                   className="relative rounded-lg border border-blue-200
//                   hover:border-blue-700

//     px-4 py-3 text-center
//     transition-all duration-300
//     group-hover:scale-[1.02]
//     group-hover:shadow-lg"
//                 >
//                   <p className="text-gray-700 text-xs ">
//                     Don’t have an account?
//                   </p>

//                   <Link
//                     href="/signup"
//                     prefetch={false}
//                     className="mt-1 inline-flex items-center gap-2
//       text-sm font-semibold text-blue-700

//       transition-colors duration-300"
//                   >
//                     <span className="relative">
//                       Create an account
//                       {/* underline animation */}
//                       <span
//                         className="absolute left-0 -bottom-0.5 h-[2px] w-0
//           bg-blue-700
//           transition-all duration-300 group-hover:w-full"
//                       />
//                     </span>

//                     {/* Arrow animation */}
//                     <ArrowRight
//                       className="h-4 w-4 transition-transform duration-300
//         group-hover:translate-x-1"
//                     />
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* FORGOT PASSWORD MODAL */}
//       {forgotPasswordOpen && (
//         <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//           <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 w-full max-w-xs sm:max-w-sm shadow-lg">
//             <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
//               Reset Password
//             </h3>
//             <p className="text-gray-600 text-xs sm:text-sm mb-4">
//               Enter your email address and we'll send you a link.
//             </p>

//             <Form {...forgotPasswordForm}>
//               <form
//                 onSubmit={forgotPasswordForm.handleSubmit(
//                   onForgotPasswordSubmit,
//                 )}
//               >
//                 <FormField
//                   control={forgotPasswordForm.control}
//                   name="email"
//                   render={({ field }) => (
//                     <FormItem className="mb-4">
//                       <FormControl>
//                         <input
//                           {...field}
//                           placeholder="Enter your email"
//                           className="w-full px-3 py-2 sm:py-3 bg-white/50 border border-gray-300 rounded-xl"
//                           disabled={isForgotPasswordSubmitting}
//                         />
//                       </FormControl>
//                       <FormMessage className="text-red-500 text-xs" />
//                     </FormItem>
//                   )}
//                 />

//                 <div className="flex gap-2 sm:gap-3">
//                   <button
//                     type="button"
//                     onClick={() => setForgotPasswordOpen(false)}
//                     className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
//                   >
//                     Cancel
//                   </button>

//                   <button
//                     type="submit"
//                     disabled={isForgotPasswordSubmitting}
//                     className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
//                   >
//                     {isForgotPasswordSubmitting ? 'Sending...' : 'Send Link'}
//                   </button>
//                 </div>
//               </form>
//             </Form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LoginForm;

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch, useSelector } from 'react-redux';

// ICONS
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

// YOUR UTILS AND SERVICES
import { useToast } from '@/hooks/use-toast';
import apiInstance from '@/services/api';
import { loginRequest } from '@/redux/reducers/authReducer';
import { GoogleSignInButton, LinkedInSignInButton } from './GoogleSingupButton';
import { RootState } from '@/redux/rootReducer';
import Image from 'next/image';
import NProgress from 'nprogress';
import { getToken } from '@/hooks/useToken';

// SHADCN/UI COMPONENTS
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// --- ZOD SCHEMAS ---
const loginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;
type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const [isForgotPasswordSubmitting, setIsForgotPasswordSubmitting] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  });

  const forgotPasswordForm = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const { token, user, error, isLoading } = useSelector(
    (state: RootState) => state.auth,
  );

  useEffect(() => {
    if (!isLoading) {
      NProgress.done();
    }
  }, [isLoading]);

  // --- MAIN LOGIN HANDLER ---
  async function onSubmit(data: LoginFormValues) {
    setIsSubmitting(true);
    NProgress.start();

    const deviceInfo = {
      device: navigator.platform,
      browser: navigator.userAgent,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    dispatch(
      loginRequest({
        email: data.email,
        password: data.password,
        deviceInfo,
      }),
    );
  }

  useEffect(() => {
    if (isSubmitting && error && !isLoading) {
      NProgress.done();
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid email or password.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  }, [error, isSubmitting, isLoading, toast]);

  useEffect(() => {
    if (token && user && isSubmitting) {
      NProgress.done();
      router.push('/dashboard');
      toast({ title: 'Login Success', variant: 'success' });
      setIsSubmitting(false);
    }
  }, [token, user, router, isSubmitting, toast]);

  async function onForgotPasswordSubmit(data: ForgotPasswordValues) {
    setIsForgotPasswordSubmitting(true);
    try {
      await apiInstance.post('/user/forgot-password', data);
      toast({
        title: 'Password reset email sent',
        description:
          'Check your email for instructions to reset your password.',
      });
      setForgotPasswordOpen(false);
      forgotPasswordForm.reset();
    } catch (error) {
      console.error('Forgot password error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send password reset email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsForgotPasswordSubmitting(false);
    }
  }

  useEffect(() => {
    if (searchParams.get('token') == 'failed') {
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password. Please try again.',
        variant: 'destructive',
      });
    }
  }, [searchParams, toast]);

  return (
    <div className="flex min-h-screen bg-white font-inter">
      {/* LEFT COLUMN - HERO IMAGE */}
      <div
        className="relative hidden lg:flex w-1/2 bg-cover bg-center"
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
              UNLOCK YOUR CAREER POTENTIAL WITH AI.
            </h1>
            <p className="text-xl font-light leading-relaxed text-blue-100">
              Your personalized platform for optimized job search and resumes.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN - LOGIN FORM */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-white p-8 sm:p-12 lg:p-20 ">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4">
          {/* Mobile Logo */}

          <div
            onClick={() => router.push('/')}
            className="mb-8 flex items-center  lg:hidden cursor-pointer"
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

          <h2 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">
            Welcome back!
          </h2>
          <p className="mb-10 text-2xl tracking-tight text-slate-900">
            Please sign in.
          </p>

          <Form {...loginForm}>
            <form
              onSubmit={loginForm.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* EMAIL FIELD */}
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className=" block text-sm font-medium text-slate-700">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        type="email"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder-slate-400 transition-all duration-200 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                        placeholder="name@example.com"
                        disabled={loginForm.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />

              {/* PASSWORD FIELD */}
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-2 flex items-center justify-between">
                      <FormLabel className="block text-sm font-medium text-slate-700">
                        Password
                      </FormLabel>
                      <button
                        type="button"
                        onClick={() => setForgotPasswordOpen(true)}
                        className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3.5 pr-12 text-slate-900 placeholder-slate-400 transition-all duration-200 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                          placeholder="••••••••"
                          disabled={loginForm.formState.isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-blue-600"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loginForm.formState.isSubmitting}
                className="mt-4 flex w-full items-center justify-center rounded-lg bg-blue-600 py-3.5 font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md disabled:opacity-70"
              >
                {loginForm.formState.isSubmitting ? (
                  <>
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    Logging in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </Form>

          {/* DIVIDER */}
          <div className="relative mb-8 mt-8">
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
            <GoogleSignInButton form={loginForm} />
            <LinkedInSignInButton form={loginForm} />
          </div>

          {/* SIGN UP LINK */}
          <p className="mt-12 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-xl font-bold tracking-tight text-slate-900">
              Reset Password
            </h3>
            <p className="mb-6 text-sm text-slate-500">
              Enter your email address and we'll send you a link.
            </p>

            <Form {...forgotPasswordForm}>
              <form
                onSubmit={forgotPasswordForm.handleSubmit(
                  onForgotPasswordSubmit,
                )}
              >
                <FormField
                  control={forgotPasswordForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormControl>
                        <input
                          {...field}
                          placeholder="name@example.com"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                          disabled={isForgotPasswordSubmitting}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="flex-1 rounded-xl bg-slate-100 px-4 py-2.5 font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isForgotPasswordSubmitting}
                    className="flex flex-1 items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-70"
                  >
                    {isForgotPasswordSubmitting ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    ) : (
                      'Send Link'
                    )}
                  </button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
