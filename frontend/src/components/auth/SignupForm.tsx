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
import { Building, Rocket, UserPlus } from 'lucide-react';
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
import { signupFormSchema } from '@/lib/schemas/signupFormSchema';
import { errorToast, successToast } from '@/utils/toasts';

type SignupFormValues = z.infer<typeof signupFormSchema>;
type JobRole = { _id: string; name: string };

const SignupForm = () => {
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
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

  const fetchJobRoles = async () => {
    try {
      const response = await apiInstance.get('/job-role');
      setJobRoles(response.data || []);
    } catch (error) {
      console.error('Error fetching job roles:', error);
    }
  };
  useEffect(() => {
    fetchJobRoles();
  }, []);

  async function onSubmit(data: SignupFormValues) {
    try {
      await apiInstance.post('/user/signup', data);
      successToast(
        'Your account has been created successfully! Please check your email for verification instructions.',
      );
    } catch (error) {
      console.error('Error creating user:', error);
      errorToast(
        'An error occurred while creating your account. Please try again later.',
      );
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
                          <SelectItem key={role._id} value={role.name}>
                            {role.name}
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
};

export default SignupForm;
