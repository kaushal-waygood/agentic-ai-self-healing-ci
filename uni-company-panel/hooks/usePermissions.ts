'use client';

import { useRBACStore } from '@/store/rbac.store';
import { useAuthStore } from '@/store/auth.store';

export const usePermissions = () => {
  const { checkPermission } = useRBACStore();
  const { user } = useAuthStore();

  const can = (permission: string) => {
    if (user?.role === 'OWNER') return true;
    
    return checkPermission(permission);
  };

  const role = user?.role || 'VIEWER';

  return {
    can,
    role,
    isOwner: role === 'OWNER',
    isHRManager: role === 'HR_MANAGER',
    isRecruiter: role === 'RECRUITER',
    isInterviewer: role === 'INTERVIEWER',
    isViewer: role === 'VIEWER',
  };
};