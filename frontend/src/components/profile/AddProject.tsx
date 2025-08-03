import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import {
  getStudentDetailsRequest,
  updateStudentJobPreferenceRequest,
} from '@/redux/reducers/studentReducer';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { JobPreferencesSchema } from '@/lib/schemas/job-search-schema';

const experienceLevels = [
  { id: 'ENTRY_LEVEL', label: 'Entry Level' },
  { id: 'MID_LEVEL', label: 'Mid Level' },
  { id: 'SENIOR', label: 'Senior Level' },
  { id: 'EXECUTIVE', label: 'Executive' },
  { id: 'NONE', label: 'None' },
];

const jobTypes = [
  { id: 'FULL_TIME', label: 'Full-time' },
  { id: 'PART_TIME', label: 'Part-time' },
  { id: 'CONTRACT', label: 'Contract' },
  { id: 'TEMPORARY', label: 'Temporary' },
  { id: 'INTERNSHIP', label: 'Internship' },
  { id: 'FREELANCE', label: 'Freelance' },
];

const companySizes = [
  { id: 'small', label: 'Small (1-50 employees)' },
  { id: 'medium', label: 'Medium (51-500 employees)' },
  { id: 'large', label: 'Large (501-1000 employees)' },
  { id: 'enterprise', label: 'Enterprise (1000+ employees)' },
];

const companyCultures = [
  { id: 'startup', label: 'Startup' },
  { id: 'tech', label: 'Tech-focused' },
  { id: 'corporate', label: 'Corporate' },
  { id: 'nonprofit', label: 'Non-profit' },
  { id: 'remote-first', label: 'Remote-first' },
];

const educationLevels = [
  { id: 'high_school', label: 'High School' },
  { id: 'associate', label: 'Associate Degree' },
  { id: 'bachelor', label: "Bachelor's Degree" },
  { id: 'master', label: "Master's Degree" },
  { id: 'phd', label: 'PhD' },
  { id: 'none', label: 'No Formal Education Required' },
];

export const JobPref = () => {
  const [formData, setFormData] = useState(null);
  const {
    students: student,
    loading,
    error,
  } = useSelector((state: RootState) => state.student);
  const dispatch = useDispatch();

  const form = useForm({
    resolver: zodResolver(JobPreferencesSchema),
    defaultValues: {
      preferedCountries: student?.jobPreferences?.preferedCountries || [],
      preferedCities: student?.jobPreferences?.preferedCities || [],
      isRemote: student?.jobPreferences?.isRemote || false,
      relocationWillingness:
        student?.jobPreferences?.relocationWillingness || '',
      preferedJobTitles: student?.jobPreferences?.preferedJobTitles || [],
      preferedJobTypes: student?.jobPreferences?.preferedJobTypes || [],
      preferedIndustries: student?.jobPreferences?.preferedIndustries || [],
      preferedExperienceLevel:
        student?.jobPreferences?.preferedExperienceLevel || '',
      preferedSalary: student?.jobPreferences?.preferedSalary || '',
      mustHaveSkills: student?.jobPreferences?.mustHaveSkills || [],
      niceToHaveSkills: [],
      preferedCertifications: [],
      preferedEducationLevel: '',
      preferedCompanySizes: [],
      preferedCompanyCultures: [],
      visaSponsorshipRequired: false,
      immediateAvailability: false,
    },
  });

  useEffect(() => {
    dispatch(getStudentDetailsRequest());
  }, [dispatch]);

  useEffect(() => {
    if (student?.jobPreferences) {
      const { jobPreferences } = student;
      form.reset({
        preferedCountries: jobPreferences.preferedCountries || [],
        preferedCities: jobPreferences.preferedCities || [],
        isRemote: jobPreferences.isRemote || false,
        relocationWillingness: jobPreferences.relocationWillingness || '',
        preferedJobTitles: jobPreferences.preferedJobTitles || [],
        preferedJobTypes: jobPreferences.preferedJobTypes || [],
        preferedIndustries: jobPreferences.preferedIndustries || [],
        preferedExperienceLevel: jobPreferences.preferedExperienceLevel || '',
        preferedSalary: jobPreferences.preferedSalary || '',
        mustHaveSkills: jobPreferences.mustHaveSkills || [],
        niceToHaveSkills: jobPreferences.niceToHaveSkills || [],
        preferedCertifications: jobPreferences.preferedCertifications || [],
        preferedEducationLevel: jobPreferences.preferedEducationLevel || '',
        preferedCompanySizes: jobPreferences.preferedCompanySizes || [],
        preferedCompanyCultures: jobPreferences.preferedCompanyCultures || [],
        visaSponsorshipRequired:
          jobPreferences.visaSponsorshipRequired || false,
        immediateAvailability: jobPreferences.immediateAvailability || false,
      });
    }
  }, [student, form]);

  const onSubmit = (data: any) => {
    try {
      dispatch(updateStudentJobPreferenceRequest(data));
    } catch (error) {
      console.error('SUBMISSION FAILED:', error);
    }
  };

  const onInvalid = (errors: any) => {
    console.log('INVALID SUBMISSION:', errors);
  };

  if (loading && !student) {
    return <div>Loading...</div>;
  }

  if (error) {
    console.log('error', error);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="space-y-6"
        noValidate // Remove if you want browser validation
      >
        {/* Location Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Location Preferences</h3>

          <FormField
            control={form.control}
            name="preferedCountries"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Countries</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter comma-separated country names"
                    className="resize-y min-h-[60px]"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormDescription>
                  Countries where you'd like to work
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferedCities"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Cities</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter comma-separated city names"
                    className="resize-y min-h-[60px]"
                    value={field.value?.join(', ') || ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          .split(',')
                          .map((item) => item.trim())
                          .filter((item) => item),
                      )
                    }
                  />
                </FormControl>
                <FormDescription>
                  Specific cities you're targeting
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isRemote"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Remote Work Only</FormLabel>
                  <FormDescription>
                    Only consider remote work opportunities
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

          <FormField
            control={form.control}
            name="relocationWillingness"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Willingness to Relocate</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your willingness to relocate" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="not-willing">
                      Not willing to relocate
                    </SelectItem>
                    <SelectItem value="open">Open to relocation</SelectItem>
                    <SelectItem value="very-willing">
                      Very willing to relocate
                    </SelectItem>
                    <SelectItem value="seeking">
                      Actively seeking relocation
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Job Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Job Details</h3>

          <FormField
            control={form.control}
            name="preferedJobTitles"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Job Titles</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter comma-separated job titles"
                    className="resize-y min-h-[60px]"
                    value={field.value?.join(', ') || ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          .split(',')
                          .map((item) => item.trim())
                          .filter((item) => item),
                      )
                    }
                  />
                </FormControl>
                <FormDescription>
                  Titles of positions you're interested in
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferedJobTypes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Job Types</FormLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {jobTypes.map((type) => (
                    <FormField
                      key={type.id}
                      control={form.control}
                      name="preferedJobTypes"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(type.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([
                                      ...(field.value || []),
                                      type.id,
                                    ])
                                  : field.onChange(
                                      (field.value || []).filter(
                                        (value) => value !== type.id,
                                      ),
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {type.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferedIndustries"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Industries</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter comma-separated industries"
                    className="resize-y min-h-[60px]"
                    value={field.value?.join(', ') || ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          .split(',')
                          .map((item) => item.trim())
                          .filter((item) => item),
                      )
                    }
                  />
                </FormControl>
                <FormDescription>
                  Industries you're interested in working in
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferedExperienceLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Experience Level</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select preferred experience level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Compensation */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Compensation</h3>

          <FormField
            control={form.control}
            name="preferredSalary"
            render={({ field }) => {
              const { value, onChange } = field;

              const updateField = (key: string, newValue: any) => {
                onChange({ ...value, [key]: newValue });
              };

              return (
                <FormItem className="space-y-2">
                  <FormLabel>Expected Salary Range (MIN.)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 50000"
                      value={value?.min || ''}
                      onChange={(e) =>
                        updateField('min', Number(e.target.value))
                      }
                      type="number"
                    />
                  </FormControl>

                  <FormLabel>Expected Salary Range (MAX.)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 60000"
                      value={value?.max || ''}
                      onChange={(e) =>
                        updateField('max', Number(e.target.value))
                      }
                      type="number"
                    />
                  </FormControl>

                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <select
                      className="input"
                      value={value?.currency || ''}
                      onChange={(e) => updateField('currency', e.target.value)}
                    >
                      <option value="">Select currency</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="INR">INR</option>
                      {/* Add more as needed */}
                    </select>
                  </FormControl>

                  <FormLabel>Salary Period</FormLabel>
                  <FormControl>
                    <select
                      className="input"
                      value={value?.period || ''}
                      onChange={(e) => updateField('period', e.target.value)}
                    >
                      <option value="">Select period</option>
                      <option value="YEAR">Yearly</option>
                      <option value="MONTH">Monthly</option>
                      <option value="WEEK">Weekly</option>
                    </select>
                  </FormControl>

                  <FormDescription>
                    Your expected salary range (in local currency per selected
                    period)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        {/* Skills & Education */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Skills & Education</h3>

          <FormField
            control={form.control}
            name="mustHaveSkills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Must-have Skills</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter comma-separated skills with level (e.g., 'JavaScript:expert, Python:intermediate')"
                    className="resize-y min-h-[80px]"
                    onChange={(e) => {
                      field.onChange(e.target.value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Skills you must use in your next role
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="niceToHaveSkills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nice-to-have Skills</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter comma-separated skills"
                    className="resize-y min-h-[60px]"
                    value={field.value?.join(', ') || ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          .split(',')
                          .map((item) => item.trim())
                          .filter((item) => item),
                      )
                    }
                  />
                </FormControl>
                <FormDescription>
                  Skills you'd like to use but aren't required
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferedCertifications"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Certifications</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter comma-separated certifications"
                    className="resize-y min-h-[60px]"
                    value={field.value?.join(', ') || ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          .split(',')
                          .map((item) => item.trim())
                          .filter((item) => item),
                      )
                    }
                  />
                </FormControl>
                <FormDescription>
                  Certifications you have or are working towards
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferedEducationLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Education Level</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {educationLevels.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Company Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Company Preferences</h3>

          <FormField
            control={form.control}
            name="preferedCompanySizes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Company Sizes</FormLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {companySizes.map((size) => (
                    <FormField
                      key={size.id}
                      control={form.control}
                      name="preferedCompanySizes"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(size.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([
                                      ...(field.value || []),
                                      size.id,
                                    ])
                                  : field.onChange(
                                      (field.value || []).filter(
                                        (value) => value !== size.id,
                                      ),
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {size.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferedCompanyCultures"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Company Cultures</FormLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {companyCultures.map((culture) => (
                    <FormField
                      key={culture.id}
                      control={form.control}
                      name="preferedCompanyCultures"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(culture.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([
                                      ...(field.value || []),
                                      culture.id,
                                    ])
                                  : field.onChange(
                                      (field.value || []).filter(
                                        (value) => value !== culture.id,
                                      ),
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {culture.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Additional Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Additional Preferences</h3>

          <FormField
            control={form.control}
            name="visaSponsorshipRequired"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Visa Sponsorship Required</FormLabel>
                  <FormDescription>
                    Do you require visa sponsorship?
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

          <FormField
            control={form.control}
            name="immediateAvailability"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Immediate Availability</FormLabel>
                  <FormDescription>
                    Are you available to start immediately?
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
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            onClick={() => console.log('Submit button clicked')} // Debug click
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

interface narrativProps {
  narrativesForm: any;
  handleNarrativesSubmit: any;
}

export const Narratives = ({
  narrativesForm,
  handleNarrativesSubmit,
}: narrativProps) => {
  return (
    <Form {...narrativesForm}>
      <form onSubmit={narrativesForm.handleSubmit(handleNarrativesSubmit)}>
        <div className="space-y-4">
          <FormField
            control={narrativesForm.control}
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
            control={narrativesForm.control}
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
            control={narrativesForm.control}
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
        </div>
      </form>
    </Form>
  );
};
