'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import apiInstance from '@/services/api';
import { toast } from '@/hooks/use-toast';
import NewJobPost from '@/components/jobs/JobForOnboard'; // Or wherever your file is

const steps = ['Organization Details', 'Post Free Job', 'Finalize'];

const OnboardingPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const bringId = searchParams.get('bringId');
  const initialStepParam = searchParams.get('step');
  const initialStep = initialStepParam ? Number(initialStepParam) : 1;

  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [loading, setLoading] = useState(false);

  const [orgForm, setOrgForm] = useState({
    companyName: '',
    size: '',
    industry: '',
    website: '',
    description: '',
  });

  // STEP 3: document upload
  const [docFile, setDocFile] = useState<File | null>(null);

  useEffect(() => {
    if (!bringId) {
      toast({
        title: 'Missing onboarding reference',
        description:
          'Invalid onboarding link. Please use the link from your email.',
        variant: 'destructive',
      });
    }
  }, [bringId, toast]);

  const handleOrgChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setOrgForm((prev) => ({ ...prev, [name]: value }));
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    if (bringId) {
      const params = new URLSearchParams();
      params.set('bringId', bringId);
      params.set('step', String(step));
      router.replace(`/dashboard/org-onboarding?${params.toString()}`);
    }
  };

  const handleSaveOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bringId) return;

    try {
      setLoading(true);
      const { data } = await apiInstance.post(
        `/user/onboard/org-info/${bringId}/organization`,
        orgForm,
      );

      toast({
        title: 'Saved',
        description: data?.message || 'Organization details saved.',
      });
      goToStep(data?.nextStep || 2);
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message ||
          'Failed to save organization details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // --- AUTOMATED JOB LINKING ---
  // This function is passed to NewJobPost to be called automatically
  const handleJobCreatedSuccess = async (newJobId: string) => {
    if (!bringId) return;

    try {
      setLoading(true);
      // Link the new job to the onboarding session
      const { data } = await apiInstance.post(
        `/user/bring-zobs/onboarding/mark-free-job`,
        {
          bringId,
          jobId: newJobId,
        },
      );

      toast({
        title: 'Success',
        description: 'Job posted and linked to account.',
      });
      goToStep(data?.nextStep || 3);
    } catch (error: any) {
      console.error('Link Job Error', error);
      toast({
        title: 'Error',
        description:
          'Job created, but failed to link to onboarding. Contact support.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bringId || !docFile) {
      toast({
        title: 'Error',
        description: 'Select a file.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', docFile);

      const { data } = await apiInstance.post(
        `/bring-zobs/onboarding/${bringId}/upload-docs`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      toast({ title: 'Uploaded', description: data?.message });
      goToStep(4);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Upload failed.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    if (!bringId) return <div className="text-red-500">Invalid Session</div>;

    switch (currentStep) {
      case 1:
        return (
          <form onSubmit={handleSaveOrganization} className="space-y-4">
            {/* ... (Existing Step 1 Fields same as before) ... */}
            <div>
              <Label>Company Name</Label>
              <Input
                name="companyName"
                value={orgForm.companyName}
                onChange={handleOrgChange}
                required
              />
            </div>
            <div>
              <Label>Size</Label>
              <Input
                name="size"
                value={orgForm.size}
                onChange={handleOrgChange}
              />
            </div>
            <div>
              <Label>Industry</Label>
              <Input
                name="industry"
                value={orgForm.industry}
                onChange={handleOrgChange}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                name="description"
                value={orgForm.description}
                onChange={handleOrgChange}
                rows={4}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save & Continue'}
              </Button>
            </div>
          </form>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="mb-4 p-4 bg-blue-50 text-blue-800 rounded-md text-sm border border-blue-100">
              Please post your first job to verify your hiring intent. This job
              will be posted for free.
            </div>

            {/* EMBEDDED JOB POST FORM */}
            <NewJobPost
              isEmbedded={true}
              onJobCreated={handleJobCreatedSuccess}
              gotoNextStep={() => goToStep(3)}
            />

            <div className="flex justify-start mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => goToStep(1)}
                disabled={loading}
              >
                Back to Organization Details
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <div className="mb-4 p-4 bg-blue-50 text-blue-800 rounded-md text-sm border border-blue-100">
              Please upload your documents to complete your onboarding process.
            </div>
            <a
              href="https://mail.google.com/mail/u/0/#inbox"
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 text-white font-bold py-4 px-8  bg-red-500 text-blue-800 rounded-md text-sm border border-blue-100"
            >
              <button className="">Gmail</button>
            </a>
          </div>
        );

      default:
        return <div>Invalid step</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {' '}
      {/* Increased max-width for job form */}
      <h1 className="text-2xl font-bold mb-2">Employer Onboarding</h1>
      {/* Step Indicator (Same as before) */}
      <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;
          return (
            <div
              key={label}
              className="flex-1 flex flex-col items-center text-center"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isActive
                    ? 'bg-primary text-white'
                    : 'bg-background'
                }`}
              >
                {stepNumber}
              </div>
              <span className="mt-2 text-xs">{label}</span>
            </div>
          );
        })}
      </div>
      <div className="border rounded-lg p-6 bg-card shadow-sm">
        {renderStepContent()}
      </div>
    </div>
  );
};

export default OnboardingPage;
