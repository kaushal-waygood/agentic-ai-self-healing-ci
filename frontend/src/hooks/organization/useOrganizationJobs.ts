// hooks/organization/useOrganizationJobs.ts
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { JobStatus } from '@/lib/data/jobs';

const jobFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  location: z.string().min(1, 'Location is required'),
  description: z.string().min(1, 'Description is required'),
  jobUrl: z.string().url('A valid job URL is required'),
  employmentType: z
    .enum(['FULLTIME', 'PARTTIME', 'CONTRACT', 'INTERN'])
    .optional(),
  salary: z.string().optional(),
});

export type JobFormValues = z.infer<typeof jobFormSchema>;

export const useOrganizationJobs = (initialJobs = []) => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState(initialJobs);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);

  const jobForm = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: '',
      location: '',
      description: '',
      jobUrl: '',
    },
  });

  const handleJobSubmit = (values: JobFormValues) => {
    const newJob = {
      ...values,
      id: `job-${Date.now()}`,
      status: 'pending_review' as JobStatus,
      postedDate: new Date().toISOString(),
    };

    setJobs((prev) => [newJob, ...prev]);
    toast({
      title: 'Job Submitted for Review',
      description: 'Your job posting is pending approval',
    });
    setIsPostJobOpen(false);
    jobForm.reset();
  };

  return {
    jobs,
    isPostJobOpen,
    setIsPostJobOpen,
    jobForm,
    handleJobSubmit,
  };
};
