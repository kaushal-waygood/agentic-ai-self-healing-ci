'use client';

import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { UserCheck } from 'lucide-react';
import { ProfileForm } from '@/components/profile/profile-form';

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProfileSave = () => {
    setIsSubmitting(true);
    // In a real app, you might await an API call. Here we simulate it.
    setTimeout(() => {
      toast({
        title: 'Profile Created!',
        description: 'Your information has been saved. Welcome to CareerPilot!',
      });
      router.push('/dashboard');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <>
      <PageHeader
        title="Welcome to CareerPilot"
        description="Let's find your next job. Start by completing your profile for the best experience."
        icon={UserCheck}
      />
      <div className="max-w-full mx-auto">
        {/* We now use the centralized ProfileForm for a consistent experience */}
        <ProfileForm
          onSave={handleProfileSave}
          isSubmitting={isSubmitting}
          isOnboarding={true}
        />
      </div>
    </>
  );
}
