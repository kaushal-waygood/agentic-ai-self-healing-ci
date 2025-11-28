'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  JobSearchFlowInput,
  JobSearchFlowInputSchema,
} from '@/lib/schemas/job-search-schema';
import { Loader2, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { countries } from '@/lib/data/countries';

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

export function JobSearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSearching, setIsSearching] = useState(false);

  const form = useForm<JobSearchFlowInput>({
    resolver: zodResolver(JobSearchFlowInputSchema),
    defaultValues: {
      query: searchParams.get('query'),
      country: searchParams.get('country'),
      state: searchParams.get('state'),
      datePosted: (searchParams.get('datePosted') as any) || 'all',
      workFromHome: searchParams.get('workFromHome') === 'true' || false,
      employmentTypes: searchParams.getAll('employmentTypes') || [],
      jobRequirements: searchParams.getAll('jobRequirements') || [],
      radius: searchParams.get('radius')
        ? parseInt(searchParams.get('radius')!)
        : undefined,
    },
  });

  // Effect to reset the form when URL search params change
  useEffect(() => {
    form.reset({
      query: searchParams.get('query') || 'developer jobs in new york',
      country: searchParams.get('country'),
      state: searchParams.get('state'),
      datePosted: (searchParams.get('datePosted') as any) || 'all',
      workFromHome: searchParams.get('workFromHome') === 'true' || false,
      employmentTypes: searchParams.getAll('employmentTypes') || [],
      jobRequirements: searchParams.getAll('jobRequirements') || [],
      radius: searchParams.get('radius')
        ? parseInt(searchParams.get('radius')!)
        : undefined,
    });
    setIsSearching(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function onSubmit(data: JobSearchFlowInput) {
    setIsSearching(true);
    const params = new URLSearchParams();

    // Append values to params only if they are not null, undefined, or empty
    if (data.query) params.append('query', data.query);
    if (data.country) params.append('country', data.country);
    if (data.state) params.append('state', data.state);
    if (data.datePosted) params.append('datePosted', data.datePosted);
    if (data.workFromHome) params.append('workFromHome', 'true');
    if (data.radius) params.append('radius', data.radius.toString());

    data.employmentTypes?.forEach((type) =>
      params.append('employmentTypes', type),
    );
    data.jobRequirements?.forEach((req) =>
      params.append('jobRequirements', req),
    );

    router.push(`/search-jobs?${params.toString()}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search for Jobs</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Query</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., software engineer in san francisco"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
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
                      {countries.map((c) => (
                        <SelectItem key={c.code} value={c.code.toLowerCase()}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="datePosted"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Posted</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">Any time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="3days">Last 3 days</SelectItem>
                        <SelectItem value="week">Last week</SelectItem>
                        <SelectItem value="month">Last month</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="radius"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Search Radius (km)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 50"
                        {...field}
                        value={field.value ?? ''} // Prevents uncontrolled -> controlled switch
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          field.onChange(isNaN(val) ? undefined : val); // Store NaN as undefined
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="workFromHome"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Work from home / Remote</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FormLabel>Employment Types</FormLabel>
                {employmentTypeOptions.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="employmentTypes"
                    render={({ field }) => (
                      <FormItem
                        key={item.id}
                        className="flex flex-row items-start space-x-3 space-y-0 mt-2"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([
                                    ...(field.value || []),
                                    item.id,
                                  ])
                                : field.onChange(
                                    (field.value || []).filter(
                                      (value) => value !== item.id,
                                    ),
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <div>
                <FormLabel>Job Requirements</FormLabel>
                {jobRequirementOptions.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="jobRequirements"
                    render={({ field }) => (
                      <FormItem
                        key={item.id}
                        className="flex flex-row items-start space-x-3 space-y-0 mt-2"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([
                                    ...(field.value || []),
                                    item.id,
                                  ])
                                : field.onChange(
                                    (field.value || []).filter(
                                      (value) => value !== item.id,
                                    ),
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSearching}
              className="w-full md:w-auto"
            >
              {isSearching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Search Jobs
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
