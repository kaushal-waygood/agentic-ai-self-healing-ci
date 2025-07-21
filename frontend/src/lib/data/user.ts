import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getProfileRequest } from '@/redux/reducers/authReducer';

export interface Permissions {
  org_view: boolean;
  org_create: boolean;
  org_update_details: boolean;
  org_update_status: boolean;
  org_manage_members: boolean;
  org_delete: boolean;
  user_view_all: boolean;
  user_update_role: boolean;
  user_impersonate: boolean;
  admin_view: boolean;
  admin_create: boolean;
  admin_update: boolean;
  admin_delete: boolean;
  role_view: boolean;
  role_create: boolean;
  role_update: boolean;
  role_delete: boolean;
  billing_view_plans: boolean;
  billing_update_plans: boolean;
  billing_assign_plans: boolean;
  content_update_jobs: boolean;
  content_update_header: boolean;
  content_update_footer: boolean;
  platform_view_audit_logs: boolean;
  platform_view_health: boolean;
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  permissions: Permissions;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string; // YYYY-MM
  endDate?: string; // YYYY-MM or "Present"
  country?: string;
  gpa?: string;
}

export interface ExperienceEntry {
  company: string;
  jobTitle: string;
  startDate?: string; // YYYY-MM
  endDate?: string; // YYYY-MM or "Present"
  responsibilities: string[]; // Array of strings
  location?: string;
  employmentType?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  isCurrent?: boolean;
}

export interface ProjectEntry {
  name: string;
  description: string;
  technologies?: string; // Comma-separated string of tech used
  link?: string; // URL to project demo or repo
  startDate?: string; // YYYY-MM
  endDate?: string; // YYYY-MM or "Present"
  isCurrent?: boolean;
}

export type SavedCv = {
  id: string;
  name: string;
  htmlContent: string;
  atsScore?: number;
  atsScoreReasoning?: string;
  createdAt: string; // ISO string
  jobTitle: string;
};

export type SavedCoverLetter = {
  id: string;
  name: string;
  htmlContent: string;
  createdAt: string; // ISO string
  jobDescription: string;
  tone: 'Formal' | 'Enthusiastic' | 'Reserved' | 'Casual';
  style: 'Concise' | 'Detailed';
  personalStory?: string;
};

// New types for auto-apply
export interface AutoApplyJobFilters {
  query: string;
  country?: string;
  datePosted?: 'all' | 'today' | '3days' | 'week' | 'month';
  workFromHome?: boolean;
  employmentTypes?: string[];
  jobRequirements?: string[];
  radius?: number;
}

export interface AutoApplyCoverLetterSettings {
  strategy: 'generate' | 'use_template';
  templateId?: string; // id of a saved cover letter
  instructions?: string;
}

export interface AutoApplySettings {
  id: string;
  name: string;
  isActive: boolean;
  jobFilters: AutoApplyJobFilters;
  baseCvId: string; // id of a saved CV
  coverLetterSettings: AutoApplyCoverLetterSettings;
  dailyLimit: number;
  lastRun?: string; // ISO date string
}

export interface ActionItem {
  id: string;
  href: string; // The link the notification should take the user to.
  summary: string;
  date: string; // ISO string
  isRead: boolean;
  type: 'application' | 'recommendation' | 'alert' | 'reward';
  // Note: Storing the component name string instead of the component itself
  // makes the data structure serializable, which is better practice.
  iconName?: keyof typeof import('lucide-react');
}

export type UserUsage = {
  // Resets monthly
  aiJobApply: number;
  aiCvGenerator: number;
  aiCoverLetterGenerator: number;
  applications: number;
};

// --- NEW SAAS MODEL TYPES ---
export type UserRole = 'Individual' | 'OrgAdmin' | 'OrgMember' | 'PrimaryAdmin';

export type PlanId =
  | 'basic'
  | 'plus'
  | 'pro'
  | 'platinum'
  | 'enterprise_plus'
  | 'enterprise_pro'
  | 'enterprise_platinum';

export const planTierOrder: Record<PlanId, number> = {
  basic: 0,
  plus: 1,
  enterprise_plus: 1,
  pro: 2,
  enterprise_pro: 2,
  platinum: 3,
  enterprise_platinum: 3,
};

export interface Organization {
  id: string;
  name: string;
  planId: PlanId;
  allowStudentUpgrades: boolean;
  seats: number;
  status: 'pending_verification' | 'active' | 'disabled';
  betaFeaturesEnabled?: boolean;
  apiKey?: string; // New field for API key
}

export interface RecentActivity {
  timestamp: string; // ISO string
  activity: string;
  details?: string;
}

// --- UPDATED USER PROFILE ---
export type UserProfile = {
  // Core Info
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  linkedin?: string;
  portfolio?: string;
  createdAt?: string; // ISO string

  // SaaS Context
  role: UserRole; // Individual, OrgAdmin, OrgMember, PrimaryAdmin
  organizationId?: string; // Null if individual, ID of org if member/admin
  department?: string; // e.g., 'Computer Science', 'Business Administration'
  course?: string; // e.g., 'B.S. in CS', 'MBA'
  adminRoleId?: string; // ID of the assigned AdminRole

  // Career Info
  jobPreference: string;
  cvUrl?: string; // THIS IS DEPRECATED but might still exist in places
  generatedCvContent?: string; // The "active" CV from onboarding/last generation
  narratives: {
    challenges: string;
    achievements: string;
    appreciation: string;
  };
  education: Array<EducationEntry>;
  experience: Array<ExperienceEntry>;
  projects: Array<ProjectEntry>;
  skills: string[];
  yearsOfExperience?: number;

  // Personal Subscription & Credits
  currentPlanId: PlanId; // For individuals, this is their plan. For org members, this is their base org-provided plan.
  personalPlanId?: PlanId; // Org members can have a personal upgrade.
  personalSubscriptionStatus?: 'active' | 'inactive' | 'cancelled';
  subscriptionStartDate?: string; // ISO String
  subscriptionEndDate?: string; // ISO String
  billingCycle?: 'monthly' | 'quarterly' | 'halfYearly';
  scheduledPlanChange?: PlanId | null;
  referralCode: string;
  referredBy?: string;
  referralsMade: number;
  earnedApplicationCredits: number;
  careerXp?: number; // For gamification

  // Account & Preferences
  usage: UserUsage;
  lastApplicationDate: string;
  isEmailLinked: boolean;
  linkedEmailProvider: string;
  preferredCountry?: string;
  preferredLanguage?: string;
  preferredDatePosted?: 'all' | 'today' | '3days' | 'week' | 'month';
  prefersWorkFromHome?: boolean;
  preferredEmploymentTypes?: string[];
  preferredJobRequirements?: string[];
  preferredSearchRadius?: number;
  excludedJobPublishers?: string;

  // Saved Items & Agents
  autoApplyAgents: AutoApplySettings[];
  hasSetupFirstAgent?: boolean;
  savedCvs: SavedCv[];
  savedCoverLetters: SavedCoverLetter[];
  actionItems: ActionItem[];
  recentActivity?: RecentActivity[];
};

// --- MOCK DATA ---

const allPermissionsFalse: Permissions = {
  org_view: false,
  org_create: false,
  org_update_details: false,
  org_update_status: false,
  org_manage_members: false,
  org_delete: false,
  user_view_all: false,
  user_update_role: false,
  user_impersonate: false,
  admin_view: false,
  admin_create: false,
  admin_update: false,
  admin_delete: false,
  role_view: false,
  role_create: false,
  role_update: false,
  role_delete: false,
  billing_view_plans: false,
  billing_update_plans: false,
  billing_assign_plans: false,
  content_update_jobs: false,
  content_update_header: false,
  content_update_footer: false,
  platform_view_audit_logs: false,
  platform_view_health: false,
};

const initialAdminRoles: AdminRole[] = [
  {
    id: 'role_super_admin',
    name: 'Super Admin',
    description: 'Full access to all platform management features.',
    permissions: Object.keys(allPermissionsFalse).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Permissions,
    ),
  },
  {
    id: 'role_org_manager',
    name: 'Organization Manager',
    description: 'Can onboard and manage organizations and their members.',
    permissions: {
      ...allPermissionsFalse,
      org_view: true,
      org_create: true,
      org_update_details: true,
      user_view_all: true,
      user_update_role: true,
    },
  },
  {
    id: 'role_content_manager',
    name: 'Content Manager',
    description: 'Can manage platform-wide job listings and site content.',
    permissions: {
      ...allPermissionsFalse,
      content_update_jobs: true,
      content_update_header: true,
      content_update_footer: true,
    },
  },
  {
    id: 'role_billing_specialist',
    name: 'Billing Specialist',
    description: 'Can manage subscription plans and billing settings.',
    permissions: {
      ...allPermissionsFalse,
      billing_view_plans: true,
      billing_update_plans: true,
      billing_assign_plans: true,
    },
  },
];

export const initialUserProfile: UserProfile = {
  id: '',
  fullName: '',
  email: '',
  role: 'Individual',
  createdAt: undefined,
  currentPlanId: 'basic',
  subscriptionStartDate: undefined,
  subscriptionEndDate: undefined,
  billingCycle: undefined,
  scheduledPlanChange: null,
  personalPlanId: undefined,
  personalSubscriptionStatus: undefined,
  jobPreference: '',
  phone: '',
  linkedin: '',
  portfolio: '',
  department: undefined,
  course: undefined,
  adminRoleId: undefined,
  generatedCvContent: '',
  narratives: {
    challenges: '',
    achievements: '',
    appreciation: '',
  },
  education: [],
  experience: [],
  projects: [],
  skills: [],
  yearsOfExperience: undefined,
  referralCode: '',
  referredBy: undefined,
  referralsMade: 0,
  earnedApplicationCredits: 0,
  careerXp: 0,
  hasSetupFirstAgent: false,
  usage: {
    aiJobApply: 0,
    aiCvGenerator: 0,
    aiCoverLetterGenerator: 0,
    applications: 0,
  },
  lastApplicationDate: '',
  isEmailLinked: false,
  linkedEmailProvider: '',
  preferredCountry: 'us',
  preferredLanguage: 'en',
  preferredDatePosted: 'all',
  prefersWorkFromHome: false,
  preferredEmploymentTypes: [],
  preferredJobRequirements: [],
  preferredSearchRadius: undefined,
  excludedJobPublishers: '',
  savedCvs: [],
  savedCoverLetters: [],
  autoApplyAgents: [],
  actionItems: [],
  recentActivity: [],
};

const initialMockUsers: UserProfile[] = [
  {
    id: 'user-fay-521699',
    fullName: 'Fan Gao',
    email: 'fay521699@gmail.com',
    role: 'Individual',
    createdAt: new Date('2024-04-20T11:00:00Z').toISOString(),
    currentPlanId: 'pro',
    subscriptionStartDate: new Date(
      new Date().setMonth(new Date().getMonth() - 1),
    ).toISOString(),
    subscriptionEndDate: new Date(
      new Date().setMonth(new Date().getMonth() + 1),
    ).toISOString(),
    billingCycle: 'monthly',
    scheduledPlanChange: null,
    personalPlanId: undefined,
    personalSubscriptionStatus: undefined,
    jobPreference: 'Graohic Designer',
    phone: '',
    linkedin: '',
    portfolio: '',
    department: undefined,
    course: undefined,
    generatedCvContent: '',
    narratives: { challenges: '', achievements: '', appreciation: '' },
    education: [],
    experience: [],
    projects: [],
    skills: ['Python', 'SQL', 'Tableau'],
    yearsOfExperience: undefined,
    referralCode: 'FAY2024',
    referredBy: undefined,
    referralsMade: 0,
    earnedApplicationCredits: 0,
    careerXp: 150,
    hasSetupFirstAgent: true,
    usage: {
      aiJobApply: 10,
      aiCvGenerator: 5,
      aiCoverLetterGenerator: 8,
      applications: 12,
    },
    lastApplicationDate: '',
    isEmailLinked: false,
    linkedEmailProvider: '',
    preferredCountry: 'us',
    preferredLanguage: 'en',
    preferredDatePosted: 'all',
    prefersWorkFromHome: false,
    preferredEmploymentTypes: [],
    preferredJobRequirements: [],
    preferredSearchRadius: undefined,
    excludedJobPublishers: '',
    savedCvs: [],
    savedCoverLetters: [],
    autoApplyAgents: [],
    actionItems: [],
    recentActivity: [
      {
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        activity: 'Applied for Job',
        details: 'Senior Product Designer',
      },
      {
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        activity: 'Upgraded to Pro',
      },
    ],
  },
  {
    id: 'primary-admin-001',
    fullName: 'Primary Admin',
    email: 'iamgde@gmail.com',
    role: 'PrimaryAdmin',
    createdAt: new Date('2024-01-10T09:00:00Z').toISOString(),
    currentPlanId: 'enterprise_pro',
    subscriptionStartDate: new Date(
      new Date().setFullYear(new Date().getFullYear() - 1),
    ).toISOString(),
    subscriptionEndDate: new Date(
      new Date().setFullYear(new Date().getFullYear() + 1),
    ).toISOString(),
    billingCycle: 'halfYearly',
    scheduledPlanChange: null,
    personalPlanId: undefined,
    personalSubscriptionStatus: undefined,
    adminRoleId: 'role_super_admin',
    jobPreference: 'Platform Management',
    phone: '',
    linkedin: '',
    portfolio: '',
    department: undefined,
    course: undefined,
    generatedCvContent: '',
    narratives: { challenges: '', achievements: '', appreciation: '' },
    education: [],
    experience: [],
    projects: [],
    skills: [],
    yearsOfExperience: undefined,
    referralCode: 'ADMINREF',
    referredBy: undefined,
    referralsMade: 0,
    earnedApplicationCredits: 0,
    careerXp: 0,
    usage: {
      aiJobApply: 0,
      aiCvGenerator: 0,
      aiCoverLetterGenerator: 0,
      applications: 0,
    },
    lastApplicationDate: '',
    isEmailLinked: false,
    linkedEmailProvider: '',
    preferredCountry: 'us',
    preferredLanguage: 'en',
    preferredDatePosted: 'all',
    prefersWorkFromHome: false,
    preferredEmploymentTypes: [],
    preferredJobRequirements: [],
    preferredSearchRadius: undefined,
    excludedJobPublishers: '',
    savedCvs: [],
    savedCoverLetters: [],
    autoApplyAgents: [],
    actionItems: [],
  },
  {
    id: 'primary-admin-002',
    fullName: 'Prakhar Waygood',
    email: 'prakhar@waygood.in',
    role: 'PrimaryAdmin',
    createdAt: new Date('2024-01-11T09:00:00Z').toISOString(),
    currentPlanId: 'enterprise_pro',
    subscriptionStartDate: new Date(
      new Date().setFullYear(new Date().getFullYear() - 1),
    ).toISOString(),
    subscriptionEndDate: new Date(
      new Date().setFullYear(new Date().getFullYear() + 1),
    ).toISOString(),
    billingCycle: 'halfYearly',
    scheduledPlanChange: null,
    personalPlanId: undefined,
    personalSubscriptionStatus: undefined,
    adminRoleId: 'role_super_admin',
    jobPreference: 'Platform Management',
    phone: '',
    linkedin: '',
    portfolio: '',
    department: undefined,
    course: undefined,
    generatedCvContent: '',
    narratives: { challenges: '', achievements: '', appreciation: '' },
    education: [],
    experience: [],
    projects: [],
    skills: [],
    yearsOfExperience: undefined,
    referralCode: 'PRAKHAR_ADMIN',
    referredBy: undefined,
    referralsMade: 0,
    earnedApplicationCredits: 0,
    careerXp: 0,
    usage: {
      aiJobApply: 0,
      aiCvGenerator: 0,
      aiCoverLetterGenerator: 0,
      applications: 0,
    },
    lastApplicationDate: '',
    isEmailLinked: false,
    linkedEmailProvider: '',
    preferredCountry: 'us',
    preferredLanguage: 'en',
    preferredDatePosted: 'all',
    prefersWorkFromHome: false,
    preferredEmploymentTypes: [],
    preferredJobRequirements: [],
    preferredSearchRadius: undefined,
    excludedJobPublishers: '',
    savedCvs: [],
    savedCoverLetters: [],
    autoApplyAgents: [],
    actionItems: [],
  },
  {
    id: 'user-admin',
    fullName: 'Admin User',
    email: 'admin@stateu.edu',
    role: 'OrgAdmin',
    createdAt: new Date('2024-02-01T14:00:00Z').toISOString(),
    organizationId: 'org_123_state_university',
    department: 'Career Services',
    course: 'Staff',
    currentPlanId: 'enterprise_pro',
    subscriptionStartDate: new Date(
      new Date().setMonth(new Date().getMonth() - 2),
    ).toISOString(),
    subscriptionEndDate: new Date(
      new Date().setMonth(new Date().getMonth() + 4),
    ).toISOString(),
    billingCycle: 'halfYearly',
    scheduledPlanChange: null,
    personalPlanId: undefined,
    personalSubscriptionStatus: undefined,
    jobPreference: 'Student Success',
    phone: '',
    linkedin: '',
    portfolio: '',
    generatedCvContent: '',
    narratives: { challenges: '', achievements: '', appreciation: '' },
    education: [],
    experience: [],
    projects: [],
    skills: [],
    yearsOfExperience: undefined,
    referralCode: 'ORGADMIN',
    referredBy: undefined,
    referralsMade: 0,
    earnedApplicationCredits: 0,
    careerXp: 0,
    usage: {
      aiJobApply: 0,
      aiCvGenerator: 0,
      aiCoverLetterGenerator: 0,
      applications: 0,
    },
    lastApplicationDate: '',
    isEmailLinked: false,
    linkedEmailProvider: '',
    preferredCountry: 'us',
    preferredLanguage: 'en',
    preferredDatePosted: 'all',
    prefersWorkFromHome: false,
    preferredEmploymentTypes: [],
    preferredJobRequirements: [],
    preferredSearchRadius: undefined,
    excludedJobPublishers: '',
    savedCvs: [],
    savedCoverLetters: [],
    autoApplyAgents: [],
    actionItems: [],
  },
  // Student Users
  {
    id: 'user-2',
    fullName: 'Alice Student',
    email: 'alice@stateu.edu',
    role: 'OrgMember',
    createdAt: new Date('2024-03-05T16:00:00Z').toISOString(),
    organizationId: 'org_123_state_university',
    department: 'Computer Science',
    course: 'B.S. in Computer Science',
    jobPreference: 'UX Designer',
    currentPlanId: 'enterprise_pro',
    personalPlanId: 'platinum',
    personalSubscriptionStatus: 'active',
    subscriptionStartDate: new Date(
      new Date().setMonth(new Date().getMonth() - 1),
    ).toISOString(),
    subscriptionEndDate: new Date(
      new Date().setMonth(new Date().getMonth() + 1),
    ).toISOString(),
    billingCycle: 'monthly',
    scheduledPlanChange: null,
    phone: '',
    linkedin: '',
    portfolio: '',
    generatedCvContent: '',
    narratives: { challenges: '', achievements: '', appreciation: '' },
    education: [],
    experience: [],
    projects: [],
    skills: [],
    yearsOfExperience: undefined,
    referralCode: 'ALICE123',
    referredBy: undefined,
    referralsMade: 0,
    earnedApplicationCredits: 0,
    careerXp: 70,
    usage: {
      aiJobApply: 5,
      aiCvGenerator: 1,
      aiCoverLetterGenerator: 2,
      applications: 5,
    },
    lastApplicationDate: '',
    isEmailLinked: false,
    linkedEmailProvider: '',
    preferredCountry: 'us',
    preferredLanguage: 'en',
    preferredDatePosted: 'all',
    prefersWorkFromHome: false,
    preferredEmploymentTypes: [],
    preferredJobRequirements: [],
    preferredSearchRadius: undefined,
    excludedJobPublishers: '',
    savedCvs: [],
    savedCoverLetters: [],
    autoApplyAgents: [],
    actionItems: [],
  },
  {
    id: 'user-3',
    fullName: 'Bob Scholar',
    email: 'bob@stateu.edu',
    role: 'OrgMember',
    createdAt: new Date('2024-05-25T18:00:00Z').toISOString(),
    organizationId: 'org_123_state_university',
    department: 'Business Administration',
    course: 'MBA',
    jobPreference: 'Data Scientist',
    currentPlanId: 'enterprise_pro',
    personalPlanId: undefined,
    personalSubscriptionStatus: undefined,
    subscriptionStartDate: new Date(
      new Date().setMonth(new Date().getMonth() - 1),
    ).toISOString(),
    subscriptionEndDate: new Date(
      new Date().setMonth(new Date().getMonth() + 1),
    ).toISOString(),
    billingCycle: 'monthly',
    scheduledPlanChange: null,
    phone: '',
    linkedin: '',
    portfolio: '',
    generatedCvContent: '',
    narratives: { challenges: '', achievements: '', appreciation: '' },
    education: [],
    experience: [],
    projects: [],
    skills: [],
    yearsOfExperience: undefined,
    referralCode: 'BOB456',
    referredBy: undefined,
    referralsMade: 0,
    earnedApplicationCredits: 0,
    careerXp: 20,
    usage: {
      aiJobApply: 2,
      aiCvGenerator: 0,
      aiCoverLetterGenerator: 0,
      applications: 2,
    },
    lastApplicationDate: '',
    isEmailLinked: false,
    linkedEmailProvider: '',
    preferredCountry: 'us',
    preferredLanguage: 'en',
    preferredDatePosted: 'all',
    prefersWorkFromHome: false,
    preferredEmploymentTypes: [],
    preferredJobRequirements: [],
    preferredSearchRadius: undefined,
    excludedJobPublishers: '',
    savedCvs: [],
    savedCoverLetters: [],
    autoApplyAgents: [],
    actionItems: [],
  },
  {
    id: 'user-4',
    fullName: 'Charlie Admin',
    email: 'charlie@stateu.edu',
    role: 'OrgAdmin',
    createdAt: new Date('2024-06-01T09:00:00Z').toISOString(),
    organizationId: 'org_123_state_university',
    department: 'Career Services',
    course: 'Staff',
    jobPreference: 'Career Coach',
    currentPlanId: 'enterprise_pro',
    personalPlanId: undefined,
    personalSubscriptionStatus: undefined,
    subscriptionStartDate: new Date(
      new Date().setMonth(new Date().getMonth() - 1),
    ).toISOString(),
    subscriptionEndDate: new Date(
      new Date().setMonth(new Date().getMonth() + 1),
    ).toISOString(),
    billingCycle: 'monthly',
    scheduledPlanChange: null,
    phone: '',
    linkedin: '',
    portfolio: '',
    generatedCvContent: '',
    narratives: { challenges: '', achievements: '', appreciation: '' },
    education: [],
    experience: [],
    projects: [],
    skills: [],
    yearsOfExperience: undefined,
    referralCode: 'CHARLIE789',
    referredBy: undefined,
    referralsMade: 0,
    earnedApplicationCredits: 0,
    careerXp: 0,
    usage: {
      aiJobApply: 0,
      aiCvGenerator: 0,
      aiCoverLetterGenerator: 0,
      applications: 0,
    },
    lastApplicationDate: '',
    isEmailLinked: false,
    linkedEmailProvider: '',
    preferredCountry: 'us',
    preferredLanguage: 'en',
    preferredDatePosted: 'all',
    prefersWorkFromHome: false,
    preferredEmploymentTypes: [],
    preferredJobRequirements: [],
    preferredSearchRadius: undefined,
    excludedJobPublishers: '',
    savedCvs: [],
    savedCoverLetters: [],
    autoApplyAgents: [],
    actionItems: [],
  },
];

const initialMockOrganizations: Organization[] = [
  {
    id: 'org_123_state_university',
    name: 'State University Career Services',
    planId: 'enterprise_pro',
    allowStudentUpgrades: true,
    seats: 100,
    status: 'active',
    betaFeaturesEnabled: false,
    apiKey: 'sk_stateu_1234567890abcdef',
  },
];

declare global {
  var __mockUserProfile: UserProfile | undefined;
  var __mockOrganizations: Organization[] | undefined;
  var __mockUsers: UserProfile[] | undefined;
  var __mockAdminRoles: AdminRole[] | undefined;
}

export let mockUserProfile: UserProfile;
export let mockOrganizations: Organization[];
export let mockUsers: UserProfile[];
export let mockAdminRoles: AdminRole[];

if (process.env.NODE_ENV === 'production') {
  mockUserProfile = { ...initialUserProfile };
  mockOrganizations = [...initialMockOrganizations];
  mockUsers = [...initialMockUsers];
  mockAdminRoles = [...initialAdminRoles];
} else {
  if (!globalThis.__mockUserProfile)
    globalThis.__mockUserProfile = { ...initialUserProfile };
  if (!globalThis.__mockOrganizations)
    globalThis.__mockOrganizations = [...initialMockOrganizations];
  if (!globalThis.__mockUsers) globalThis.__mockUsers = [...initialMockUsers];
  if (!globalThis.__mockAdminRoles)
    globalThis.__mockAdminRoles = [...initialAdminRoles];

  mockUserProfile = globalThis.__mockUserProfile;
  mockOrganizations = globalThis.__mockOrganizations;
  mockUsers = globalThis.__mockUsers;
  mockAdminRoles = globalThis.__mockAdminRoles;
}
