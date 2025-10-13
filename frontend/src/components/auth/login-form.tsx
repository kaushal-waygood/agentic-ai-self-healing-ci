/** @format */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch } from 'react-redux';

// ICONS
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Rocket,
  ArrowRight,
  Sparkles,
  Shield,
} from 'lucide-react';

// YOUR UTILS AND SERVICES (ensure paths are correct)
import { useToast } from '@/hooks/use-toast';
import apiInstance from '@/services/api';
import { successToast, errorToast } from '@/utils/toasts';
import { loginRequest } from '@/redux/reducers/authReducer';
import { GoogleSignInButton } from './GoogleSingupButton';

// SHADCN/UI COMPONENTS (ensure paths are correct)
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import Image from 'next/image';

// --- ZOD SCHEMAS (Unchanged) ---
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
  // --- All State Management and Logic Hooks Remain Unchanged ---
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { toast } = useToast();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector(
    (state: RootState) => state.auth,
  );
  const [isForgotPasswordSubmitting, setIsForgotPasswordSubmitting] =
    useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  });

  const forgotPasswordForm = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(data: LoginFormValues) {
    try {
      dispatch(loginRequest(data));

      if (user) {
        router.push('/dashboard');
        successToast('Login successful! Redirecting to your dashboard...');
      } else {
        errorToast('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);

      toast({
        title: 'Login Failed',
        description: 'Invalid email or password. Please try again.',
        variant: 'destructive',
      });
    }
  }

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
    const handleMouseMove = (e) =>
      setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    // THEME CHANGE: Main background changed to a light gradient.
    <div className="mt-[-25px] h-screen w-full bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* THEME CHANGE: Animated blobs softened for a light background. */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full filter blur-3xl opacity-40 animate-pulse hidden sm:block"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full filter blur-3xl opacity-50 animate-pulse hidden sm:block"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-cyan-100 rounded-full filter blur-3xl opacity-60 animate-pulse -translate-x-1/2 -translate-y-1/2"
          style={{ animationDelay: '4s' }}
        ></div>
      </div>

      {/* THEME CHANGE: Mouse-follow gradient softened. */}
      <div
        className="fixed w-96 h-96 bg-gradient-radial from-purple-200/40 to-transparent rounded-full pointer-events-none transition-all duration-300 ease-out hidden md:block"
        style={{ left: mousePosition.x - 192, top: mousePosition.y - 192 }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* THEME CHANGE: Card styling for light theme with glassmorphism effect. */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-2xl transform transition-all duration-500">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6">
              {/* <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mx-auto flex items-center justify-center transform transition-all duration-300 hover:rotate-12 shadow-lg">
                <Rocket className="h-8 w-8 text-white" />
              </div> */}
              <div className="w-16 h-16  rounded-lg flex items-center justify-center ">
                <Image
                  src="/zobsai.svg"
                  alt="Zobsai logo"
                  width={100}
                  height={100}
                />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                <Sparkles className="h-3 w-3 text-yellow-800" />
              </div>
            </div>

            {/* THEME CHANGE: Header text colors updated for contrast. */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back!
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Enter your credentials to access your account
            </p>
          </div>

          {/* --- Integrated Login Form --- */}
          <Form {...loginForm}>
            <form
              onSubmit={loginForm.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* Email Field */}
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div
                          className={`absolute inset-y-0 left-0 pl-4 flex items-center transition-all duration-300 ${
                            focusedField === 'email'
                              ? 'text-purple-600'
                              : 'text-gray-400'
                          }`}
                        >
                          <Mail className="h-5 w-5" />
                        </div>
                        {/* THEME CHANGE: Input styling for light theme. */}
                        <input
                          {...field}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField('')}
                          className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300 hover:bg-gray-50"
                          placeholder="name@example.com"
                          disabled={loginForm.formState.isSubmitting}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs mt-1" />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div
                          className={`absolute inset-y-0 left-0 pl-4 flex items-center transition-all duration-300 ${
                            focusedField === 'password'
                              ? 'text-purple-600'
                              : 'text-gray-400'
                          }`}
                        >
                          <Lock className="h-5 w-5" />
                        </div>
                        {/* THEME CHANGE: Input styling for light theme. */}
                        <input
                          type={showPassword ? 'text' : 'password'}
                          {...field}
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField('')}
                          className="w-full pl-12 pr-12 py-3 bg-white/50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300 hover:bg-gray-50"
                          placeholder="••••••••"
                          disabled={loginForm.formState.isSubmitting}
                        />
                        {/* THEME CHANGE: Eye icon colors updated. */}
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs mt-1" />
                  </FormItem>
                )}
              />

              {/* Forgot Password Button */}
              <div className="flex justify-end">
                {/* THEME CHANGE: Link color updated. */}
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-200 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button (Gradient works well on light theme) */}
              <button
                type="submit"
                disabled={loginForm.formState.isSubmitting}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-200"
              >
                <div className="relative flex items-center justify-center">
                  {loginForm.formState.isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      Login
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </form>
          </Form>

          {/* THEME CHANGE: Divider styled for light theme. */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/80 px-4 text-gray-500 rounded-full backdrop-blur-sm">
                Or continue with
              </span>
            </div>
          </div>

          <GoogleSignInButton form={loginForm} />

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="text-blue-600 hover:text-blue-500 font-medium transition-colors hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* THEME CHANGE: Security badge text color updated. */}
        <div className="mt-6 flex items-center justify-center text-gray-500 text-xs">
          <Shield className="h-4 w-4 mr-2 text-green-500" />
          <span>Secured with 256-bit SSL encryption</span>
        </div>
      </div>

      {/* --- Integrated Forgot Password Modal (Themed for light background) --- */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 w-full max-w-sm shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Reset Password
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Enter your email address and we'll send you a link to reset it.
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
                    <FormItem className="mb-4">
                      <FormControl>
                        <input
                          {...field}
                          placeholder="Enter your email"
                          className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                          disabled={isForgotPasswordSubmitting}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs mt-1" />
                    </FormItem>
                  )}
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="flex-1 px-4 py-2 bg-gray-200/80 text-gray-800 rounded-lg hover:bg-gray-300/80"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotPasswordSubmitting}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 flex items-center justify-center disabled:opacity-50"
                  >
                    {isForgotPasswordSubmitting ? (
                      'Sending...'
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" /> Send Link
                      </>
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
