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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';

const ConfigWizard = ({ form, currentPlan, setWizardStep, isLoading }: any) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 4: Configure and Save</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="dailyLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Max Applications to Prepare per Day{' '}
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max={
                    currentPlan?.limits.autoApplyDailyLimit === -1
                      ? 50
                      : currentPlan?.limits.autoApplyDailyLimit
                  }
                  {...field}
                  value={field.value ?? 5}
                />
              </FormControl>
              <FormDescription>
                Your plan supports up to{' '}
                {currentPlan?.limits.autoApplyDailyLimit === -1
                  ? '50 (recommended max)'
                  : currentPlan?.limits.autoApplyDailyLimit}{' '}
                per day. The agent will stop once this limit is reached.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setWizardStep('coverLetter')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Save Agent Settings <Check className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConfigWizard;
