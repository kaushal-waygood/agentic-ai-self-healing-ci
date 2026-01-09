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

const Page = () => {
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

        <JobsTab />
      </div>
    </div>
  );
};

export default Page;
