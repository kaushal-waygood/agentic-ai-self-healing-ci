import { Suspense } from 'react';
import DashboardLayoutClient from './layout-client';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayoutClient>
      <Suspense fallback={null}>{children}</Suspense>
    </DashboardLayoutClient>
  );
}
