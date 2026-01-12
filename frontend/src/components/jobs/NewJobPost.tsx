'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Loader2,
  Briefcase,
  Building2,
  MapPin,
  Banknote,
  FileText,
  Globe,
  Mail,
  Sparkles,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useDispatch } from 'react-redux';
import { postJobMannalByOrgAdminRequest } from '@/redux/reducers/jobReducer';
import JobsTab from '@/components/organization/tabs/JobsTab';

const QuillJs = dynamic(() => import('@/components/rich-text/QuillJs'), {
  ssr: false,
  loading: () => <div className="h-40 bg-gray-50 animate-pulse rounded-md" />,
});

// --- Schema aligned with backend fields ---
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

  // new optional location detail fields (mapped to location.state, postalCode)
  state: z.string().optional(),
  postalCode: z.string().optional(),

  // mapped to arrays for backend: responsibilities, qualifications, experience, tags
  responsibilities: z.string().optional(),
  qualifications: z.string().optional(),
  experience: z.string().optional(),
  tags: z.string().optional(),

  resumeRequired: z.boolean(),
  remote: z.boolean(),
});

type JobFormType = z.infer<typeof jobSchema>;

const NewJobPost = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const dispatch = useDispatch();

  // --- Theme Constants ---
  const THEME = {
    glassCard:
      'bg-white/90 backdrop-blur-xl border-0 shadow-2xl shadow-purple-500/10',
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
    },
  });

  const remote = form.watch('remote');
  const jobType = form.watch('jobType');

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
    console.log(data);
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

        // New fields aligned with backend arrays
        responsibilities: splitLines(data.responsibilities),
        qualifications: splitLines(data.qualifications),
        experience: splitLines(data.experience),
        tags: splitTags(data.tags),
      };

      console.log('Final Payload:', finalPayload);

      dispatch(postJobMannalByOrgAdminRequest(finalPayload));
      toast.success('Job posted successfully!');
      // router.push('/organization/jobs'); // uncomment if you want redirect
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to post job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50">
      <div className="">
        {/* Page Header */}
        <div className="mb-8 text-center space-y-2">
          <h1 className={`text-4xl font-bold ${THEME.gradientText}`}>
            Post a New Opportunity
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Create a compelling job post to attract the best talent for your
            organization.
          </p>
        </div>

        <Card className={`${THEME.glassCard} overflow-hidden`}>
          <CardHeader className="border-b border-gray-100 bg-white/50 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Job Details
                </CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  Fill in the information required to publish this role.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 md:p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit, (errors) => {
                  toast.error('Failed to post job. Please try again.');
                })}
                className="space-y-8"
              >
                {/* SECTION 1: Basic Info */}
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
                          <FormLabel className="text-gray-700">
                            Job Title <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Senior Product Designer"
                              {...field}
                              className={THEME.inputFocus}
                            />
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
                          <FormLabel className="text-gray-700">
                            Company Name <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Acme Corp"
                              {...field}
                              className={THEME.inputFocus}
                            />
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
                          <FormLabel className="text-gray-700">
                            Application Email{' '}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                              <Input
                                type="email"
                                placeholder="hr@company.com"
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
                          <FormLabel className="text-gray-700">
                            Employment Type
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className={THEME.inputFocus}>
                                <SelectValue placeholder="Select type" />
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

                {/* Contract Details (Conditional) */}
                {jobType === 'CONTRACT' && (
                  <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                    <h4 className="font-medium text-orange-800 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> Contract Duration
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="contractLengthValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-orange-900">
                              Duration
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="e.g. 6"
                                {...field}
                                className="bg-white border-orange-200 focus:ring-orange-300"
                              />
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
                            <FormLabel className="text-orange-900">
                              Unit
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-white border-orange-200 focus:ring-orange-300">
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
                  </div>
                )}

                {/* SECTION 2: Description */}
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
                          <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-purple-400 transition-all bg-white">
                            <QuillJs
                              content={field.value}
                              onContentChange={(content) =>
                                field.onChange(content)
                              }
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* SECTION 3: Role expectations & requirements (maps to arrays) */}
                <div className="space-y-6">
                  <div className="flex items-center mb-4">
                    <div className={THEME.sectionIcon}>
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Role Expectations & Requirements
                    </h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="responsibilities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Key Responsibilities
                          <span className="ml-1 text-xs text-gray-400">
                            (one per line)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <textarea
                            {...field}
                            rows={4}
                            placeholder={`• Own product roadmap\n• Collaborate with cross-functional teams\n• Ship features regularly`}
                            className={`min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ${THEME.inputFocus}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="qualifications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Required Qualifications
                          <span className="ml-1 text-xs text-gray-400">
                            (one per line)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <textarea
                            {...field}
                            rows={4}
                            placeholder={`• 3+ years in product roles\n• Strong communication skills`}
                            className={`min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ${THEME.inputFocus}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Preferred Experience
                          <span className="ml-1 text-xs text-gray-400">
                            (one per line, optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <textarea
                            {...field}
                            rows={3}
                            placeholder={`• Experience with early-stage startups\n• Background in B2B SaaS`}
                            className={`min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ${THEME.inputFocus}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Tags / Keywords
                          <span className="ml-1 text-xs text-gray-400">
                            (comma-separated)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="product, design, senior, remote, saas"
                            className={THEME.inputFocus}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* SECTION 4: Compensation */}
                <div className="space-y-6">
                  <div className="flex items-center mb-4">
                    <div className={THEME.sectionIcon}>
                      <Banknote className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Compensation
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="salaryMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            Minimum
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-gray-500 font-semibold">
                                $
                              </span>
                              <Input
                                type="number"
                                className={`pl-8 ${THEME.inputFocus}`}
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
                          <FormLabel className="text-gray-700">
                            Maximum
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-gray-500 font-semibold">
                                $
                              </span>
                              <Input
                                type="number"
                                className={`pl-8 ${THEME.inputFocus}`}
                                placeholder="80000"
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
                          <FormLabel className="text-gray-700">
                            Frequency
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className={THEME.inputFocus}>
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

                {/* SECTION 5: Location & Settings */}
                <div className="space-y-6">
                  <div className="flex items-center mb-4">
                    <div className={THEME.sectionIcon}>
                      <Globe className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Location & Settings
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="remote"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-xl border border-purple-100 bg-purple-50/50 p-4 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-semibold text-purple-900">
                              Remote Position
                            </FormLabel>
                            <p className="text-xs text-purple-700/80">
                              This is a fully remote role
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-purple-600"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="resumeRequired"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-semibold text-gray-900">
                              Resume Required
                            </FormLabel>
                            <p className="text-xs text-gray-500">
                              Applicants must upload a CV
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-purple-600"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {!remote && (
                    <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-4">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Physical Location Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700">
                                City
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. New York"
                                  {...field}
                                  className={THEME.inputFocus}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700">
                                State / Region (optional)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. NY"
                                  {...field}
                                  className={THEME.inputFocus}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700">
                                Country
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. USA"
                                  {...field}
                                  className={THEME.inputFocus}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="postalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700">
                                Postal Code (optional)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. 10001"
                                  {...field}
                                  className={THEME.inputFocus}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full md:w-auto px-8 h-12 text-lg font-semibold shadow-xl shadow-purple-200 ${THEME.gradientBtn}`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Publishing Job...
                      </>
                    ) : (
                      <>
                        Publish Job Posting
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
