// 'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
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
import {
  Loader2,
  Briefcase,
  Building2,
  Banknote,
  FileText,
  Globe,
  Sparkles,
  MapPin,
  Mail,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useDispatch } from 'react-redux';
import { postJobMannalByOrgAdminRequest } from '@/redux/reducers/jobReducer';
import apiInstance from '@/services/api';

// Dynamic import for Quill
const QuillJs = dynamic(() => import('@/components/rich-text/QuillJs'), {
  ssr: false,
  loading: () => <div className="h-40 bg-gray-50 animate-pulse rounded-md" />,
});

// --- Zod Schema ---
const jobSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  company: z.string().min(1, 'Company name is required'),
  applyEmail: z.string().email('Please enter a valid email'),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']),
  contractLengthValue: z.coerce.number().optional(),
  contractLengthType: z.enum(['MONTHS', 'YEARS']).optional(),
  salaryMin: z.coerce.number().min(0, 'Salary must be positive'),
  salaryMax: z.coerce.number().min(0, 'Salary must be positive'),
  salaryPeriod: z.enum(['YEAR', 'MONTH']),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  responsibilities: z.string().optional(),
  qualifications: z.string().optional(),
  experience: z.string().optional(),
  tags: z.string().optional(),
  resumeRequired: z.boolean(),
  remote: z.boolean(),
  isActive: z.boolean(),
});

type JobFormType = z.infer<typeof jobSchema>;

interface NewJobPostProps {
  isEmbedded?: boolean; // If true, remove page headers/backgrounds for onboarding
  onJobCreated?: (jobId: string) => void; // Callback to parent (OnboardingPage)
}

const NewJobPost: React.FC<NewJobPostProps> = ({
  isEmbedded = false,
  onJobCreated,
  gotoNextStep,
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  // --- Theme Logic ---
  const THEME = {
    glassCard: isEmbedded
      ? 'border-0 shadow-none bg-transparent'
      : 'bg-white/90 backdrop-blur-xl border-0 shadow-2xl shadow-purple-500/10',
    gradientText:
      'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent',
    gradientBtn:
      'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-[1.02]',
    inputFocus:
      'focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:border-transparent transition-all duration-300',
    sectionIcon:
      'p-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg text-purple-600 mr-3',
  };

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
      state: '',
      postalCode: '',
      country: 'IN',
      responsibilities: '',
      qualifications: '',
      experience: '',
      tags: '',
      resumeRequired: true,
      remote: false,
      isActive: true, // Default to true, but overridden later if embedded
    },
  });

  const remote = form.watch('remote');

  // --- Helpers ---
  const splitLines = (value?: string | null) =>
    value
      ? value
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  const splitTags = (value?: string | null) =>
    value
      ? value
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  const onSubmit = async (data: JobFormType) => {
    setIsSubmitting(true);
    const beingId = searchParams.get('bringId');

    try {
      const finalPayload = {
        title: data.title,
        description: data.description,
        company: data.company,
        applyMethod: { method: 'EMAIL', emails: [data.applyEmail] },
        jobTypes: [data.jobType],
        contractLength:
          data.jobType === 'CONTRACT'
            ? { value: data.contractLengthValue, type: data.contractLengthType }
            : null,
        salary: {
          min: data.salaryMin,
          max: data.salaryMax,
          period: data.salaryPeriod,
        },
        jobAddress: !data.remote
          ? `${data.city}${data.state ? ', ' + data.state : ''}, ${
              data.country
            }`
          : null,
        country: data.country,
        resumeRequired: data.resumeRequired,
        remote: data.remote,
        location: data.remote
          ? null
          : {
              city: data.city,
              state: data.state || '',
              postalCode: data.postalCode || '',
            },
        responsibilities: splitLines(data.responsibilities),
        qualifications: splitLines(data.qualifications),
        experience: splitLines(data.experience),
        tags: splitTags(data.tags),
        isOnboarding: isEmbedded,
        isActive: isEmbedded ? false : data.isActive,
      };

      const response = await apiInstance.post('/jobs/mannual', finalPayload);

      const response2 = await apiInstance.post(
        '/bring-zobs/onboarding/mark-free-job',
        {
          bringId: beingId,
          jobId: response.data.job._id,
        },
      );

      toast.success('Job posted successfully!');
      gotoNextStep();
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast.error(
        error.response?.data?.message ||
          'Failed to post job. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={
        isEmbedded
          ? 'w-full'
          : 'min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50'
      }
    >
      <div className="">
        {!isEmbedded && (
          <div className="mb-8 text-center space-y-2">
            <h1 className={`text-4xl font-bold ${THEME.gradientText}`}>
              Post a New Opportunity
            </h1>
            <p className="text-gray-500 max-w-lg mx-auto">
              Create a compelling job post to attract the best talent.
            </p>
          </div>
        )}

        <Card className={`${THEME.glassCard} overflow-hidden`}>
          {!isEmbedded && (
            <CardHeader className="border-b border-gray-100 bg-white/50 pb-6">
              <CardTitle className="text-xl font-semibold text-gray-800">
                Job Details
              </CardTitle>
            </CardHeader>
          )}

          <CardContent className={isEmbedded ? 'p-0' : 'p-6 md:p-8'}>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* --- SECTIONS --- */}

                {/* 1. Basic Info */}
                <div className="space-y-6">
                  <div className="flex items-center mb-4">
                    <div className={THEME.sectionIcon}>
                      <Building2 className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Company & Role
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title *</FormLabel>
                          <FormControl>
                            <Input {...field} className={THEME.inputFocus} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name *</FormLabel>
                          <FormControl>
                            <Input {...field} className={THEME.inputFocus} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="applyEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Application Email *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                              <Input
                                type="email"
                                {...field}
                                className={`pl-10 ${THEME.inputFocus}`}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="jobType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className={THEME.inputFocus}>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="FULL_TIME">
                                Full-time
                              </SelectItem>
                              <SelectItem value="PART_TIME">
                                Part-time
                              </SelectItem>
                              <SelectItem value="CONTRACT">Contract</SelectItem>
                              <SelectItem value="INTERN">Internship</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* 2. Description */}
                <div className="space-y-4">
                  <div className="flex items-center mb-2">
                    <div className={THEME.sectionIcon}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Job Description
                    </h3>
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <QuillJs
                              content={field.value}
                              onContentChange={field.onChange}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 3. Location */}
                <div className="space-y-6">
                  <div className="flex items-center mb-4">
                    <div className={THEME.sectionIcon}>
                      <Globe className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Location
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="remote"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-xl border p-3 bg-white/50">
                          <div className="space-y-0.5">
                            <FormLabel>Remote Position</FormLabel>
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
                  {!remote && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} className={THEME.inputFocus} />
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
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input {...field} className={THEME.inputFocus} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* 4. Compensation */}
                <div className="space-y-6">
                  <div className="flex items-center mb-4">
                    <div className={THEME.sectionIcon}>
                      <Banknote className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Compensation
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="salaryMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="salaryMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="salaryPeriod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Period</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="YEAR">Yearly</SelectItem>
                              <SelectItem value="MONTH">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full md:w-auto px-8 h-12 text-lg font-semibold shadow-xl shadow-purple-200 ${THEME.gradientBtn}`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        {isEmbedded
                          ? 'Create Free Job & Continue'
                          : 'Publish Job Posting'}
                        <Sparkles className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewJobPost;
