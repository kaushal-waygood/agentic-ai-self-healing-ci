import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Select, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { SelectContent } from '@radix-ui/react-select';
import { countries } from '@/lib/data/countries';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

const employmentTypeOptions = [
  { id: 'FULLTIME', label: 'Full-time' },
  { id: 'CONTRACTOR', label: 'Contractor' },
  { id: 'PARTTIME', label: 'Part-time' },
  { id: 'INTERN', label: 'Internship' },
];

const FilterWizard = ({
  form,
  errors,
  isFiltersStepValid,
  handleGoToNextStep,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 1: Agent Name & Job Filters</CardTitle>
        <CardDescription>
          Give your agent a name and define your ideal job. Fields marked with{' '}
          <span className="text-destructive">*</span> are required.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Agent Name <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Senior Product Manager Roles"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Separator />
        <FormField
          control={form.control}
          name="jobFilters.query"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Job Title / Keywords <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Senior Product Manager"
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
          name="jobFilters.country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Country <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ''}>
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
        <FormField
          control={form.control}
          name="jobFilters.workFromHome"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <Label className="font-normal">
                Remote / Work from home only
              </Label>
            </FormItem>
          )}
        />
        <div>
          <FormLabel>
            Employment Types <span className="text-destructive">*</span>
          </FormLabel>
          {employmentTypeOptions.map((item) => (
            <FormField
              key={item.id}
              control={form.control}
              name="jobFilters.employmentTypes"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 mt-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value?.includes(item.id)}
                      onCheckedChange={(checked) => {
                        return checked
                          ? field.onChange([...(field.value || []), item.id])
                          : field.onChange(
                              (field.value || []).filter((v) => v !== item.id),
                            );
                      }}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">{item.label}</FormLabel>
                </FormItem>
              )}
            />
          ))}{' '}
          <FormMessage className="pt-2">
            {errors.jobFilters?.employmentTypes?.message}
          </FormMessage>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            editingAgent ? setView('dashboard') : setWizardStep('intro')
          }
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          onClick={() =>
            handleGoToNextStep('filters', [
              'name',
              'jobFilters.query',
              'jobFilters.country',
              'jobFilters.employmentTypes',
            ])
          }
          disabled={!isFiltersStepValid}
        >
          Next: Select CV <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FilterWizard;
