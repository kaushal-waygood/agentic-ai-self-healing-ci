'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';
import { Root } from 'postcss';
import { RootState } from '@/redux/rootReducer';

export default function OnboardingGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { student, loading } = useSelector((state: RootState) => state.student);

  const onboardingTourPath = '/dashboard/onboarding-tour';

  useEffect(() => {
    if (loading || !student) {
      return;
    }

    const hasCompleted = student.hasCompletedOnboarding;

    if (!hasCompleted && pathname !== onboardingTourPath) {
      router.replace(onboardingTourPath);
    }
    if (hasCompleted && pathname === onboardingTourPath) {
      router.replace('/dashboard');
    }
  }, [student, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center flex-col justify-center min-h-screen">
        {/* <Loader2 className="w-10 h-10 animate-spin" /> */}
        <div>
          <img src="/logo.png" alt="" className="w-10 h-10 animate-bounce" />
        </div>

        <div className="text-lg">LOADING...</div>
      </div>
    ); // Or a proper spinner component
  }

  // If logic passes, render the actual page content
  return children;
}
