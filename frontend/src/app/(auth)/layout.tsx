
"use client";

import { usePathname, useRouter } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { Footer } from "@/components/layout/footer";
import { useEffect, useState } from "react";
import { mockUserProfile } from "@/lib/data/user";
import { Loader2 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // If a user is already logged in, redirect them away from auth pages
    if (mockUserProfile.email) {
      const destination = mockUserProfile.role === 'PrimaryAdmin' ? '/primary-admin/dashboard' : '/dashboard';
      router.push(destination);
    } else {
      // If not logged in, allow access to auth pages
      setIsVerified(true);
    }
  }, [router]);

  if (!isVerified) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
