'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Save,
  DollarSign,
  History,
  Settings as SettingsIcon,
  Briefcase,
  PlusCircle,
  Trash2,
  Loader2,
} from 'lucide-react';
import { mockUserProfile } from '@/lib/data/user';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { countries } from '@/lib/data/countries';
import { languages } from '@/lib/data/languages';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { getProfileRequest } from '@/redux/reducers/authReducer';
import { getStudentDetailsRequest } from '@/redux/reducers/studentReducer';
import { RootState } from '@/redux/rootReducer';
import {
  AddEducation,
  AddExperience,
  AddProject,
  AddSkill,
} from './AddEducation';
import { JobPref, Narratives } from './AddProject';

const employmentTypes = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
] as const;

const employmentTypeOptions = [
  { id: 'FULLTIME', label: 'Full-time' },
  { id: 'CONTRACTOR', label: 'Contractor' },
  { id: 'PARTTIME', label: 'Part-time' },
  { id: 'INTERN', label: 'Internship' },
];

const jobRequirementOptions = [
  { id: 'under_3_years_experience', label: 'Under 3 years experience' },
  { id: 'more_than_3_years_experience', label: 'More than 3 years experience' },
  { id: 'no_experience', label: 'No experience required' },
  { id: 'no_degree', label: 'No degree required' },
];

const educationEntrySchema = z.object({
  institution: z.string().min(1, 'Institution name is required'),
  degree: z.string().min(1, 'Degree is required'),
  fieldOfStudy: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  gpa: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
});

const experienceEntrySchema = z
  .object({
    company: z.string().min(1, 'Company name is required'),
    jobTitle: z.string().min(1, 'Job title is required'),
    employmentType: z.enum(employmentTypes).optional(),
    location: z.string().optional(),
    isCurrent: z.boolean().default(false).optional(),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    responsibilities: z.string().optional(),
  })
  .refine(
    (data) => data.isCurrent || (!!data.endDate && data.endDate.length > 0),
    {
      message: 'End date is required for past jobs.',
      path: ['endDate'],
    },
  );

const projectEntrySchema = z
  .object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().min(1, 'Project description is required'),
    technologies: z.string().optional(),
    link: z
      .string()
      .url({ message: 'Please enter a valid URL.' })
      .or(z.literal(''))
      .optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isCurrent: z.boolean().default(false).optional(),
  })
  .refine(
    (data) => data.isCurrent || (!!data.endDate && data.endDate.length > 0),
    {
      message: 'End date is required for past projects.',
      path: ['endDate'],
    },
  );

const profileFormSchema = z.object({
  fullName: z.string().min(2, {
    message: 'Full name must be at least 2 characters.',
  }),
  email: z.string().email(),
  jobPreference: z.string().min(2, {
    message: 'Job preference must be at least 2 characters.',
  }),

  // Rich profile data
  education: z.array(educationEntrySchema).optional(),
  experience: z.array(experienceEntrySchema).optional(),
  projects: z.array(projectEntrySchema).optional(),
  skills: z.string().optional(),

  // Narratives
  narrativeChallenges: z.string().optional(),
  narrativeAchievements: z.string().optional(),
  narrativeAppreciation: z.string().optional(),

  // Job Search Preferences
  preferredCountry: z.string().optional(),
  preferredLanguage: z.string().optional(),
  preferredDatePosted: z
    .enum(['all', 'today', '3days', 'week', 'month'])
    .optional(),
  prefersWorkFromHome: z.boolean().optional(),
  preferredEmploymentTypes: z.array(z.string()).optional(),
  preferredJobRequirements: z.array(z.string()).optional(),
  preferredSearchRadius: z.preprocess(
    (val) =>
      val === '' ||
      val === null ||
      val === undefined ||
      Number.isNaN(Number(val))
        ? undefined
        : Number(val),
    z.number().min(0, 'Radius must be positive').optional(),
  ),
  excludedJobPublishers: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  isOnboarding?: boolean;
}

export function ProfileForm({ isOnboarding = false }: ProfileFormProps) {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { students, loading, error } = useSelector(
    (state: RootState) => state.student,
  );

  const defaultValues: ProfileFormValues = {
    fullName: students.fullName,
    email: students.email,
    jobPreference: students.jobRole,
    education: (students.education || []).map((edu) => ({
      institution: edu.institution || '',
      degree: edu.degree || '',
      fieldOfStudy: edu.fieldOfStudy || '',
      // country: edu.country || '',
      gpa: edu.grade || '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || '',
    })),
    experience: (mockUserProfile.experience || []).map((exp) => ({
      company: exp.company || '',
      jobTitle: exp.jobTitle || '',
      employmentType: exp.employmentType,
      location: exp.location || '',
      responsibilities: (exp.responsibilities || []).join('\n'),
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      isCurrent: exp.endDate?.toLowerCase() === 'present',
    })),
    projects: (mockUserProfile.projects || []).map((proj) => ({
      name: proj.name || '',
      description: proj.description || '',
      technologies: proj.technologies || '',
      link: proj.link || '',
      startDate: proj.startDate || '',
      endDate: proj.endDate || '',
      isCurrent: proj.isCurrent || false,
    })),
    skills: (mockUserProfile.skills || []).join(', '),
    // Narratives
    narrativeChallenges: mockUserProfile.narratives.challenges,
    narrativeAchievements: mockUserProfile.narratives.achievements,
    narrativeAppreciation: mockUserProfile.narratives.appreciation,
    // Job Search Preferences
    preferredCountry: mockUserProfile.preferredCountry || 'US',
    preferredLanguage: mockUserProfile.preferredLanguage || 'en',
    preferredDatePosted: mockUserProfile.preferredDatePosted || 'all',
    prefersWorkFromHome: mockUserProfile.prefersWorkFromHome || false,
    preferredEmploymentTypes: mockUserProfile.preferredEmploymentTypes || [],
    preferredJobRequirements: mockUserProfile.preferredJobRequirements || [],
    preferredSearchRadius:
      mockUserProfile.preferredSearchRadius === undefined
        ? undefined
        : mockUserProfile.preferredSearchRadius,
    excludedJobPublishers: mockUserProfile.excludedJobPublishers || '',
  };

  const [addExp, setAddExp] = useState(false);
  const [addProj, setAddProj] = useState(false);
  const [addEdu, setAddEdu] = useState(false);
  const [addSkill, setAddSkill] = useState(false);

  // Personal Info Form
  const personalInfoForm = useForm<
    Pick<ProfileFormValues, 'fullName' | 'email'>
  >({
    resolver: zodResolver(
      profileFormSchema.pick({ fullName: true, email: true }),
    ),
    defaultValues: {
      fullName: defaultValues.fullName,
      email: defaultValues.email,
    },
    mode: 'onChange',
  });

  // Career Details Form
  const careerDetailsForm = useForm<
    Pick<ProfileFormValues, 'jobPreference' | 'skills'>
  >({
    resolver: zodResolver(
      profileFormSchema.pick({ jobPreference: true, skills: true }),
    ),
    defaultValues: {
      jobPreference: defaultValues.jobPreference,
      skills: defaultValues.skills,
    },
    mode: 'onChange',
  });

  const educationForm = useForm<{ education: ProfileFormValues['education'] }>({
    resolver: zodResolver(
      z.object({ education: z.array(educationEntrySchema) }),
    ),
    defaultValues: {
      education: defaultValues.education || [],
    },
    mode: 'onChange',
  });

  // Narratives Form
  const narrativesForm = useForm<
    Pick<
      ProfileFormValues,
      'narrativeChallenges' | 'narrativeAchievements' | 'narrativeAppreciation'
    >
  >({
    resolver: zodResolver(
      profileFormSchema.pick({
        narrativeChallenges: true,
        narrativeAchievements: true,
        narrativeAppreciation: true,
      }),
    ),
    defaultValues: {
      narrativeChallenges: defaultValues.narrativeChallenges,
      narrativeAchievements: defaultValues.narrativeAchievements,
      narrativeAppreciation: defaultValues.narrativeAppreciation,
    },
    mode: 'onChange',
  });

  // Job Search Preferences Form
  const jobSearchForm = useForm<
    Pick<
      ProfileFormValues,
      | 'preferredCountry'
      | 'preferredLanguage'
      | 'preferredDatePosted'
      | 'prefersWorkFromHome'
      | 'preferredEmploymentTypes'
      | 'preferredJobRequirements'
      | 'preferredSearchRadius'
      | 'excludedJobPublishers'
    >
  >({
    resolver: zodResolver(
      profileFormSchema.pick({
        preferredCountry: true,
        preferredLanguage: true,
        preferredDatePosted: true,
        prefersWorkFromHome: true,
        preferredEmploymentTypes: true,
        preferredJobRequirements: true,
        preferredSearchRadius: true,
        excludedJobPublishers: true,
      }),
    ),
    defaultValues: {
      preferredCountry: defaultValues.preferredCountry,
      preferredLanguage: defaultValues.preferredLanguage,
      preferredDatePosted: defaultValues.preferredDatePosted,
      prefersWorkFromHome: defaultValues.prefersWorkFromHome,
      preferredEmploymentTypes: defaultValues.preferredEmploymentTypes,
      preferredJobRequirements: defaultValues.preferredJobRequirements,
      preferredSearchRadius: defaultValues.preferredSearchRadius,
      excludedJobPublishers: defaultValues.excludedJobPublishers,
    },
    mode: 'onChange',
  });

  // Handlers for each form submission
  const handlePersonalInfoSubmit = (
    data: Pick<ProfileFormValues, 'fullName' | 'email'>,
  ) => {
    // Call API for personal info update
    console.log('Personal Info:', data);
    toast({
      title: 'Personal Information Updated',
      description: 'Your personal information has been saved successfully.',
    });
  };

  const handleCareerDetailsSubmit = (
    data: Pick<ProfileFormValues, 'jobPreference' | 'skills'>,
  ) => {
    // Call API for career details update
    console.log('Career Details:', data);
    toast({
      title: 'Career Details Updated',
      description: 'Your career details have been saved successfully.',
    });
  };

  const handleNarrativesSubmit = (
    data: Pick<
      ProfileFormValues,
      'narrativeChallenges' | 'narrativeAchievements' | 'narrativeAppreciation'
    >,
  ) => {
    // Call API for narratives update
    console.log('Narratives:', data);
    toast({
      title: 'Narratives Updated',
      description: 'Your narratives have been saved successfully.',
    });
  };

  const handleJobSearchSubmit = (
    data: Pick<
      ProfileFormValues,
      | 'preferredCountry'
      | 'preferredLanguage'
      | 'preferredDatePosted'
      | 'prefersWorkFromHome'
      | 'preferredEmploymentTypes'
      | 'preferredJobRequirements'
      | 'preferredSearchRadius'
      | 'excludedJobPublishers'
    >,
  ) => {
    // Call API for job search preferences update
    console.log('Job Search Preferences:', data);
    toast({
      title: 'Job Search Preferences Updated',
      description: 'Your job search preferences have been saved successfully.',
    });
  };

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        dispatch(getStudentDetailsRequest());
      } catch (error) {
        console.error('Error fetching student details:', error);
      }
    };

    fetchStudentDetails();
  }, [dispatch]);

  const onCancel = () => {
    setAddEdu(false);
  };

  return (
    <div className="space-y-6">
      {/* Personal Information Card */}
      <Card id="personal-info">
        <CardHeader>
          <CardTitle className="text-xl font-headline">
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...personalInfoForm}>
            <form
              onSubmit={personalInfoForm.handleSubmit(handlePersonalInfoSubmit)}
            >
              <div className="space-y-4">
                <FormField
                  control={personalInfoForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your full name"
                          value={defaultValues.fullName}
                          readOnly
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={personalInfoForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
                          value={defaultValues.email}
                          readOnly
                        />
                      </FormControl>
                      <FormDescription>
                        Your email address is used for login and cannot be
                        changed here.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="sm">
                  <Save className="mr-2 h-4 w-4" /> Save Personal Info
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Career Details Card */}
      <Card id="career-details">
        <CardHeader>
          <CardTitle className="text-xl font-headline">
            Career & CV Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...careerDetailsForm}>
            <form
              onSubmit={careerDetailsForm.handleSubmit(
                handleCareerDetailsSubmit,
              )}
            >
              <div className="space-y-4">
                <FormField
                  control={careerDetailsForm.control}
                  name="jobPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Job Role You're Seeking</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Software Engineer, Product Manager"
                          value={defaultValues.jobPreference}
                          readOnly
                        />
                      </FormControl>
                      <FormDescription>
                        This helps us tailor job recommendations and AI
                        assistance.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>

          <Separator />

          {/* Experience section */}
          <div id="education">
            <h3 className="text-lg font-medium mb-2">Educations</h3>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddEdu(true)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Educations
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Project / Research Work section */}
          <div id="projects">
            <h3 className="text-lg font-medium mb-2">Projects</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddProj(true)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Project
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div id="experience">
            <h3 className="text-lg font-medium mb-2">Experiences</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddExp(true)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Experience
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div id="skills">
            <h3 className="text-lg font-medium mb-2">Skills</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddSkill(true)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Skills
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="narratives">
        <CardHeader>
          <CardTitle className="text-xl font-headline">
            Personalize Your AI Documents
          </CardTitle>
          <CardDescription>
            Share key experiences to help the AI tailor your CV and cover
            letters more effectively, making them unique to you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Narratives
            narrativesForm={narrativesForm}
            handleNarrativesSubmit={handleNarrativesSubmit}
          />
        </CardContent>
      </Card>

      <Card id="search-prefs">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Job Search Preferences
          </CardTitle>
          <CardDescription>
            Configure your default preferences for job searching.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <JobPref
            jobSearchForm={jobSearchForm}
            handleJobSearchSubmit={handleJobSearchSubmit}
          />
        </CardContent>
      </Card>

      {!isOnboarding && (
        <>
          <Separator />
          <div>
            <h3 className="text-lg font-medium mb-3 font-headline">
              Account Management
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="outline" asChild>
                <Link href="/subscriptions">
                  <DollarSign className="mr-2 h-4 w-4" /> Manage Subscription
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/applications">
                  <History className="mr-2 h-4 w-4" /> View Application History
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/settings">
                  <SettingsIcon className="mr-2 h-4 w-4" /> Account Settings
                </Link>
              </Button>
            </div>
          </div>
        </>
      )}

      {addEdu && (
        <div className="w-full h-full z-[999] fixed top-0 left-0 bg-black bg-opacity-50">
          <div className="w-full max-w-3xl md:h-full max-h-[80vh] overflow-y-auto z-[1000] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg">
            <AddEducation onCancel={() => setAddEdu(false)} />
          </div>
        </div>
      )}

      {addProj && (
        <div className="w-full h-full z-[999] fixed top-0 left-0 bg-black bg-opacity-50">
          <div className="w-full max-w-3xl md:h-full max-h-[80vh] overflow-y-auto z-[1000] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg">
            <AddProject onCancel={() => setAddProj(false)} />
          </div>
        </div>
      )}

      {addExp && (
        <div className="w-full h-full z-[999] fixed top-0 left-0 bg-black bg-opacity-50">
          <div className="w-full max-w-3xl md:h-full max-h-[80vh] overflow-y-auto z-[1000] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg">
            <AddExperience onCancel={() => setAddExp(false)} />
          </div>
        </div>
      )}

      {addSkill && (
        <div className="w-full h-full z-[999] fixed top-0 left-0 bg-black bg-opacity-50">
          <div className="w-full max-w-3xl overflow-y-auto z-[1000] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg">
            <AddSkill onCancel={() => setAddSkill(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
