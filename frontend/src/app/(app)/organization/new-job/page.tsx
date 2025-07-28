'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { AlertDialogFooter } from '@/components/ui/alert-dialog';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
// import QuillJs from '@/components/rich-text/QuillJs';
import { useDispatch } from 'react-redux';
import { postJobMannalByOrgAdminRequest } from '@/redux/reducers/jobReducer';

const QuillJs = dynamic(() => import('@/components/rich-text/QuillJs'), {
  ssr: false,
});
const jobSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  company: z.string().min(1, 'Company name is required'),
  applyEmail: z.string().email('Please enter a valid email'),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']),
  // contractLengthValue: z.coerce
  //   .number()
  //   .min(1, 'Contract length must be at least 1'),
  // contractLengthType: z.enum(['MONTHS', 'YEARS']),
  salaryMin: z.coerce.number().min(0, 'Salary must be positive'),
  salaryMax: z.coerce.number().min(0, 'Salary must be positive'),
  salaryPeriod: z.enum(['YEAR', 'MONTH']),
  city: z.string().min(1, 'City is required'),
  lat: z.coerce
    .number()
    .min(-90)
    .max(90, 'Latitude must be between -90 and 90'),
  lng: z.coerce
    .number()
    .min(-180)
    .max(180, 'Longitude must be between -180 and 180'),
  country: z.string().min(1, 'Country is required'),
  resumeRequired: z.boolean(),
  remote: z.boolean(),
});

type JobFormType = z.infer<typeof jobSchema>;

const Page = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const dispatch = useDispatch();

  const form = useForm<JobFormType>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      description: '',
      company: '',
      applyEmail: '',
      jobType: 'FULL_TIME',
      contractLengthValue: 0,
      contractLengthType: 'MONTHS',
      salaryMin: 0,
      salaryMax: 0,
      salaryPeriod: 'YEAR',
      city: '',
      lat: 0,
      lng: 0,
      country: 'IN',
      resumeRequired: true,
      remote: false,
    },
  });

  const remote = form.watch('remote');
  const jobType = form.watch('jobType');

  const onSubmit = async (data: JobFormType) => {
    setIsSubmitting(true);
    try {
      const finalPayload = {
        title: data.title,
        description: data.description,
        company: data.company,
        applyMethod: {
          method: 'EMAIL',
          emails: [data.applyEmail],
        },
        jobTypes: [data.jobType],
        contractLength:
          data.jobType === 'CONTRACT'
            ? {
                value: data.contractLengthValue,
                type: data.contractLengthType,
              }
            : null,
        salary: {
          min: data.salaryMin,
          max: data.salaryMax,
          period: data.salaryPeriod,
        },
        jobAddress: !data.remote ? `${data.city}, ${data.country}` : null,
        country: data.country,
        resumeRequired: data.resumeRequired,
        remote: data.remote,
        location: data.remote
          ? null
          : {
              city: data.city,
              lat: data.lat,
              lng: data.lng,
            },
      };

      dispatch(postJobMannalByOrgAdminRequest(finalPayload));
      toast.success('Job posted successfully!');
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to post job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Post a New Job</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                console.log('Submit event triggered');

                try {
                  const isValid = await form.trigger();
                  console.log('Form valid:', isValid, form.formState.errors);

                  if (isValid) {
                    console.log('Calling onSubmit');
                    await onSubmit(form.getValues());
                  }
                } catch (error) {
                  console.error('Submission error:', error);
                }
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Job Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Senior React Developer"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Company */}
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company*</FormLabel>
                      <FormControl>
                        <Input placeholder="Your company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description with Rich Text Editor */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description*</FormLabel>
                    <FormControl>
                      <QuillJs
                        content={field.value}
                        onContentChange={(content) => {
                          console.log('Editor content changed:', content);
                          field.onChange(content);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Apply Email */}
              <FormField
                control={form.control}
                name="applyEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Email*</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="hr@company.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Job Type and Remote Switch */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="jobType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Type*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select job type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="FULL_TIME">Full-time</SelectItem>
                          <SelectItem value="PART_TIME">Part-time</SelectItem>
                          <SelectItem value="CONTRACT">Contract</SelectItem>
                          <SelectItem value="INTERN">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="remote"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Remote Position
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Check if this job is fully remote
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Contract Length - Only show for CONTRACT type */}
              {jobType === 'CONTRACT' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="contractLengthValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Duration*</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="6" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contractLengthType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration Unit*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MONTHS">Months</SelectItem>
                            <SelectItem value="YEARS">Years</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Salary Information */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Salary Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="salaryMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Salary*</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">
                              $
                            </span>
                            <Input
                              type="number"
                              className="pl-8"
                              placeholder="50000"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="salaryMax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Salary*</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">
                              $
                            </span>
                            <Input
                              type="number"
                              className="pl-8"
                              placeholder="70000"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="salaryPeriod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salary Period*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="YEAR">Per Year</SelectItem>
                            <SelectItem value="MONTH">Per Month</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Location - Only show if not remote */}
              {!remote && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Location Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City*</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Bangalore" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country*</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. India" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="lat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude*</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.000001"
                              placeholder="e.g. 12.9716"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lng"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude*</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.000001"
                              placeholder="e.g. 77.5946"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Resume Required */}
              <FormField
                control={form.control}
                name="resumeRequired"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Resume Required
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Candidates must submit a resume to apply
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <AlertDialogFooter className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    'Post Job'
                  )}
                </Button>
              </AlertDialogFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
