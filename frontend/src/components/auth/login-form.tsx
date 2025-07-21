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
import { Rocket, LogIn } from 'lucide-react';
import apiInstance from '@/services/api';
import { successToast } from '@/utils/toasts';
import { useEffect } from 'react';
import Cookie from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { loginRequest } from '@/redux/reducers/authReducer';

const loginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const dispatch = useDispatch();

  async function onSubmit(data: LoginFormValues) {
    console.log(data);
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
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
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
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
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="w-full"
            disabled={form.formState.isSubmitting}
            onClick={() => handleOAuthLogin('Google')}
          >
            <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
              <path
                fill="currentColor"
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.01zM12.04 22c-3.04 0-5.7-1.25-7.63-3.39L7.5 15.91c.89 1.14 2.28 1.9 3.98 1.9 2.7 0 4.92-1.95 5.36-4.47H12.48V10.9h9.48.16c0 .43.06 1.1.06 1.52 0 5.03-3.05 9.58-9.64 9.58zM12 3.45c1.62 0 3.05.51 4.18 1.49l2.94-2.96C16.88 .71 14.64 0 12 0 7.31 0 3.25 2.64 1.07 6.63l3.1 2.47C5.03 6.18 8.17 3.45 12 3.45z"
              ></path>
            </svg>
            Google
          </Button>
          <Button
            variant="outline"
            className="w-full"
            disabled={form.formState.isSubmitting}
            onClick={() => handleOAuthLogin('Microsoft')}
          >
            <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
              <path fill="#F25022" d="M1 1h10.5v10.5H1z" />
              <path fill="#7FBA00" d="M12.5 1h10.5v10.5H12.5z" />
              <path fill="#00A4EF" d="M1 12.5h10.5v10.5H1z" />
              <path fill="#FFB900" d="M12.5 12.5h10.5v10.5H12.5z" />
            </svg>
            Microsoft
          </Button>
        </div>
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
