/** @format */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { Rocket, LogIn, Mail } from 'lucide-react';
import apiInstance from '@/services/api';
import { successToast } from '@/utils/toasts';
import { useEffect, useState } from 'react';
import Cookie from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { loginRequest } from '@/redux/reducers/authReducer';
import { GoogleSignInButton } from './GoogleSingupButton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const loginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;
type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [isForgotPasswordSubmitting, setIsForgotPasswordSubmitting] =
    useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const forgotPasswordForm = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const dispatch = useDispatch();

  async function onSubmit(data: LoginFormValues) {
    try {
      dispatch(loginRequest(data));
      successToast('Login successful! Redirecting to your dashboard...');
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password. Please try again.',
        variant: 'destructive',
      });
      return;
    }
  }

  async function onForgotPasswordSubmit(data: ForgotPasswordValues) {
    console.log('Forgot password data:', data);
    setIsForgotPasswordSubmitting(true);
    try {
      await apiInstance.post('/user/forgot-password', data);
      toast({
        title: 'Password reset email sent',
        description:
          'Check your email for instructions to reset your password.',
      });
      setForgotPasswordOpen(false);
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
    const token = Cookie.get('accessToken');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center items-center mb-4">
          <Rocket className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-2xl font-headline">Welcome Back!</CardTitle>
        <CardDescription>
          Enter your credentials to access your CareerPilot account. <br />
          (Admins: Admin@123, Students: Student@123)
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Form {...loginForm}>
          <form
            onSubmit={loginForm.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={loginForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@example.com"
                      {...field}
                      disabled={loginForm.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={loginForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      disabled={loginForm.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Dialog
                open={forgotPasswordOpen}
                onOpenChange={setForgotPasswordOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 text-sm text-muted-foreground hover:text-primary"
                  >
                    Forgot password?
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reset your password</DialogTitle>
                    <DialogDescription>
                      Enter your email address and we'll send you a link to
                      reset your password.
                    </DialogDescription>
                  </DialogHeader>
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
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="name@example.com"
                                {...field}
                                disabled={isForgotPasswordSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isForgotPasswordSubmitting}
                      >
                        {isForgotPasswordSubmitting ? (
                          'Sending...'
                        ) : (
                          <>
                            <Mail className="mr-2 h-4 w-4" /> Send Reset Link
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loginForm.formState.isSubmitting}
            >
              {loginForm.formState.isSubmitting ? (
                'Logging in...'
              ) : (
                <>
                  {' '}
                  <LogIn className="mr-2 h-4 w-4" /> Login{' '}
                </>
              )}
            </Button>
          </form>
        </Form>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <GoogleSignInButton form={loginForm} />
      </CardContent>
      <CardFooter className="flex justify-center text-sm">
        <p>
          Don&apos;t have an account?&nbsp;
          <Link
            href="/signup"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
