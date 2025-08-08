import React from 'react';
import {
  Card,
  CardContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { mockUserProfile } from '@/lib/data/user';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';

const CoverLetterWizard = ({
  form,
  setWizardStep,
  handleGoToNextStep,
}: any) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 3: Set Cover Letter Strategy (Optional)</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="coverLetterSettings.strategy"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value ?? 'generate'}
                  className="space-y-2"
                >
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="generate" />
                    </FormControl>
                    <Label className="font-normal">
                      Let AI generate it from scratch for each job.
                    </Label>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="use_template" />
                    </FormControl>
                    <Label className="font-normal">
                      Use one of my saved cover letters as a template.
                    </Label>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.watch('coverLetterSettings.strategy') === 'use_template' && (
          <FormField
            control={form.control}
            name="coverLetterSettings.templateId"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>
                  Select Template <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a saved cover letter" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mockUserProfile.savedCoverLetters.map((cl) => (
                      <SelectItem key={cl.id} value={cl.id}>
                        {cl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {mockUserProfile.savedCoverLetters.length === 0 && (
                  <p className="text-xs text-muted-foreground pt-2">
                    No saved cover letters available.
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="coverLetterSettings.instructions"
          render={({ field }) => (
            <FormItem className="mt-4">
              <FormLabel>Specific Instructions (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Always mention my passion for sustainable technology."
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setWizardStep('cv')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          onClick={() =>
            handleGoToNextStep('coverLetter', ['coverLetterSettings'])
          }
        >
          Next: Final Config <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CoverLetterWizard;
