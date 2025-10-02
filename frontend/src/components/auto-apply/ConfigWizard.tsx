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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ArrowLeft, Check, Loader2, Gauge, Shield } from 'lucide-react';

const ConfigWizard = ({ form, currentPlan, setWizardStep, isLoading }: any) => {
  // REMOVED the handleSaveAgent function
  // const handleSaveAgent = async () => {
  //   form.handleSubmit();
  // };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Indicator UI */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-green-600">
              Job Context
            </span>
          </div>
          <div className="w-12 h-0.5 bg-green-500"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-green-600">Your CV</span>
          </div>
          <div className="w-12 h-0.5 bg-green-500"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-green-600">
              Cover Letter
            </span>
          </div>
          <div className="w-12 h-0.5 bg-gradient-to-r from-green-500 to-purple-500"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">4</span>
            </div>
            <span className="text-sm font-medium text-purple-600">
              Final Config
            </span>
          </div>
        </div>
      </div>

      <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-2xl shadow-purple-500/10 rounded-3xl overflow-hidden">
        {/* Styled Card Header */}
        <CardHeader className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white relative">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Check className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Step 4: Configure and Save
              </CardTitle>
            </div>
            <CardDescription className="text-purple-100 text-base">
              Set the final parameters before launching your application agent.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          {/* Daily Limit Field */}
          <FormField
            control={form.control}
            name="dailyLimit"
            render={({ field }) => (
              <FormItem>
                <div className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-2">
                  <Gauge className="h-5 w-5 text-purple-500" />
                  Max Applications to Prepare per Day{' '}
                  <span className="text-destructive">*</span>
                </div>
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
                  <span className="font-semibold">
                    {currentPlan?.limits.autoApplyDailyLimit === -1
                      ? '50 (recommended max)'
                      : currentPlan?.limits.autoApplyDailyLimit}
                  </span>{' '}
                  applications per day. The agent will stop once this limit is
                  reached.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>

        {/* Styled Card Footer */}
        <CardFooter className="bg-gray-50/80 backdrop-blur-xl border-t border-gray-100 p-4">
          <div className="flex items-center justify-between w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setWizardStep('coverLetter')}
              className="h-12 px-6 rounded-xl"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              // REMOVED onClick={handleSaveAgent}
              className="h-12 px-6 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
            >
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
          </div>
        </CardFooter>
      </Card>

      {/* Security Notice */}
      <div className="text-center mt-6">
        <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg">
          <Shield className="h-4 w-4 text-green-500" />
          Your data is processed securely and is always private.
        </div>
      </div>
    </div>
  );
};

export default ConfigWizard;
