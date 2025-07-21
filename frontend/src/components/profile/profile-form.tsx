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
import { useEffect } from 'react';
import { getProfileRequest } from '@/redux/reducers/authReducer';
import { getStudentDetailsRequest } from '@/redux/reducers/studentReducer';
import { RootState } from '@/redux/rootReducer';

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

const employmentTypes = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
] as const;

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
  onSave?: () => void;
  isSubmitting?: boolean;
  isOnboarding?: boolean;
}

export function ProfileForm({
  onSave,
  isSubmitting,
  isOnboarding = false,
}: ProfileFormProps) {
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

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    fields: eduFields,
    append: appendEdu,
    remove: removeEdu,
  } = useFieldArray({ control: form.control, name: 'education' });
  const {
    fields: expFields,
    append: appendExp,
    remove: removeExp,
  } = useFieldArray({ control: form.control, name: 'experience' });
  const {
    fields: projectFields,
    append: appendProject,
    remove: removeProject,
  } = useFieldArray({ control: form.control, name: 'projects' });

  function onSubmit(data: ProfileFormValues) {
    // Update mockUserProfile for demonstration during session
    mockUserProfile.fullName = data.fullName;
    mockUserProfile.jobPreference = data.jobPreference;

    mockUserProfile.education = (data.education || []).map((edu) => ({
      ...edu,
    }));
    mockUserProfile.experience = (data.experience || []).map((exp) => ({
      ...exp,
      responsibilities: exp.responsibilities
        ? exp.responsibilities.split('\n').filter(Boolean)
        : [],
    }));
    mockUserProfile.projects = (data.projects || []).map((proj) => ({
      ...proj,
    }));
    mockUserProfile.skills = data.skills
      ? data.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    if (data.narrativeChallenges)
      mockUserProfile.narratives.challenges = data.narrativeChallenges;
    if (data.narrativeAchievements)
      mockUserProfile.narratives.achievements = data.narrativeAchievements;
    if (data.narrativeAppreciation)
      mockUserProfile.narratives.appreciation = data.narrativeAppreciation;

    mockUserProfile.preferredCountry = data.preferredCountry;
    mockUserProfile.preferredLanguage = data.preferredLanguage;
    mockUserProfile.preferredDatePosted = data.preferredDatePosted;
    mockUserProfile.prefersWorkFromHome = data.prefersWorkFromHome;
    mockUserProfile.preferredEmploymentTypes = data.preferredEmploymentTypes;
    mockUserProfile.preferredJobRequirements = data.preferredJobRequirements;
    mockUserProfile.preferredSearchRadius = data.preferredSearchRadius;
    mockUserProfile.excludedJobPublishers = data.excludedJobPublishers;

    if (onSave) {
      onSave();
    } else {
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been saved successfully.',
      });
    }
  }

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

  console.log('mockUserProfile', students);
  console.log('defaultValues', defaultValues);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card id="personal-info">
          <CardHeader>
            <CardTitle className="text-xl font-headline">
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your full name"
                      value={defaultValues.fullName}
                      // {...field }
                      readOnly
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
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
                    Your email address is used for login and cannot be changed
                    here.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card id="career-details">
          <CardHeader>
            <CardTitle className="text-xl font-headline">
              Career & CV Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
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
                    This helps us tailor job recommendations and AI assistance.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />
            {/* Education section */}
            <div id="education">
              <h3 className="text-lg font-medium mb-2">Education</h3>
              {eduFields.map((field, index) => (
                <div
                  key={field.id}
                  className="border p-4 mt-2 mb-4 space-y-4 relative rounded-lg"
                >
                  <FormField
                    control={form.control}
                    name={`education.${index}.institution`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Institution</FormLabel>
                        <FormControl>
                          <Input {...f} value={f.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`education.${index}.degree`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Degree</FormLabel>
                        <FormControl>
                          <Input {...f} value={f.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`education.${index}.fieldOfStudy`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Field of Study (Optional)</FormLabel>
                        <FormControl>
                          <Input {...f} value={f.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`education.${index}.country`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select
                            onValueChange={f.onChange}
                            defaultValue={f.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {countries.map((c) => (
                                <SelectItem key={c.code} value={c.name}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`education.${index}.gpa`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>GPA (Optional)</FormLabel>
                          <FormControl>
                            <Input {...f} value={f.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`education.${index}.startDate`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="month" {...f} value={f.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`education.${index}.endDate`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input
                              type="month"
                              placeholder="or 'Present'"
                              {...f}
                              value={f.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeEdu(index)}
                    className="absolute top-2 right-2 h-7 w-7"
                  >
                    <Trash2 className="h-4 w-4" />{' '}
                    <span className="sr-only">Remove Education</span>
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendEdu({
                    institution: '',
                    degree: '',
                    fieldOfStudy: '',
                    country: '',
                    gpa: '',
                    startDate: '',
                    endDate: '',
                  })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Education
              </Button>
            </div>

            <Separator />

            {/* Experience section */}
            <div id="experience">
              <h3 className="text-lg font-medium mb-2">Work Experience</h3>
              {expFields.map((field, index) => (
                <div
                  key={field.id}
                  className="border p-4 mt-2 mb-4 space-y-4 relative rounded-lg"
                >
                  <FormField
                    control={form.control}
                    name={`experience.${index}.company`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input {...f} value={f.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`experience.${index}.jobTitle`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input {...f} value={f.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`experience.${index}.employmentType`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Employment Type</FormLabel>
                          <Select
                            onValueChange={f.onChange}
                            defaultValue={f.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {employmentTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`experience.${index}.location`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Location (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. San Francisco, CA"
                              {...f}
                              value={f.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`experience.${index}.startDate`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="month" {...f} value={f.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`experience.${index}.endDate`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input
                              type="month"
                              placeholder="or 'Present'"
                              {...f}
                              value={f.value ?? ''}
                              disabled={form.watch(
                                `experience.${index}.isCurrent`,
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name={`experience.${index}.isCurrent`}
                    render={({ field: f }) => (
                      <FormItem className="flex flex-row items-center space-x-2 pt-2">
                        <FormControl>
                          <Checkbox
                            checked={f.value}
                            onCheckedChange={(checked) => {
                              f.onChange(checked);
                              form.setValue(
                                `experience.${index}.endDate`,
                                checked ? 'Present' : '',
                              );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          I currently work here
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`experience.${index}.responsibilities`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>
                          Responsibilities / Achievements (Optional)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your key responsibilities. Use separate lines for each point."
                            {...f}
                            value={f.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeExp(index)}
                    className="absolute top-2 right-2 h-7 w-7"
                  >
                    <Trash2 className="h-4 w-4" />{' '}
                    <span className="sr-only">Remove Experience</span>
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendExp({
                    company: '',
                    jobTitle: '',
                    location: '',
                    employmentType: undefined,
                    responsibilities: '',
                    startDate: '',
                    endDate: '',
                    isCurrent: false,
                  })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Experience
              </Button>
            </div>

            <Separator />

            {/* Project / Research Work section */}
            <div id="projects">
              <h3 className="text-lg font-medium mb-2">
                Projects / Research Work
              </h3>
              {projectFields.map((field, index) => (
                <div
                  key={field.id}
                  className="border p-4 mt-2 mb-4 space-y-4 relative rounded-lg"
                >
                  <FormField
                    control={form.control}
                    name={`projects.${index}.name`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., AI-Powered Chatbot"
                            {...f}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`projects.${index}.description`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your project, its goals, and your role."
                            {...f}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`projects.${index}.startDate`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="month" {...f} value={f.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`projects.${index}.endDate`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input
                              type="month"
                              placeholder="or 'Present'"
                              {...f}
                              value={f.value ?? ''}
                              disabled={form.watch(
                                `projects.${index}.isCurrent`,
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name={`projects.${index}.isCurrent`}
                    render={({ field: f }) => (
                      <FormItem className="flex flex-row items-center space-x-2 pt-2">
                        <FormControl>
                          <Checkbox
                            checked={f.value}
                            onCheckedChange={(checked) => {
                              f.onChange(checked);
                              form.setValue(
                                `projects.${index}.endDate`,
                                checked ? 'Present' : '',
                              );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          I am currently working on this
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`projects.${index}.technologies`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Technologies Used (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., React, Python, TensorFlow"
                            {...f}
                            value={f.value ?? ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Comma-separated list of technologies.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`projects.${index}.link`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Project Link (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://github.com/user/project"
                            {...f}
                            value={f.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeProject(index)}
                    className="absolute top-2 right-2 h-7 w-7"
                  >
                    <Trash2 className="h-4 w-4" />{' '}
                    <span className="sr-only">Remove Project</span>
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendProject({
                    name: '',
                    description: '',
                    technologies: '',
                    link: '',
                    startDate: '',
                    endDate: '',
                    isCurrent: false,
                  })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Project
              </Button>
            </div>

            <Separator />

            {/* Skills section */}
            <div id="skills-section">
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., React, Node.js, Project Management"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Comma-separated list of your top skills.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            <FormField
              control={form.control}
              name="narrativeChallenges"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Challenging Situations Overcome</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe a challenging situation you overcame..."
                      className="resize-y min-h-[100px]"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="narrativeAchievements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Significant Achievements</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe a significant achievement..."
                      className="resize-y min-h-[100px]"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="narrativeAppreciation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appreciation Received</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe any appreciation or recognition you received..."
                      className="resize-y min-h-[100px]"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="preferredCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Country</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name} ({country.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Default country for job searches.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferredLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Language</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name} ({lang.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Language for job postings.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="preferredDatePosted"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Job Posting Recency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">Any Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="3days">Last 3 Days</SelectItem>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prefersWorkFromHome"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Prefer Work From Home / Remote Jobs</FormLabel>
                    <FormDescription>
                      Filter for remote opportunities by default.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Preferred Employment Types</FormLabel>
              <FormDescription className="mb-2">
                Select your preferred types of employment.
              </FormDescription>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {employmentTypeOptions.map((option) => (
                  <FormField
                    key={option.id}
                    control={form.control}
                    name="preferredEmploymentTypes"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(option.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([
                                    ...(field.value || []),
                                    option.id,
                                  ])
                                : field.onChange(
                                    (field.value || []).filter(
                                      (value) => value !== option.id,
                                    ),
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {option.label}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </div>

            <div>
              <FormLabel>Preferred Job Requirements</FormLabel>
              <FormDescription className="mb-2">
                Specify your preferred job requirements.
              </FormDescription>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                {jobRequirementOptions.map((option) => (
                  <FormField
                    key={option.id}
                    control={form.control}
                    name="preferredJobRequirements"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(option.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([
                                    ...(field.value || []),
                                    option.id,
                                  ])
                                : field.onChange(
                                    (field.value || []).filter(
                                      (value) => value !== option.id,
                                    ),
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {option.label}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </div>

            <FormField
              control={form.control}
              name="preferredSearchRadius"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Search Radius (km)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 50"
                      {...field}
                      value={field.value === undefined ? '' : field.value}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ''
                            ? undefined
                            : parseInt(e.target.value, 10),
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Default search radius from your location (if specified in
                    search).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="excludedJobPublishers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exclude Job Publishers</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., BeeBee,Dice"
                      className="resize-y min-h-[60px]"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Comma-separated list of job publishers to exclude from
                    searches.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />{' '}
                {isOnboarding ? 'Save & Continue' : 'Save Profile Changes'}
              </>
            )}
          </Button>
        </div>

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
                    <History className="mr-2 h-4 w-4" /> View Application
                    History
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
      </form>
    </Form>
  );
}
