import { mockUserProfile } from './user';

export type AuditLogAction =
  | 'USER_UPDATE'
  | 'PLAN_CHANGE'
  | 'ORG_UPDATE'
  | 'ADMIN_ACTION'
  | 'LOGIN_ACTION'
  | 'SYSTEM_CONFIG_CHANGE'
  | 'JOB_ACTION';

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO string
  adminId: string;
  adminEmail: string;
  action: AuditLogAction;
  targetId: string; // ID of the user, org, or entity being acted upon
  details: string;
}

const initialMockAuditLogs: AuditLogEntry[] = [
  {
    id: 'log_1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    adminId: 'primary-admin-001',
    adminEmail: 'iamgde@gmail.com',
    action: 'ORG_UPDATE',
    targetId: 'org_123_state_university',
    details: 'Updated organization plan to enterprise_pro.',
  },
  {
    id: 'log_2',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    adminId: 'primary-admin-001',
    adminEmail: 'iamgde@gmail.com',
    action: 'USER_UPDATE',
    targetId: 'user-fay-521699',
    details: 'Reset usage counters for user Fan Gao.',
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __mockAuditLogs: AuditLogEntry[] | undefined;
}

export let mockAuditLogs: AuditLogEntry[];

if (process.env.NODE_ENV === 'production') {
  mockAuditLogs = initialMockAuditLogs;
} else {
  if (!globalThis.__mockAuditLogs) {
    globalThis.__mockAuditLogs = initialMockAuditLogs;
  }
  mockAuditLogs = globalThis.__mockAuditLogs;
}

/**
 * A helper function to simulate adding an audit log entry.
 * In a real application, this would be a call to a logging service or database.
 */
export function logAdminAction(
  action: AuditLogAction,
  targetId: string,
  details: string,
) {
  // Use the currently logged-in admin from mockUserProfile
  const admin = mockUserProfile;

  if (admin.role !== 'PrimaryAdmin') {
    console.warn('Attempted to log an admin action by a non-admin user.');
    return;
  }

  const newLog: AuditLogEntry = {
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    adminId: admin.id,
    adminEmail: admin.email,
    action,
    targetId,
    details,
  };

  // Prepend to the array to keep it in reverse-chronological order
  mockAuditLogs.unshift(newLog);
}
