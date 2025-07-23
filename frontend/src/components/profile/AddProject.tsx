import React from 'react';
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
import { countries } from '@/lib/data/countries';
import { languages } from '@/lib/data/languages';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';

interface narrativProps {
  narrativesForm: any;
  handleNarrativesSubmit: any;
}

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

interface jobPrefProps {
  jobSearchForm: any;
  handleJobSearchSubmit: any;
}

export const JobPref = ({ jobSearchForm, handleJobSearchSubmit }: any) => {
  return (
    <Form {...jobSearchForm}>
      <form onSubmit={jobSearchForm.handleSubmit(handleJobSearchSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={jobSearchForm.control}
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
            control={jobSearchForm.control}
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
                <FormDescription>Language for job postings.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={jobSearchForm.control}
          name="preferredDatePosted"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Job Posting Recency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          control={jobSearchForm.control}
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
                control={jobSearchForm.control}
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
                                  (value: string) => value !== option.id,
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
                control={jobSearchForm.control}
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
          control={jobSearchForm.control}
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
          control={jobSearchForm.control}
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
                Comma-separated list of job publishers to exclude from searches.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit button added here */}
        <div className="mt-6 flex justify-end">
          <Button type="submit" className="w-full sm:w-auto">
            Save Preferences
          </Button>
        </div>
      </form>
    </Form>
  );
};
