'use client';

import { PermissionGuard } from '@/components/common/PermissionGuard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import NewJobPost from '@/components/postJobs/NewPostingJobs';

export default function PostJobPage() {
  return (
    <PermissionGuard
      permission="create_job"
      fallback={
        <div className="p-8">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              You don't have permission to post jobs. Please contact your administrator.
            </AlertDescription>
          </Alert>
        </div>
      }
    >
      <NewJobPost />
    </PermissionGuard>
  );
}